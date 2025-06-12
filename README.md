
# Gemini Live SDK

[![npm version](https://badge.fury.io/js/npm.svg)](https://badge.fury.io/js/gemini-live-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, production-ready SDK for integrating Google's Gemini Live API with real-time audio, video, and text capabilities. Built with JavaScript and featuring full React support.

## 🚀 Features

- **🎤 Real-time Audio** - High-quality audio recording with volume visualization and mute controls
- **🎥 Video Streaming** - Webcam integration, screen sharing, and AI vision capabilities
- **💬 Text Chat** - Send text messages alongside voice interactions
- **🔧 Tool Integration** - Support for function calling and custom tool responses
- **⚛️ React Components** - Pre-built hooks and components for React applications
- **🔒 Authentication** - JWT-based authentication with middleware support
- **📊 Metrics & Monitoring** - Built-in connection monitoring and performance metrics
- **🎯 TypeScript** - Full TypeScript support with comprehensive type definitions
- **🌐 Multi-format** - ES modules, CommonJS, UMD, and React-specific builds

## 📦 Installation

```bash
npm install gemini-live-sdk
```

## 🏗️ Architecture

The SDK is built with a modular architecture supporting multiple deployment scenarios:

```
gemini-live-sdk/
├── 📁 Client SDK (Browser)     # Real-time audio/video/text client
├── 📁 Server SDK (Node.js)     # WebSocket server with Google AI integration
├── 📁 React Hooks              # Pre-built React hooks
└── 📁 UMD Build (CDN)          # Browser-compatible bundle
```

### Package Exports

```javascript
// Main client SDK
import { GeminiLiveClient } from 'gemini-live-sdk';

// Server SDK
import { GeminiLiveServer } from 'gemini-live-sdk/server';

// React hooks
import { GeminiLiveProvider, useGeminiLive } from 'gemini-live-sdk/react';

// UMD build (browser/HTML CDN)
<script src="https://cdn.jsdelivr.net/npm/gemini-live-sdk/dist/umd/index.umd.js"></script>
<script>
const config = {
          endpoint: "ws://localhost:<SERVER_PORT>",
          debug: true,
};
const client = new window.GeminiLiveSDK.GeminiLiveClient(config);
</script>
```

## 🚀 Quick Start

### 1. Server Setup (Node.js)

Create a WebSocket server that connects to Google's Gemini Live API:

```javascript
import { GeminiLiveServer } from 'gemini-live-sdk/server';

const server = new GeminiLiveServer({
  googleApiKey: 'your-google-gemini-api-key',
  port: 8080,
  enableAiAudioTranscription: true,
  enableUserAudioTranscription: true,
  googleSetup: {
    model: 'models/gemini-2.0-flash-exp',
    system_instruction: {
      role: 'user',
      parts: [{ text: 'You are a helpful assistant.' }]
    }
  },
  events: {
    aiAudioTranscriptionReceived: (socket, data) => {
      // console.log(`AI Transcription for socket ${socket.id}: ${data.text}`);
    
    },
    userAudioTranscriptionReceived: (socket, data) => {
      // console.log(`User Transcription for socket ${socket.id}: ${data.text}`);
    },
    messageReceived: (socket, parsedData) => {
      // console.log(`Message received from socket ${socket.id}:`, parsedData);
      // Emit custom transcription event if transcription data exists
      if (parsedData.serverContent?.outputTranscription?.text) {
        socket.emit('customTranscription', {
          type: 'ai',
          text: parsedData.serverContent.outputTranscription.text,
          timestamp: new Date().toISOString()
        });
      }
      if (parsedData.serverContent?.inputTranscription?.text) {
        socket.emit('customTranscription', {
          type: 'user',
          text: parsedData.serverContent.inputTranscription.text,
          timestamp: new Date().toISOString()
        });
      }
    },
    toolCall: (socket, toolCall) => {
      console.log(`Tool call from socket ${socket.id}:`, toolCall);
    },
    // custome event listening
    clientAction: (socket, data) => {
      console.log(`Received clientAction from ${socket.id}:`, data);
      // Emit a custom response back to the client
      socket.emit('serverResponse', { response: `Server received: ${data.action}` });
    },
    // custome event listening
    transcriptionAck: (socket, data) => {
      console.log(`Received transcriptionAck from ${socket.id}:`, {
        type: data.type,
        text: data.text,
        receivedAt: data.receivedAt
      });
      // Optional: Respond back to client to confirm receipt
      socket.emit('ackConfirmed', { message: `Ack received for ${data.type} transcription` });
    }
  },
  hooks: {
    onClientConnect: (socket) => {
      console.log(`Client connected: ${socket.id}`);
    },
    onDisconnect: (socket, reason) => {
      console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
    },
    onError: (err, socket) => {
      console.error(`Error for socket ${socket.id}: ${err.message}`);
    }
  }
});

server.start();
console.log('🚀 Gemini Live Server running on port 8080');
```

### 2. Client Usage (Vanilla JavaScript)

```javascript
import { GeminiLiveClient } from 'gemini-live-sdk';

const client = new GeminiLiveClient({
  endpoint: 'ws://localhost:8080',
  debug: true
});

// Connection events
client.on('connectionStateChange', (state) => {
  console.log('Connection state:', state.status);
});

// Start voice recording
await client.startRecording();

// Listen for AI responses
// Audio Will be played Automatically
// Optionally handle the audio data below
client.on('audioReceived', (audioData) => {
  console.log('Received AI audio response');
});

// Send text messages to AI
client.sendTextMessage('Hello, how can you help me today?');

// Video integration
const videoElement = document.getElementById('video');
client.setVideoElement(videoElement);
await client.toggleWebcam(); // Start webcam
```

### 3. React Integration

```jsx
import React from 'react';
import { GeminiLiveProvider, useGeminiLive } from 'gemini-live-sdk/react';

function App() {
  return (
    <GeminiLiveProvider config={{ endpoint: 'ws://localhost:8080' }}>
      <VoiceChat />
    </GeminiLiveProvider>
  );
}

function VoiceChat() {
  const {
    connectionState,
    isRecording,
    startRecording,
    stopRecording,
    sendTextMessage,
    toggleWebcam
  } = useGeminiLive();

  return (
    <div>
      <div>Status: {connectionState.status}</div>
    
      <button 
        onClick={isRecording ? stopRecording : startRecording}
        disabled={connectionState.status !== 'connected'}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    
      <button onClick={() => toggleWebcam()}>
        Toggle Camera
      </button>
    
      <button onClick={() => sendTextMessage('Hello!')}>
        Send Message
      </button>
    </div>
  );
}
```

### 4. HTML/CDN Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/gemini-live-sdk/dist/umd/index.umd.js"></script>
</head>
<body>
  <button id="recordBtn">Start Recording</button>
  <video id="videoElement" autoplay muted></video>

  <script>
    const client = new GeminiLiveSDK.GeminiLiveClient({
      endpoint: 'ws://localhost:8080'
    });

    document.getElementById('recordBtn').onclick = async () => {
      await client.startRecording();
    };

    client.setVideoElement(document.getElementById('videoElement'));
  </script>
</body>
</html>
```

## 📚 API Reference

### GeminiLiveClient

The main client class for browser-side integration.

#### Constructor

```javascript
const client = new GeminiLiveClient(config);
```

**Config Options:**

- `endpoint` (string, required) - WebSocket server URL
- `token` (string, optional) - JWT authentication token
- `sampleRate` (number, default: 24000) - Audio sample rate
- `debug` (boolean, default: false) - Enable debug logging
- `reconnectAttempts` (number, default: 3) - Max reconnection attempts
- `reconnectDelay` (number, default: 2000) - Delay between reconnections

#### Audio Methods

```javascript
// Start audio recording
await client.startRecording();

// Stop audio recording
client.stopRecording();

// Toggle microphone mute
client.toggleMute();

// Create volume meters for visualization
client.createUserVolumeMeter(progressElement);
client.createAIVolumeMeter(progressElement);
```

#### Video Methods

```javascript
// Set video element for display
client.setVideoElement(videoElement, errorCallback);

// Toggle webcam
const isActive = await client.toggleWebcam();

// Toggle screen sharing
const isSharing = await client.toggleScreenShare();

// Switch between front/back camera
await client.switchCamera();
```

#### Messaging Methods

```javascript
// Send text message
client.sendTextMessage('Hello, AI!');

// Send tool response
client.sendToolResponse([{
  name: 'function_name',
  response: { result: 'success' }
}]);

// Send custom events
client.sendCustomEvent('customEvent', { data: 'value' });

// Listen for custom events
client.onCustomEvent('serverResponse', (data) => {
  console.log('Server response:', data);
});
```

#### Event Handling

```javascript
// Connection events
client.on('connectionStateChange', (state) => {});
client.on('error', (error) => {});

// Audio events
client.on('recordingStarted', () => {});
client.on('recordingStopped', () => {});
client.on('muteToggled', (isMuted) => {});
client.on('audioReceived', (audioData) => {});

// Transcription events
client.on('aiTranscription', (data) => {});
client.on('userTranscription', (data) => {});

// Tool events
client.on('toolCall', (toolCall) => {});
```

### GeminiLiveServer

The server class for Node.js backend integration.

#### Constructor

```javascript
const server = new GeminiLiveServer(config);
```

**Config Options:**

- `googleApiKey` (string, required) - Your Google API key
- `port` (number, default: 8080) - Server port
- `enableAiAudioTranscription` (boolean, default: false) - Enable AI transcription
- `enableUserAudioTranscription` (boolean, default: false) - Enable user transcription
- `googleSetup` (object) - Google AI configuration
- `jwtSecret` (string, optional) - JWT secret for authentication
- `enableMetrics` (boolean, default: false) - Enable metrics collection
- `debug` (boolean, default: false) - Enable debug logging

#### Google AI Configuration

```javascript
googleSetup: {
  model: 'models/gemini-2.0-flash-exp',
  system_instruction: {
    role: 'user',
    parts: [{ text: 'You are a helpful assistant.' }]
  },
  tools: [
    {
      functionDeclarations: [{
        name: 'get_weather',
        description: 'Get weather information',
        parameters: {
          type: 'OBJECT',
          properties: {
            location: { type: 'STRING', description: 'City name' }
          },
          required: ['location']
        }
      }]
    }
  ]
}
```

#### Event Hooks

```javascript
hooks: {
  onClientConnect: (socket) => {
    console.log(`Client ${socket.id} connected`);
  },
  onDisconnect: (socket, reason) => {
    console.log(`Client ${socket.id} disconnected: ${reason}`);
  },
  onError: (error, socket) => {
    console.error(`Error for ${socket.id}:`, error);
  }
},
events: {
  aiAudioTranscriptionReceived: (socket, data) => {
    console.log('AI transcription:', data.text);
  },
  userAudioTranscriptionReceived: (socket, data) => {
    console.log('User transcription:', data.text);
  },
  toolCall: (socket, toolCall) => {
    // Handle tool calls
    console.log('Tool called:', toolCall);
  },
  messageReceived: (socket, message) => {
    // Handle all messages
  }
}
```

#### Methods

```javascript
// Start the server
server.start();

// Send tool responses
server.sendToolResponse(socket, functionResponses);

// Get metrics (if enabled)
const metrics = server.getMetrics();

// Subscribe to metrics updates
const unsubscribe = server.subscribeToMetrics((metrics) => {
  console.log('Active connections:', metrics.activeConnections);
});
```

## ⚛️ React Integration

### Hooks

#### useGeminiLive

Main hook for Gemini Live integration:

```javascript
const {
  client,                    // GeminiLiveClient instance
  connectionState,           // Connection status object
  isRecording,              // Boolean recording state
  isMuted,                  // Boolean mute state
  error,                    // Error message string
  transcriptions,           // Array of transcription objects
  customEvents,             // Array of custom events
  webcamActive,             // Boolean webcam state
  screenActive,             // Boolean screen share state
  
  // Methods
  startRecording,
  stopRecording,
  toggleMute,
  sendTextMessage,
  sendToolResponse,
  setVideoElement,
  toggleWebcam,
  toggleScreenShare,
  switchCamera,
  createUserVolumeMeter,
  createAIVolumeMeter,
  sendCustomEvent,
  onCustomEvent
} = useGeminiLive(config);
```

### Components

#### GeminiLiveProvider

Context provider for the SDK:

```jsx
<GeminiLiveProvider config={config}>
  <YourApp />
</GeminiLiveProvider>
```

#### VoiceChat

Pre-built voice chat component:

```jsx
<VoiceChat
  showVideoControls={true}
  showTextInput={true}
  onTranscription={(text) => console.log(text)}
  onToolCall={(call) => console.log(call)}
  className="custom-class"
/>
```

#### AudioVisualizer

Audio level visualization component:

```jsx
<AudioVisualizer
  volumeLevel={75}
  color="#3b82f6"
  backgroundColor="#e5e7eb"
  className="custom-class"
/>
```

## 🔧 Advanced Usage

### Custom Tool Integration

```javascript
// Server-side tool handling
const server = new GeminiLiveServer({
  googleApiKey: 'your-key',
  googleSetup: {
    tools: [{
      functionDeclarations: [{
        name: 'search_database',
        description: 'Search the company database',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'Search query' },
            limit: { type: 'NUMBER', description: 'Max results' }
          },
          required: ['query']
        }
      }]
    }]
  },
  events: {
    toolCall: async (socket, toolCall) => {
      if (toolCall.name === 'search_database') {
        const results = await searchDatabase(toolCall.parameters);
        server.sendToolResponse(socket, [{
          name: toolCall.name,
          response: { results }
        }]);
      }
    }
  }
});
```

### Authentication & Security

```javascript
// Server with JWT authentication
const server = new GeminiLiveServer({
  googleApiKey: 'your-key',
  jwtSecret: 'your-jwt-secret',
  // Custom auth middleware
  authMiddleware: (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const user = jwt.verify(token, 'your-secret');
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  }
});

