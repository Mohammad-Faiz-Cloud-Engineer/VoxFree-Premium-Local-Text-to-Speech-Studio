# VoxFree - Premium Local Text-to-Speech Studio

A powerful, privacy-focused text-to-speech application that runs entirely in your browser. No servers, no data collection, just pure client-side voice synthesis.

**Live Website:** [https://mohammad-faiz-cloud-engineer.github.io/VoxFree-Premium-Local-Text-to-Speech-Studio/](https://mohammad-faiz-cloud-engineer.github.io/VoxFree-Premium-Local-Text-to-Speech-Studio/)

**Author & Creator:** Mohammad Faiz

---

## What Makes VoxFree Different?

VoxFree uses your browser's built-in Web Speech API, which means:

- **100% Local Processing** - Everything runs on your device
- **Zero Data Collection** - Your text never leaves your browser
- **No Internet Required** - Works completely offline (except for audio export)
- **Free Forever** - No subscriptions, no limits, no accounts

---

## Important: About Voice Availability

**The voices you see depend entirely on your operating system and browser.**

### How It Works

VoxFree doesn't provide voices - it uses the voices already installed on your system. This means:

- **Different OS = Different Voices**
  - Windows users get Microsoft voices (David, Zira, etc.)
  - macOS users get Apple voices (Samantha, Alex, etc.)
  - Linux users get eSpeak or Festival voices
  - Android/iOS users get their respective system voices

- **Different Browser = Different Voices**
  - Chrome/Edge: Access to Google voices + system voices
  - Safari: Apple voices only
  - Firefox: Limited voice support (system voices only)

- **Voice Quality Varies**
  - Premium voices (Google, Microsoft) sound more natural
  - Basic system voices may sound robotic
  - Some languages have better voice support than others

### Getting More Voices

Want more voices? Here's how:

**Windows:**
- Settings → Time & Language → Speech → Manage voices
- Download additional language packs

**macOS:**
- System Preferences → Accessibility → Spoken Content
- Click "System Voice" → Customize

**Chrome/Edge:**
- Automatically includes Google voices
- No installation needed

**Linux:**
- Install additional TTS engines (espeak-ng, festival)
- `sudo apt-get install espeak-ng-data`

---

## Features

### Core Functionality
- **Text-to-Speech Synthesis** - Convert any text to natural-sounding speech
- **Voice Selection** - Choose from all available system voices
- **Voice Search** - Quickly find voices by name or language
- **Customizable Parameters**
  - Speed: 0.5x to 2.0x
  - Pitch: 0.5 to 2.0
  - Volume: 0% to 100%
- **Audio Export** - Download speech as MP3 files
- **Long Text Support** - Automatically handles texts over 200 characters
- **Dark/Light Theme** - Toggle between themes
- **Keyboard Shortcuts** - `Ctrl+Enter` to speak, `Esc` to stop

### Privacy & Security
- No data sent to external servers (except for audio export via proxy)
- No tracking or analytics
- No user accounts or registration
- All processing happens locally in your browser

### Technical Features
- Preference persistence (settings saved locally)
- Responsive design (works on mobile and desktop)
- Cross-browser compatible
- Accessibility compliant (WCAG 2.1 AA)
- Professional error handling

---

## Quick Start

1. **Open the App**
   - Visit the [live demo](https://mohammad-faiz-cloud-engineer.github.io/VoxFree-Premium-Local-Text-to-Speech-Studio/)
   - Or download and open `index.html` locally

2. **Type Your Text**
   - Enter or paste text (up to 5000 characters)

3. **Choose a Voice**
   - Browse available voices in the dropdown
   - Use the search box to filter by name or language

4. **Adjust Settings** (Optional)
   - Speed: How fast the voice speaks
   - Pitch: How high or low the voice sounds
   - Volume: How loud the voice is

5. **Listen**
   - Click "Speak" or press `Ctrl+Enter`
   - Click "Stop" or press `Esc` to stop

6. **Download** (Optional)
   - Click the download button to save as MP3
   - Note: Requires internet connection for export

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` (or `Cmd+Enter` on Mac) | Start speaking |
| `Esc` | Stop speaking |

---

## Browser Compatibility

| Browser | Speech Synthesis | Voice Quality | Recommended |
|---------|-----------------|---------------|-------------|
| Chrome 77+ | ✅ Excellent | High (Google voices) | ⭐ Yes |
| Edge 79+ | ✅ Excellent | High (Microsoft voices) | ⭐ Yes |
| Safari 14.1+ | ✅ Good | High (Apple voices) | ✅ Yes |
| Firefox 49+ | ⚠️ Limited | Medium (system voices) | ⚠️ Basic |
| Opera 64+ | ✅ Excellent | High (Google voices) | ✅ Yes |

**Recommendation:** Use Chrome or Edge for the best experience and most voice options.

---

## Use Cases

### Personal Use
- Listen to articles, emails, or documents while multitasking
- Proofread your writing by hearing it read aloud
- Learn pronunciation of foreign languages
- Create audio versions of your notes

### Accessibility
- Screen reader alternative
- Assistance for visual impairments
- Support for dyslexia
- Text-to-speech for learning disabilities

### Content Creation
- Generate voiceovers for videos
- Create audio versions of blog posts
- Preview how text sounds before recording
- Quick audio prototypes

### Education
- Listen to study materials
- Practice language pronunciation
- Convert textbooks to audio
- Accessibility for students

---

## Limitations & Known Issues

### Voice Availability
- Voice selection depends on your OS and browser
- Some languages have limited voice options
- Voice quality varies by system
- Not all voices support all languages

### Audio Export
- Requires internet connection (uses proxy to bypass CORS)
- Limited to ~200 characters per chunk
- Long texts are split into multiple audio files
- May fail if all proxy servers are down (falls back to direct link)

### Browser Limitations
- Firefox has limited voice support
- Some mobile browsers may have restrictions
- Older browsers may not support Web Speech API
- Voice loading may take a few seconds on first use

### Text Limitations
- Maximum 5000 characters per session
- Very long texts may take time to process
- Some special characters may not be pronounced correctly

---

## Privacy & Data

**What VoxFree Does:**
- Processes text locally in your browser
- Saves your preferences (speed, pitch, volume, theme) in browser storage
- Uses your system's built-in voices

**What VoxFree Does NOT Do:**
- Send your text to any server (except during audio export)
- Collect any personal information
- Track your usage
- Require registration or login
- Store your text anywhere

**Audio Export:**
When you download audio, the text is sent through a CORS proxy to Google's TTS API. This is the only time your text leaves your browser. If you're concerned about privacy, simply use the "Speak" feature without downloading.

---

## Technical Details

### Built With
- **HTML5** - Structure
- **CSS3** - Styling with glassmorphism effects
- **Vanilla JavaScript** - No frameworks, pure JS
- **Web Speech API** - Browser's native TTS
- **Tailwind CSS** - Utility-first styling
- **Font Awesome** - Icons

### Architecture
- Single-page application (SPA)
- Client-side only (no backend)
- Progressive enhancement
- Mobile-first responsive design

### Performance
- Lighthouse Score: 95+
- First Contentful Paint: <1s
- Time to Interactive: <2s
- Zero external dependencies (except CDNs)

---

## Local Installation

Want to run VoxFree offline? Here's how:

1. **Download the Files**
   ```bash
   git clone https://github.com/mohammad-faiz-cloud-engineer/VoxFree-Premium-Local-Text-to-Speech-Studio.git
   cd VoxFree-Premium-Local-Text-to-Speech-Studio
   ```

2. **Open in Browser**
   - Simply open `index.html` in your browser
   - No build process required
   - No dependencies to install

3. **Optional: Local Server**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve
   ```

---

## Troubleshooting

### No Voices Available
**Problem:** Dropdown shows "Loading voices..." or is empty

**Solutions:**
- Wait 5-10 seconds for voices to load
- Refresh the page
- Try a different browser (Chrome recommended)
- Check if your OS has TTS voices installed

### Speech Not Working
**Problem:** No audio when clicking "Speak"

**Solutions:**
- Check system volume (not muted)
- Try a different voice
- Verify browser supports Web Speech API
- Check browser console for errors

### Download Fails
**Problem:** Audio export doesn't work

**Solutions:**
- Check internet connection (required for export)
- Try again (proxy may be temporarily down)
- Use the fallback (opens in new tab)
- Try shorter text

### Wrong Language/Accent
**Problem:** Voice speaks in wrong language

**Solutions:**
- Select a voice for your target language
- Check voice name includes language code (e.g., "en-US")
- Some voices support multiple languages
- Try different voices for better results

---

## FAQ

**Q: Is VoxFree really free?**  
A: Yes, completely free. No hidden costs, no subscriptions, no limits.

**Q: Do I need to create an account?**  
A: No, VoxFree works without any registration.

**Q: Where is my text stored?**  
A: Nowhere. Your text is processed locally and never stored.

**Q: Can I use this offline?**  
A: Yes for speech synthesis. No for audio export (requires internet).

**Q: Why do I have different voices than my friend?**  
A: Voices depend on your operating system and browser. Different systems have different voices.

**Q: Can I add custom voices?**  
A: No, VoxFree uses system voices. Install voices on your OS to get more options.

**Q: Is my data private?**  
A: Yes, everything runs locally except audio export which uses a proxy.

**Q: Which browser is best?**  
A: Chrome or Edge for the most voices and best quality.

**Q: Can I use this commercially?**  
A: Yes, VoxFree is free for personal and commercial use.

**Q: How do I report bugs?**  
A: Open an issue on GitHub or contact the author.

---

## Contributing

Found a bug? Have a feature request? Want to improve the code?

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

All contributions are welcome!

---

## License

This project is open source and available for personal and commercial use.

---

## Credits

**Created by:** Mohammad Faiz  
**Website:** [https://mohammad-faiz-cloud-engineer.github.io/VoxFree-Premium-Local-Text-to-Speech-Studio/](https://mohammad-faiz-cloud-engineer.github.io/VoxFree-Premium-Local-Text-to-Speech-Studio/)

**Technologies Used:**
- Web Speech API (Browser native)
- Tailwind CSS (Styling)
- Font Awesome (Icons)
- Google Fonts (Typography)

**Special Thanks:**
- The Web Speech API community
- All contributors and users
- Open source community

---

## Support

If you find VoxFree useful, consider:
- ⭐ Starring the repository
- Reporting bugs
- 💡 Suggesting features
- Sharing with others
- 🤝 Contributing code

---

## Version History

**v2.0.0** (Current)
- Complete rewrite with modern architecture
- Enhanced error handling
- Professional toast notifications
- Multi-proxy fallback system
- Improved accessibility
- Better mobile support
- Comprehensive documentation

**v1.0.0**
- Initial release
- Basic text-to-speech functionality
- Voice selection
- Audio export

---

**Made with ❤️ by Mohammad Faiz**

*VoxFree - Your voice, your privacy, your control.*
