import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class BottomNavigation {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent pointer-events-none';
  }

  render() {
    const state = context.state;
    const lang = state.language;

    // Outer shell has pointer-events-none, but internal navbar has pointer-events-auto
    this.container.innerHTML = `
      <nav class="max-w-md mx-auto pointer-events-auto glass-panel rounded-2xl flex items-center justify-around py-3 px-2 border border-white/20 dark:border-white/5 shadow-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-lg">
        
        <!-- Tab: Home -->
        <button id="btn-bnav-home" class="flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all duration-300 ${state.activeTab === 'home' ? 'text-brand-500 scale-110 font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}">
          <i data-lucide="home" class="w-5 h-5 mb-0.5"></i>
          <span class="text-[9px]">Home</span>
        </button>

        <!-- Tab: AI Chat -->
        <button id="btn-bnav-assistant" class="flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all duration-300 ${state.activeTab === 'assistant' ? 'text-brand-500 scale-110 font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}">
          <i data-lucide="bot" class="w-5 h-5 mb-0.5"></i>
          <span class="text-[9px]">AI Guru</span>
        </button>

        <!-- Center Scan Button -->
        <button id="btn-bnav-disease" class="flex flex-col items-center justify-center w-14 h-14 -mt-6 bg-gradient-to-br from-brand-500 to-green-600 hover:from-brand-600 hover:to-green-700 text-white rounded-full shadow-lg border-4 border-slate-100 dark:border-slate-900 transition-all duration-300 hover:scale-105 active:scale-95">
          <i data-lucide="scan" class="w-6 h-6"></i>
        </button>

        <!-- Tab: Dashboard -->
        <button id="btn-bnav-dashboard" class="flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all duration-300 ${state.activeTab === 'dashboard' ? 'text-brand-500 scale-110 font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}">
          <i data-lucide="layout-dashboard" class="w-5 h-5 mb-0.5"></i>
          <span class="text-[9px]">Dashboard</span>
        </button>

        <!-- Tab: Profile -->
        <button id="btn-bnav-profile" class="flex flex-col items-center justify-center w-12 py-1 rounded-xl transition-all duration-300 ${state.activeTab === 'profile' ? 'text-brand-500 scale-110 font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}">
          <i data-lucide="user" class="w-5 h-5 mb-0.5"></i>
          <span class="text-[9px]">Profile</span>
        </button>

      </nav>
    `;

    this.bindEvents();

    if (window.lucide) {
      window.lucide.createIcons();
    }

    return this.container;
  }

  bindEvents() {
    const btnHome = this.container.querySelector('#btn-bnav-home');
    const btnAssistant = this.container.querySelector('#btn-bnav-assistant');
    const btnDisease = this.container.querySelector('#btn-bnav-disease');
    const btnDashboard = this.container.querySelector('#btn-bnav-dashboard');
    const btnProfile = this.container.querySelector('#btn-bnav-profile');

    if (btnHome) btnHome.addEventListener('click', () => context.setTab('home'));
    if (btnAssistant) btnAssistant.addEventListener('click', () => context.setTab('assistant'));
    if (btnDisease) btnDisease.addEventListener('click', () => context.setTab('disease'));
    if (btnDashboard) btnDashboard.addEventListener('click', () => context.setTab('dashboard'));
    if (btnProfile) btnProfile.addEventListener('click', () => context.setTab('profile'));
  }
}