// Client with authentication
const client = new GeminiLiveClient({
  endpoint: 'ws://localhost:8080',
  token: 'your-jwt-token'
});
```

### Metrics & Monitoring

```javascript
// Enable metrics collection
const server = new GeminiLiveServer({
  googleApiKey: 'your-key',
  enableMetrics: true,
  metricsInterval: 5000
});

// Subscribe to metrics
server.subscribeToMetrics((metrics) => {
  console.log('📊 Server Metrics:', {
    activeConnections: metrics.activeConnections,
    messagesProcessed: metrics.messagesProcessed,
    errors: metrics.errors
  });
});
```

### Custom Events

```javascript
// Client-side custom events
client.sendCustomEvent('userAction', {
  action: 'button_click',
  timestamp: Date.now()
});

client.onCustomEvent('serverNotification', (data) => {
  console.log('Server notification:', data);
});

// Server-side custom event handling
server.config.events.userAction = (socket, data) => {
  console.log(`User action from ${socket.id}:`, data);
  
  // Broadcast to all clients
  socket.broadcast.emit('userActionBroadcast', {
    userId: socket.id,
    action: data.action
  });
};
```

## 📁 Examples

The repository includes three comprehensive examples:

### 1. Node.js Server (`examples/server_nodejs/`)

Basic server implementation showing:

- Google API integration
- Custom event handling
- Tool call processing
- Metrics monitoring

### 2. React Application (`examples/react-app-example/`)

Full-featured React app demonstrating:

- Complete UI with voice, video, and text chat
- Configuration management
- Activity logging
- Error handling
- Responsive design

### 3. HTML/CDN Example (`examples/html-cdn-example/`)

Vanilla JavaScript implementation featuring:

- UMD build usage
- Audio visualization
- Video controls
- Real-time transcription
- Tool integration

## 🛠️ Development

### Building the SDK

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Build specific packages
npm run build:main      # Main client SDK
npm run build:server    # Server SDK
npm run build:react     # React components
npm run build:umd       # UMD browser build
```

