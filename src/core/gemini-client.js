import { EventEmitter } from 'eventemitter3';
import { io } from 'socket.io-client';
import { AudioRecorder } from '../audio/audio-recorder.js';
import { AudioStreamer } from '../audio/audio-streamer.js';
import { MediaHandler } from '../media/media-handler.js';
import { VolumeMeter } from '../utils/volume-meter.js';
import { createAudioContext, base64ToArrayBuffer } from '../utils/audio-utils.js';

export class GeminiLiveClient extends EventEmitter {
  constructor(config) {
    super();
    this.socket = null;
    this.audioContext = null;
    this.audioRecorder = null;
    this.audioStreamer = null;
    this.mediaHandler = null;
    this.volumeMeter = null;
    this.AIVolumeMeter = null;
    this.connectionState = { status: 'disconnected' };
    this.isRecording = false;
    this.isMuted = false;
    this.initialized = false;
    this.reconnectAttempts = 0;

    this.config = this.validateConfig(config);
    this.setupConnection();
  }

  validateConfig(config) {
    if (!config.endpoint) {
      throw new Error('Endpoint is required');
    }

    return {
      sampleRate: 24000,
      debug: false,
      reconnectAttempts: 3,
      reconnectDelay: 2000,
      ...config
    };
  }

  setupConnection() {
    try {
      this.socket = io(this.config.endpoint, {
        auth: { token: this.config.token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.config.reconnectAttempts,
        reconnectionDelay: this.config.reconnectDelay,
        timeout: 20000
      });

      this.setupSocketEventHandlers();
    } catch (error) {
      this.handleError(new Error(`Connection failed: ${error.message}`));
    }
  }

  setupSocketEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.updateConnectionState({ status: 'connected' });
      this.reconnectAttempts = 0;
      this.emit('setupComplete');
    });

    this.socket.on('message', (message) => {
      this.handleServerMessage(message);
    });

    this.socket.on('aiTranscription', (data) => {
      this.emit('aiTranscription', data);
    });

    this.socket.on('userTranscription', (data) => {
      this.emit('userTranscription', data);
    });

    this.socket.on('ready', (data) => {
      this.emit('ready', data);
    });

    this.socket.on('connect_error', (error) => {
      this.handleConnectionError(error);
    });

    this.socket.on('disconnect', (reason) => {
      this.updateConnectionState({ status: 'disconnected' });
      this.emit('close', { code: 1000, reason });
    });

    this.socket.on('error', (error) => {
      const err = error instanceof Error ? error : new Error(error);
      this.handleError(err);
    });
  }

  handleServerMessage(message) {
    try {
      if (message.toolCall) {
        this.emit('toolCall', message.toolCall);
      }

      if (message.serverContent) {
        if (message.serverContent.interrupted) {
          this.audioStreamer?.stop();
          this.emit('interrupted');
          return;
        }

        if (message.serverContent.modelTurn?.parts?.[0]?.inlineData) {
          const audioData = message.serverContent.modelTurn.parts[0].inlineData.data;
          this.handleAudioData(audioData);
        }

        if (message.serverContent.turnComplete) {
          this.audioStreamer?.complete();
          this.emit('turnComplete');
        }
      }
    } catch (error) {
      this.handleError(new Error(`Message parsing failed: ${error.message}`));
    }
  }

  async handleAudioData(audioData) {
    await this.ensureAudioInitialized();

    if (this.audioStreamer) {
      const arrayBuffer = base64ToArrayBuffer(audioData);
      const uint8Array = new Uint8Array(arrayBuffer);
      this.audioStreamer.addPCM16(uint8Array);
      await this.audioStreamer.resume();
      this.emit('audioReceived', audioData);
    }
  }

  handleConnectionError(error) {
    this.reconnectAttempts++;
    this.updateConnectionState({
      status: 'error',
      error: error.message,
      reconnectAttempt: this.reconnectAttempts
    });

    if (this.reconnectAttempts >= (this.config.reconnectAttempts || 3)) {
      this.handleError(new Error(`Max reconnection attempts reached: ${error.message}`));
    }
  }

  handleError(error) {
    this.updateConnectionState({ status: 'error', error: error.message });
    this.emit('error', error);
  }

  updateConnectionState(newState) {
    this.connectionState = { ...this.connectionState, ...newState };
    this.emit('connectionStateChange', this.connectionState);
  }

  async ensureAudioInitialized() {
    if (!this.initialized) {
      try {
        this.audioContext = await createAudioContext(this.config.sampleRate);
        this.audioStreamer = new AudioStreamer(this.audioContext);
        this.initialized = true;
      } catch (error) {
        throw new Error(`Audio initialization failed: ${error.message}`);
      }
    }
  }

  async startRecording() {
    if (this.isRecording) return;

    await this.ensureAudioInitialized();

    this.audioRecorder = new AudioRecorder();
    await this.audioRecorder.start();

    this.audioRecorder.on('data', (base64Data) => {
      this.sendAudioChunk(base64Data);
    });

    this.isRecording = true;
    this.emit('recordingStarted');
  }

  stopRecording() {
    if (!this.isRecording || !this.audioRecorder) return;

    this.audioRecorder.stop();
    this.audioRecorder.removeAllListeners();
    this.audioRecorder = null;
    this.isRecording = false;
    this.isMuted = false;

    this.sendEndMessage();
    this.emit('recordingStopped');
  }

  toggleMute() {
    if (!this.audioRecorder || !this.isRecording) return;

    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.audioRecorder.mute();
    } else {
      this.audioRecorder.unmute();
    }

    this.emit('muteToggled', this.isMuted);
  }

  sendTextMessage(text) {
    this.sendMessage({
      client_content: {
        turns: [{ role: 'user', parts: [{ text }] }],
        turn_complete: true
      }
    });
  }

  sendToolResponse(functionResponses) {
    this.sendMessage({
      tool_response: {
        function_responses: functionResponses
      }
    });
  }

  setVideoElement(videoElement, setErrorCallback) {
    this.mediaHandler = new MediaHandler();
    this.mediaHandler.initialize(videoElement, setErrorCallback);
  }

  async toggleWebcam() {
    if (!this.mediaHandler) {
      throw new Error('Set video element before using webcam');
    }

    if (this.mediaHandler.isWebcamActive) {
      this.mediaHandler.stopAll();
      return false;
    } else {
      const success = await this.mediaHandler.startWebcam();
      if (success) {
        this.mediaHandler.startFrameCapture((base64Image) => {
          this.sendFrame(base64Image);
        });
      }
      return success;
    }
  }

  async toggleScreenShare() {
    if (!this.mediaHandler) {
      throw new Error('Set video element before using screen share');
    }
    if (this.mediaHandler.isScreenActive) {
      this.mediaHandler.stopAll();
      return false;
    } else {
      const success = await this.mediaHandler.startScreenShare();
      if (success) {
        this.mediaHandler.startFrameCapture((base64Image) => {
          this.sendFrame(base64Image);
        });
      }
      return success;
    }
  }

  async switchCamera() {
    if (!this.mediaHandler) {
      throw new Error('Set video element before using webcam');
    }

    return await this.mediaHandler.switchCamera();
  }

  createUserVolumeMeter(element) {
    if (!this.audioRecorder?.audioContext || !this.audioRecorder?.source) {
      console.error('Audio recorder not initialized');
      return null;
    }

    this.volumeMeter = new VolumeMeter(this.audioRecorder.audioContext, element);
    this.volumeMeter.attachToSource(this.audioRecorder.source);

    return this.volumeMeter;
  }

  createAIVolumeMeter(element) {
    if (!this.audioStreamer || !this.audioStreamer.gainNode) {
      console.error('Audio streamer not initialized');
      return null;
    }

    this.AIVolumeMeter = new VolumeMeter(this.audioContext, element);
    this.AIVolumeMeter.attachToSource(this.audioStreamer.gainNode);

    return this.AIVolumeMeter;
  }

  sendMessage(message) {
    if (this.socket?.connected) {
      this.socket.emit('message', message);
    }
  }

  sendAudioChunk(base64Audio) {
    this.sendMessage({
      realtime_input: {
        media_chunks: [{
          mime_type: 'audio/pcm',
          data: base64Audio
        }]
      }
    });
  }

  sendEndMessage() {
    this.sendMessage({
      client_content: {
        turns: [{ role: 'user', parts: [] }],
        turn_complete: true
      }
    });
  }

  sendFrame(base64Image) {
    this.sendMessage({
      realtime_input: {
        media_chunks: [{
          mime_type: 'image/jpeg',
          data: base64Image
        }]
      }
    });
  }

  sendCustomEvent(eventName, data) {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn(`Cannot send event '${eventName}': socket not connected`);
    }
  }

  onCustomEvent(eventName, listener) {
    this.socket.on(eventName, listener);
  }

  get isConnected() {
    return this.socket?.connected || false;
  }

  get connectionStatus() {
    return this.connectionState;
  }

  get recordingState() {
    return this.isRecording;
  }

  get muteState() {
    return this.isMuted;
  }

  destroy() {
    this.stopRecording();
    this.mediaHandler?.stopAll();
    this.volumeMeter?.disconnect();
    this.AIVolumeMeter?.disconnect();
    this.audioContext?.close();
    this.socket?.disconnect();
    this.removeAllListeners();
  }
}