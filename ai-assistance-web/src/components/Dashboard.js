import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';
import { UseSpeech } from '../hooks/useSpeech.js';

export class Dashboard {
  constructor(onQuickAsk) {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in-up pb-24';
    this.onQuickAsk = onQuickAsk; // callback to submit queries
    
    // Voice assistant dialog state
    this.voiceActive = false;
    this.speechRecognizer = null;
    this.isFetchingWeather = false;
    
    // Dynamic home tasks from storage or defaults
    const savedTasks = localStorage.getItem('kisan_daily_tasks');
    if (savedTasks) {
      try {
        this.tasks = JSON.parse(savedTasks);
      } catch (e) {
        this.tasks = this.getDefaultTasks();
      }
    } else {
      this.tasks = this.getDefaultTasks();
    }

    // Initialize speech recognizer
    try {
      this.speechRecognizer = new UseSpeech(
        (transcript) => this.handleSpeechResult(transcript),
        (error) => this.handleSpeechError(error)
      );
    } catch (e) {
      console.warn('Speech recognition not supported in this browser environment:', e);
    }

    // Automatically load live weather in background
    this.loadLiveWeather();
  }

  getDefaultTasks() {
    return [
      { id: 1, text: 'Apply balanced nitrogen (Urea) split in wheat block A', done: false },
      { id: 2, text: 'Check yellow rust leaf spots on outer border rows', done: false },
      { id: 3, text: 'Calibrate drip irrigation nozzles in tomato beds', done: true },
      { id: 4, text: 'Confirm APMC Mandi grain prices for rice selling strategy', done: false }
    ];
  }

  saveTasks() {
    localStorage.setItem('kisan_daily_tasks', JSON.stringify(this.tasks));
  }

  async loadLiveWeather() {
    if (this.isFetchingWeather || context.state.weatherData) return;
    this.isFetchingWeather = true;

    try {
      const city = localStorage.getItem('user_district') || 'Lucknow';
      const response = await fetch(`http://127.0.0.1:8000/api/weather/current?city=${encodeURIComponent(city)}`);
      if (response.ok) {
        const data = await response.json();
        context.state.weatherData = {
          temperature: data.current_weather.temperature,
          description: data.location_name || city,
          humidity: data.humidity || 65,
          rain: `${data.rain_probability || 10}%`,
          windspeed: data.current_weather.windspeed,
          advisory: data.advisory || 'Weather is optimal for field work.'
        };
        this.render();
      }
    } catch (err) {
      console.warn('Weather fetch fallback to default:', err);
    } finally {
      this.isFetchingWeather = false;
    }
  }

  handleSpeechResult(transcript) {
    this.voiceActive = false;
    const input = this.container.querySelector('#quick-chat-input');
    if (input) {
      input.value = transcript;
    }
    if (this.onQuickAsk && transcript.trim()) {
      this.onQuickAsk(transcript.trim());
    }
    this.render();
  }

  handleSpeechError(error) {
    this.voiceActive = false;
    this.render();
  }

