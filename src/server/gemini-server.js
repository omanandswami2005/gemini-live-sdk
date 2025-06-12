import { createServer } from 'http';
import { Server } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import * as winston from 'winston';
import * as WebSocket from 'ws';

export class GeminiLiveServer {
  constructor(config = {}) {
    this.config = this.validateAndNormalizeConfig(config);
    this.logger = this.createLogger();
    this.metricsData = this.config.enableMetrics ? this.createMetricsData() : null;
    this.metricsSubscribers = new Set();
    this.googleWsConnections = new Map();

    this.httpServer = createServer();
    this.io = new Server(this.httpServer, {
      cors: this.config.cors,
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
  }

  validateAndNormalizeConfig(config) {
    if (!config.googleApiKey) {
      throw new Error('googleApiKey is required');
    }
    return {
      port: 8080,
      googleWsUrl: 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent',
      cors: config.cors || { origin: '*', methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'] },
      googleSetup: {
        model: 'models/gemini-2.0-flash-exp',
        system_instruction: {
          role: 'user',
          parts: [{ text: 'You are a helpful assistant.' }]
        },
        ...config.googleSetup
      },
      enableAiAudioTranscription: false,
      enableUserAudioTranscription: false,
      retryConfig: {
        maxAttempts: 3,
        retryDelay: 2000,
        backoffFactor: 2,
        ...config.retryConfig
      },
      events: {
        aiAudioTranscriptionReceived: () => { },
        userAudioTranscriptionReceived: () => { },
        toolCall: () => { },
        messageReceived: () => { },
        ...config.events
      },
      hooks: {
        onClientConnect: () => { },
        onDisconnect: () => { },
        onError: () => { },
        ...config.hooks
      },
      enableMetrics: false,
      metricsInterval: 5000,
      debug: false,
      ...config
    };
  }

  createLogger() {
    return this.config.logger || winston.createLogger({
      level: this.config.debug ? 'debug' : 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [new winston.transports.Console()]
    });
  }

  createMetricsData() {
    return {
      activeConnections: 0,
      messagesProcessed: 0,
      errors: 0
    };
  }

  setupMiddleware() {
    if (this.config.authMiddleware) {
      this.io.use(this.config.authMiddleware);
    } else if (this.config.jwtSecret) {
      this.io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) return next(new Error('Authentication error'));

        try {
          socket.user = jwt.verify(token, this.config.jwtSecret);
          next();
        } catch (err) {
          next(new Error(`Authentication failed: ${err.message}`));
        }
      });
    }
  }

  processTools(toolConfigs) {
    if (!toolConfigs || !Array.isArray(toolConfigs)) return [];

    const result = [];
    for (const tool of toolConfigs) {
      if (typeof tool !== 'object' || tool === null) {
        throw new Error(`Invalid tool config: ${JSON.stringify(tool)}`);
      }

      if (Object.keys(tool).some(key => ['googleSearch', 'codeExecution'].includes(key))) {
        result.push(tool);
        continue;
      }

      if (tool.functionDeclarations) {
        if (!Array.isArray(tool.functionDeclarations) || tool.functionDeclarations.length === 0) {
          throw new Error(`functionDeclarations must be a non-empty array in tool: ${JSON.stringify(tool)}`);
        }

        for (const func of tool.functionDeclarations) {
          if (!func.name || typeof func.name !== 'string') {
            throw new Error(`Function declaration missing valid 'name' in tool: ${JSON.stringify(func)}`);
          }
          if (!func.description || typeof func.description !== 'string') {
            throw new Error(`Function declaration missing valid 'description' in tool: ${JSON.stringify(func)}`);
          }
          if (!func.parameters || typeof func.parameters !== 'object' || func.parameters === null) {
            throw new Error(`Function declaration missing valid 'parameters' in tool: ${JSON.stringify(func)}`);
          }

          const { parameters } = func;
          if (!parameters.type) {
            throw new Error(`Parameters 'type' must be 'object' in function: ${func.name}`);
          }
          if (!parameters.properties || typeof parameters.properties !== 'object' || parameters.properties === null) {
            throw new Error(`Parameters missing valid 'properties' in function: ${func.name}`);
          }
          if (!Array.isArray(parameters.required) || parameters.required.length === 0) {
            throw new Error(`Parameters missing valid 'required' array in function: ${func.name}`);
          }

          for (const [propName, prop] of Object.entries(parameters.properties)) {
            if (!prop.type || !['STRING', 'NUMBER', 'BOOLEAN', 'ARRAY', 'OBJECT'].includes(prop.type)) {
              throw new Error(`Invalid property type for '${propName}' in function: ${func.name}`);
            }
            if (prop.description && typeof prop.description !== 'string') {
              throw new Error(`Invalid description for property '${propName}' in function: ${func.name}`);
            }
            if (prop.type === 'array' && (!prop.items || !prop.items.type)) {
              throw new Error(`Array property '${propName}' missing valid 'items' type in function: ${func.name}`);
            }
          }

          for (const requiredProp of parameters.required) {
            if (!parameters.properties[requiredProp]) {
              throw new Error(`Required property '${requiredProp}' not defined in properties for function: ${func.name}`);
            }
          }
        }
        result.push(tool);
      } else {
        throw new Error(`Tool must contain either googleSearch, codeExecution, or functionDeclarations: ${JSON.stringify(tool)}`);
      }
    }
    return result;
  }

