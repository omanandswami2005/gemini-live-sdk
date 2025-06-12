import React from 'react';
import { useGeminiLiveContext } from 'gemini-live-sdk/react';
import { Wifi, WifiOff, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

function ConnectionStatus() {
  const { connectionState, client } = useGeminiLiveContext();

  const getStatusInfo = () => {
    switch (connectionState.status) {
      case 'connected':
        return {
          icon: CheckCircle,
          text: 'Connected',
          description: 'Ready for AI conversation',
          className: 'bg-success-50 border-success-200 text-success-800',
          iconClassName: 'text-success-600'
        };
      case 'connecting':
        return {
          icon: Loader2,
          text: 'Connecting...',
          description: 'Establishing connection to AI service',
          className: 'bg-warning-50 border-warning-200 text-warning-800',
          iconClassName: 'text-warning-600 animate-spin'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          text: 'Connection Error',
          description: connectionState.error || 'Failed to connect to AI service',
          className: 'bg-error-50 border-error-200 text-error-800',
          iconClassName: 'text-error-600'
        };
      default:
        return {
          icon: WifiOff,
          text: 'Disconnected',
          description: 'Not connected to AI service',
          className: 'bg-gray-50 border-gray-200 text-gray-800',
          iconClassName: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`card border-2 ${statusInfo.className} animate-slide-up`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <StatusIcon className={`w-6 h-6 ${statusInfo.iconClassName}`} />
          <div>
            <h3 className="font-semibold text-lg">{statusInfo.text}</h3>
            <p className="text-sm opacity-75">{statusInfo.description}</p>
          </div>
        </div>

        {connectionState.status === 'connected' && (
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="status-indicator status-connected"></div>
              <span>Live</span>
            </div>
            {client?.isConnected && (
              <div className="bg-success-100 text-success-800 px-3 py-1 rounded-full font-medium">
                Ready
              </div>
            )}
          </div>
        )}

        {connectionState.reconnectAttempt && (
          <div className="text-sm">
            Attempt {connectionState.reconnectAttempt}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectionStatus;