import React, { useState } from 'react';
import { useGeminiLiveContext } from 'gemini-live-sdk/react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

function TextChatPanel() {
  const { connectionState, sendTextMessage } = useGeminiLiveContext();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendTextMessage(message.trim());
      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (!e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const isConnected = connectionState.status === 'connected';

  return (
    <div className="card animate-slide-up bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center mb-6">
        <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Text Chat</h3>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { label: '👋 Say Hello', message: 'Hello! How can you help me today?' },
            { label: '🧠 Ask About Science', message: 'Can you explain quantum computing in simple terms?' },
            { label: '✍️ Creative Writing', message: 'Write a short poem about artificial intelligence' },
            { label: '🍽️ Meal Planning', message: 'Help me plan a healthy meal for dinner' },
          ].map(({ label, message }) => (
            <button
              key={label}
              onClick={() => setMessage(message)}
              disabled={!isConnected || isSending}
              className="btn-secondary text-sm rounded-md border border-gray-200 px-2 py-1 hover:bg-gray-100 text-gray-700"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                isConnected 
                  ? 'Type your message here... (Press Enter to send, Shift+Enter for new line)'
                  : 'Connect to start chatting...'
              }
              disabled={!isConnected || isSending}
              className="input-field w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-500 resize-none h-20"
              rows={3}
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!message.trim() || !isConnected || isSending}
            className="btn-primary h-20 px-6 rounded bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <span>{message.length} characters</span>
          {!isConnected && (
            <span className="text-yellow-600">⚠️ Not connected</span>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">💡 Tips for better conversations:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Be specific in your questions for more accurate responses</li>
            <li>• Use voice and text together for richer interactions</li>
            <li>• Enable video for visual context when needed</li>
            <li>• Try different types of requests: questions, creative tasks, analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TextChatPanel;
