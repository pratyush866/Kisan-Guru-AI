import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';
import { UseSpeech } from '../hooks/useSpeech.js';

export class Search {
  constructor(onQueryTrigger) {
    this.container = document.createElement('div');
    this.container.className = 'w-full glass-panel rounded-2xl p-6 mb-6 transition-all duration-300';
    this.onQueryTrigger = onQueryTrigger; // Callback to run search query
    
    // Bind native speech recognition listener
    this.speechHandler = new UseSpeech(
      (transcript) => {
        const input = this.container.querySelector('#search-input-field');
        if (input) {
          input.value = transcript;
          context.setSearchQuery(transcript);
          this.triggerQuery(transcript);
        }
      },
      (error) => {
        alert(`Voice Error: ${error}`);
      }
    );
  }

  render() {
    const state = context.state;
    const suggestionKeys = ['sug_wheat', 'sug_tomato', 'sug_paddy', 'sug_organic', 'sug_scheme'];
    const suggestions = suggestionKeys.map(k => TranslationUtils.translate(k, state.language));

    this.container.innerHTML = `
      <div class="space-y-4">
        <!-- Input & Voice Buttons -->
        <div class="relative flex items-center">
          <div class="absolute left-4 text-gray-400">
            <i data-lucide="search" class="w-5 h-5"></i>
          </div>
          <input 
            type="text" 
            id="search-input-field" 
            placeholder="${TranslationUtils.translate('searchPlaceholder', state.language)}"
            value="${state.searchQuery}"
            class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-28 py-3.5 text-base font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-300"
          />
          <div class="absolute right-2 flex items-center space-x-1.5">
            <!-- Speech ASR Activator -->
            <button id="btn-voice-search" class="p-2.5 rounded-lg transition-colors duration-300 ${
              state.voiceStatus === 'listening' ? 'bg-red-500/10 text-red-500 dark:bg-red-950/20 pulse-border-active' :
              state.voiceStatus === 'speaking' ? 'bg-green-500/10 text-green-500 dark:bg-green-950/20 animate-pulse' :
              state.voiceStatus === 'processing' ? 'bg-blue-500/10 text-blue-500 dark:bg-blue-950/20 animate-pulse' :
              'text-gray-500 dark:text-gray-300 hover:text-brand-500 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }">
              <i data-lucide="${state.voiceStatus === 'listening' ? 'mic-off' : 'mic'}" class="w-5 h-5"></i>
            </button>
            <button id="btn-submit-search" class="px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors duration-300">
              ${TranslationUtils.translate('btnSend', state.language)}
            </button>
          </div>
        </div>

        <!-- Voice Assistant Status Badge -->
        ${state.voiceStatus && state.voiceStatus !== 'idle' ? `
          <div class="flex items-center space-x-2 text-xs py-1.5 px-3 rounded-lg w-max font-bold animate-fade-in ${
            state.voiceStatus === 'listening' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
            state.voiceStatus === 'processing' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
            state.voiceStatus === 'speaking' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
            'bg-amber-500/10 text-amber-500 border border-amber-500/20'
          }">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                state.voiceStatus === 'listening' ? 'bg-red-400' :
                state.voiceStatus === 'processing' ? 'bg-blue-400' :
                state.voiceStatus === 'speaking' ? 'bg-green-400' :
                'bg-amber-400'
              }"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 ${
                state.voiceStatus === 'listening' ? 'bg-red-500' :
                state.voiceStatus === 'processing' ? 'bg-blue-500' :
                state.voiceStatus === 'speaking' ? 'bg-green-500' :
                'bg-amber-500'
              }"></span>
            </span>
            <span>
              ${state.voiceStatus === 'listening' ? 'ASR: Listening to voice...' :
                state.voiceStatus === 'processing' ? 'AI: Processing query...' :
                state.voiceStatus === 'speaking' ? 'TTS: Reading out response...' :
                'Error: Voice module error'}
            </span>
          </div>
        ` : ''}

        <!-- Suggestion Tags -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
            ${TranslationUtils.translate('trendingTitle', state.language)}:
          </span>
          ${suggestions.map(tag => `
            <button class="btn-suggestion-tag px-3 py-1 bg-brand-50/50 hover:bg-brand-50 dark:bg-gray-800/40 dark:hover:bg-gray-800 text-brand-500 dark:text-green-400 hover:text-brand-600 dark:hover:text-green-300 border border-brand-100/50 dark:border-gray-700 text-xs font-semibold rounded-lg transition-all duration-300">
              ${tag}
            </button>
          `).join('')}
        </div>

        <!-- Recent Searches Section -->
        ${state.recentSearches.length > 0 ? `
          <div class="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <div class="flex items-center space-x-2 overflow-x-auto py-1">
              <span class="font-bold text-gray-400">Recent:</span>
              ${state.recentSearches.slice(0, 3).map(term => `
                <button class="btn-recent-search-term text-gray-600 dark:text-gray-300 hover:text-brand-500 dark:hover:text-green-400 font-medium underline">
                  ${term}
                </button>
              `).join('<span class="text-gray-300 dark:text-gray-600">•</span>')}
            </div>
            <button id="btn-clear-search-history" class="text-gray-400 hover:text-red-500 font-semibold transition-colors duration-300">
              ${TranslationUtils.translate('clearHistory', state.language)}
            </button>
          </div>
        ` : ''}
      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    const input = this.container.querySelector('#search-input-field');
    const btnSubmit = this.container.querySelector('#btn-submit-search');
    const btnVoice = this.container.querySelector('#btn-voice-search');
    const suggestionBtns = this.container.querySelectorAll('.btn-suggestion-tag');
    const recentBtns = this.container.querySelectorAll('.btn-recent-search-term');
    const clearBtn = this.container.querySelector('#btn-clear-search-history');

    // Input changes
    if (input) {
      input.addEventListener('input', (e) => {
        context.state.searchQuery = e.target.value;
      });
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.triggerQuery(input.value);
        }
      });
    }

    // Submit actions
    if (btnSubmit && input) {
      btnSubmit.addEventListener('click', () => {
        this.triggerQuery(input.value);
      });
    }

    // Voice activation toggling
    if (btnVoice) {
      btnVoice.addEventListener('click', () => {
        if (context.state.isListening) {
          this.speechHandler.stop();
        } else {
          this.speechHandler.start();
        }
      });
    }

    // Click suggestions
    suggestionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.textContent.trim();
        if (input) input.value = text;
        context.setSearchQuery(text);
        this.triggerQuery(text);
      });
    });

    // Click recent searches
    recentBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.textContent.trim();
        if (input) input.value = text;
        context.setSearchQuery(text);
        this.triggerQuery(text);
      });
    });

    // Clear search history registry
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        context.clearSearchHistory();
      });
    }
  }

  triggerQuery(text) {
    if (!text.trim()) return;
    context.addRecentSearch(text);
    if (this.onQueryTrigger) {
      this.onQueryTrigger(text);
    }
  }
}
