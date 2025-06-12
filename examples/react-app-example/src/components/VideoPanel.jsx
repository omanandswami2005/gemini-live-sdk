import React, { useRef, useEffect, useState } from 'react';
import { useGeminiLiveContext } from 'gemini-live-sdk/react';
import { Video, Camera, Monitor, VideoOff } from 'lucide-react';

function VideoPanel() {
  const { setVideoElement, toggleWebcam, toggleScreenShare, webcamActive, screenActive, switchCamera } = useGeminiLiveContext();
  const videoRef = useRef(null);
  const [isVideoElementSet, setIsVideoElementSet] = useState(false);
  const [error, setError] = useState(null);

  const handleToggleWebcam = async () => {
    try {
      await toggleWebcam();
    } catch (err) {
      console.error('Failed to toggle webcam:', err);
    }
  };

  const handleToggleScreenShare = async () => {
    try {
      await toggleScreenShare();
    } catch (err) {
      console.error('Failed to toggle screen share:', err);
    }
  };

  const handleSwitchCamera = async () => {
    try {
      await switchCamera();
    } catch (err) {
      console.error('Failed to switch camera:', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white shadow-xl rounded-2xl p-8 border border-slate-200/60 backdrop-blur-sm">
      {/* Hidden button for testing - styled to be less obtrusive */}
      <button 
        onClick={() => {
          setVideoElement(videoRef.current, setError);
          setIsVideoElementSet(true);
        }}
        className="mb-4 px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors duration-200 border border-slate-200 bolder-5"
      >
        Initialize Video Element
      </button>
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg mr-4">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Video Controls</h3>
            <p className="text-slate-500 text-sm">Manage your camera and screen sharing</p>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="flex flex-col items-end space-y-2">
          {webcamActive && (
            <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Webcam Active
            </div>
          )}
          {screenActive && (
            <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              Screen Sharing
            </div>
          )}
          {!webcamActive && !screenActive && (
            <div className="flex items-center bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-sm">
              <VideoOff className="w-3 h-3 mr-2" />
              No Video Active
            </div>
          )}
        </div>
      </div>

      {/* Video Display */}
      <div className="relative mb-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full max-w-2xl h-64 object-cover bg-slate-800 border-2 border-slate-700 rounded-xl mx-auto shadow-lg"
          ></video>
          
          {/* Video Overlay */}
          {!webcamActive && !screenActive && (
            <div className="absolute inset-6 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-400 text-lg font-medium">No video input</p>
                <p className="text-slate-500 text-sm">Start your webcam or screen share to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handleToggleWebcam}
          className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${
            webcamActive
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
          } ${
            (screenActive || !isVideoElementSet)
              ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100'
              : 'hover:shadow-xl'
          }`}
          disabled={screenActive || !isVideoElementSet}
        >
          <Camera className="w-5 h-5 mr-2" />
          {webcamActive ? 'Stop Webcam' : 'Start Webcam'}
        </button>

        <button
          onClick={handleToggleScreenShare}
          className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${
            screenActive
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
          } ${
            (webcamActive || !isVideoElementSet)
              ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100'
              : 'hover:shadow-xl'
          }`}
          disabled={webcamActive || !isVideoElementSet}
        >
          <Monitor className="w-5 h-5 mr-2" />
          {screenActive ? 'Stop Screen Share' : 'Start Screen Share'}
        </button>

        <button
          onClick={handleSwitchCamera}
          className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white ${
            (!webcamActive || !isVideoElementSet)
              ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100'
              : 'hover:shadow-xl'
          }`}
          disabled={!webcamActive || !isVideoElementSet}
        >
          <Camera className="w-5 h-5 mr-2" />
          Switch Camera
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm font-medium">Error: {error}</p>
        </div>
      )}
    </div>
  );
}

export default VideoPanel;