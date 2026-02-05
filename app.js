class VoxFreeApp {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];


        // DOM Elements
        this.ui = {
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

        this.init();
    }

    init() {
        // Platform Detection
        this.detectPlatform();

        // Voice Loading
        this.populateVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.populateVoices();
        }

        // Event Listeners
        this.addEventListeners();

        // Initial UI State
        this.updateCharCount();
    }

    detectPlatform() {
        const platform = navigator.platform.toLowerCase();
        let osName = "Unknown OS";
        if (platform.includes('win')) osName = "Windows";
        if (platform.includes('mac')) osName = "macOS";
        if (platform.includes('linux')) osName = "Linux";
        if (platform.includes('android')) osName = "Android";
        if (platform.includes('iphone') || platform.includes('ipad')) osName = "iOS";

        this.ui.osTag.innerText = osName;
    }

    populateVoices() {
        this.voices = this.synth.getVoices();

        // Filter if search is active
        const searchTerm = this.ui.voiceSearch.value.toLowerCase();

        this.ui.voiceSelect.innerHTML = '';

        this.voices.forEach((voice, index) => {
            if (searchTerm && !voice.name.toLowerCase().includes(searchTerm) && !voice.lang.toLowerCase().includes(searchTerm)) {
                return;
            }

            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.value = index; // Store index for easier retrieval

            if (voice.default) {
                option.textContent += ' -- DEFAULT';
                option.selected = true;
            }

            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            this.ui.voiceSelect.appendChild(option);
        });

        if (this.voices.length === 0) {
            const option = document.createElement('option');
            option.textContent = "No voices found (or loading...)";
            this.ui.voiceSelect.appendChild(option);
        }
    }

    addEventListeners() {
        // Text Area
        this.ui.textInput.addEventListener('input', () => this.updateCharCount());

        // Sliders
        this.ui.rate.addEventListener('input', (e) => this.ui.rateValue.innerText = `${e.target.value}x`);
        this.ui.pitch.addEventListener('input', (e) => this.ui.pitchValue.innerText = e.target.value);
        this.ui.volume.addEventListener('input', (e) => this.ui.volumeValue.innerText = `${Math.round(e.target.value * 100)}%`);

        // Voice Search
        this.ui.voiceSearch.addEventListener('input', () => this.populateVoices());

        // Controls
        this.ui.speakBtn.addEventListener('click', () => this.speak());
        this.ui.stopBtn.addEventListener('click', () => this.stop());

        // Downloads
        this.ui.downloadBtn.addEventListener('click', () => this.handleExport('mp3'));

        // Theme
        this.ui.themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            this.ui.themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        });
    }

    updateCharCount() {
        this.ui.charCount.innerText = `${this.ui.textInput.value.length} chars`;
    }

    speak(isExporting = false) {
        if (this.synth.speaking && !isExporting) {
            this.synth.cancel();
        }

        const text = this.ui.textInput.value;
        if (text === '') return;

        const utterance = new SpeechSynthesisUtterance(text);

        // Get selected voice
        const selectedIndex = this.ui.voiceSelect.value;
        // Important: use the original full voices array using the index, 
        // relying on filtered list might be tricky if we didn't map indices correctly, 
        // but here we stored the original index in option value.
        // HOWEVER, if the list was re-filtered, the indices in value match the original array? 
        // Yes, in populateVoices we use the index from the forEach on the full array.
        if (this.voices[selectedIndex]) {
            utterance.voice = this.voices[selectedIndex];
        }

        utterance.rate = this.ui.rate.value;
        utterance.pitch = this.ui.pitch.value;
        utterance.volume = this.ui.volume.value;

        // Visuals
        utterance.onstart = () => {
            if (!isExporting) {
                this.updateStatus('Speaking...', true);
                this.toggleVisualizer(true);
            }
        };

        utterance.onend = () => {
            if (!isExporting) {
                this.updateStatus('Ready', false);
                this.toggleVisualizer(false);
            }
        };

        utterance.onerror = (e) => {
            console.error('Speech error:', e);
            this.updateStatus('Error occurred', false);
            this.toggleVisualizer(false);
        };

        this.synth.speak(utterance);
        return utterance; // Return for export handling
    }

    stop() {
        this.synth.cancel();
        this.toggleVisualizer(false);
        this.updateStatus('Stopped', false);
    }

    updateStatus(text, isActive) {
        this.ui.statusText.innerText = text;
        this.ui.statusText.className = isActive ? 'text-primary font-semibold animate-pulse' : 'text-slate-400 font-medium';

        if (isActive) {
            this.ui.speakBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Speaking';
        } else {
            this.ui.speakBtn.innerHTML = '<i class="fa-solid fa-play"></i> Speak';
        }
    }

    toggleVisualizer(active) {
        if (active) {
            this.ui.visualizer.classList.remove('opacity-50');
            this.ui.visualizer.classList.add('opacity-100');
        } else {
            this.ui.visualizer.classList.add('opacity-50');
            this.ui.visualizer.classList.remove('opacity-100');
        }
    }

    async handleExport(format) {
        const text = this.ui.textInput.value.trim();
        if (text === '') {
            alert('Please enter some text to download.');
            return;
        }

        if (text.length > 200) {
            // Check if we need to split (Basic splitting implementation)
            // For this quick fix, we'll warn or just try the first chunk if strict.
            // But Google TTS often accepts up to ~200 chars reliably. 
            // Let's implement a robust chunking for better UX.
            return this.handleLongExport(text, format);
        }

        this.updateStatus('Downloading...', true);

        try {
            // Get language from selected voice or default to en
            const selectedOption = this.ui.voiceSelect.options[this.ui.voiceSelect.selectedIndex];
            const lang = selectedOption ? selectedOption.getAttribute('data-lang') : 'en-US';

            // Google TTS API requires short language code (e.g. 'en' from 'en-US')
            const shortLang = lang ? lang.split('-')[0] : 'en';

            // Use a CORS proxy to bypass browser restrictions
            const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${shortLang}&client=tw-ob&q=${encodeURIComponent(text)}`;

            // Try via allorigins proxy (often more reliable)
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(googleUrl)}`;

            try {
                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error('Network response was not ok');
                const blob = await response.blob();
                this.downloadBlob(blob, 'mp3');
                this.updateStatus('Download Complete', false);
            } catch (fetchErr) {
                console.warn("Proxy download failed, trying direct fallback:", fetchErr);
                // Fallback: Open in new tab so user can save manually
                // This bypasses CORS because it is a navigation
                window.open(googleUrl, '_blank');
                this.updateStatus('Opened in New Tab', false);
                alert("Automatic download failed due to browser security. The audio has been opened in a new tab - you can save it from there.");
            }

        } catch (err) {
            console.error("Download setup failed:", err);
            this.updateStatus('Error', false);
            alert("Unexpected error during download setup.");
        }
    }

    async handleLongExport(text, format) {
        this.updateStatus('Processing Long Text...', true);

        // Simple chunking by sentence/punctuation to stay under limit
        // Google TTS limit is around 200 chars.
        const chunkSize = 200;
        const chunks = [];
        const regex = /[^.!?]+[.!?]+/g;
        let match;

        // If no punctuation found, just split by length
        let remaining = text;
        while (remaining.length > 0) {
            let limit = Math.min(remaining.length, chunkSize);
            let cutIndex = remaining.lastIndexOf(' ', limit);
            if (cutIndex === -1) cutIndex = limit; // No space, force cut

            chunks.push(remaining.substring(0, cutIndex).trim());
            remaining = remaining.substring(cutIndex).trim();
        }

        try {
            const blobs = [];
            const selectedOption = this.ui.voiceSelect.options[this.ui.voiceSelect.selectedIndex];
            const lang = selectedOption ? selectedOption.getAttribute('data-lang') : 'en-US';
            const shortLang = lang ? lang.split('-')[0] : 'en';

            for (const chunk of chunks) {
                if (!chunk) continue;
                const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${shortLang}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(googleUrl)}`;

                try {
                    const response = await fetch(proxyUrl);
                    if (!response.ok) throw new Error('Proxy error');
                    const blob = await response.blob();
                    blobs.push(blob);
                } catch (e) {
                    console.warn("Chunk failed via proxy, breaking:", e);
                    throw e; // Trigger catch block
                }
            }

            // Concatenate blobs (MP3s can often be just concatenated)
            const finalBlob = new Blob(blobs, { type: 'audio/mp3' });
            this.downloadBlob(finalBlob, 'mp3');
            this.updateStatus('Download Complete', false);

        } catch (err) {
            console.error("Long export failed:", err);
            this.updateStatus('Error', false);
            alert("Automatic download failed. Try shorter text, or check your internet.");
        }
    }

    downloadBlob(blob, ext) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `voxfree-export.${ext}`;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    new VoxFreeApp();
});