### Project Structure

```
src/
├── core/                 # Core client functionality
│   ├── gemini-client.js  # Main client class
│   └── types.js          # TypeScript definitions
├── audio/                # Audio processing
│   ├── audio-recorder.js # Audio recording
│   ├── audio-streamer.js # Audio playback
│   └── worklets/         # Audio worklets
├── media/                # Video handling
│   └── media-handler.js  # Camera/screen capture
├── react/                # React components
│   ├── hooks/            # React hooks
│   └── components/       # React components
├── server/               # Server implementation
│   └── gemini-server.js  # WebSocket server
└── utils/                # Utilities
    ├── audio-utils.js    # Audio helpers
    ├── volume-meter.js   # Volume visualization
    └── worklet-registry.js # Worklet management
```

### Running Examples

```bash
# Start the server
cd examples/server_nodejs
npm start

# Run React example
cd examples/react-app-example
npm install && npm run dev

# Serve HTML example
cd examples/html-cdn-example
python -m http.server 3001
```

## 🌐 Browser Compatibility

| Feature         | Chrome | Firefox | Safari | Edge |
| --------------- | ------ | ------- | ------ | ---- |
| Audio Recording | ✅     | ✅      | ✅     | ✅   |
| Video Streaming | ✅     | ✅      | ✅     | ✅   |
| Screen Sharing  | ✅     | ✅      | ⚠️*  | ✅   |
| WebSocket       | ✅     | ✅      | ✅     | ✅   |
| Audio Worklets  | ✅     | ✅      | ✅     | ✅   |

