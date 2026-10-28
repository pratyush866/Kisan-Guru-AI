import { context } from '../context/AppContext.js';

class SoundManager {
  static audioCtx = null;

  static init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  static playChime(type = 'start') {
    this.init();
    if (!this.audioCtx) return;
    
    // Respect user preferences (if mute is on or reduced motion/sound is preferred)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Resume context if suspended (browser autoplay policy)
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    if (type === 'start') {
      // Soft ascending chime for 'Mic Open'
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(659.25, this.audioCtx.currentTime + 0.1); // E5
      gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
      osc.start(this.audioCtx.currentTime);
      osc.stop(this.audioCtx.currentTime + 0.3);
    } else if (type === 'stop') {
      // Soft descending chime for 'Mic Close'
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, this.audioCtx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.15); // A4
      gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, this.audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
      osc.start(this.audioCtx.currentTime);
      osc.stop(this.audioCtx.currentTime + 0.3);
    }
  }
}

export class UseSpeech {
  constructor(onResultCallback, onErrorCallback) {
    this.recognition = null;
    this.onResult = onResultCallback;
    this.onError = onErrorCallback;
    
    // Check for native browser SpeechRecognition API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      
      // Auto resolve language code from context
      this.recognition.lang = this.getLangCode(context.state.language);
      
      this.recognition.onstart = () => {
        SoundManager.playChime('start');
        context.setListening(true);
      };
      
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (this.onResult) {
          this.onResult(transcript);
        }
        context.setListening(false);
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (this.onError) {
          this.onError(event.error);
        }
        context.setListening(false);
      };
      
      this.recognition.onend = () => {
        SoundManager.playChime('stop');
        context.setListening(false);
      };
    }
  }

  start() {
    // Stop any active text-to-speech playbacks before opening microphone
    UseSpeech.stopSpeaking();
    
    if (this.recognition && !context.state.isListening) {
      // Refresh language mapping dynamically in case it has changed
      this.recognition.lang = this.getLangCode(context.state.language);
      try {
        this.recognition.start();
      } catch (e) {
        console.error(e);
      }
    } else if (!this.recognition) {
      if (this.onError) {
        this.onError('Not supported in this browser. Use Chrome/Safari.');
      }
    }
  }

  stop() {
    if (this.recognition && context.state.isListening) {
      this.recognition.stop();
      context.setListening(false);
    }
  }

  // Maps UI language selections to standard BCP 47 locale codes
  getLangCode(language) {
    switch (language.toLowerCase()) {
      case 'hindi': return 'hi-IN';
      case 'bhojpuri': return 'hi-IN'; // Fallback to Indian locale
      case 'awadhi': return 'hi-IN';
      default: return 'en-IN';
    }
  }

  // CENTRALIZED SPEECH SYNTHESIS CONTROLLER
  static speakResponse(text, language = 'english', onStart = null, onEnd = null, onError = null) {
    if (!window.speechSynthesis) {
      if (onError) onError('Speech synthesis not supported in this browser.');
      return;
    }

    // Cancel any active speak queues
    window.speechSynthesis.cancel();

    // Clean text to avoid reading out weird HTML characters or raw brackets
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/[\*\[\]\(\)\{\}\#]/g, ' ').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Resolve language locale code
    let langCode = 'en-IN';
    switch (language.toLowerCase()) {
      case 'hindi':
      case 'bhojpuri':
      case 'awadhi':
        langCode = 'hi-IN';
        break;
      default:
        langCode = 'en-IN';
    }
    utterance.lang = langCode;

    // Load browser-specific voice indexes
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode) || v.lang.replace('_', '-').startsWith(langCode));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.error('SpeechSynthesis error:', err);
      // Ignore 'interrupted' errors which are expected when user cancels manually
      if (err.error !== 'interrupted' && onError) {
        onError(err.error || 'Failed to play response audio');
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  static stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}
