import React from 'react';
import { useGeminiLiveContext } from 'gemini-live-sdk/react';
import VoiceChatPanel from './VoiceChatPanel.jsx';
import VideoPanel from './VideoPanel.jsx';
import TextChatPanel from './TextChatPanel.jsx';
import ConnectionStatus from './ConnectionStatus.jsx';

function MainInterface() {
  const { client } = useGeminiLiveContext();

  return (
    <div className="space-y-6">
      <ConnectionStatus />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VoiceChatPanel />
        <VideoPanel />
      </div>
      <TextChatPanel />
    </div>
  );
}

export default MainInterface;