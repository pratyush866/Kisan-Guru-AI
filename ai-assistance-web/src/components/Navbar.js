import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';
import { UseTheme } from '../hooks/useTheme.js';

export class Navbar {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full';
    
    // Notification drawer state
    this.showNotifications = false;
    
    // Mobile sidebar state
    this.mobileSidebarOpen = false;
  }

  render() {
    const state = context.state;
    const lang = state.language;
    
    // Core layout container
    this.container.innerHTML = `
      <!-- TOP HEADER BAR -->
      <header class="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <!-- Mobile Menu trigger & Brand Logo -->
          <div class="flex items-center space-x-3">
            <button id="btn-mobile-sidebar-toggle" class="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <i data-lucide="menu" class="w-5 h-5"></i>
            </button>
            <div class="flex items-center space-x-2.5 cursor-pointer" id="nav-brand-logo-main">
              <div class="w-10 h-10 rounded-2xl shadow-lg shadow-emerald-500/20 overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-extrabold transition-transform hover:scale-105 duration-300">
                <i data-lucide="sprout" class="w-6 h-6"></i>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h1 class="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                    Kisan Guru AI
                  </h1>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    BAOS v2.0
                  </span>
                </div>
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">
                  Bharat Agriculture OS
                </span>
              </div>
            </div>
          </div>

          <!-- Topbar Actions Controls (Theme, Language, Notifications, Profile) -->
          <div class="flex items-center space-x-3 sm:space-x-4">
            
            <!-- Language Dropdown -->
            <div class="relative hidden sm:block">
              <select id="select-language-nav" class="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="english" ${lang === 'english' ? 'selected' : ''}>English</option>
                <option value="hindi" ${lang === 'hindi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                <option value="bhojpuri" ${lang === 'bhojpuri' ? 'selected' : ''}>भोजपुरी (Bhojpuri)</option>
                <option value="hinglish" ${lang === 'hinglish' ? 'selected' : ''}>Hinglish</option>
                <option value="awadhi" ${lang === 'awadhi' ? 'selected' : ''}>अवधी (Awadhi)</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
              </div>
            </div>

            <!-- Dark Theme Toggle -->
            <button id="btn-theme-toggle-nav" class="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Toggle Theme">
              <i data-lucide="${state.theme === 'dark' ? 'sun' : 'moon'}" class="w-4 h-4"></i>
            </button>

            <!-- Notifications Center Trigger -->
            <div class="relative">
              <button id="btn-notifications-trigger" class="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative" title="Alerts">
                <i data-lucide="bell" class="w-4 h-4"></i>
                <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <!-- Notifications Dropdown Dialog -->
              ${this.showNotifications ? `
                <div class="absolute right-0 mt-3 w-80 glass-panel rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 z-50 space-y-3 animate-fade-in">
                  <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span class="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Field Advisories</span>
                    <button id="btn-notifications-clear" class="text-[10px] text-brand-500 font-bold hover:underline">Clear all</button>
                  </div>
                  <div class="space-y-2 max-h-60 overflow-y-auto">
                    <div class="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs flex items-start space-x-2">
                      <i data-lucide="alert-triangle" class="w-4 h-4 text-red-500 shrink-0 mt-0.5"></i>
                      <div>
                        <div class="font-bold text-red-800 dark:text-red-400">Yellow Rust Warning</div>
                        <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Humidity high. Inspect outer Wheat rows.</div>
                      </div>
                    </div>
                    <div class="p-2.5 bg-brand-500/10 border border-brand-500/20 rounded-xl text-xs flex items-start space-x-2">
                      <i data-lucide="cloud-rain" class="w-4 h-4 text-brand-600 shrink-0 mt-0.5"></i>
                      <div>
                        <div class="font-bold text-slate-800 dark:text-slate-200">Rain Forecast Available</div>
                        <div class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Open-Meteo zero-config forecast active for your location.</div>
                      </div>
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- Profile Info Badge -->
            <button id="btn-profile-badge" class="flex items-center space-x-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Settings & Profile">
              <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-green-500 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                ${state.user && state.user.name ? state.user.name[0] : 'R'}
              </div>
              <span class="hidden md:inline text-xs font-bold text-slate-700 dark:text-slate-200">
                ${state.user && state.user.name ? state.user.name : 'Ramesh Kumar'}
              </span>
            </button>

          </div>
        </div>
      </header>

      <!-- DESKTOP PERSISTENT SIDEBAR NAVIGATION -->
      <aside class="hidden lg:flex flex-col w-64 fixed top-16 bottom-0 left-0 bg-white/70 dark:bg-slate-950/40 border-r border-slate-200/50 dark:border-slate-800/50 z-20 p-4 space-y-4 select-none overflow-y-auto">
        
        <!-- Navigation Groups -->
        <div class="space-y-4 flex-1">
          <!-- Main Core Hub -->
          <div>
            <span class="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Core Hub</span>
            <div class="space-y-1 mt-1">
              ${this.renderSidebarLink('home', 'home', 'Home (मुख्य पृष्ठ)')}
              ${this.renderSidebarLink('assistant', 'bot', 'AI Assistant (सलाहकार)')}
              ${this.renderSidebarLink('dashboard', 'layout-dashboard', 'Farm Operations (बहीखाता)')}
            </div>
          </div>

          <!-- Crop Health & Diagnosis -->
          <div>
            <span class="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Crop Health & Care</span>
            <div class="space-y-1 mt-1">
              ${this.renderSidebarLink('disease', 'shield-alert', 'Disease Scanner (रोग जाँच)')}
              ${this.renderSidebarLink('pest', 'bug', 'Pest Management (कीट नियंत्रण)')}
              ${this.renderSidebarLink('irrigation', 'droplets', 'Smart Irrigation (स्मार्ट सिंचाई)')}
            </div>
          </div>

          <!-- Advisory & Markets -->
          <div>
            <span class="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Advisory & Markets</span>
            <div class="space-y-1 mt-1">
              ${this.renderSidebarLink('recommendation', 'sprout', 'Crop Advisory (फसल चयन)')}
              ${this.renderSidebarLink('mandi', 'trending-up', 'Mandi Prices (मंडी भाव)')}
              ${this.renderSidebarLink('weather', 'cloud-sun', 'Weather (मौसम पूर्वानुमान)')}
              ${this.renderSidebarLink('marketplace', 'shopping-bag', 'Marketplace (बाज़ार व किराये)')}
            </div>
          </div>

          <!-- Community & Settings -->
          <div>
            <span class="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Community & Settings</span>
            <div class="space-y-1 mt-1">
              ${this.renderSidebarLink('community', 'users', 'Community Chopal (चौपाल)')}
              ${this.renderSidebarLink('schemes', 'landmark', 'Gov Schemes (सरकारी योजना)')}
              ${this.renderSidebarLink('learning', 'book-open', 'Learning Center (कृषि ज्ञान)')}
              ${this.renderSidebarLink('expert', 'phone-call', 'Expert Booking (सलाह)')}
              ${this.renderSidebarLink('profile', 'settings', 'Settings & API Keys (सेटिंग्स)')}
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-900 text-center">
          <div class="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            Bharat Agriculture OS
          </div>
          <div class="text-[8px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            Operational (Port 8000 API)
          </div>
        </div>
      </aside>

      <!-- MOBILE SLIDEOUT SIDEBAR DRAWER Overlay -->
      ${this.mobileSidebarOpen ? `
        <div class="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" id="sidebar-mobile-overlay">
          <div class="w-64 h-full bg-white dark:bg-slate-950 p-4 flex flex-col space-y-4 animate-slide-in-right shadow-2xl relative overflow-y-auto">
            <button id="btn-mobile-sidebar-close" class="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
            <div class="flex items-center space-x-2 pb-3 border-b border-slate-200 dark:border-slate-900">
              <span class="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center"><i data-lucide="sprout" class="w-5 h-5"></i></span>
              <span class="font-bold text-slate-800 dark:text-white">Kisan Guru AI</span>
            </div>
            
            <div class="space-y-4 flex-1">
              <div>
                <span class="px-2 text-[10px] font-extrabold uppercase text-slate-400">Core Hub</span>
                <div class="space-y-1 mt-1">
                  ${this.renderSidebarLink('home', 'home', 'Home')}
                  ${this.renderSidebarLink('assistant', 'bot', 'AI Assistant')}
                  ${this.renderSidebarLink('dashboard', 'layout-dashboard', 'Farm Operations')}
                </div>
              </div>

              <div>
                <span class="px-2 text-[10px] font-extrabold uppercase text-slate-400">Crop Health</span>
                <div class="space-y-1 mt-1">
                  ${this.renderSidebarLink('disease', 'shield-alert', 'Disease Scanner')}
                  ${this.renderSidebarLink('pest', 'bug', 'Pest Management')}
                  ${this.renderSidebarLink('irrigation', 'droplets', 'Smart Irrigation')}
                </div>
              </div>

              <div>
                <span class="px-2 text-[10px] font-extrabold uppercase text-slate-400">Advisory & Markets</span>
                <div class="space-y-1 mt-1">
                  ${this.renderSidebarLink('recommendation', 'sprout', 'Crop Advisory')}
                  ${this.renderSidebarLink('mandi', 'trending-up', 'Mandi Prices')}
                  ${this.renderSidebarLink('weather', 'cloud-sun', 'Weather')}
                  ${this.renderSidebarLink('marketplace', 'shopping-bag', 'Marketplace')}
                </div>
              </div>

              <div>
                <span class="px-2 text-[10px] font-extrabold uppercase text-slate-400">Community & Settings</span>
                <div class="space-y-1 mt-1">
                  ${this.renderSidebarLink('community', 'users', 'Community')}
                  ${this.renderSidebarLink('schemes', 'landmark', 'Gov Schemes')}
                  ${this.renderSidebarLink('learning', 'book-open', 'Learning Center')}
                  ${this.renderSidebarLink('expert', 'phone-call', 'Expert Booking')}
                  ${this.renderSidebarLink('profile', 'settings', 'Settings & API Keys')}
                </div>
              </div>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    this.bindEvents();
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
    return this.container;
  }

  renderSidebarLink(tabId, icon, label) {
    const state = context.state;
    const isActive = state.activeTab === tabId;
    return `
      <button class="nav-sidebar-link-btn w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-all duration-200 flex items-center space-x-2.5 ${isActive ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'}" data-tab="${tabId}">
        <i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i>
        <span class="truncate">${label}</span>
      </button>
    `;
  }

  bindEvents() {
    // 1. Language selector change
    const langSelect = this.container.querySelector('#select-language-nav');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        context.setLanguage(e.target.value);
      });
    }

    // 2. Dark Mode Toggle
    const themeBtn = this.container.querySelector('#btn-theme-toggle-nav');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        UseTheme.toggle();
        this.render();
      });
    }

    // 3. Brand Logo navigation to Home
    const logoMain = this.container.querySelector('#nav-brand-logo-main');
    if (logoMain) {
      logoMain.addEventListener('click', () => context.setTab('home'));
    }

    // 4. Notifications trigger toggles
    const notifBtn = this.container.querySelector('#btn-notifications-trigger');
    if (notifBtn) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showNotifications = !this.showNotifications;
        this.render();
      });
    }

    // Clear notifications
    const clearNotif = this.container.querySelector('#btn-notifications-clear');
    if (clearNotif) {
      clearNotif.addEventListener('click', () => {
        this.showNotifications = false;
        alert('All alerts cleared.');
        this.render();
      });
    }

    // 5. Sidebar buttons clicks routing
    const sidebarBtns = this.container.querySelectorAll('.nav-sidebar-link-btn');
    sidebarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        context.setTab(tab);
        this.mobileSidebarOpen = false;
        this.render();
      });
    });

    // 6. Profile Badge click -> Navigate to Profile / Settings
    const profileBadge = this.container.querySelector('#btn-profile-badge');
    if (profileBadge) {
      profileBadge.addEventListener('click', () => {
        context.setTab('profile');
      });
    }

    // 7. Mobile menu sidebar trigger toggles
    const mobToggle = this.container.querySelector('#btn-mobile-sidebar-toggle');
    if (mobToggle) {
      mobToggle.addEventListener('click', () => {
        this.mobileSidebarOpen = true;
        this.render();
      });
    }

    const mobClose = this.container.querySelector('#btn-mobile-sidebar-close');
    if (mobClose) {
      mobClose.addEventListener('click', () => {
        this.mobileSidebarOpen = false;
        this.render();
      });
    }

    const mobOverlay = this.container.querySelector('#sidebar-mobile-overlay');
    if (mobOverlay) {
      mobOverlay.addEventListener('click', (e) => {
        if (e.target === mobOverlay) {
          this.mobileSidebarOpen = false;
          this.render();
        }
      });
    }
  }
}
