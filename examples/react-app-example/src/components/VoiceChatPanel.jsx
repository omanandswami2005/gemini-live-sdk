import React, { useState, useRef } from 'react';
import { useGeminiLiveContext } from 'gemini-live-sdk/react';
import { Mic, MicOff, Square, Play, Volume2, VolumeX } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

function VoiceChatPanel() {
  const {
    connectionState,
    isRecording,
    isMuted,
    startRecording,
    stopRecording,
    toggleMute,
    error
  } = useGeminiLiveContext();

  const [lastTranscription, setLastTranscription] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const isConnected = connectionState.status === 'connected';

  return (
    <div className="card animate-scale-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Mic className="w-5 h-5 mr-2 text-primary-600" />
          Voice Chat
        </h3>
        
        {isRecording && (
          <div className="flex items-center space-x-2 text-sm">
            <div className="status-indicator bg-error-500 animate-pulse"></div>
            <span className="text-error-600 font-medium">Recording</span>
          </div>
        )}
      </div>

      {/* Audio Visualizer */}
      {isRecording && (
        <div className="mb-6">
          <AudioVisualizer isActive={isRecording && !isMuted} />
        </div>
      )}

      {/* Last Transcription */}
      {lastTranscription && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-primary-900 mb-2">Last Transcription:</h4>
          <p className="text-primary-800">{lastTranscription}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
          <p className="text-error-800 text-sm">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        {/* Main Recording Button */}
        <button
          onClick={isRecording ? stopRecording : handleStartRecording}
          disabled={!isConnected}
          className={`relative p-4 rounded-full transition-all duration-200 ${
            isRecording
              ? 'bg-error-600 hover:bg-error-700 text-white shadow-lg scale-110'
              : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:scale-105'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {isRecording ? (
            <Square className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
          
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-error-600 animate-ping opacity-75"></div>
          )}
        </button>

        {/* Mute Toggle */}
        {isRecording && (
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors duration-200 ${
              isMuted
                ? 'bg-error-100 text-error-600 hover:bg-error-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        {/* Audio Output Toggle */}
        <button
          className={`p-3 rounded-full transition-colors duration-200 ${
            isPlaying
              ? 'bg-success-100 text-success-600 hover:bg-success-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Status Text */}
      <div className="text-center mt-4">
        {!isConnected ? (
          <p className="text-gray-500 text-sm">Connect to start voice chat</p>
        ) : isRecording ? (
          <p className="text-primary-600 text-sm font-medium">
            {isMuted ? 'Microphone muted' : 'Listening...'}
          </p>
        ) : (
          <p className="text-gray-600 text-sm">Click the microphone to start recording</p>
        )}
      </div>
    </div>
  );
}

export default VoiceChatPanel;