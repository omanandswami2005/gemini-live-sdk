import React, { useRef, useEffect, useState } from 'react';
import { useGeminiLiveContext } from 'gemini-live-sdk/react';
import { Mic, Volume2 } from 'lucide-react';

function AudioVisualizer({ isActive = false }) {
  const { createUserVolumeMeter, createAIVolumeMeter, isRecording, isMuted } = useGeminiLiveContext();
  const userProgressRef = useRef(null);
  const aiProgressRef = useRef(null);
  const isVolumeMetersInitialized = useRef(false);
  const [userVolume, setUserVolume] = useState(0);
  const [aiVolume, setAiVolume] = useState(0);

  // Initialize volume meters
  useEffect(() => {
    if (
      isRecording &&
      !isMuted &&
      userProgressRef.current &&
      aiProgressRef.current &&
      !isVolumeMetersInitialized.current
    ) {
      try {
        console.log('Initializing volume meters...');
        createUserVolumeMeter(userProgressRef.current);
        createAIVolumeMeter(aiProgressRef.current);
        isVolumeMetersInitialized.current = true;
      } catch (error) {
        console.error('Failed to initialize volume meters:', error);
      }
    }

    if (!isRecording) {
      isVolumeMetersInitialized.current = false;
    }
  }, [isRecording, isMuted, createUserVolumeMeter, createAIVolumeMeter]);

  // Poll progress bar values
  useEffect(() => {
    if (!isRecording || isMuted) {
      setUserVolume(0);
      setAiVolume(0);
      return;
    }

    const interval = setInterval(() => {
      if (userProgressRef.current) {
        setUserVolume(parseFloat(userProgressRef.current.value) || 0);
      }
      if (aiProgressRef.current) {
        setAiVolume(parseFloat(aiProgressRef.current.value) || 0);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isRecording, isMuted]);

  // Generate bar heights based on volume (0-100)
  const generateBarHeights = (volume, barCount = 15) => {
    const normalizedVolume = Math.min(volume / 100, 1); // 0-1
    return Array.from({ length: barCount }, (_, i) => {
      const position = i / barCount;
      const intensity = Math.max(0, normalizedVolume - position * 0.7);
      return Math.max(4, intensity * 48); // Min height 4px, max 48px
    });
  };

  const userBarHeights = generateBarHeights(userVolume);
  const aiBarHeights = generateBarHeights(aiVolume);

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-white">
          <Mic className="w-4 h-4 mr-2 text-blue-600" />
          <span>Audio Visualizer</span>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive && !isMuted ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          {isActive && !isMuted ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Visualizer Sections */}
      <div className="space-y-4">
        {/* User Audio Visualizer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-300">
              <Mic className="w-3 h-3 mr-1 text-green-400" />
              <span>User Audio</span>
            </div>
            <span className="text-xs text-gray-400">{userVolume.toFixed(0)}%</span>
          </div>
          <div className="flex items-end justify-center space-x-0.5 h-12 bg-gray-800 rounded p-2">
            {userBarHeights.map((height, i) => (
              <div
                key={`user-${i}`}
                className="w-1 bg-gradient-to-t from-green-600 to-green-400 rounded-full"
                style={{
                  height: `${height}px`,
                  transition: 'height 0.1s ease',
                  opacity: isActive && !isMuted ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* AI Audio Visualizer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-300">
              <Volume2 className="w-3 h-3 mr-1 text-blue-400" />
              <span>AI Audio</span>
            </div>
            <span className="text-xs text-gray-400">{aiVolume.toFixed(0)}%</span>
          </div>
          <div className="flex items-end justify-center space-x-0.5 h-12 bg-gray-800 rounded p-2">
            {aiBarHeights.map((height, i) => (
              <div
                key={`ai-${i}`}
                className="w-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full"
                style={{
                  height: `${height}px`,
                  transition: 'height 0.1s ease',
                  opacity: isActive && !isMuted ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mt-4 space-y-2">
        <div>
          <label className="text-xs text-gray-400">User Input Volume:</label>
          <progress
            id="volume-meter-user"
            max="100"
            value={userVolume}
            ref={userProgressRef}
            className="w-full h-2 rounded-full progress-bar progress-bar-user"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Incoming Voice Volume:</label>
          <progress
            id="volume-meter-stream"
            max="100"
            value={aiVolume}
            ref={aiProgressRef}
            className="w-full h-2 rounded-full progress-bar progress-bar-ai"
          />
        </div>
      </div>
    </div>
  );
}

export default AudioVisualizer;