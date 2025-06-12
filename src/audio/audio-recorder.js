import { EventEmitter } from 'eventemitter3';
import { createAudioContext } from '../utils/audio-utils.js';
import { createWorkletFromSource, registeredWorklets } from '../utils/worklet-registry.js';
import { AUDIO_RECORDING_WORKLET_CODE } from './worklets/audio-recording-worklet.js';

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export class AudioRecorder extends EventEmitter {
  constructor() {
    super();
    this.sampleRate = 16000;
    this.stream = undefined;
    this.audioContext = undefined;
    this.source = undefined;
    this.recordingWorklet = undefined;
    this.isRecording = false;
    this.isMuted = false;
    this.startPromise = undefined;
  }

  async start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('getUserMedia not supported');
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    this.startPromise = this.initializeRecording();
    return this.startPromise;
  }

  async initializeRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = await createAudioContext(this.sampleRate);
      
      if (!this.audioContext) {
        throw new Error('Failed to initialize audio context');
      }

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      await this.setupWorklet();
      
      this.isRecording = true;
    } catch (error) {
      this.cleanup();
      throw error;
    } finally {
      this.startPromise = undefined;
    }
  }

  async setupWorklet() {
    if (!this.audioContext || !this.source) return;

    const workletName = 'audio-recorder-worklet';
    
    if (!registeredWorklets.has(this.audioContext)) {
      registeredWorklets.set(this.audioContext, new Map());
    }

    const registry = registeredWorklets.get(this.audioContext);
    
    if (!registry.has(workletName)) {
      const workletUrl = createWorkletFromSource(workletName, AUDIO_RECORDING_WORKLET_CODE);
      await this.audioContext.audioWorklet.addModule(workletUrl);
      registry.set(workletName, true);
    }

    this.recordingWorklet = new AudioWorkletNode(this.audioContext, workletName);
    
    this.recordingWorklet.port.onmessage = (event) => {
      const arrayBuffer = event.data.data.int16arrayBuffer;
      if (arrayBuffer) {
        const base64String = arrayBufferToBase64(arrayBuffer);
        this.emit('data', base64String);
      }
    };

    this.source.connect(this.recordingWorklet);
  }

  stop() {
    if (this.startPromise) {
      this.startPromise.then(() => this.cleanup());
    } else {
      this.cleanup();
    }
  }

  cleanup() {
    this.source?.disconnect();
    this.stream?.getTracks().forEach(track => track.stop());
    this.recordingWorklet?.disconnect();
    
    this.stream = undefined;
    this.source = undefined;
    this.recordingWorklet = undefined;
    this.isRecording = false;
    this.isMuted = false;
  }

  mute() {
    if (this.source && this.recordingWorklet && !this.isMuted) {
      this.source.disconnect(this.recordingWorklet);
      this.isMuted = true;
    }
  }

  unmute() {
    if (this.source && this.recordingWorklet && this.isMuted) {
      this.source.connect(this.recordingWorklet);
      this.isMuted = false;
    }
  }

  get recording() {
    return this.isRecording;
  }

  get muted() {
    return this.isMuted;
  }
}