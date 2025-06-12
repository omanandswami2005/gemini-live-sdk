# Gemini Live SDK - React Example

A comprehensive React.js example application showcasing all features of the Gemini Live SDK. This production-ready application demonstrates real-time AI conversation with voice, video, and text capabilities.

## Features

### 🎤 Voice Chat
- Real-time audio recording with visual feedback
- Mute/unmute controls
- Audio visualization during recording
- Live transcription display

### 🎥 Video Streaming
- Webcam integration with toggle controls
- Screen sharing capabilities
- Video overlay controls
- Visual status indicators

### 💬 Text Chat
- Rich text input with quick action buttons
- Character count and validation
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Helpful tips and suggestions

### 📊 Activity Monitoring
- Real-time message logs
- Tool call tracking
- Error monitoring and display
- Export functionality for logs

### ⚙️ Configuration Management
- Persistent configuration storage
- Validation and error handling
- Easy reconfiguration options
- Connection status monitoring

## Getting Started

### Prerequisites

1. **Gemini Live Server**: Make sure you have the Gemini Live Server running
2. **Google API Key**: You'll need a valid Google API key for Gemini
3. **Node.js**: Version 16 or higher

### Installation

1. Navigate to the example directory:
```bash
cd examples/react-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Configuration

On first launch, you'll see a configuration panel where you can set:

- **WebSocket Endpoint**: The URL of your Gemini Live Server (default: `ws://localhost:8080`)
- **Authentication Token**: Optional JWT token if your server requires authentication
- **Sample Rate**: Audio quality setting (16kHz, 24kHz, or 48kHz)
- **Debug Mode**: Enable detailed logging for development

## Usage Guide

### Voice Chat
1. Click the microphone button to start recording
2. Speak naturally - the AI will respond with audio
3. Use the mute button to temporarily disable your microphone
4. Click the square button to stop recording

### Video Features
1. Click "Start Camera" to enable webcam
2. Use "Share Screen" to share your screen with the AI
3. Video controls appear as overlay when active
4. The AI can see and respond to visual content

### Text Chat
1. Type messages in the text area
2. Use quick action buttons for common requests
3. Press Enter to send, Shift+Enter for new lines
4. View character count and connection status

### Activity Logs
- **Messages Tab**: View all transcriptions
- **Tool Calls Tab**: Monitor AI function calls
- **Errors Tab**: Track any issues
- Use export button to save logs as JSON

## Customization

### Styling
The app uses Tailwind CSS with a custom design system:
- Primary colors: Blue theme
- Success: Green indicators
- Warning: Yellow alerts
- Error: Red notifications

### Components
All components are modular and can be customized:
- `Header.jsx`: App title and feature highlights
- `ConfigurationPanel.jsx`: Settings and validation
- `MainInterface.jsx`: Core chat functionality
- `ActivityLogs.jsx`: Monitoring and logging
- `Footer.jsx`: Status and links

### Hooks
Custom hooks for enhanced functionality:
- `useLocalStorage`: Persistent configuration
- `useNotifications`: Toast notifications (ready for implementation)

## Development

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Preview Production Build
```bash
npm run preview
```

## Architecture

### State Management
- React hooks for local state
- Context API for SDK integration
- Local storage for persistence

### Component Structure
```
App
├── Header (branding and features)
├── ConfigurationPanel (setup and validation)
├── MainInterface
│   ├── ConnectionStatus
│   ├── VoiceChatPanel
│   ├── VideoPanel
│   └── TextChatPanel
├── ActivityLogs (monitoring)
└── Footer (status and links)
```

### SDK Integration
- Uses `GeminiLiveProvider` for context
- Leverages all SDK hooks and components
- Handles events and state synchronization

## Best Practices Demonstrated

### User Experience
- Progressive disclosure of features
- Clear visual feedback
- Accessible design patterns
- Responsive layout

### Error Handling
- Graceful degradation
- User-friendly error messages
- Retry mechanisms
- Validation feedback

### Performance
- Efficient re-renders
- Optimized event handling
- Memory leak prevention
- Smooth animations

## Troubleshooting

### Common Issues

**Connection Failed**
- Verify the Gemini Live Server is running
- Check the WebSocket endpoint URL
- Ensure your API key is valid

**Audio Not Working**
- Grant microphone permissions
- Check browser audio settings
- Verify sample rate compatibility

**Video Issues**
- Grant camera permissions
- Check browser video settings
- Ensure HTTPS for production

### Debug Mode
Enable debug mode in configuration to see:
- Detailed connection logs
- SDK event information
- Network request details

## Contributing

This example serves as a reference implementation. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This example is part of the Gemini Live SDK and follows the same MIT license.