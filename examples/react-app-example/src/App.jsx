import React, { useState } from 'react';
import { GeminiLiveProvider } from 'gemini-live-sdk/react';
import Header from './components/Header.jsx';
import ConfigurationPanel from './components/ConfigurationPanel.jsx';
import MainInterface from './components/MainInterface.jsx';
import ActivityLogs from './components/ActivityLogs.jsx';
import Footer from './components/Footer.jsx';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [config, setConfig] = useLocalStorage('gemini-config', {
    endpoint: 'http://localhost:8080',
    sampleRate: 24000,
    debug: true,
    reconnectAttempts: 3,
    reconnectDelay: 2000
  });

  const [isConfigured, setIsConfigured] = useState(false);

  const handleConfigSave = (newConfig) => {
    setConfig(newConfig);
    setIsConfigured(true);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <Header />
          <div className="max-w-2xl mx-auto mt-8">
            <ConfigurationPanel 
              initialConfig={config}
              onSave={handleConfigSave}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <GeminiLiveProvider config={config}>
        <div className="container mx-auto px-4 py-8">
          <Header />
          <div className="mt-8 grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <MainInterface />
            </div>
            <div className="xl:col-span-1">
              <ActivityLogs />
            </div>
          </div>
          <Footer onReconfigure={() => setIsConfigured(false)} config={config} />
        </div>
      </GeminiLiveProvider>
    </div>
  );
}

export default App;