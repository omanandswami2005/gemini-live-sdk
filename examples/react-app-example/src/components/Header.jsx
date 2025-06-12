import React from 'react';
import { Mic, Sparkles, Zap } from 'lucide-react';

function Header() {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <Sparkles className="w-12 h-12 text-primary-600 animate-pulse-slow" />
          <Zap className="w-6 h-6 text-warning-500 absolute -top-1 -right-1 animate-bounce-slow" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Gemini Live SDK
        <span className="block text-2xl md:text-3xl text-primary-600 font-normal mt-2">
          React Example
        </span>
      </h1>
      
      <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Experience the power of real-time AI conversation with voice, video, and text capabilities. 
        This comprehensive example showcases all features of the Gemini Live SDK in a beautiful, 
        production-ready React application.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
          <Mic className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">Voice Recording</span>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
          <svg className="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Video Streaming</span>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Text Chat</span>
        </div>
      </div>
    </header>
  );
}

export default Header;