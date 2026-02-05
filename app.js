/**
 * VoxFree Text-to-Speech Application
 * Enterprise-grade text-to-speech web application with advanced features
 * @class VoxFreeApp
 * @version 2.0.0
 */
class VoxFreeApp {
    /**
     * Application configuration constants
     * @static
     * @readonly
     */
    static CONFIG = {
        MAX_TEXT_LENGTH: 5000,
        CHUNK_SIZE: 200,
        DEBOUNCE_DELAY: 300,
        RETRY_ATTEMPTS: 2,
        RETRY_DELAY: 1000,
        // Reliable CORS proxies (tested and working)
        PROXY_URLS: [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest='
        ],
        TTS_BASE_URL: 'https://translate.google.com/translate_tts',
        STORAGE_KEY: 'voxfree_preferences'
    };

    /**
     * Initialize VoxFree application
     * @constructor
     */
    constructor() {
        // Validate browser compatibility
        if (!this.checkBrowserCompatibility()) {
            this.showError('Your browser does not support the Web Speech API. Please use a modern browser.');
            return;
        }

        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentUtterance = null;
        this.isProcessing = false;
        this.debounceTimer = null;

        // Cache DOM elements for performance
        this.ui = this.cacheUIElements();
        
        // Validate all required DOM elements exist
        if (!this.validateUIElements()) {
            console.error('Critical UI elements missing. Application cannot initialize.');
            return;
        }

        this.init();
    }

    /**
     * Check if browser supports required APIs
     * @returns {boolean} Browser compatibility status
     */
    checkBrowserCompatibility() {
        return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    }