*Safari requires HTTPS for screen sharing

### Requirements

- **Modern Browser** with WebRTC support
- **Secure Context** (HTTPS or localhost)
- **Microphone/Camera Permissions** for media features
- **Node.js 16+** for server components

## 🔒 Security Considerations

- **API Keys**: Never expose Google API keys in client-side code
- **Authentication**: Use JWT tokens for client authentication
- **HTTPS**: Always use HTTPS in production for media access
- **Permissions**: Request minimal necessary permissions
- **Validation**: Validate all tool call parameters server-side

## 🐛 Troubleshooting

### Common Issues

**Connection Failed**

```javascript
// Check server is running and accessible
client.on('error', (error) => {
  console.error('Connection error:', error.message);
});
```

**Audio Not Working**

```javascript
// Ensure secure context and permissions
if (!navigator.mediaDevices?.getUserMedia) {
  console.error('getUserMedia not supported');
}
```

**Video Issues**

```javascript
// Check camera permissions and HTTPS
client.setVideoElement(videoElement, (error) => {
  console.error('Video error:', error);
});
```

### Debug Mode

Enable debug logging for detailed information:

```javascript
// Client debug
const client = new GeminiLiveClient({
  endpoint: 'ws://localhost:8080',
  debug: true
});

// Server debug
const server = new GeminiLiveServer({
  googleApiKey: 'your-key',
  debug: true
});
```

## 📄 License

MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/omanandswami2005/gemini-live-sdk/issues)
- **Examples**: See `examples/` directory
- **Community**: [Discord Server](https://discord.gg/gemini-live-sdk-community-support)

---

<div align="center">

**Built with ❤️ for the AI community**

[Website](https://omanandswami2005.tech)  • [Examples](https://github.com/omanandswami2005/gemini-live-sdk/tree/main/examples)

</div>