  render() {
    const state = context.state;
    const lang = state.language;
    const user = state.user || { name: 'Kisan' };

    const hour = new Date().getHours();
    let greeting = 'Good Evening (शुभ संध्या)';
    if (hour < 12) greeting = 'Good Morning (शुभ प्रभात)';
    else if (hour < 17) greeting = 'Good Afternoon (शुभ दोपहर)';

    // Live weather data from context or pleasant defaults
    const liveWeather = context.state.weatherData;
    const weatherData = {
      temp: liveWeather ? `${liveWeather.temperature}°C` : '28.5°C',
      condition: liveWeather ? liveWeather.description : (localStorage.getItem('user_district') || 'Uttar Pradesh'),
      humidity: liveWeather ? `${liveWeather.humidity}%` : '62%',
      rain: liveWeather ? liveWeather.rain : '12%',
      advisory: liveWeather ? liveWeather.advisory : 'मौसम फसलों के लिए अनुकूल है। सामान्य कृषि कार्य और पोषण प्रबंधन जारी रखें।'
    };

    const marketPrices = [
      { crop: 'Wheat (गेहूं)', price: '₹2,275/Qtl', trend: 'up' },
      { crop: 'Potato (आलू)', price: '₹1,450/Qtl', trend: 'down' },
      { crop: 'Paddy (धान)', price: '₹2,183/Qtl', trend: 'up' }
    ];

    const alerts = [
      { id: 1, type: 'critical', msg: 'Warning: Yellow rust reports in block. Inspect leaves immediately.' },
      { id: 2, type: 'info', msg: 'Advisory: Rain forecast in 48 hours. Postpone irrigation splitting.' }
    ];

    this.container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- LEFT PANEL: HERO, CHAT, TASKS (8 COLS) -->
        <div class="lg:col-span-8 space-y-6">
          
          <!-- HERO BANNER -->
          <div class="p-6 sm:p-8 bg-gradient-to-r from-brand-600 via-emerald-600 to-green-600 rounded-3xl text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)] pointer-events-none"></div>
            
            <div class="relative z-10 max-w-lg space-y-3">
              <div class="flex items-center space-x-2">
                <span class="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  🌾 Bharat Agriculture OS
                </span>
                <span class="text-xs text-green-100 font-semibold">Live Intelligence</span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-extrabold leading-tight">
                ${greeting}, ${user.name || 'Kisan Bhai'}!
              </h2>
              <p class="text-green-100 text-xs sm:text-sm font-medium leading-relaxed">
                Empowering your farm with localized AI agronomy, instant disease detection, live mandi rates, and precision irrigation.
              </p>
            </div>

            <div class="relative z-10 flex flex-wrap gap-2.5 mt-5">
              <button id="btn-hero-scan" class="px-4 py-2.5 bg-white text-emerald-700 font-bold rounded-xl text-xs shadow-lg hover:bg-slate-50 transition-all flex items-center space-x-1.5 transform hover:scale-105 active:scale-95">
                <i data-lucide="scan" class="w-4 h-4 text-emerald-600"></i>
                <span>Diagnose Crop Leaf (रोग जाँच)</span>
              </button>
              <button id="btn-hero-irrigation" class="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold rounded-xl text-xs border border-white/30 transition-all flex items-center space-x-1.5">
                <i data-lucide="droplets" class="w-4 h-4"></i>
                <span>Irrigation Plan</span>
              </button>
              <button id="btn-hero-mandi" class="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold rounded-xl text-xs border border-white/30 transition-all flex items-center space-x-1.5">
                <i data-lucide="trending-up" class="w-4 h-4"></i>
                <span>Mandi Rates</span>
              </button>
            </div>
            <i data-lucide="sprout" class="absolute right-3 bottom-2 w-44 h-44 text-white/10 pointer-events-none"></i>
          </div>

          <!-- FEATURE SHORTCUTS GRID -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button class="feature-quick-btn p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-left hover:border-emerald-500 transition-all shadow-sm group" data-tab="disease">
              <div class="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <i data-lucide="shield-alert" class="w-4 h-4"></i>
              </div>
              <div class="text-xs font-bold text-slate-800 dark:text-white">Disease Scan</div>
              <div class="text-[10px] text-slate-400">Leaf diagnosis</div>
            </button>

            <button class="feature-quick-btn p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-left hover:border-emerald-500 transition-all shadow-sm group" data-tab="pest">
              <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <i data-lucide="bug" class="w-4 h-4"></i>
              </div>
              <div class="text-xs font-bold text-slate-800 dark:text-white">Pest Control</div>
              <div class="text-[10px] text-slate-400">IPM bio-sprays</div>
            </button>

            <button class="feature-quick-btn p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-left hover:border-emerald-500 transition-all shadow-sm group" data-tab="irrigation">
              <div class="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <i data-lucide="droplets" class="w-4 h-4"></i>
              </div>
              <div class="text-xs font-bold text-slate-800 dark:text-white">Smart Water</div>
              <div class="text-[10px] text-slate-400">Drip calculator</div>
            </button>

            <button class="feature-quick-btn p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-left hover:border-emerald-500 transition-all shadow-sm group" data-tab="recommendation">
              <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <i data-lucide="sprout" class="w-4 h-4"></i>
              </div>
              <div class="text-xs font-bold text-slate-800 dark:text-white">Crop Advisory</div>
              <div class="text-[10px] text-slate-400">Yield & profit</div>
            </button>
          </div>

          <!-- QUICK AI ASK & VOICE BAR -->
          <div class="glass-card rounded-3xl p-5 border border-white/20 dark:border-slate-800/80 shadow-lg space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center space-x-2">
                <i data-lucide="message-square" class="w-4 h-4 text-brand-500"></i>
                <span>Ask Kisan Guru AI (कृषि सलाहकार)</span>
              </h3>
              <span class="text-[10px] font-bold text-brand-600 dark:text-emerald-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full">
                Multilingual Speech & Text
              </span>
            </div>
            
            <div class="flex items-center space-x-2">
              <div class="relative flex-1">
                <input type="text" id="quick-chat-input" placeholder="Ask about crop disease, fertilizer doses, spray timings in Hindi or English..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-4 pr-11 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner" />
                <button id="btn-quick-voice-trigger" class="absolute inset-y-0 right-2 px-2.5 text-slate-400 hover:text-brand-500 transition-colors" title="Speak Query">
                  <i data-lucide="${this.voiceActive ? 'mic-off' : 'mic'}" class="w-4 h-4 ${this.voiceActive ? 'text-red-500 animate-pulse' : ''}"></i>
                </button>
              </div>
              <button id="btn-quick-submit" class="p-3 bg-brand-500 text-white rounded-2xl hover:bg-brand-600 transition-all flex items-center justify-center shadow-md shadow-brand-500/20">
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- Voice active wave popover -->
            ${this.voiceActive ? `
              <div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between animate-fade-in">
                <div class="flex items-center space-x-3">
                  <div class="flex items-end space-x-1.5 h-6">
                    <span class="w-1 bg-emerald-500 rounded-full animate-pulse h-3"></span>
                    <span class="w-1 bg-emerald-500 rounded-full animate-pulse h-6"></span>
                    <span class="w-1 bg-emerald-500 rounded-full animate-pulse h-4"></span>
                    <span class="w-1 bg-emerald-500 rounded-full animate-pulse h-5"></span>
                    <span class="w-1 bg-emerald-500 rounded-full animate-pulse h-2"></span>
                  </div>
                  <span class="text-xs font-bold text-emerald-800 dark:text-emerald-300">Listening to regional dialect (Hindi / English / Bhojpuri)...</span>
                </div>
                <button id="btn-quick-voice-stop" class="text-xs font-bold text-red-500 hover:underline">Stop</button>
              </div>
            ` : ''}

            <!-- Suggested questions shortcuts -->
            <div class="flex flex-wrap gap-2 pt-1">
              <button class="quick-suggest-btn px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-500 hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all" data-query="गेहूं में पीला रतुआ का इलाज क्या है?">
                🌾 गेहूं पीला रतुआ इलाज
              </button>
              <button class="quick-suggest-btn px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-500 hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all" data-query="टमाटर में झुलसा रोग की दवा">
                🍅 टमाटर झुलसा दवा
              </button>
              <button class="quick-suggest-btn px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-500 hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all" data-query="सरसों में माहू कीट का समाधान">
                🌱 सरसों माहू कीट
              </button>
              <button class="quick-suggest-btn px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-500 hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all" data-query="PM-Kisan और कुसुम योजना के लाभ">
                📜 पीएम किसान योजना
              </button>
            </div>
          </div>

          <!-- TODAY'S TASKS LIST -->
          <div class="glass-card rounded-3xl p-5 border border-white/20 dark:border-slate-800/80 shadow-lg space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center space-x-2">
                <i data-lucide="check-square" class="w-4 h-4 text-brand-500"></i>
                <span>Today's Farm Operations (आज के कृषि कार्य)</span>
              </h3>
              <span class="text-[10px] font-bold text-brand-600 dark:text-green-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full">
                ${this.tasks.filter(t => t.done).length}/${this.tasks.length} Done
              </span>
            </div>
            
            <div class="space-y-2">
              ${this.tasks.map(task => `
                <div class="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors">
                  <div class="flex items-center space-x-3">
                    <input type="checkbox" data-id="${task.id}" class="task-check-input w-4 h-4 rounded-md border-slate-300 text-brand-500 focus:ring-brand-500 cursor-pointer" ${task.done ? 'checked' : ''} />
                    <span class="text-xs font-semibold ${task.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}">${task.text}</span>
                  </div>
                  <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400">High Priority</span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- RIGHT PANEL: WEATHER, MANDI PRICES, HELPLINE (4 COLS) -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- WEATHER SUMMARY WIDGET -->
          <div class="glass-card rounded-3xl p-5 border border-white/20 dark:border-slate-800/80 shadow-lg space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center space-x-2">
                <i data-lucide="cloud-sun" class="w-4 h-4 text-brand-500"></i>
                <span>Live Agro-Weather</span>
              </h3>
              <button id="btn-weather-details" class="text-[10px] font-bold text-brand-500 hover:underline">7-Day Forecast</button>
            </div>
            
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-3">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <i data-lucide="sun" class="w-7 h-7"></i>
                </div>
                <div>
                  <div class="text-2xl font-extrabold text-slate-800 dark:text-white">${weatherData.temp}</div>
                  <div class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px]">${weatherData.condition}</div>
                </div>
              </div>
              <div class="text-right text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                <div>Humidity: <b>${weatherData.humidity}</b></div>
                <div>Rain Chance: <b>${weatherData.rain}</b></div>
              </div>
            </div>

            <div class="p-3 bg-brand-500/10 border border-brand-500/20 text-[11px] font-medium text-brand-700 dark:text-brand-300 rounded-2xl leading-normal flex items-start space-x-2">
              <i data-lucide="info" class="w-4 h-4 text-brand-600 shrink-0 mt-0.5"></i>
              <span>${weatherData.advisory}</span>
            </div>
          </div>

          <!-- MANDI PRICING WIDGET -->
          <div class="glass-card rounded-3xl p-5 border border-white/20 dark:border-slate-800/80 shadow-lg space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center space-x-2">
                <i data-lucide="trending-up" class="w-4 h-4 text-brand-500"></i>
                <span>Live Mandi APMC Rates</span>
              </h3>
              <button id="btn-mandi-details" class="text-[10px] font-bold text-brand-500 hover:underline">Full Market</button>
            </div>

            <div class="space-y-2.5">
              ${marketPrices.map(item => `
                <div class="flex items-center justify-between p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${item.crop}</span>
                  <div class="flex items-center space-x-2 text-right">
                    <span class="text-xs font-extrabold text-slate-900 dark:text-white">${item.price}</span>
                    <span class="text-xs ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}">
                      <i data-lucide="${item.trend === 'up' ? 'trending-up' : 'trending-down'}" class="w-3.5 h-3.5 inline"></i>
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- KRISHI SOS HELPLINE -->
          <div class="p-5 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl text-white shadow-lg space-y-3 relative overflow-hidden">
            <div class="relative z-10">
              <div class="flex items-center space-x-2 font-bold text-sm">
                <i data-lucide="phone-call" class="w-4 h-4 animate-bounce"></i>
                <span>Krishi SOS Toll-Free</span>
              </div>
              <p class="text-[11px] text-red-100 mt-1">Direct contact with state agricultural officers & veterinary scientists.</p>
            </div>
            <a href="tel:18001801551" class="relative z-10 block w-full py-2.5 bg-white text-red-600 font-extrabold rounded-xl text-xs text-center hover:bg-slate-50 transition-all shadow">
              Dial 1800-180-1551
            </a>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();

    if (window.lucide) {
      window.lucide.createIcons();
    }
    return this.container;
  }

  bindEvents() {
    // Feature Shortcuts
    const featureBtns = this.container.querySelectorAll('.feature-quick-btn');
    featureBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        context.setTab(tab);
      });
    });

    // Hero buttons
    const btnHeroScan = this.container.querySelector('#btn-hero-scan');
    if (btnHeroScan) btnHeroScan.addEventListener('click', () => context.setTab('disease'));

    const btnHeroIrrigation = this.container.querySelector('#btn-hero-irrigation');
    if (btnHeroIrrigation) btnHeroIrrigation.addEventListener('click', () => context.setTab('irrigation'));

    const btnHeroMandi = this.container.querySelector('#btn-hero-mandi');
    if (btnHeroMandi) btnHeroMandi.addEventListener('click', () => context.setTab('mandi'));

    // Quick AI Submit
    const quickInput = this.container.querySelector('#quick-chat-input');
    const quickBtn = this.container.querySelector('#btn-quick-submit');
    if (quickBtn && quickInput) {
      quickBtn.addEventListener('click', () => {
        const val = quickInput.value.trim();
        if (val) {
          if (this.onQuickAsk) this.onQuickAsk(val);
          quickInput.value = '';
        }
      });
      quickInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = quickInput.value.trim();
          if (val) {
            if (this.onQuickAsk) this.onQuickAsk(val);
            quickInput.value = '';
          }
        }
      });
    }

    // Voice assistant triggers
    const voiceTrigger = this.container.querySelector('#btn-quick-voice-trigger');
    if (voiceTrigger) {
      voiceTrigger.addEventListener('click', () => {
        this.voiceActive = !this.voiceActive;
        if (this.voiceActive && this.speechRecognizer && this.speechRecognizer.recognition) {
          try {
            this.speechRecognizer.recognition.start();
          } catch (e) {
            console.warn(e);
          }
        }
        this.render();
      });
    }
    
    // Stop voice listening
    const voiceStop = this.container.querySelector('#btn-quick-voice-stop');
    if (voiceStop) {
      voiceStop.addEventListener('click', () => {
        this.voiceActive = false;
        if (this.speechRecognizer && this.speechRecognizer.recognition) {
          try {
            this.speechRecognizer.recognition.stop();
          } catch (e) {
            console.warn(e);
          }
        }
        this.render();
      });
    }

    // Suggested questions click handler
    const sugBtns = this.container.querySelectorAll('.quick-suggest-btn');
    sugBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        if (this.onQuickAsk) this.onQuickAsk(query);
      });
    });

    // Checkbox toggles in tasks list
    const taskChecks = this.container.querySelectorAll('.task-check-input');
    taskChecks.forEach(check => {
      check.addEventListener('change', (e) => {
        const id = parseInt(check.getAttribute('data-id'));
        const task = this.tasks.find(t => t.id === id);
        if (task) {
          task.done = e.target.checked;
          this.saveTasks();
          this.render();
        }
      });
    });

    // Weather Forecast button
    const btnWeather = this.container.querySelector('#btn-weather-details');
    if (btnWeather) btnWeather.addEventListener('click', () => context.setTab('weather'));

    // Mandi Details button
    const btnMandi = this.container.querySelector('#btn-mandi-details');
    if (btnMandi) btnMandi.addEventListener('click', () => context.setTab('mandi'));
  }
}
