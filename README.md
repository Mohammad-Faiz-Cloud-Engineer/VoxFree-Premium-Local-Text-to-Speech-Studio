# VoxFree - Premium Local Text-to-Speech Studio

A professional, single-page web application that uses the browser's native Web Speech API to provide a high-quality TTS experience with voice selection, real-time controls, and audio export capabilities.

## Features

### 🎯 Core Functionality
- **Voice Selection**: Browse and select from all system-installed voices, organized by language
- **Real-time Controls**: Adjust Pitch, Rate (Speed), and Volume with professional sliders
- **Audio Export**: Download speech as WAV files using MediaRecorder API
- **Platform Detection**: Automatically detects your operating system to explain available voices

### 🎨 Premium UI/UX
- **Glassmorphic Design**: High-end corporate SaaS aesthetic with mesh gradient backgrounds
- **Dark/Light Theme**: Toggle between themes with persistent settings
- **Responsive Layout**: Works seamlessly on Mobile, Tablet, and Desktop
- **Real-time Feedback**: Character/word counters and speaking status indicators

### ⌨️ Accessibility & Shortcuts
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + Enter`: Speak text
  - `Ctrl/Cmd + Space`: Start/Stop speaking
  - `Ctrl/Cmd + S`: Download audio
- **High Contrast Support**: Compatible with accessibility preferences
- **Toast Notifications**: Clear feedback for all actions and errors

## Technical Implementation

### Web Speech API Integration
- **Voice Loading**: Handles asynchronous voice loading across all browsers
- **Cross-browser Support**: Works in Chrome, Brave, Safari, and Firefox
- **Error Handling**: Graceful fallbacks when TTS is unavailable

### Audio Recording Solution
Since browsers don't natively support saving TTS output, VoxFree implements:
- **MediaRecorder API**: Captures audio output in real-time
- **AudioContext**: Routes speech synthesis to recording stream
- **Blob Export**: Creates downloadable WAV files

### Platform-Specific Voice Support
- **Windows**: Microsoft David, Zira, and other installed voices
- **macOS/iOS**: Siri, Samantha, Daniel, and system voices
- **Android**: Google TTS voices
- **Linux**: eSpeak and other available voices

## Browser Compatibility

- ✅ Chrome 33+
- ✅ Brave Browser
- ✅ Safari 7+
- ✅ Firefox 49+
- ⚠️ Edge (limited support)
- ❌ Internet Explorer

## Installation & Usage

### Quick Start
1. Download or clone this project
2. Open `index.html` in a supported browser
3. No server required - runs directly in the browser!

### Voice Requirements
For the best experience, ensure your system has TTS voices installed:
- **Windows**: Voices are built-in
- **macOS**: Voices are built-in
- **Linux**: Install `espeak` or other TTS engines
- **Mobile**: Voices are built-in

## Development

### Project Structure
```
VoxFree/
├── index.html          # Main application structure
├── styles.css          # Glassmorphic styling and responsive design
├── app.js             # Core application logic
└── README.md          # This documentation
```

### Key Technologies
- **HTML5**: Semantic markup and accessibility
- **CSS3**: Tailwind CSS + custom glassmorphic styles
- **JavaScript ES6+**: Modern syntax with classes and async/await
- **Web Speech API**: Browser-native TTS functionality
- **MediaRecorder API**: Audio capture and export
- **AudioContext API**: Audio processing and routing

### Code Architecture
The application follows a clean, modular structure:
- **VoxFreeApp Class**: Main application controller
- **State Management**: Centralized state tracking
- **Event-Driven**: Clean separation of concerns
- **Error Handling**: Comprehensive error management

## Troubleshooting

### Common Issues

**"No voices available"**
- Check if your browser supports Web Speech API
- Ensure TTS voices are installed on your system
- Try refreshing the page to reload voices

**"Recording failed"**
- Check microphone permissions in your browser
- Ensure MediaRecorder API is supported
- Try using a different browser

**"Download not working"**
- Check if downloads are blocked by your browser
- Ensure sufficient storage space
- Try right-clicking the download button

### Browser Permissions
VoxFree requires these permissions:
- **Microphone Access**: For audio recording (only when downloading)
- **Downloads**: To save audio files
- **Speech Synthesis**: Built into modern browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or feature requests:
1. Check the troubleshooting section above
2. Review browser compatibility requirements
3. Open an issue on the GitHub repository

---

**VoxFree** - Professional TTS for the modern web. No servers, no APIs, just pure browser power. 🚀
