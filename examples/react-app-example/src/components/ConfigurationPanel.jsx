import React, { useState } from 'react';
import { Settings, Save, AlertCircle, CheckCircle, Info } from 'lucide-react';

function ConfigurationPanel({ initialConfig, onSave }) {
  const [config, setConfig] = useState(initialConfig);
  const [errors, setErrors] = useState({});

  const validateConfig = () => {
    const newErrors = {};
    
    if (!config.endpoint.trim()) {
      newErrors.endpoint = 'Endpoint is required';
    } else if (!config.endpoint.startsWith('ws://') && !config.endpoint.startsWith('wss://')) {
      newErrors.endpoint = 'Endpoint must start with ws:// or wss://';
    }
    
    if (config.sampleRate < 8000 || config.sampleRate > 48000) {
      newErrors.sampleRate = 'Sample rate must be between 8000 and 48000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateConfig()) {
      onSave(config);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 text-primary-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-primary-900 mb-1">Before You Start</h3>
            <p className="text-sm text-primary-700 mb-2">
              Make sure you have the Gemini Live Server running. You can start it with:
            </p>
            <code className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs">
              npm run server
            </code>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-2">
            WebSocket Endpoint *
          </label>
          <input
            type="text"
            id="endpoint"
            value={config.endpoint}
            onChange={(e) => handleInputChange('endpoint', e.target.value)}
            className={`input-field ${errors.endpoint ? 'border-error-500 focus:ring-error-500' : ''}`}
            placeholder="ws://localhost:8080"
          />
          {errors.endpoint && (
            <div className="flex items-center mt-2 text-error-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">{errors.endpoint}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
            Authentication Token
          </label>
          <input
            type="password"
            id="token"
            value={config.token}
            onChange={(e) => handleInputChange('token', e.target.value)}
            className="input-field"
            placeholder="Optional JWT token"
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty if your server doesn't require authentication
          </p>
        </div>

        <div>
          <label htmlFor="sampleRate" className="block text-sm font-medium text-gray-700 mb-2">
            Sample Rate (Hz)
          </label>
          <select
            id="sampleRate"
            value={config.sampleRate}
            onChange={(e) => handleInputChange('sampleRate', parseInt(e.target.value))}
            className={`input-field ${errors.sampleRate ? 'border-error-500 focus:ring-error-500' : ''}`}
          >
            <option value={16000}>16,000 Hz (Standard)</option>
            <option value={24000}>24,000 Hz (High Quality)</option>
            <option value={48000}>48,000 Hz (Studio Quality)</option>
          </select>
          {errors.sampleRate && (
            <div className="flex items-center mt-2 text-error-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">{errors.sampleRate}</span>
            </div>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="debug"
            checked={config.debug}
            onChange={(e) => handleInputChange('debug', e.target.checked)}
            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
          />
          <label htmlFor="debug" className="ml-2 text-sm font-medium text-gray-700">
            Enable debug mode
          </label>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 mr-1 text-success-500" />
            Configuration will be saved locally
          </div>
          
          <button
            type="submit"
            className="btn-primary flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}

export default ConfigurationPanel;