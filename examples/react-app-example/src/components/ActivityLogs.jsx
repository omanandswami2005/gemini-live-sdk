import React, { useState } from 'react';
import { useGeminiLiveContext } from 'gemini-live-sdk/react';
import { MessageSquare, Settings, AlertTriangle, Trash2, Download } from 'lucide-react';

function ActivityLogs() {
  const { transcriptions, error, customEvents } = useGeminiLiveContext();
  const [activeTab, setActiveTab] = useState('transcriptions');

  // Aggregate AI transcriptions into blocks based on time proximity
  const groupTranscriptions = () => {
    const grouped = [];
    let currentGroup = null;
    const timeThreshold = 5000; // 5 seconds in milliseconds

    transcriptions.forEach((item, index) => {
      if (item.type === 'user') {
        // Push any pending AI group before adding user transcription
        if (currentGroup) {
          grouped.push(currentGroup);
          currentGroup = null;
        }
        grouped.push({ ...item, key: `user-${index}` });
      } else if (item.type === 'ai') {
        const itemTime = new Date(item.timestamp).getTime();
        if (currentGroup) {
          const lastTime = new Date(currentGroup.timestamp).getTime();
          if (itemTime - lastTime <= timeThreshold) {
            // Add to current group
            currentGroup.text += item.text;
          } else {
            // Push current group and start new one
            grouped.push(currentGroup);
            currentGroup = { ...item, key: `ai-${index}`, text: item.text };
          }
        } else {
          // Start new AI group
          currentGroup = { ...item, key: `ai-${index}`, text: item.text };
        }
      }
    });

    // Push any remaining group
    if (currentGroup) {
      grouped.push(currentGroup);
    }

    return grouped;
  };

  const exportLogs = () => {
    const data = {
      transcriptions,
      customEvents,
      errors: error ? [{ id: Date.now().toString(), message: error, timestamp: new Date().toISOString() }] : [],
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    console.warn('Clearing logs not implemented; requires SDK state reset');
  };

  const tabs = [
    { id: 'transcriptions', label: 'Transcriptions', icon: MessageSquare, count: transcriptions.length },
    { id: 'customEvents', label: 'Custom Events', icon: Settings, count: customEvents.length },
    { id: 'errors', label: 'Errors', icon: AlertTriangle, count: error ? 1 : 0 }
  ];

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="card h-fit animate-fade-in bg-white shadow-lg rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Activity Logs</h3>
        <div className="flex space-x-2">
          <button
            onClick={exportLogs}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Export logs"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={clearLogs}
            className="p-2 text-gray-500 hover:text-red-500"
            title="Clear all logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activeTab === 'transcriptions' && (
          <>
            {transcriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transcriptions yet</p>
              </div>
            ) : (
              groupTranscriptions().map((item) => (
                <div key={item.key} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-blue-600 uppercase">{item.type}</span>
                    <span className="text-xs text-blue-500">{formatTime(item.timestamp)}</span>
                  </div>
                  <p className="text-sm text-blue-800">{item.text}</p>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'customEvents' && (
          <>
            {customEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No custom events yet</p>
              </div>
            ) : (
              customEvents.map((item, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-green-600 uppercase">{item.event}</span>
                    <span className="text-xs text-green-500">{formatTime(item.timestamp)}</span>
                  </div>
                  <pre className="text-xs text-green-700 bg-green-100 rounded p-2 overflow-x-auto">
                    {JSON.stringify(item.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'errors' && (
          <>
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-red-600 uppercase">Error</span>
                  <span className="text-xs text-red-500">{formatTime(new Date())}</span>
                </div>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No errors</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ActivityLogs;