import { useState, useEffect, useCallback, useRef } from 'react';
import { GeminiLiveClient } from '../../core/gemini-client.js';

export function useGeminiLive(config) {
  const [client, setClient] = useState(null);
  const [connectionState, setConnectionState] = useState({ status: 'disconnected' });
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [transcriptions, setTranscriptions] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [webcamActive, setWebcamActive] = useState(false);
  const [screenActive, setScreenActive] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const geminiClient = new GeminiLiveClient(config);
    clientRef.current = geminiClient;
    setClient(geminiClient);

    // Event listeners
    geminiClient.on('connectionStateChange', setConnectionState);
    geminiClient.on('recordingStarted', () => setIsRecording(true));
    geminiClient.on('recordingStopped', () => setIsRecording(false));
    geminiClient.on('muteToggled', (muted) => setIsMuted(muted));
    geminiClient.on('error', (err) => setError(err.message || 'Unknown error'));
    geminiClient.on('aiTranscription', (data) =>
      setTranscriptions(prev => [...prev, { type: 'ai', text: data.text, timestamp: data.timestamp }]));
    geminiClient.on('userTranscription', (data) =>
      setTranscriptions(prev => [...prev, { type: 'user', text: data.text, timestamp: data.timestamp }]));
    geminiClient.on('ready', (data) =>
      setCustomEvents(prev => [...prev, { event: 'ready', data, timestamp: new Date().toISOString() }]));

    return () => {
      geminiClient.destroy();
      clientRef.current = null;
    };
  }, [config]);

  const startRecording = useCallback(async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.startRecording();
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to start recording');
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.stopRecording();
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.toggleMute();
    }
  }, []);

  const sendTextMessage = useCallback((text) => {
    if (clientRef.current) {
      clientRef.current.sendTextMessage(text);
    }
  }, []);

  const sendToolResponse = useCallback((responses) => {
    if (clientRef.current) {
      clientRef.current.sendToolResponse(responses);
    }
  }, []);

  const setVideoElement = useCallback((element, setErrorCallback) => {
    if (clientRef.current) {
      clientRef.current.setVideoElement(element, setErrorCallback);
    }
  }, []);

  const toggleWebcam = useCallback(async () => {
    if (clientRef.current) {
      try {
        const success = await clientRef.current.toggleWebcam();
        setWebcamActive(success);
        setError(null);
        return success;
      } catch (err) {
        setError(err.message || 'Failed to toggle webcam');
        return false;
      }
    }
    return false;
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (clientRef.current) {
      try {
        const success = await clientRef.current.toggleScreenShare();
        setScreenActive(success);
        setError(null);
        return success;
      } catch (err) {
        setError(err.message || 'Failed to toggle screen sharing');
        return false;
      }
    }
    return false;
  }, []);

  const switchCamera = useCallback(async () => {
    if (clientRef.current) {
      try {
        const success = await clientRef.current.switchCamera();
        setError(null);
        return success;
      } catch (err) {
        setError(err.message || 'Failed to switch camera');
        return false;
      }
    }
    return false;
  }, []);

  const createUserVolumeMeter = useCallback((element) => {
    if (clientRef.current) {
      return clientRef.current.createUserVolumeMeter(element);
    }
    return null;
  }, []);

  const createAIVolumeMeter = useCallback((element) => {
    if (clientRef.current) {
      return clientRef.current.createAIVolumeMeter(element);
    }
    return null;
  }, []);

  const sendCustomEvent = useCallback((eventName, data) => {
    if (clientRef.current) {
      clientRef.current.sendCustomEvent(eventName, data);
    }
  }, []);

  const onCustomEvent = useCallback((eventName, listener) => {
    if (clientRef.current) {
      clientRef.current.onCustomEvent(eventName, (data) => {
        listener(data);
        setCustomEvents(prev => [...prev, { event: eventName, data, timestamp: new Date().toISOString() }]);
      });
    }
  }, []);

  return {
    client,
    connectionState,
    isRecording,
    isMuted,
    error,
    transcriptions,
    customEvents,
    webcamActive,
    screenActive,
    startRecording,
    stopRecording,
    toggleMute,
    sendTextMessage,
    sendToolResponse,
    setVideoElement,
    toggleWebcam,
    toggleScreenShare,
    switchCamera,
    createUserVolumeMeter,
    createAIVolumeMeter,
    sendCustomEvent,
    onCustomEvent,
    isConnected: clientRef.current?.isConnected || false,
    connectionStatus: clientRef.current?.connectionStatus || { status: 'disconnected' },
    recordingState: clientRef.current?.recordingState || false,
    muteState: clientRef.current?.muteState || false
  };
}