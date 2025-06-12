# Gemini Live SDK - HTML CDN Example

A complete HTML/JavaScript example demonstrating the Gemini Live SDK functionality using the UMD build. This example shows how to integrate real-time AI conversation with voice, video, and text capabilities using vanilla JavaScript and the Gemini Live SDK.

## Features

### 🎤 Voice Recording
- Real-time audio capture with visual feedback
- Mute/unmute controls during recording
- Audio visualization with animated bars
- Live transcription display

### 🎥 Video Streaming
- Webcam integration with permission handling
- Screen sharing capabilities (when implemented in SDK)
- Video overlay controls
- AI vision with frame capture

### 💬 Text Chat
- Rich text input with quick action buttons
- Character count and real-time validation
- Keyboard shortcuts (Enter to send)
- Pre-defined message templates

### 📊 Activity Monitoring
- Real-time connection status
- Activity log with timestamps
- Error handling and user feedback
- Visual status indicators

## How to Run

### Prerequisites

1. **Build the UMD version**: Make sure you have built the UMD version of the SDK
   ```bash
   npm run build:lib
   ```

2. **Gemini Live Server**: Make sure the server is running on port 8080
   ```bash
   node server.js
   ```

3. **Web Server**: Serve the HTML file through a web server (required for camera/microphone access)

### Option 1: Using Python (Recommended)
```bash
cd examples/html-cdn-example
python -m http.server 3001
```
Then open: `http://localhost:3001`

### Option 2: Using Node.js
```bash
cd examples/html-cdn-example
npx serve -p 3001
```
Then open: `http://localhost:3001`

### Option 3: Using Live Server (VS Code)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Usage Guide

### 1. Connect to Server
- Click the "Connect" button to establish connection to the Gemini Live Server
- Wait for the status to show "Connected" with a green indicator

### 2. Voice Chat
- Click the microphone button to start recording
- Speak naturally - the AI will respond with audio
- Use the mute button to temporarily disable your microphone
- Click the square button to stop recording
- View transcriptions in the blue box below the controls

### 3. Video Features
- Click "Start Camera" to enable webcam
- Click "Share Screen" to share your screen (when implemented)
- Use overlay controls when video is active:
  - Square buttons to stop camera/screen sharing
  - Play/Pause button to toggle AI vision
- The AI can see and respond to visual content when AI vision is active

### 4. Text Chat
- Type messages in the text area
- Use quick action buttons for common requests
- Press Enter to send, Shift+Enter for new lines
- View character count at the bottom

### 5. Activity Log
- Monitor all interactions in the activity log
- See connection status changes
- Track sent messages and received transcriptions
- View timestamps for all activities

## Technical Details

### Dependencies
- **Gemini Live SDK**: Loaded via UMD build from `../../dist/index.umd.js`
- **Tailwind CSS**: For styling and responsive design
- **Lucide Icons**: For beautiful, consistent icons

### SDK Integration
- Uses `GeminiLiveSDK.GeminiLiveClient` from the UMD build
- Connects to Gemini Live Server via WebSocket
- Handles audio recording, video streaming, and text messaging
- Receives transcriptions and AI responses

### Browser Requirements
- Modern browser with WebRTC support
- Camera and microphone permissions
- JavaScript enabled
- Secure context (HTTPS or localhost)

## API Usage

### Client Initialization
```javascript
const client = new GeminiLiveSDK.GeminiLiveClient({
    endpoint: 'ws://localhost:8080',
    sampleRate: 24000,
    debug: true
});
```

### Event Handling
```javascript
client.on('connectionStateChange', (state) => {
    // Handle connection state changes
});

client.on('transcriptionUpdate', (text) => {
    // Handle transcription updates
});

client.on('recordingStarted', () => {
    // Handle recording start
});
```

### Methods
```javascript
// Audio
await client.startRecording();
client.stopRecording();
client.toggleMute();

// Video
client.setVideoElement(videoElement);
await client.toggleWebcam();

// Text
client.sendTextMessage(text);

// Cleanup
client.destroy();
```

## Customization

### Styling
The example uses Tailwind CSS classes for styling. You can customize:
- Colors by modifying the color classes
- Layout by adjusting the grid and flexbox classes
- Animations by updating the CSS animations

### Functionality
Key areas for customization:
- **Audio Settings**: Modify sample rates and audio constraints
- **Video Settings**: Adjust video resolution and frame rates
- **UI Elements**: Add or remove features as needed
- **Event Handling**: Customize responses to SDK events

## Troubleshooting

### Common Issues

**Connection Failed**
- Ensure the Gemini Live Server is running on port 8080
- Check that the server has a valid Google API key
- Verify WebSocket endpoint is accessible

**Camera/Microphone Not Working**
- Grant permissions when prompted by the browser
- Ensure you're accessing via HTTPS or localhost
- Check that no other applications are using the camera/microphone

**SDK Not Loading**
- Ensure the UMD build exists at `../../dist/index.umd.js`
- Run `npm run build:lib` to generate the UMD build
- Check browser console for loading errors

### Debug Information
- Open browser developer tools (F12)
- Check the Console tab for error messages
- Monitor the Network tab for WebSocket connections
- Use the activity log in the app for real-time status

## Security Notes

- Camera and microphone access requires user permission
- All communication with the AI service goes through your server
- No direct API keys are exposed in the client code
- Video frames are processed locally before sending

## Browser Compatibility

- **Chrome/Edge**: Full support for all features
- **Firefox**: Full support for all features
- **Safari**: Full support (may require HTTPS for some features)
- **Mobile Browsers**: Limited support for screen sharing

## Performance Tips

- Video frame capture runs every 2 seconds to balance responsiveness and performance
- Audio processing is optimized for real-time streaming
- Activity log is limited to 10 entries to prevent memory issues
- Streams are properly cleaned up when switching between camera and screen sharing