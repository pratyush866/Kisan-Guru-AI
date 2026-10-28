import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class AuthFlow {
  constructor(onSuccess) {
    this.container = document.createElement('div');
    this.container.className = 'w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-300';
    this.onSuccess = onSuccess; // Callback on successful login
    
    // Internal auth navigation states:
    // 'splash' | 'language' | 'welcome' | 'login' | 'register' | 'forgot' | 'otp'
    this.step = 'splash';
    this.selectedLanguage = 'english';
    
    // Inputs & Error States
    this.phoneValue = '';
    this.passwordValue = '';
    this.nameValue = '';
    this.stateValue = '';
    this.cropPrefValue = '';
    this.otpDigits = ['', '', '', ''];
    
    this.errors = {};
    this.isLoading = false;
    this.otpTimer = 60;
    this.timerInterval = null;

    // Trigger splash auto-transition
    this.triggerSplashTimer();
  }

  triggerSplashTimer() {
    this.splashTimeout = setTimeout(() => {
      this.step = 'language';
      this.render();
    }, 2500);
  }

  skipSplash() {
    if (this.splashTimeout) clearTimeout(this.splashTimeout);
    this.step = 'language';
    this.render();
  }

  startOtpTimer() {
    this.otpTimer = 60;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) {
        clearInterval(this.timerInterval);
        this.otpTimer = 0;
      }
      this.updateTimerDisplay();
    }, 1000);
  }

  updateTimerDisplay() {
    const timerEl = this.container.querySelector('#otp-timer-count');
    const resendBtn = this.container.querySelector('#btn-otp-resend');
    if (timerEl) {
      timerEl.textContent = this.otpTimer > 0 ? `Resend OTP in ${this.otpTimer}s` : '';
    }
    if (resendBtn) {
      if (this.otpTimer > 0) {
        resendBtn.disabled = true;
        resendBtn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        resendBtn.disabled = false;
        resendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }
  }

  render() {
    this.container.innerHTML = '';
    
    // Renders different content wrappers depending on the active stage
    const wrapper = document.createElement('div');
    wrapper.className = 'w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-white/5 animate-fade-in-up bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl relative overflow-hidden';

    if (this.step === 'splash') {
      this.renderSplash(wrapper);
    } else if (this.step === 'language') {
      this.renderLanguageSelection(wrapper);
    } else if (this.step === 'welcome') {
      this.renderWelcome(wrapper);
    } else if (this.step === 'login') {
      this.renderLogin(wrapper);
    } else if (this.step === 'register') {
      this.renderRegister(wrapper);
    } else if (this.step === 'forgot') {
      this.renderForgotPassword(wrapper);
    } else if (this.step === 'otp') {
      this.renderOtpVerification(wrapper);
    }

    this.container.appendChild(wrapper);
    this.bindEvents();

    if (window.lucide) {
      window.lucide.createIcons();
    }

    return this.container;
  }

  // ==========================================
  // SPLASH SCREEN VIEW
  // ==========================================
  renderSplash(parent) {
    parent.className = 'w-full max-w-md text-center py-16 px-8 space-y-6 flex flex-col items-center justify-center';
    parent.innerHTML = `
      <!-- Animated Logo Icon -->
      <div class="relative w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-green-600 shadow-xl shadow-brand-500/20 animate-bounce">
        <i data-lucide="sprout" class="w-16 h-16 text-white"></i>
        <!-- Orbiting ring animation -->
        <span class="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
      </div>
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-green-600 dark:from-brand-400 dark:to-green-500">
          Kisan Guru AI
        </h1>
        <p class="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mt-1">
          Bharat Agriculture OS (BAOS)
        </p>
      </div>
      <div class="flex items-center space-x-1.5 pt-4">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
      <div class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold pt-4">
        Secure, Smart, Multilingual Intelligence Fabric
      </div>
      <button id="btn-skip-splash" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-2 cursor-pointer flex items-center space-x-1">
        <span>Tap to begin / आगे बढ़ें</span>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      </button>
    `;
  }

  // ==========================================
  // LANGUAGE SELECTION VIEW
  // ==========================================
  renderLanguageSelection(parent) {
    const languages = [
      { id: 'english', label: 'English', native: 'English' },
      { id: 'hindi', label: 'Hindi', native: 'हिन्दी' },
      { id: 'bhojpuri', label: 'Bhojpuri', native: 'भोजपुरी' },
      { id: 'awadhi', label: 'Awadhi', native: 'अवधी' },
      { id: 'marathi', label: 'Marathi', native: 'मराठी' },
      { id: 'gujarati', label: 'Gujarati', native: 'गुराती' },
      { id: 'punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
      { id: 'tamil', label: 'Tamil', native: 'தமிழ்' },
      { id: 'telugu', label: 'Telugu', native: 'తెలుగు' },
      { id: 'kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
      { id: 'malayalam', label: 'Malayalam', native: 'മലയാളம்' },
      { id: 'bengali', label: 'Bengali', native: 'বাংলা' },
      { id: 'odia', label: 'Odia', native: 'ଓଡ଼ିଆ' },
      { id: 'assamese', label: 'Assamese', native: 'অসমীয়া' }
    ];

    parent.innerHTML = `
      <div class="text-center mb-6">
        <h2 class="text-xl font-bold text-slate-800 dark:text-white">Select Language / भाषा चुनें</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Choose your preferred agricultural dialog dialect</p>
      </div>

      <div class="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 mb-6">
        ${languages.map(lang => `
          <button class="lang-option-btn p-3.5 rounded-2xl text-left border transition-all duration-300 flex items-center justify-between group ${this.selectedLanguage === lang.id ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 font-bold' : 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-brand-500/50'}" data-lang="${lang.id}">
            <div>
              <div class="text-sm">${lang.native}</div>
              <div class="text-[10px] text-slate-400 group-hover:text-slate-500">${lang.label}</div>
            </div>
            ${this.selectedLanguage === lang.id ? `<span class="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px]"><i data-lucide="check" class="w-2.5 h-2.5"></i></span>` : ''}
          </button>
        `).join('')}
      </div>

      <button id="btn-lang-continue" class="w-full py-3.5 bg-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-[0.99] flex items-center justify-center space-x-2">
        <span>Proceed / आगे बढ़ें</span>
        <i data-lucide="arrow-right" class="w-4 h-4"></i>
      </button>
    `;
  }

  // ==========================================
  // WELCOME SCREEN VIEW
  // ==========================================
  renderWelcome(parent) {
    const welcomeTitle = TranslationUtils.translate('welcomeTitle', this.selectedLanguage);
    const welcomeDesc = TranslationUtils.translate('welcomeDesc', this.selectedLanguage);

    parent.innerHTML = `
      <div class="text-center space-y-4 mb-8">
        <div class="w-16 h-16 mx-auto bg-brand-100 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center shadow-inner">
          <i data-lucide="sprout" class="w-8 h-8"></i>
        </div>
        <div>
          <h2 class="text-2xl font-extrabold text-slate-800 dark:text-white">${welcomeTitle}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">${welcomeDesc}</p>
        </div>
      </div>

      <div class="space-y-3">
        <button id="btn-welcome-demo" class="w-full py-4 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
          <i data-lucide="zap" class="w-4 h-4 text-amber-300 fill-amber-300"></i>
          <span>⚡ Instant Demo Access (तुरंत शुरू करें)</span>
        </button>

        <button id="btn-welcome-login" class="w-full py-3.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 font-bold rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center space-x-2">
          <i data-lucide="log-in" class="w-4 h-4 text-brand-500"></i>
          <span>Log In with Mobile Number</span>
        </button>

        <button id="btn-welcome-register" class="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all flex items-center justify-center space-x-2">
          <i data-lucide="user-plus" class="w-4 h-4"></i>
          <span>Register New Farm Profile</span>
        </button>
      </div>

      <div class="mt-6 text-center">
        <button id="btn-welcome-back-lang" class="text-xs text-brand-500 font-semibold hover:underline flex items-center justify-center mx-auto space-x-1">
          <i data-lucide="languages" class="w-3.5 h-3.5"></i>
          <span>Change Language / भाषा बदलें</span>
        </button>
      </div>
    `;
  }

  // ==========================================
  // LOGIN SCREEN VIEW
  // ==========================================
  renderLogin(parent) {
    parent.innerHTML = `
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Farmer Log In</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Access your farm operational data</p>
        </div>
        <button id="btn-login-back" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <i data-lucide="arrow-left" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="auth-login-form" class="space-y-4">
        <!-- Phone Number -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-semibold select-none border-r border-slate-200 dark:border-slate-800 pr-2">+91</span>
            <input type="tel" id="login-phone" placeholder="98765 43210" class="w-full bg-white dark:bg-slate-900 border ${this.errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl pl-16 pr-4 py-3 text-sm focus:outline-none" value="${this.phoneValue}" />
          </div>
          ${this.errors.phone ? `<p class="text-red-500 text-[10px] font-semibold mt-1">${this.errors.phone}</p>` : ''}
        </div>

        <!-- Password -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <button type="button" id="btn-login-forgot" class="text-xs font-bold text-brand-500 hover:underline">Forgot?</button>
          </div>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <i data-lucide="lock" class="w-4 h-4"></i>
            </span>
            <input type="password" id="login-password" placeholder="••••••••" class="w-full bg-white dark:bg-slate-900 border ${this.errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none" value="${this.passwordValue}" />
          </div>
          ${this.errors.password ? `<p class="text-red-500 text-[10px] font-semibold mt-1">${this.errors.password}</p>` : ''}
        </div>

        <button type="submit" class="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 mt-6">
          ${this.isLoading ? `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>` : '<i data-lucide="unlock" class="w-4 h-4"></i>'}
          <span>Unlock Dashboard</span>
        </button>
      </form>

      <div class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        New to BAOS? 
        <button id="btn-login-to-register" class="text-brand-500 font-bold hover:underline">Create a farm account</button>
      </div>
    `;
  }

  // ==========================================
  // REGISTER SCREEN VIEW
  // ==========================================
  renderRegister(parent) {
    parent.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Register Farmer</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Initialize your digital agricultural profile</p>
        </div>
        <button id="btn-register-back" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <i data-lucide="arrow-left" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="auth-register-form" class="space-y-3.5">
        <!-- Full Name -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Farmer Name</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <i data-lucide="user" class="w-4 h-4"></i>
            </span>
            <input type="text" id="register-name" placeholder="Ramesh Kumar" class="w-full bg-white dark:bg-slate-900 border ${this.errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none" value="${this.nameValue}" />
          </div>
          ${this.errors.name ? `<p class="text-red-500 text-[10px] font-semibold mt-1">${this.errors.name}</p>` : ''}
        </div>

        <!-- Phone Number -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-semibold select-none border-r border-slate-200 dark:border-slate-800 pr-2">+91</span>
            <input type="tel" id="register-phone" placeholder="98765 43210" class="w-full bg-white dark:bg-slate-900 border ${this.errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl pl-16 pr-4 py-2.5 text-sm focus:outline-none" value="${this.phoneValue}" />
          </div>
          ${this.errors.phone ? `<p class="text-red-500 text-[10px] font-semibold mt-1">${this.errors.phone}</p>` : ''}
        </div>

        <!-- Password -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <i data-lucide="lock" class="w-4 h-4"></i>
            </span>
            <input type="password" id="register-password" placeholder="Min 6 characters" class="w-full bg-white dark:bg-slate-900 border ${this.errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none" value="${this.passwordValue}" />
          </div>
          ${this.errors.password ? `<p class="text-red-500 text-[10px] font-semibold mt-1">${this.errors.password}</p>` : ''}
        </div>

        <!-- Regional State and Crops Selection -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">State</label>
            <select id="register-state" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2.5 text-xs font-semibold focus:outline-none">
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Punjab">Punjab</option>
              <option value="Bihar">Bihar</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Haryana">Haryana</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary Crop</label>
            <select id="register-crop" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2.5 text-xs font-semibold focus:outline-none">
              <option value="Wheat">Wheat (गेहूं)</option>
              <option value="Rice">Rice (धान)</option>
              <option value="Potato">Potato (आलू)</option>
              <option value="Tomato">Tomato (टमाटर)</option>
              <option value="Maize">Maize (मक्का)</option>
            </select>
          </div>
        </div>

        <button type="submit" class="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 mt-4">
          ${this.isLoading ? `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>` : '<i data-lucide="user-check" class="w-4 h-4"></i>'}
          <span>Register Profile</span>
        </button>
      </form>

      <div class="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Already registered? 
        <button id="btn-register-to-login" class="text-brand-500 font-bold hover:underline">Log in here</button>
      </div>
    `;
  }

  // ==========================================
  // FORGOT PASSWORD SCREEN VIEW
  // ==========================================
  renderForgotPassword(parent) {
    parent.innerHTML = `
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Recover Password</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive verification code on registered phone</p>
        </div>
        <button id="btn-forgot-back" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <i data-lucide="arrow-left" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="auth-forgot-form" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-semibold select-none border-r border-slate-200 dark:border-slate-800 pr-2">+91</span>
            <input type="tel" id="forgot-phone" placeholder="98765 43210" class="w-full bg-white dark:bg-slate-900 border ${this.errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl pl-16 pr-4 py-3 text-sm focus:outline-none" value="${this.phoneValue}" />
          </div>
          ${this.errors.phone ? `<p class="text-red-500 text-[10px] font-semibold mt-1">${this.errors.phone}</p>` : ''}
        </div>

        <button type="submit" class="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 mt-4">
          <span>Request Reset Code</span>
          <i data-lucide="message-square" class="w-4 h-4"></i>
        </button>
      </form>
    `;
  }

  // ==========================================
  // OTP VERIFICATION SCREEN VIEW
  // ==========================================
  renderOtpVerification(parent) {
    parent.innerHTML = `
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">OTP Verification</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">We sent a 4-digit code to +91 ${this.phoneValue}</p>
        </div>
        <button id="btn-otp-back" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <i data-lucide="arrow-left" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="auth-otp-form" class="space-y-6">
        <!-- OTP Inputs Row -->
        <div class="flex justify-between px-6">
          ${[0, 1, 2, 3].map(idx => `
            <input type="text" maxlength="1" data-index="${idx}" class="otp-digit-input w-12 h-14 bg-white dark:bg-slate-900 border ${this.errors.otp ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-brand-500" value="${this.otpDigits[idx]}" />
          `).join('')}
        </div>
        ${this.errors.otp ? `<p class="text-red-500 text-[10px] font-semibold text-center">${this.errors.otp}</p>` : ''}

        <div class="text-center space-y-2">
          <div id="otp-timer-count" class="text-xs text-slate-400 font-bold"></div>
          <div>
            <button type="button" id="btn-otp-resend" class="text-xs font-bold text-brand-500 hover:underline">Resend OTP via SMS</button>
          </div>
        </div>

        <button type="submit" class="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 mt-4">
          ${this.isLoading ? `<span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>` : '<i data-lucide="shield-check" class="w-4 h-4"></i>'}
          <span>Verify Credentials</span>
        </button>
      </form>
    `;

    this.startOtpTimer();
    this.updateTimerDisplay();
  }

  // ==========================================
  // EVENT BINDINGS AND STATE TRANSITIONS
  // ==========================================
  bindEvents() {
    // 0. Splash screen click to skip
    const btnSkipSplash = this.container.querySelector('#btn-skip-splash');
    if (btnSkipSplash) {
      btnSkipSplash.addEventListener('click', () => this.skipSplash());
    }

    // 1. Language Option clicks
    const langBtns = this.container.querySelectorAll('.lang-option-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedLanguage = btn.getAttribute('data-lang');
        this.render();
      });
    });

    // 2. Language Continue button
    const btnLangContinue = this.container.querySelector('#btn-lang-continue');
    if (btnLangContinue) {
      btnLangContinue.addEventListener('click', () => {
        // Sync setting in global context
        context.setLanguage(this.selectedLanguage);
        this.step = 'welcome';
        this.render();
      });
    }

    // 3. Welcome screen events
    const btnWDemo = this.container.querySelector('#btn-welcome-demo');
    const btnWLogin = this.container.querySelector('#btn-welcome-login');
    const btnWRegister = this.container.querySelector('#btn-welcome-register');
    const btnWSkip = this.container.querySelector('#btn-welcome-skip');
    const btnWLang = this.container.querySelector('#btn-welcome-back-lang');

    if (btnWDemo) btnWDemo.addEventListener('click', () => this.loginAsDemo());
    if (btnWLogin) btnWLogin.addEventListener('click', () => { this.step = 'login'; this.errors = {}; this.render(); });
    if (btnWRegister) btnWRegister.addEventListener('click', () => { this.step = 'register'; this.errors = {}; this.render(); });
    if (btnWLang) btnWLang.addEventListener('click', () => { this.step = 'language'; this.render(); });
    if (btnWSkip) btnWSkip.addEventListener('click', () => this.loginAsDemo());


    // 4. Back navigation anchors
    const btnLoginBack = this.container.querySelector('#btn-login-back');
    const btnRegBack = this.container.querySelector('#btn-register-back');
    const btnForgotBack = this.container.querySelector('#btn-forgot-back');
    const btnOtpBack = this.container.querySelector('#btn-otp-back');

    if (btnLoginBack) btnLoginBack.addEventListener('click', () => { this.step = 'welcome'; this.render(); });
    if (btnRegBack) btnRegBack.addEventListener('click', () => { this.step = 'welcome'; this.render(); });
    if (btnForgotBack) btnForgotBack.addEventListener('click', () => { this.step = 'login'; this.render(); });
    if (btnOtpBack) btnOtpBack.addEventListener('click', () => { this.step = 'welcome'; this.render(); });

    // 5. Navigate from login page directly to register or forgot
    const btnLoginToReg = this.container.querySelector('#btn-login-to-register');
    const btnLoginForgot = this.container.querySelector('#btn-login-forgot');
    if (btnLoginToReg) btnLoginToReg.addEventListener('click', () => { this.step = 'register'; this.errors = {}; this.render(); });
    if (btnLoginForgot) btnLoginForgot.addEventListener('click', () => { this.step = 'forgot'; this.errors = {}; this.render(); });

    // 6. Navigate from Register back to login
    const btnRegToLogin = this.container.querySelector('#btn-register-to-login');
    if (btnRegToLogin) btnRegToLogin.addEventListener('click', () => { this.step = 'login'; this.errors = {}; this.render(); });

    // 7. Login form submission
    const loginForm = this.container.querySelector('#auth-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = this.container.querySelector('#login-phone').value.trim();
        const password = this.container.querySelector('#login-password').value.trim();

        // Validation
        this.errors = {};
        if (!/^[6-9]\d{9}$/.test(phone)) {
          this.errors.phone = 'Please enter a valid 10-digit Indian mobile number.';
        }
        if (password.length < 6) {
          this.errors.password = 'Password must be at least 6 characters.';
        }

        this.phoneValue = phone;
        this.passwordValue = password;

        if (Object.keys(this.errors).length > 0) {
          this.render();
          return;
        }

        // Simulate secure API/OTP dispatch request
        this.isLoading = true;
        this.render();
        setTimeout(() => {
          this.isLoading = false;
          // Redirect to verification code
          this.step = 'otp';
          this.render();
        }, 1200);
      });
    }

    // 8. Register form submission
    const registerForm = this.container.querySelector('#auth-register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = this.container.querySelector('#register-name').value.trim();
        const phone = this.container.querySelector('#register-phone').value.trim();
        const password = this.container.querySelector('#register-password').value.trim();
        const stateName = this.container.querySelector('#register-state').value;
        const cropName = this.container.querySelector('#register-crop').value;

        this.errors = {};
        if (!name) this.errors.name = 'Name is required.';
        if (!/^[6-9]\d{9}$/.test(phone)) this.errors.phone = 'Valid 10-digit Indian number required.';
        if (password.length < 6) this.errors.password = 'Password must be at least 6 characters.';

        this.nameValue = name;
        this.phoneValue = phone;
        this.passwordValue = password;
        this.stateValue = stateName;
        this.cropPrefValue = cropName;

        if (Object.keys(this.errors).length > 0) {
          this.render();
          return;
        }

        this.isLoading = true;
        this.render();
        setTimeout(() => {
          this.isLoading = true;
          this.step = 'otp';
          this.render();
        }, 1200);
      });
    }

    // 9. Forgot password form
    const forgotForm = this.container.querySelector('#auth-forgot-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = this.container.querySelector('#forgot-phone').value.trim();
        this.errors = {};
        if (!/^[6-9]\d{9}$/.test(phone)) {
          this.errors.phone = 'Valid Indian number required.';
          this.render();
          return;
        }
        this.phoneValue = phone;
        this.step = 'otp';
        this.render();
      });
    }

    // 10. OTP Input behaviors (auto-tab / verify)
    const otpInputs = this.container.querySelectorAll('.otp-digit-input');
    otpInputs.forEach((input, index) => {
      // Auto-tab to next input box
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        this.otpDigits[index] = val;
        if (val && index < 3) {
          otpInputs[index + 1].focus();
        }
      });
      // Backspace handler
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
          otpInputs[index - 1].focus();
        }
      });
    });

    const otpForm = this.container.querySelector('#auth-otp-form');
    if (otpForm) {
      otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.errors = {};
        const code = this.otpDigits.join('');

        if (code.length < 4) {
          this.errors.otp = 'Please fill out all 4 digits.';
          this.render();
          return;
        }

        this.isLoading = true;
        this.render();

        setTimeout(() => {
          this.isLoading = false;
          clearInterval(this.timerInterval);

          // Save user credentials in state & token storage
          const userProfile = {
            name: this.nameValue || 'Ramesh Kumar',
            phone: this.phoneValue,
            state: this.stateValue || 'Uttar Pradesh',
            crop: this.cropPrefValue || 'Wheat',
            role: 'farmer'
          };
          localStorage.setItem('access_token', 'mock_jwt_access_token_kisan_guru');
          context.login(true, userProfile);

          if (this.onSuccess) {
            this.onSuccess();
          }
        }, 1200);
      });
    }

    // Resend button
    const btnResend = this.container.querySelector('#btn-otp-resend');
    if (btnResend) {
      btnResend.addEventListener('click', () => {
        this.startOtpTimer();
        this.updateTimerDisplay();
        alert('Verification SMS resent to +91 ' + this.phoneValue);
      });
    }
  }

  async loginAsDemo() {
    this.isLoading = true;
    this.render();

    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }
      } else {
        localStorage.setItem('access_token', 'mock_jwt_access_token_kisan_guru');
      }
    } catch (err) {
      localStorage.setItem('access_token', 'mock_jwt_access_token_kisan_guru');
    }

    const demoFarmer = {
      name: 'Ramesh Kumar',
      phone: '9876543210',
      state: 'Uttar Pradesh',
      crop: 'Wheat',
      role: 'farmer'
    };
    context.login(true, demoFarmer);
    if (this.onSuccess) {
      this.onSuccess();
    }
  }
}