  start() {
    this.setupEventHandlers();

    this.httpServer.listen(this.config.port, () => {
      this.logger.info(`Gemini Live Server running on port ${this.config.port}`);
    });

    if (this.config.enableMetrics) {
      this.startMetricsBroadcast();
    }

    this.setupGracefulShutdown();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      if (this.metricsData) this.metricsData.activeConnections++;
      try {
        this.config.hooks?.onClientConnect?.(socket);
      } catch (err) {
        this.logger.error(`Error in onClientConnect hook for socket ${socket.id}: ${err.message}`);
      }

      const messageQueue = [];
      let googleWs = null;
      let connectionAttempts = 0;

      const setupGoogleConnection = () => {
        if (connectionAttempts >= (this.config.retryConfig?.maxAttempts || 3)) {
          this.logger.error(`Max Google WebSocket connection attempts reached for socket ${socket.id}`);
          try {
            socket.emit('error', 'Failed to connect to AI service');
            this.config.hooks?.onError?.(new Error('Max attempts reached'), socket);
          } catch (err) {
            this.logger.error(`Error emitting connection failure for socket ${socket.id}: ${err.message}`);
          }
          if (this.metricsData) this.metricsData.errors++;
          return;
        }

        connectionAttempts++;
        const delay = (this.config.retryConfig?.retryDelay || 2000) *
          Math.pow(this.config.retryConfig?.backoffFactor || 2, connectionAttempts - 1);

        const url = `${this.config.googleWsUrl}?key=${this.config.googleApiKey}`;
        googleWs = new WebSocket.default(url);

        this.googleWsConnections.set(socket.id, googleWs);

        googleWs.on('open', () => {
          if (googleWs?.readyState !== WebSocket.default.OPEN) return;

          this.logger.info(`Connected to Google AI service for socket ${socket.id}`);
          connectionAttempts = 0;

          try {
            const setupMessage = {
              setup: {
                ...this.config.googleSetup,
                tools: this.processTools(this.config.googleSetup?.tools),
                ...(this.config.enableAiAudioTranscription ? { outputAudioTranscription: {} } : {}),
                ...(this.config.enableUserAudioTranscription ? { inputAudioTranscription: {} } : {})
              }
            };

            googleWs.send(JSON.stringify(setupMessage));

            while (messageQueue.length > 0 && googleWs.readyState === WebSocket.default.OPEN) {
              googleWs.send(messageQueue.shift());
            }

            socket.emit('ready', {
              status: 'connected',
              timestamp: new Date().toISOString()
            });
          } catch (err) {
            this.logger.error(`Setup error for socket ${socket.id}: ${err.message}`);
            this.config.hooks?.onError?.(err, socket);
            if (this.metricsData) this.metricsData.errors++;
          }
        });

        googleWs.on('message', (data) => {
          this.handleGoogleMessage(data, socket);
        });

        googleWs.on('close', (code, reason) => {
          this.logger.info(`Google WebSocket closed for socket ${socket.id}: ${code} ${reason.toString()}`);
          this.googleWsConnections.delete(socket.id);

          if (code !== 1000 && socket.connected) {
            setTimeout(setupGoogleConnection, delay);
          }
        });

        googleWs.on('error', (err) => {
          this.logger.error(`Google WebSocket error for socket ${socket.id}: ${err.message}`);
          try {
            this.config.hooks?.onError?.(err, socket);
          } catch (hookErr) {
            this.logger.error(`Error in onError hook for socket ${socket.id}: ${hookErr.message}`);
          }
          if (this.metricsData) this.metricsData.errors++;
          if (socket.connected) {
            setTimeout(setupGoogleConnection, delay);
          }
        });
      };

      socket.on('message', (message) => {
        this.handleClientMessage(message, googleWs, messageQueue, setupGoogleConnection, socket);
      });

      socket.on('disconnect', (reason) => {
        this.handleClientDisconnect(reason, googleWs, socket);
      });

      socket.on('error', (err) => {
        try {
          this.config.hooks?.onError?.(err, socket);
        } catch (hookErr) {
          this.logger.error(`Error in onError hook for socket ${socket.id}: ${hookErr.message}`);
        }
        if (this.metricsData) this.metricsData.errors++;
      });

      Object.entries(this.config.events).forEach(([eventName, handler]) => {
        if (eventName !== 'aiAudioTranscriptionReceived' && eventName !== 'userAudioTranscriptionReceived' && eventName !== 'toolCall' && eventName !== 'messageReceived') {
          socket.on(eventName, (data) => {
            try {
              handler(socket, data);
            } catch (err) {
              this.logger.error(`Custom event handler error for ${eventName} on socket ${socket.id}: ${err.message}`);
              try {
                socket.emit('error', `Error handling ${eventName}: ${err.message}`);
              } catch (emitErr) {
                this.logger.error(`Error emitting error for ${eventName} on socket ${socket.id}: ${emitErr.message}`);
              }
            }
          });
        }
      });

      setupGoogleConnection();
    });
  }

  handleGoogleMessage(data, socket) {
    let parsedData;

    try {
      parsedData = JSON.parse(data.toString());
    } catch (err) {
      parsedData = data.toString();
      this.logger.error(`Message parsing error for socket ${socket.id}: ${err.message}`);
      try {
        this.config.hooks?.onError?.(err, socket);
      } catch (hookErr) {
        this.logger.error(`Error in onError hook for socket ${socket.id}: ${hookErr.message}`);
      }
      return;
    }

    try {
      this.config.events.messageReceived(socket, parsedData);
    } catch (err) {
      this.logger.error(`Error in messageReceived handler for socket ${socket.id}: ${err.message}`);
    }

    if (this.config.enableAiAudioTranscription && parsedData.serverContent?.outputTranscription?.text) {
      const transcription = parsedData.serverContent.outputTranscription.text;
      const transcriptionData = { text: transcription, timestamp: new Date().toISOString() };
      try {
        socket.emit('aiTranscription', transcriptionData);
        this.config.events.aiAudioTranscriptionReceived(socket, transcriptionData);
      } catch (err) {
        this.logger.error(`Error emitting AI transcription for socket ${socket.id}: ${err.message}`);
      }
    }

    if (this.config.enableUserAudioTranscription && parsedData.serverContent?.inputTranscription?.text) {
      const transcription = parsedData.serverContent.inputTranscription.text;
      const transcriptionData = { text: transcription, timestamp: new Date().toISOString() };
      try {
        socket.emit('userTranscription', transcriptionData);
        this.config.events.userAudioTranscriptionReceived(socket, transcriptionData);
      } catch (err) {
        this.logger.error(`Error emitting user transcription for socket ${socket.id}: ${err.message}`);
      }
    }

    try {
      socket.emit('message', parsedData);
    } catch (err) {
      this.logger.error(`Error emitting message for socket ${socket.id}: ${err.message}`);
    }

    if (parsedData.toolCall) {
      const toolCalls = Array.isArray(parsedData.toolCall.functionCalls)
        ? parsedData.toolCall.functionCalls
        : [parsedData.toolCall];
      toolCalls.forEach((tc) => {
        try {
          this.config.events.toolCall(socket, tc);
        } catch (err) {
          this.logger.error(`Error in toolCall handler for socket ${socket.id}: ${err.message}`);
        }
      });
    }

    if (this.metricsData) this.metricsData.messagesProcessed++;
  }

  handleClientMessage(message, googleWs, messageQueue, setupGoogleConnection, socket) {
    if (!message) {
      try {
        socket.emit('error', 'Empty message received');
        this.config.hooks?.onError?.(new Error('Empty message'), socket);
      } catch (err) {
        this.logger.error(`Error handling empty message for socket ${socket.id}: ${err.message}`);
      }
      if (this.metricsData) this.metricsData.errors++;
      return;
    }

    let messageStr;
    try {
      messageStr = JSON.stringify(message);
    } catch (err) {
      this.logger.error(`Error stringifying message for socket ${socket.id}: ${err.message}`);
      try {
        socket.emit('error', `Invalid message format: ${err.message}`);
      } catch (emitErr) {
        this.logger.error(`Error emitting invalid message error for socket ${socket.id}: ${emitErr.message}`);
      }
      if (this.metricsData) this.metricsData.errors++;
      return;
    }

    if (googleWs?.readyState === WebSocket.default.OPEN) {
      try {
        googleWs.send(messageStr);
      } catch (err) {
        this.logger.error(`Failed to send message for socket ${socket.id}: ${err.message}`);
        try {
          socket.emit('error', `Failed to send message: ${err.message}`);
          this.config.hooks?.onError?.(err, socket);
        } catch (emitErr) {
          this.logger.error(`Error emitting send failure for socket ${socket.id}: ${emitErr.message}`);
        }
        if (this.metricsData) this.metricsData.errors++;
      }
    } else {
      messageQueue.push(messageStr);
      if (!googleWs || googleWs.readyState === WebSocket.default.CLOSED) {
        setupGoogleConnection();
      }
    }
  }

  handleClientDisconnect(reason, googleWs, socket) {
    if (this.metricsData) this.metricsData.activeConnections--;
    try {
      this.config.hooks?.onDisconnect?.(socket, reason);
    } catch (err) {
      this.logger.error(`Error in onDisconnect hook for socket ${socket.id}: ${err.message}`);
    }

    if (googleWs && googleWs.readyState !== WebSocket.default.CLOSED) {
      try {
        googleWs.close(1000, 'Client disconnected');
      } catch (err) {
        this.logger.error(`Error closing Google WebSocket for socket ${socket.id}: ${err.message}`);
      }
    }
    this.googleWsConnections.delete(socket.id);
  }

  sendToolResponse(socket, functionResponses) {
    const googleWs = this.googleWsConnections.get(socket.id);

    if (!googleWs || googleWs.readyState !== WebSocket.default.OPEN) {
      this.logger.error(`Cannot send tool response for socket ${socket.id}: Google WebSocket not open`);
      try {
        socket.emit('error', 'Google WebSocket not connected');
      } catch (err) {
        this.logger.error(`Error emitting WebSocket not connected for socket ${socket.id}: ${err.message}`);
      }
      return;
    }

    const response = {
      tool_response: {
        function_responses: Array.isArray(functionResponses) ? functionResponses : [functionResponses]
      }
    };

    try {
      googleWs.send(JSON.stringify(response));
      this.logger.debug(`Sent tool response for socket ${socket.id}: ${JSON.stringify(response)}`);
    } catch (err) {
      this.logger.error(`Failed to send tool response for socket ${socket.id}: ${err.message}`);
      try {
        socket.emit('error', `Failed to send tool response: ${err.message}`);
      } catch (emitErr) {
        this.logger.error(`Error emitting tool response failure for socket ${socket.id}: ${emitErr.message}`);
      }
    }
  }

  startMetricsBroadcast() {
    if (!this.metricsData) return;

    this.metricsIntervalId = setInterval(() => {
      this.metricsSubscribers.forEach((callback) => {
        try {
          callback({ ...this.metricsData });
        } catch (err) {
          this.logger.error(`Metrics subscriber error: ${err.message}`);
        }
      });
    }, this.config.metricsInterval);
  }

  stopMetricsBroadcast() {
    if (this.metricsIntervalId) {
      clearInterval(this.metricsIntervalId);
      this.metricsIntervalId = undefined;
    }
  }

  setupGracefulShutdown() {
    const shutdown = () => {
      this.logger.info('Shutting down Gemini Live Server');
      this.stopMetricsBroadcast();

      this.googleWsConnections.forEach((ws, socketId) => {
        try {
          if (ws.readyState !== WebSocket.default.CLOSED) {
            ws.close(1000, 'Server shutdown');
          }
        } catch (err) {
          this.logger.error(`Error closing WebSocket for socket ${socketId} during shutdown: ${err.message}`);
        }
      });
      this.googleWsConnections.clear();

      this.io.close(() => {
        this.httpServer.close(() => {
          this.logger.info('Server shutdown complete');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }

  getMetrics() {
    return this.metricsData ? { ...this.metricsData } : null;
  }

  subscribeToMetrics(callback, duration) {
    if (!this.metricsData) {
      throw new Error('Metrics not enabled');
    }

    this.metricsSubscribers.add(callback);

    if (duration) {
      setTimeout(() => this.metricsSubscribers.delete(callback), duration);
    }

    return () => this.metricsSubscribers.delete(callback);
  }
}