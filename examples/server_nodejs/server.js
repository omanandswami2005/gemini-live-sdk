import { GeminiLiveServer } from 'gemini-live-sdk/server';

// Create and configure the server
const serverConfig = {
  googleApiKey: 'your-google-gemini-api-key',
  port: 8080,
  enableAiAudioTranscription: true,
  enableUserAudioTranscription: true,
  googleSetup: {
    model: 'models/gemini-2.0-flash-exp',
    system_instruction: {
      role: 'user',
      parts: [{ text: 'You are a helpful assistant.' }]
    }
  },
  events: {
    aiAudioTranscriptionReceived: (socket, data) => {
      // console.log(`AI Transcription for socket ${socket.id}: ${data.text}`);
      
    },
    userAudioTranscriptionReceived: (socket, data) => {
      // console.log(`User Transcription for socket ${socket.id}: ${data.text}`);
    },
    messageReceived: (socket, parsedData) => {
      // console.log(`Message received from socket ${socket.id}:`, parsedData);
      // Emit custom transcription event if transcription data exists
      if (parsedData.serverContent?.outputTranscription?.text) {
        socket.emit('customTranscription', {
          type: 'ai',
          text: parsedData.serverContent.outputTranscription.text,
          timestamp: new Date().toISOString()
        });
      }
      if (parsedData.serverContent?.inputTranscription?.text) {
        socket.emit('customTranscription', {
          type: 'user',
          text: parsedData.serverContent.inputTranscription.text,
          timestamp: new Date().toISOString()
        });
      }
    },
    toolCall: (socket, toolCall) => {
      console.log(`Tool call from socket ${socket.id}:`, toolCall);
    },
    clientAction: (socket, data) => {
      console.log(`Received clientAction from ${socket.id}:`, data);
      // Emit a custom response back to the client
      socket.emit('serverResponse', { response: `Server received: ${data.action}` });
    },
    transcriptionAck: (socket, data) => {
      console.log(`Received transcriptionAck from ${socket.id}:`, {
        type: data.type,
        text: data.text,
        receivedAt: data.receivedAt
      });
      // Optional: Respond back to client to confirm receipt
      socket.emit('ackConfirmed', { message: `Ack received for ${data.type} transcription` });
    }
  },
  hooks: {
    onClientConnect: (socket) => {
      console.log(`Client connected: ${socket.id}`);
    },
    onDisconnect: (socket, reason) => {
      console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
    },
    onError: (err, socket) => {
      console.error(`Error for socket ${socket.id}: ${err.message}`);
    }
  }
};

const server = new GeminiLiveServer(serverConfig);
server.start();

// Monitor metrics if enabled
if (server.getMetrics()) {
  setInterval(() => {
    const metrics = server.getMetrics();
    if (metrics.activeConnections > 0 || metrics.messagesProcessed > 0) {
      console.log('📊 Server Metrics:', {
        activeConnections: metrics.activeConnections,
        messagesProcessed: metrics.messagesProcessed,
        errors: metrics.errors
      });
    }
  }, 30000); // Log every 30 seconds if there's activity
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Gemini Live Server...');
  process.exit(0);
});