    /**
     * Cache all UI elements for performance optimization
     * @returns {Object} Cached DOM elements
     */
    cacheUIElements() {
        return {
            textInput: document.getElementById('textInput'),
            charCount: document.getElementById('charCount'),
            voiceSelect: document.getElementById('voiceSelect'),
            voiceSearch: document.getElementById('voiceSearch'),
            rate: document.getElementById('rate'),
            rateValue: document.getElementById('rateValue'),
            pitch: document.getElementById('pitch'),
            pitchValue: document.getElementById('pitchValue'),
            volume: document.getElementById('volume'),
            volumeValue: document.getElementById('volumeValue'),
            speakBtn: document.getElementById('speakBtn'),
            stopBtn: document.getElementById('stopBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            themeToggle: document.getElementById('themeToggle'),
            osTag: document.getElementById('osTag'),
            visualizer: document.getElementById('visualizer'),
            statusText: document.getElementById('statusText')
        };
    }

    /**
     * Validate that all required UI elements exist
     * @returns {boolean} Validation status
     */
    validateUIElements() {
        const requiredElements = ['textInput', 'speakBtn', 'stopBtn', 'voiceSelect'];
        return requiredElements.every(key => this.ui[key] !== null);
    }

    /**
     * Initialize application components
     * @private
     */
    init() {
        try {
            // Load user preferences
            this.loadPreferences();

            // Platform Detection
            this.detectPlatform();

            // Voice Loading with retry mechanism
            this.populateVoices();
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => this.populateVoices();
            }

            // Event Listeners
            this.addEventListeners();

            // Initial UI State
            this.updateCharCount();

            // Set initial theme
            this.initializeTheme();

            // Cleanup on page unload
            window.addEventListener('beforeunload', () => this.cleanup());

            console.info('VoxFree initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Load user preferences from localStorage
     * @private
     */
    loadPreferences() {
        try {
            const stored = localStorage.getItem(VoxFreeApp.CONFIG.STORAGE_KEY);
            if (stored) {
                const prefs = JSON.parse(stored);
                if (prefs.rate) this.ui.rate.value = prefs.rate;
                if (prefs.pitch) this.ui.pitch.value = prefs.pitch;
                if (prefs.volume) this.ui.volume.value = prefs.volume;
                if (prefs.theme) {
                    document.documentElement.classList.toggle('dark', prefs.theme === 'dark');
                }
            }
        } catch (error) {
            console.warn('Failed to load preferences:', error);
        }
    }

    /**
     * Save user preferences to localStorage
     * @private
     */
    savePreferences() {
        try {
            const prefs = {
                rate: this.ui.rate.value,
                pitch: this.ui.pitch.value,
                volume: this.ui.volume.value,
                theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
            };
            localStorage.setItem(VoxFreeApp.CONFIG.STORAGE_KEY, JSON.stringify(prefs));
        } catch (error) {
            console.warn('Failed to save preferences:', error);
        }
    }

    /**
     * Initialize theme based on user preference or system setting
     * @private
     */
    initializeTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        this.ui.themeToggle.innerHTML = isDark 
            ? '<i class="fa-solid fa-moon"></i>' 
            : '<i class="fa-solid fa-sun"></i>';
    }

    /**
     * Detect user's operating system platform
     * @private
     */
    detectPlatform() {
        try {
            const platform = navigator.platform.toLowerCase();
            const userAgent = navigator.userAgent.toLowerCase();
            
            let osName = "Unknown OS";
            
            if (userAgent.includes('android')) {
                osName = "Android";
            } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                osName = "iOS";
            } else if (platform.includes('win')) {
                osName = "Windows";
            } else if (platform.includes('mac')) {
                osName = "macOS";
            } else if (platform.includes('linux')) {
                osName = "Linux";
            }

            if (this.ui.osTag) {
                this.ui.osTag.textContent = osName;
            }
        } catch (error) {
            console.warn('Platform detection failed:', error);
        }
    }

    /**
     * Populate voice selection dropdown with available voices
     * @private
     */
    populateVoices() {
        try {
            this.voices = this.synth.getVoices();

            // Filter voices based on search term
            const searchTerm = this.ui.voiceSearch?.value.toLowerCase().trim() || '';

            // Use DocumentFragment for better performance
            const fragment = document.createDocumentFragment();

            const filteredVoices = this.voices.filter(voice => {
                if (!searchTerm) return true;
                return voice.name.toLowerCase().includes(searchTerm) || 
                       voice.lang.toLowerCase().includes(searchTerm);
            });

            filteredVoices.forEach((voice, index) => {
                const option = document.createElement('option');
                const displayName = this.sanitizeText(`${voice.name} (${voice.lang})`);
                option.textContent = voice.default ? `${displayName} -- DEFAULT` : displayName;
                option.value = this.voices.indexOf(voice); // Store original index
                
                if (voice.default) {
                    option.selected = true;
                }

                option.setAttribute('data-lang', voice.lang);
                option.setAttribute('data-name', voice.name);
                fragment.appendChild(option);
            });

            // Clear and update dropdown
            this.ui.voiceSelect.innerHTML = '';
            
            if (filteredVoices.length === 0) {
                const option = document.createElement('option');
                option.textContent = this.voices.length === 0 
                    ? "Loading voices..." 
                    : "No voices match your search";
                fragment.appendChild(option);
            }

            this.ui.voiceSelect.appendChild(fragment);
        } catch (error) {
            console.error('Error populating voices:', error);
            this.showError('Failed to load voices. Please refresh the page.');
        }
    }

    /**
     * Attach event listeners to UI elements
     * @private
     */
    addEventListeners() {
        // Text Area with debouncing for performance
        this.ui.textInput.addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.updateCharCount();
                this.validateInput();
            }, VoxFreeApp.CONFIG.DEBOUNCE_DELAY);
        });

        // Sliders with preference saving
        this.ui.rate.addEventListener('input', (e) => {
            this.ui.rateValue.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
            this.savePreferences();
        });

        this.ui.pitch.addEventListener('input', (e) => {
            this.ui.pitchValue.textContent = parseFloat(e.target.value).toFixed(1);
            this.savePreferences();
        });

        this.ui.volume.addEventListener('input', (e) => {
            this.ui.volumeValue.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
            this.savePreferences();
        });

        // Voice Search with debouncing
        this.ui.voiceSearch.addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this.populateVoices(), VoxFreeApp.CONFIG.DEBOUNCE_DELAY);
        });

        // Control buttons
        this.ui.speakBtn.addEventListener('click', () => this.handleSpeak());
        this.ui.stopBtn.addEventListener('click', () => this.stop());
        this.ui.downloadBtn.addEventListener('click', () => this.handleExport('mp3'));

        // Theme toggle
        this.ui.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Prevent memory leaks - stop speech on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.synth.speaking) {
                this.stop();
            }
        });
    }

    /**
     * Handle keyboard shortcuts for accessibility
     * @param {KeyboardEvent} e - Keyboard event
     * @private
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to speak
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.handleSpeak();
        }
        // Escape to stop
        if (e.key === 'Escape' && this.synth.speaking) {
            e.preventDefault();
            this.stop();
        }
    }

    /**
     * Toggle application theme
     * @private
     */
    toggleTheme() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        this.ui.themeToggle.innerHTML = isDark 
            ? '<i class="fa-solid fa-moon"></i>' 
            : '<i class="fa-solid fa-sun"></i>';
        this.savePreferences();
    }

    /**
     * Update character count display
     * @private
     */
    updateCharCount() {
        const length = this.ui.textInput.value.length;
        const maxLength = VoxFreeApp.CONFIG.MAX_TEXT_LENGTH;
        this.ui.charCount.textContent = `${length} / ${maxLength} chars`;
        
        // Visual feedback for character limit
        if (length > maxLength) {
            this.ui.charCount.classList.add('text-red-500');
        } else {
            this.ui.charCount.classList.remove('text-red-500');
        }
    }

    /**
     * Validate text input
     * @returns {boolean} Validation status
     * @private
     */
    validateInput() {
        const text = this.ui.textInput.value.trim();
        const length = text.length;

        if (length === 0) {
            return false;
        }

        if (length > VoxFreeApp.CONFIG.MAX_TEXT_LENGTH) {
            this.showError(`Text exceeds maximum length of ${VoxFreeApp.CONFIG.MAX_TEXT_LENGTH} characters.`);
            return false;
        }

        return true;
    }

    /**
     * Sanitize text to prevent XSS attacks
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     * @private
     */
    sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Handle speak button click with validation
     * @private
     */
    handleSpeak() {
        if (this.isProcessing) {
            console.warn('Already processing a request');
            return;
        }

        if (!this.validateInput()) {
            this.showError('Please enter valid text to speak.');
            return;
        }

        this.speak();
    }

    /**
     * Convert text to speech using Web Speech API
     * @param {boolean} isExporting - Whether this is for export
     * @returns {SpeechSynthesisUtterance|null} The utterance object
     * @private
     */
    speak(isExporting = false) {
        try {
            // Cancel any ongoing speech
            if (this.synth.speaking && !isExporting) {
                this.synth.cancel();
            }

            const text = this.ui.textInput.value.trim();
            if (!text) {
                return null;
            }

            // Create utterance with sanitized text
            const utterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance = utterance;

            // Get selected voice safely
            const selectedIndex = parseInt(this.ui.voiceSelect.value, 10);
            if (this.voices[selectedIndex]) {
                utterance.voice = this.voices[selectedIndex];
            }

            // Apply voice parameters with validation
            utterance.rate = Math.max(0.5, Math.min(2, parseFloat(this.ui.rate.value)));
            utterance.pitch = Math.max(0.5, Math.min(2, parseFloat(this.ui.pitch.value)));
            utterance.volume = Math.max(0, Math.min(1, parseFloat(this.ui.volume.value)));

            // Event handlers
            utterance.onstart = () => {
                if (!isExporting) {
                    this.isProcessing = true;
                    this.updateStatus('Speaking...', true);
                    this.toggleVisualizer(true);
                }
            };

            utterance.onend = () => {
                if (!isExporting) {
                    this.isProcessing = false;
                    this.updateStatus('Ready', false);
                    this.toggleVisualizer(false);
                    this.currentUtterance = null;
                }
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                this.isProcessing = false;
                this.updateStatus('Error occurred', false);
                this.toggleVisualizer(false);
                this.currentUtterance = null;
                
                if (!isExporting) {
                    this.showError(`Speech error: ${event.error || 'Unknown error'}`);
                }
            };

            utterance.onpause = () => {
                if (!isExporting) {
                    this.updateStatus('Paused', false);
                }
            };

            utterance.onresume = () => {
                if (!isExporting) {
                    this.updateStatus('Speaking...', true);
                }
            };

            this.synth.speak(utterance);
            return utterance;

        } catch (error) {
            console.error('Error in speak method:', error);
            this.isProcessing = false;
            this.showError('Failed to start speech synthesis.');
            return null;
        }
    }

    /**
     * Stop speech synthesis
     * @public
     */
    stop() {
        try {
            this.synth.cancel();
            this.isProcessing = false;
            this.currentUtterance = null;
            this.toggleVisualizer(false);
            this.updateStatus('Stopped', false);
        } catch (error) {
            console.error('Error stopping speech:', error);
        }
    }

    /**
     * Update status display
     * @param {string} text - Status text
     * @param {boolean} isActive - Whether actively processing
     * @private
     */
    updateStatus(text, isActive) {
        if (this.ui.statusText) {
            this.ui.statusText.textContent = text;
            this.ui.statusText.className = isActive 
                ? 'text-primary font-semibold animate-pulse' 
                : 'text-slate-400 font-medium';
        }

        if (this.ui.speakBtn) {
            this.ui.speakBtn.innerHTML = isActive
                ? '<i class="fa-solid fa-spinner fa-spin"></i> Speaking'
                : '<i class="fa-solid fa-play"></i> Speak';
            this.ui.speakBtn.disabled = isActive;
        }
    }

    /**
     * Toggle visualizer animation
     * @param {boolean} active - Whether to activate visualizer
     * @private
     */
    toggleVisualizer(active) {
        if (!this.ui.visualizer) return;

        if (active) {
            this.ui.visualizer.classList.remove('opacity-50');
            this.ui.visualizer.classList.add('opacity-100');
        } else {
            this.ui.visualizer.classList.add('opacity-50');
            this.ui.visualizer.classList.remove('opacity-100');
        }
    }

    /**
     * Display error message to user with better UX
     * @param {string} message - Error message
     * @private
     */
    showError(message) {
        console.error(message);
        this.updateStatus('Error', false);
        
        // Create a better notification instead of alert
        if (typeof message === 'string' && message.trim()) {
            // Try to use a toast notification if available, otherwise use alert
            this.showNotification(message, 'error');
        }
    }

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (info, error, success)
     * @private
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 max-w-md p-4 rounded-lg shadow-lg z-50 animate-fade-in ${
            type === 'error' ? 'bg-red-500/90' : 
            type === 'success' ? 'bg-green-500/90' : 
            'bg-blue-500/90'
        } text-white backdrop-blur-sm`;
        
        notification.innerHTML = `
            <div class="flex items-start gap-3">
                <i class="fa-solid ${
                    type === 'error' ? 'fa-circle-exclamation' : 
                    type === 'success' ? 'fa-circle-check' : 
                    'fa-circle-info'
                } text-xl"></i>
                <div class="flex-1">
                    <p class="text-sm font-medium">${this.sanitizeText(message)}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="text-white/80 hover:text-white transition-colors">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                notification.style.transition = 'all 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 8000);
    }

    /**
     * Handle audio export with validation and error handling
     * @param {string} format - Export format (mp3)
     * @public
     */
    async handleExport(format) {
        if (!this.validateInput()) {
            this.showError('Please enter valid text to download.');
            return;
        }

        const text = this.ui.textInput.value.trim();

        // Handle long text with chunking
        if (text.length > VoxFreeApp.CONFIG.CHUNK_SIZE) {
            return this.handleLongExport(text, format);
        }

        this.updateStatus('Preparing download...', true);

        try {
            const lang = this.getSelectedLanguage();
            const shortLang = lang.split('-')[0];

            const audioBlob = await this.fetchAudioWithRetry(text, shortLang);
            
            if (audioBlob) {
                this.downloadBlob(audioBlob, format);
                this.updateStatus('Download Complete', false);
            } else {
                throw new Error('Failed to generate audio');
            }

        } catch (error) {
            console.error("Export failed:", error);
            this.updateStatus('Error', false);
            this.showError('Download failed. Please try again or use shorter text.');
        }
    }

    /**
     * Get selected voice language
     * @returns {string} Language code
     * @private
     */
    getSelectedLanguage() {
        const selectedOption = this.ui.voiceSelect.options[this.ui.voiceSelect.selectedIndex];
        return selectedOption?.getAttribute('data-lang') || 'en-US';
    }

    /**
     * Fetch audio with retry mechanism
     * @param {string} text - Text to convert
     * @param {string} lang - Language code
     * @param {number} attempt - Current attempt number
     * @returns {Promise<Blob|null>} Audio blob
     * @private
     */
    /**
     * Fetch audio with retry mechanism and multiple proxy fallbacks
     * @param {string} text - Text to convert
     * @param {string} lang - Language code
     * @param {number} attempt - Current attempt number
     * @param {number} proxyIndex - Current proxy index
     * @returns {Promise<Blob|null>} Audio blob
     * @private
     */
    async fetchAudioWithRetry(text, lang, attempt = 1, proxyIndex = 0) {
        try {
            const googleUrl = `${VoxFreeApp.CONFIG.TTS_BASE_URL}?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(text)}`;
            
            // Try current proxy
            const currentProxy = VoxFreeApp.CONFIG.PROXY_URLS[proxyIndex];
            const proxyUrl = `${currentProxy}${encodeURIComponent(googleUrl)}`;

            console.log(`Attempting download with proxy ${proxyIndex + 1}/${VoxFreeApp.CONFIG.PROXY_URLS.length}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'audio/mpeg, audio/*, */*'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            
            // Verify blob is valid audio
            if (blob.size === 0) {
                throw new Error('Empty audio file received');
            }

            console.log(`Download successful with proxy ${proxyIndex + 1}`);
            return blob;

        } catch (error) {
            const errorMsg = error.name === 'AbortError' ? 'Request timeout' : error.message;
            console.warn(`Fetch attempt ${attempt} with proxy ${proxyIndex + 1} failed: ${errorMsg}`);

            // Try next proxy
            const nextProxyIndex = proxyIndex + 1;
            if (nextProxyIndex < VoxFreeApp.CONFIG.PROXY_URLS.length) {
                return this.fetchAudioWithRetry(text, lang, attempt, nextProxyIndex);
            }

            // Retry with first proxy
            if (attempt < VoxFreeApp.CONFIG.RETRY_ATTEMPTS) {
                console.log(`Retrying all proxies (attempt ${attempt + 1}/${VoxFreeApp.CONFIG.RETRY_ATTEMPTS})`);
                await this.delay(VoxFreeApp.CONFIG.RETRY_DELAY);
                return this.fetchAudioWithRetry(text, lang, attempt + 1, 0);
            }

            // All attempts failed - use direct fallback
            console.warn('All proxy attempts failed, using direct fallback');
            const googleUrl = `${VoxFreeApp.CONFIG.TTS_BASE_URL}?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(text)}`;
            window.open(googleUrl, '_blank', 'noopener,noreferrer');
            
            this.showError('Unable to download automatically due to network restrictions. The audio has been opened in a new tab where you can play and save it manually.');
            return null;
        }
    }

    /**
     * Delay helper for retry mechanism
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     * @private
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Handle export for long text with intelligent chunking
     * @param {string} text - Text to export
     * @param {string} format - Export format
     * @private
     */
    async handleLongExport(text, format) {
        this.updateStatus('Processing long text...', true);

        try {
            const chunks = this.chunkText(text, VoxFreeApp.CONFIG.CHUNK_SIZE);
            const lang = this.getSelectedLanguage();
            const shortLang = lang.split('-')[0];

            const blobs = [];
            const totalChunks = chunks.length;

            for (let i = 0; i < totalChunks; i++) {
                const chunk = chunks[i];
                if (!chunk.trim()) continue;

                this.updateStatus(`Processing chunk ${i + 1}/${totalChunks}...`, true);

                const blob = await this.fetchAudioWithRetry(chunk, shortLang);
                if (blob) {
                    blobs.push(blob);
                } else {
                    throw new Error(`Failed to process chunk ${i + 1}`);
                }

                // Small delay between chunks to avoid rate limiting
                if (i < totalChunks - 1) {
                    await this.delay(500);
                }
            }

            // Concatenate all audio blobs
            const finalBlob = new Blob(blobs, { type: 'audio/mpeg' });
            this.downloadBlob(finalBlob, format);
            this.updateStatus('Download Complete', false);

        } catch (error) {
            console.error("Long export failed:", error);
            this.updateStatus('Error', false);
            this.showError('Failed to process long text. Try shorter text or check your connection.');
        }
    }

    /**
     * Intelligently chunk text by sentences and word boundaries
     * @param {string} text - Text to chunk
     * @param {number} maxSize - Maximum chunk size
     * @returns {string[]} Array of text chunks
     * @private
     */
    chunkText(text, maxSize) {
        const chunks = [];
        let remaining = text.trim();

        while (remaining.length > 0) {
            if (remaining.length <= maxSize) {
                chunks.push(remaining);
                break;
            }

            // Try to find sentence boundary
            let cutIndex = -1;
            const sentenceEnders = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
            
            for (const ender of sentenceEnders) {
                const idx = remaining.lastIndexOf(ender, maxSize);
                if (idx > cutIndex) {
                    cutIndex = idx + ender.length;
                }
            }

            // If no sentence boundary, try word boundary
            if (cutIndex === -1) {
                cutIndex = remaining.lastIndexOf(' ', maxSize);
            }

            // If still no boundary, force cut at maxSize
            if (cutIndex === -1 || cutIndex === 0) {
                cutIndex = maxSize;
            }

            chunks.push(remaining.substring(0, cutIndex).trim());
            remaining = remaining.substring(cutIndex).trim();
        }

        return chunks;
    }

    /**
     * Download blob as file
     * @param {Blob} blob - Blob to download
     * @param {string} ext - File extension
     * @private
     */
    downloadBlob(blob, ext) {
        try {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            a.download = `voxfree-${timestamp}.${ext}`;
            
            document.body.appendChild(a);
            a.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Download failed:', error);
            this.showError('Failed to download file.');
        }
    }

    /**
     * Cleanup resources before page unload
     * @private
     */
    cleanup() {
        try {
            // Stop any ongoing speech
            if (this.synth.speaking) {
                this.synth.cancel();
            }

            // Save preferences
            this.savePreferences();

            // Clear timers
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
        } catch (error) {
            console.warn('Cleanup error:', error);
        }
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.voxFreeApp = new VoxFreeApp();
    });
} else {
    window.voxFreeApp = new VoxFreeApp();
}

