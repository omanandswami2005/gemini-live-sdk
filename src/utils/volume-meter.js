import { registeredWorklets } from './worklet-registry.js';

const VOLUME_METER_WORKLET_CODE = `
const SMOOTHING_FACTOR = 0.8;
const FRAME_PER_SECOND = 60;
const FRAME_INTERVAL = 1 / FRAME_PER_SECOND;

class VolumeMeter extends AudioWorkletProcessor {
  constructor() {
    super();
    this._lastUpdate = currentTime;
    this._volume = 0;
  }

  calculateRMS(inputChannelData) {
    if (!inputChannelData || inputChannelData.length === 0) {
      this._volume = Math.max(0, this._volume * SMOOTHING_FACTOR);
      return;
    }

    let sum = 0;
    for (let i = 0; i < inputChannelData.length; i++) {
      sum += inputChannelData[i] * inputChannelData[i];
    }
    const rms = Math.sqrt(sum / inputChannelData.length);
    this._volume = Math.max(rms, this._volume * SMOOTHING_FACTOR);
  }

  process(inputs, outputs) {
    const inputChannelData = inputs && inputs[0] && inputs[0][0] ? inputs[0][0] : null;
    if (currentTime - this._lastUpdate > FRAME_INTERVAL) {
      this.calculateRMS(inputChannelData);
      this.port.postMessage(this._volume);
      this._lastUpdate = currentTime;
    }
    return true;
  }
}

registerProcessor("volume-meter", VolumeMeter);
`;

export class VolumeMeter {
  constructor(audioContext, meterElement) {
    this.audioContext = audioContext;
    this.meterElement = meterElement;
    this.processor = null;
    console.log(`Creating VolumeMeter for element: ${meterElement.id}`);
  }

  async attachToSource(sourceNode) {
    console.log(`Attaching VolumeMeter to source for ${this.meterElement.id}`);
    const workletName = "volume-meter";
    if (!registeredWorklets.has(this.audioContext)) {
      registeredWorklets.set(this.audioContext, {});
    }
    const registry = registeredWorklets.get(this.audioContext);
    if (!registry[workletName]) {
      const blob = new Blob([VOLUME_METER_WORKLET_CODE], {
        type: "application/javascript",
      });
      const blobUrl = URL.createObjectURL(blob);
      const workletUrl = blobUrl;

      console.log(`Loading worklet for ${this.meterElement.id}: ${workletUrl}`);
      await this.audioContext.audioWorklet.addModule(workletUrl);
      registry[workletName] = true;
    }
    const workletNode = new AudioWorkletNode(this.audioContext, workletName);
    sourceNode.connect(workletNode);
    workletNode.port.onmessage = (event) => {
      const volume = event.data;
      const percentage = Math.min(100, Math.max(0, Math.floor(volume * 700)));
      this.meterElement.value = percentage;
      // Log volume updates for debugging
      //   console.log(`Volume update for ${this.meterElement.id}: ${percentage}%`);
    };
    this.processor = workletNode;
  }

  disconnect() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
      console.log(`Disconnected VolumeMeter for ${this.meterElement.id}`);
    }
  }
}