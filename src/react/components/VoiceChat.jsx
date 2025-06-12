import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Send, Loader2 } from 'lucide-react';
import { useGeminiLiveContext } from './GeminiLiveProvider.jsx';

export function VoiceChat({
  className = '',
  showVideoControls = true,
  showTextInput = true,
  onTranscription,
  onToolCall
}) {
  const {
    client,
    connectionState,
    isRecording,
    isMuted,
    startRecording,
    stopRecording,
    toggleMute,
    sendTextMessage,
    setVideoElement,
    toggleWebcam,
    error
  } = useGeminiLiveContext();

  const [textInput, setTextInput] = useState('');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const videoRef = useRef(null);
  const volumeMeterRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      setVideoElement(videoRef.current);
    }
  }, [setVideoElement]);

  useEffect(() => {
    if (!client) return;

    const handleTranscription = (text) => {
      setTranscription(text);
      onTranscription?.(text);
    };

    const handleToolCall = (toolCall) => {
      onToolCall?.(toolCall);
    };

    const handleRecordingStarted = async () => {
      if (volumeMeterRef.current && client.recordingState) {
        // Access the audio recorder's context and source
        const audioRecorder = client.audioRecorder;
        if (audioRecorder?.audioContext && audioRecorder?.source) {
          await attachToSource(
            audioRecorder.audioContext,
            audioRecorder.source,
            volumeMeterRef.current
          );
        }
      }
    };

    const handleRecordingStopped = () => {
      disconnect();
    };

    client.on('transcriptionUpdate', handleTranscription);
    client.on('toolCall', handleToolCall);
    client.on('recordingStarted', handleRecordingStarted);
    client.on('recordingStopped', handleRecordingStopped);

    return () => {
      client.off('transcriptionUpdate', handleTranscription);
      client.off('toolCall', handleToolCall);
      client.off('recordingStarted', handleRecordingStarted);
      client.off('recordingStopped', handleRecordingStopped);
    };
  }, [client, attachToSource, disconnect, onTranscription, onToolCall]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const handleToggleWebcam = async () => {
    try {
      const active = await toggleWebcam();
      setIsWebcamActive(active);
    } catch (err) {
      console.error('Failed to toggle webcam:', err);
    }
  };

  const handleSendText = () => {
    if (textInput.trim()) {
      sendTextMessage(textInput.trim());
      setTextInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionState.status) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Connection Status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionState.status === 'connected' ? 'bg-green-500' : 
            connectionState.status === 'connecting' ? 'bg-yellow-500' : 
            'bg-red-500'
          }`} />
          <span className={`text-sm font-medium ${getConnectionStatusColor()}`}>
            {connectionState.status === 'connected' ? 'Connected' :
             connectionState.status === 'connecting' ? 'Connecting...' :
             connectionState.status === 'error' ? 'Error' : 'Disconnected'}
          </span>
        </div>
        
        {connectionState.status === 'connecting' && (
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Video Element */}
      {showVideoControls && (
        <div className="mb-4">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full max-w-md mx-auto rounded-lg bg-gray-100 hidden"
          />
        </div>
      )}


      {/* Transcription Display */}
      {transcription && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Transcription:</strong> {transcription}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        {/* Recording Controls */}
        <button
          onClick={isRecording ? stopRecording : handleStartRecording}
          disabled={connectionState.status !== 'connected'}
          className={`p-3 rounded-full transition-colors ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300'
          }`}
        >
          <Mic className="w-6 h-6" />
        </button>

        {/* Mute Toggle */}
        {isRecording && (
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        )}

        {/* Video Controls */}
        {showVideoControls && (
          <button
            onClick={handleToggleWebcam}
            disabled={connectionState.status !== 'connected'}
            className={`p-3 rounded-full transition-colors ${
              isWebcamActive
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-300'
            }`}
          >
            {isWebcamActive ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* Text Input */}
      {showTextInput && (
        <div className="flex space-x-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={connectionState.status !== 'connected'}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={handleSendText}
            disabled={!textInput.trim() || connectionState.status !== 'connected'}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}