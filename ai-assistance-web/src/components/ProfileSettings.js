import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';
import { StorageService } from '../services/StorageService.js';
import { UseTheme } from '../hooks/useTheme.js';

export class ProfileSettings {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6 pb-24';
    
    // Status states
    this.geminiStatus = 'idle'; // 'idle' | 'testing' | 'success' | 'error'
    this.weatherStatus = 'idle';
    this.saveMessage = '';

    // Supabase & Cloud DB states
    this.dbStatus = null;
    this.dbTestStatus = 'idle'; // 'idle' | 'testing' | 'success' | 'error'
    this.dbTestMessage = '';
    this.loadDbStatus();
  }

  async loadDbStatus() {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/system/db-status');
      if (res.ok) {
        this.dbStatus = await res.json();
        const pill = this.container.querySelector('#supabase-live-status-pill');
        if (pill) {
          pill.innerHTML = `
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${this.dbStatus.is_supabase ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'}">
              ● ${this.dbStatus.mode}
            </span>
            <span class="text-[10px] text-slate-400 font-mono">${this.dbStatus.engine}</span>
          `;
        }
      }
    } catch (e) {
      console.warn('Backend DB status check failed:', e);
    }

  render() {
    const state = context.state;
    const user = state.user || {
      name: 'Ramesh Kumar',
      phone: '9876543210',
      state: 'Uttar Pradesh',
      crop: 'Wheat',
      role: 'farmer'
    };
    const lang = state.language;

    // Retrieve saved API keys from localStorage
    const savedGeminiKey = localStorage.getItem('user_gemini_api_key') || '';
    const savedWeatherKey = localStorage.getItem('user_weather_api_key') || '';
    const landSize = localStorage.getItem('user_land_size') || '4.5';
    const district = localStorage.getItem('user_district') || 'Lucknow';
    const irrigationType = localStorage.getItem('user_irrigation_type') || 'Drip Irrigation';

    this.container.innerHTML = `
      <!-- PAGE HEADER -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <i data-lucide="settings" class="w-6 h-6 text-brand-500"></i>
            <span>Farmer Profile & System Settings</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your farm identity, custom AI API keys, regional languages, and offline storage.
          </p>
        </div>
        ${this.saveMessage ? `
          <div class="mt-2 md:mt-0 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-1.5 animate-fade-in">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>${this.saveMessage}</span>
          </div>
        ` : ''}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- LEFT COLUMN: FARMER IDENTITY & FARM PROFILE (7 COLS) -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- FARMER IDENTITY CARD -->
          <div class="glass-card rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-lg space-y-5">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-green-500 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-brand-500/20">
                  ${user.name ? user.name.charAt(0).toUpperCase() : 'K'}
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900 dark:text-white">${user.name || 'Farmer'}</h3>
                  <div class="flex items-center space-x-2 mt-0.5">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                      ● Active BAOS Farmer
                    </span>
                    <span class="text-xs text-slate-400 font-medium">+91 ${user.phone || '9876543210'}</span>
                  </div>
                </div>
              </div>
              <button id="btn-logout-profile" class="px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all flex items-center space-x-1">
                <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
                <span>Switch Profile</span>
              </button>
            </div>

            <!-- FARM PROFILE FORM -->
            <form id="farm-profile-form" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Farmer Full Name</label>
                  <input type="text" id="profile-name" value="${user.name || ''}" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500" required />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                  <input type="tel" id="profile-phone" value="${user.phone || ''}" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500" readonly />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">State</label>
                  <select id="profile-state" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
                    ${['Uttar Pradesh', 'Punjab', 'Bihar', 'Haryana', 'Madhya Pradesh', 'Rajasthan', 'Maharashtra', 'Gujarat', 'West Bengal'].map(s => `
                      <option value="${s}" ${user.state === s ? 'selected' : ''}>${s}</option>
                    `).join('')}
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">District / Block</label>
                  <input type="text" id="profile-district" value="${district}" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Total Land Area (Acres)</label>
                  <input type="number" step="0.1" id="profile-land" value="${landSize}" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Primary Crop Cultivated</label>
                  <select id="profile-crop" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
                    ${['Wheat (गेहूं)', 'Paddy / Rice (धान)', 'Potato (आलू)', 'Tomato (टमाटर)', 'Sugarcane (गन्ना)', 'Mustard (सरसों)', 'Maize (मक्का)', 'Cotton (कपास)', 'Chilli (मिर्च)'].map(c => `
                      <option value="${c.split(' ')[0]}" ${user.crop === c.split(' ')[0] ? 'selected' : ''}>${c}</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Irrigation Setup</label>
                <select id="profile-irrigation" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
                  <option value="Drip Irrigation" ${irrigationType === 'Drip Irrigation' ? 'selected' : ''}>Drip Irrigation (टपक सिंचाई - 70% Water Saving)</option>
                  <option value="Sprinkler System" ${irrigationType === 'Sprinkler System' ? 'selected' : ''}>Sprinkler System (फव्वारा सिंचाई)</option>
                  <option value="Flood / Furrow Irrigation" ${irrigationType === 'Flood / Furrow Irrigation' ? 'selected' : ''}>Flood / Furrow Irrigation (पारंपरिक क्यारी सिंचाई)</option>
                  <option value="Tube-well / Canal" ${irrigationType === 'Tube-well / Canal' ? 'selected' : ''}>Tube-well / Canal (नहर / बोरवेल)</option>
                </select>
              </div>

              <button type="submit" class="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2">
                <i data-lucide="save" class="w-4 h-4"></i>
                <span>Save Farm Profile</span>
              </button>
            </form>
          </div>

          <!-- LOCAL STORAGE & DATA PERSISTENCE CARD -->
          <div class="glass-card rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-lg space-y-4">
            <h3 class="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
              <i data-lucide="database" class="w-4 h-4 text-brand-500"></i>
              <span>Offline Storage & Device Health</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Kisan Guru saves diagnostic reports and chat logs locally so you can access recommendations without internet in your field.
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div class="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span class="block text-lg font-extrabold text-brand-500">${(state.diagnosticsHistory || []).length}</span>
                <span class="text-[10px] text-slate-400 font-bold uppercase">Cached Scans</span>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span class="block text-lg font-extrabold text-amber-500">${(state.chats || []).length}</span>
                <span class="text-[10px] text-slate-400 font-bold uppercase">Saved Chats</span>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
                <span class="block text-lg font-extrabold text-emerald-500">${state.isOffline ? 'Offline' : 'Online'}</span>
                <span class="text-[10px] text-slate-400 font-bold uppercase">Network State</span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 pt-2">
              <button id="btn-export-data" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span>Export Farm Data (JSON)</span>
              </button>
              <button id="btn-clear-cache" class="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                <span>Clear Local Cache</span>
              </button>
            </div>
          </div>

          <!-- SUPABASE CLOUD DATABASE & REALTIME STORAGE CARD -->
          <div class="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-br from-white via-white to-emerald-50/20 dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950/20 shadow-xl space-y-5 relative overflow-hidden">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div class="flex items-center space-x-3">
                <div class="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 shadow-inner">
                  <i data-lucide="database" class="w-6 h-6"></i>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
                    <span>Supabase Cloud Database & Storage</span>
                  </h3>
                  <div class="flex items-center space-x-2 mt-0.5" id="supabase-live-status-pill">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${this.dbStatus?.is_supabase ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'}">
                      ● ${this.dbStatus ? this.dbStatus.mode : 'Checking Connection...'}
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono">${this.dbStatus?.engine || 'postgres / sqlite'}</span>
                  </div>
                </div>
              </div>
              <button id="btn-refresh-db-status" class="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition-all" title="Refresh Live Database Health">
                <i data-lucide="refresh-cw" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- LIVE DB HEALTH METRICS -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span class="block text-base font-extrabold text-emerald-500">${this.dbStatus?.status === 'healthy' ? 'Active' : 'Standby'}</span>
                <span class="text-[9px] text-slate-400 font-bold uppercase">System State</span>
              </div>
              <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span class="block text-base font-extrabold text-brand-600 dark:text-brand-400">${this.dbStatus ? Object.keys(this.dbStatus.table_counts || {}).length : 16}</span>
                <span class="text-[9px] text-slate-400 font-bold uppercase">Tables</span>
              </div>
              <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span class="block text-base font-extrabold text-amber-500">${this.dbStatus ? this.dbStatus.total_records : 0}</span>
                <span class="text-[9px] text-slate-400 font-bold uppercase">Records</span>
              </div>
              <div class="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span class="block text-base font-extrabold text-sky-500">${this.dbStatus?.is_supabase ? 'Supabase' : 'SQLite DB'}</span>
                <span class="text-[9px] text-slate-400 font-bold uppercase">Engine Mode</span>
              </div>
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Link your <strong>Supabase Cloud Project</strong> to enable multi-device sync, hosted PostgreSQL persistence, and cloud file storage for crop leaf scans.
            </p>

            <!-- SUPABASE INPUTS -->
            <div class="space-y-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Supabase Project URL</label>
                <input type="text" id="input-supabase-url" placeholder="https://xxxxxxxxxxxx.supabase.co" value="${localStorage.getItem('user_supabase_url') || this.dbStatus?.supabase_url || ''}" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Supabase Anon / Service API Key</label>
                <div class="relative">
                  <input type="password" id="input-supabase-key" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${localStorage.getItem('user_supabase_key') || ''}" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <button id="btn-toggle-supabase-key" class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                    <i data-lucide="eye" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Supabase Direct / Pooler Database URI (PostgreSQL)</label>
                <div class="relative">
                  <input type="password" id="input-supabase-db-url" placeholder="postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres" value="${localStorage.getItem('user_supabase_db_url') || ''}" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <button id="btn-toggle-supabase-db-url" class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                    <i data-lucide="eye" class="w-4 h-4"></i>
                  </button>
                </div>
                <span class="text-[10px] text-slate-400 mt-1 block">Found in Supabase Dashboard &gt; Project Settings &gt; Database &gt; Connection string (URI).</span>
              </div>
            </div>

            <!-- TEST & STATUS BANNER -->
            ${this.dbTestMessage ? `
              <div class="p-3 rounded-2xl text-xs font-bold flex items-center space-x-2 ${this.dbTestStatus === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : this.dbTestStatus === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400'}">
                <i data-lucide="${this.dbTestStatus === 'success' ? 'check-circle' : this.dbTestStatus === 'error' ? 'alert-triangle' : 'loader'}" class="w-4 h-4 flex-shrink-0 ${this.dbTestStatus === 'testing' ? 'animate-spin' : ''}"></i>
                <span>${this.dbTestMessage}</span>
              </div>
            ` : ''}

            <!-- ACTION BUTTONS -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button id="btn-test-supabase" class="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm">
                <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i>
                <span>Test Live Connection</span>
              </button>
              <button id="btn-save-supabase" class="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/20">
                <i data-lucide="save" class="w-3.5 h-3.5"></i>
                <span>Save & Connect Supabase</span>
              </button>
            </div>

            <!-- SCHEMA HELPER -->
            <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span class="text-[11px] text-slate-500 dark:text-slate-400">Need to execute schema in Supabase SQL Editor?</span>
              <button id="btn-view-supabase-sql" class="text-xs font-bold text-brand-600 dark:text-emerald-400 hover:underline flex items-center space-x-1">
                <span>View SQL Schema</span>
                <i data-lucide="file-code" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: API KEYS MANAGER & PREFERENCES (5 COLS) -->
        <div class="lg:col-span-5 space-y-6">

          <!-- API KEYS MANAGER CARD -->
          <div class="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950/20 shadow-xl space-y-5 relative overflow-hidden">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <i data-lucide="key" class="w-5 h-5"></i>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white text-sm">AI & Weather API Manager</h3>
                  <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Live Integration Hub</span>
                </div>
              </div>
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Connect your personalized Google Gemini Generative AI key for infinite live agronomy questions, or enjoy our built-in Zero-Config offline agricultural matrix.
            </p>

            <!-- GEMINI API KEY INPUT -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                  <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-500"></i>
                  <span>Google Gemini API Key</span>
                </label>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-[10px] font-bold text-brand-500 hover:underline flex items-center space-x-1">
                  <span>Get Free Key</span>
                  <i data-lucide="external-link" class="w-3 h-3"></i>
                </a>
              </div>
              <div class="relative">
                <input type="password" id="input-gemini-key" placeholder="Paste AIzaSy... key here" value="${savedGeminiKey}" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <button id="btn-toggle-gemini-vis" class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                  <i data-lucide="eye" class="w-4 h-4"></i>
                </button>
              </div>
              <div class="flex items-center justify-between pt-1">
                <button id="btn-test-gemini" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1">
                  <i data-lucide="activity" class="w-3 h-3"></i>
                  <span>Test Key</span>
                </button>
                <span id="gemini-status-text" class="text-[11px] font-bold text-slate-400">
                  ${savedGeminiKey ? '● Configured' : '● Using Local AI Engine'}
                </span>
              </div>
            </div>

            <!-- OPENWEATHER API KEY INPUT -->
            <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
                  <i data-lucide="cloud-sun" class="w-3.5 h-3.5 text-sky-500"></i>
                  <span>OpenWeather API Key (Optional)</span>
                </label>
                <span class="text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                  Open-Meteo Active
                </span>
              </div>
              <input type="password" id="input-weather-key" placeholder="OpenWeather 32-char key (Optional)" value="${savedWeatherKey}" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <p class="text-[10px] text-slate-400">
                Notice: Real-time temperature, rain probability, and weather alerts are automatically active via our zero-config Open-Meteo engine without any key required!
              </p>
            </div>

            <button id="btn-save-api-keys" class="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2">
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Save API Settings</span>
            </button>
          </div>

          <!-- REGIONAL LANGUAGE & THEME PREFERENCES CARD -->
          <div class="glass-card rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-lg space-y-4">
            <h3 class="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
              <i data-lucide="globe" class="w-4 h-4 text-brand-500"></i>
              <span>Language & Appearance</span>
            </h3>

            <!-- Language Buttons Grid -->
            <div>
              <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preferred Dialect / Language</label>
              <div class="grid grid-cols-2 gap-2">
                ${[
                  { id: 'english', label: 'English', sub: 'Standard' },
                  { id: 'hindi', label: 'हिन्दी (Hindi)', sub: 'मानक भाषा' },
                  { id: 'bhojpuri', label: 'भोजपुरी', sub: 'क्षेत्रीय बोली' },
                  { id: 'hinglish', label: 'Hinglish', sub: 'Conversational' },
                  { id: 'awadhi', label: 'अवधी', sub: 'उत्तर भारत' }
                ].map(item => `
                  <button class="lang-selector-btn p-2.5 rounded-2xl border text-left transition-all ${lang === item.id ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'}" data-lang="${item.id}">
                    <div class="text-xs font-bold leading-tight">${item.label}</div>
                    <div class="text-[9px] text-slate-400 mt-0.5">${item.sub}</div>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Theme Switcher -->
            <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Theme Mode</label>
              <div class="grid grid-cols-2 gap-2">
                <button id="btn-set-light" class="p-2.5 rounded-2xl border text-center transition-all flex items-center justify-center space-x-2 ${state.theme === 'light' ? 'border-brand-500 bg-brand-500/10 text-brand-600 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}">
                  <i data-lucide="sun" class="w-4 h-4"></i>
                  <span class="text-xs">Light Mode</span>
                </button>
                <button id="btn-set-dark" class="p-2.5 rounded-2xl border text-center transition-all flex items-center justify-center space-x-2 ${state.theme === 'dark' ? 'border-brand-500 bg-brand-500/10 text-brand-400 font-bold' : 'border-slate-800 text-slate-400 hover:bg-slate-900'}">
                  <i data-lucide="moon" class="w-4 h-4"></i>
                  <span class="text-xs">Dark Mode</span>
                </button>
              </div>
            </div>

          </div>

          <!-- KRISHI HELPLINE SOS CARD -->
          <div class="p-5 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl text-white shadow-lg space-y-3 relative overflow-hidden">
            <div class="relative z-10 flex items-center justify-between">
              <div class="flex items-center space-x-2 font-bold text-sm">
                <i data-lucide="phone-call" class="w-4 h-4 animate-bounce"></i>
                <span>National Kisan Helpline (Toll-Free)</span>
              </div>
            </div>
            <p class="relative z-10 text-[11px] text-red-100 leading-relaxed">
              Dial <strong>1800-180-1551</strong> from 6:00 AM to 10:00 PM to consult state agriculture department scientists and veterinary doctors in your mother tongue.
            </p>
            <a href="tel:18001801551" class="relative z-10 block w-full py-2.5 bg-white text-red-600 font-extrabold rounded-xl text-xs text-center hover:bg-slate-100 transition-all shadow-md">
              Call 1800-180-1551 Now
            </a>
            <i data-lucide="sprout" class="absolute -right-4 -bottom-4 w-28 h-28 text-white/10 pointer-events-none"></i>
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
    // Farm profile form submission
    const profileForm = this.container.querySelector('#farm-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = this.container.querySelector('#profile-name').value.trim();
        const stateName = this.container.querySelector('#profile-state').value;
        const district = this.container.querySelector('#profile-district').value.trim();
        const land = this.container.querySelector('#profile-land').value;
        const crop = this.container.querySelector('#profile-crop').value;
        const irrigation = this.container.querySelector('#profile-irrigation').value;

        const updatedUser = {
          ...(context.state.user || {}),
          name: name || 'Farmer',
          state: stateName,
          crop: crop
        };

        localStorage.setItem('user_district', district);
        localStorage.setItem('user_land_size', land);
        localStorage.setItem('user_irrigation_type', irrigation);

        context.login(true, updatedUser);
        this.showFeedback('Profile updated successfully!');
      });
    }

    // Save API keys
    const btnSaveKeys = this.container.querySelector('#btn-save-api-keys');
    if (btnSaveKeys) {
      btnSaveKeys.addEventListener('click', () => {
        const geminiKey = this.container.querySelector('#input-gemini-key').value.trim();
        const weatherKey = this.container.querySelector('#input-weather-key').value.trim();

        if (geminiKey) {
          localStorage.setItem('user_gemini_api_key', geminiKey);
        } else {
          localStorage.removeItem('user_gemini_api_key');
        }

        if (weatherKey) {
          localStorage.setItem('user_weather_api_key', weatherKey);
        } else {
          localStorage.removeItem('user_weather_api_key');
        }

        this.showFeedback('API configurations saved!');
      });
    }

    // Test Gemini Key
    const btnTestGemini = this.container.querySelector('#btn-test-gemini');
    const statusText = this.container.querySelector('#gemini-status-text');
    if (btnTestGemini && statusText) {
      btnTestGemini.addEventListener('click', async () => {
        const key = this.container.querySelector('#input-gemini-key').value.trim();
        if (!key) {
          statusText.textContent = '❌ Key is empty';
          statusText.className = 'text-[11px] font-bold text-red-500';
          return;
        }

        statusText.textContent = '⏳ Testing connection...';
        statusText.className = 'text-[11px] font-bold text-amber-500';

        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Hello, respond with word OK' }] }]
            })
          });

          if (res.ok) {
            statusText.textContent = '✅ Key is Valid & Active!';
            statusText.className = 'text-[11px] font-bold text-emerald-500';
          } else {
            const err = await res.json().catch(() => ({}));
            statusText.textContent = `❌ Failed (${res.status}): ${err.error?.message || 'Invalid Key'}`;
            statusText.className = 'text-[11px] font-bold text-red-500';
          }
        } catch (e) {
          statusText.textContent = '❌ Network Error testing key';
          statusText.className = 'text-[11px] font-bold text-red-500';
        }
      });
    }

    // Toggle Gemini Key visibility
    const btnToggleVis = this.container.querySelector('#btn-toggle-gemini-vis');
    const inputKey = this.container.querySelector('#input-gemini-key');
    if (btnToggleVis && inputKey) {
      btnToggleVis.addEventListener('click', () => {
        if (inputKey.type === 'password') {
          inputKey.type = 'text';
        } else {
          inputKey.type = 'password';
        }
      });
    }

    // Language selection buttons
    const langBtns = this.container.querySelectorAll('.lang-selector-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        context.setLanguage(lang);
        this.render();
      });
    });

    // Theme toggles
    const btnLight = this.container.querySelector('#btn-set-light');
    const btnDark = this.container.querySelector('#btn-set-dark');
    if (btnLight) btnLight.addEventListener('click', () => { UseTheme.set('light'); this.render(); });
    if (btnDark) btnDark.addEventListener('click', () => { UseTheme.set('dark'); this.render(); });

    // Switch Profile / Logout
    const btnLogout = this.container.querySelector('#btn-logout-profile');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (confirm('Do you want to switch or sign in with another phone profile?')) {
          context.logout();
        }
      });
    }

    // Clear local cache
    const btnClear = this.container.querySelector('#btn-clear-cache');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('Clear local scan and recommendation cache?')) {
          StorageService.clearAll();
          context.state.diagnosticsHistory = [];
          context.state.chats = [];
          this.showFeedback('Local cache cleared.');
        }
      });
    }

    // Export data
    const btnExport = this.container.querySelector('#btn-export-data');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const exportObj = {
          user: context.state.user,
          diagnostics: context.state.diagnosticsHistory,
          chats: context.state.chats,
          exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kisan_guru_farm_data_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Refresh DB status
    const btnRefreshDb = this.container.querySelector('#btn-refresh-db-status');
    if (btnRefreshDb) {
      btnRefreshDb.addEventListener('click', async () => {
        btnRefreshDb.classList.add('animate-spin');
        await this.loadDbStatus();
        this.render();
      });
    }

    // Toggle Supabase API Key visibility
    const btnToggleKey = this.container.querySelector('#btn-toggle-supabase-key');
    const inputSupKey = this.container.querySelector('#input-supabase-key');
    if (btnToggleKey && inputSupKey) {
      btnToggleKey.addEventListener('click', () => {
        inputSupKey.type = inputSupKey.type === 'password' ? 'text' : 'password';
      });
    }

    // Toggle Supabase DB URL visibility
    const btnToggleDb = this.container.querySelector('#btn-toggle-supabase-db-url');
    const inputDbUrl = this.container.querySelector('#input-supabase-db-url');
    if (btnToggleDb && inputDbUrl) {
      btnToggleDb.addEventListener('click', () => {
        inputDbUrl.type = inputDbUrl.type === 'password' ? 'text' : 'password';
      });
    }

    // Test Supabase Connection
    const btnTestSupabase = this.container.querySelector('#btn-test-supabase');
    if (btnTestSupabase) {
      btnTestSupabase.addEventListener('click', async () => {
        const url = (this.container.querySelector('#input-supabase-url')?.value || '').trim();
        const key = (this.container.querySelector('#input-supabase-key')?.value || '').trim();
        const dbUrl = (this.container.querySelector('#input-supabase-db-url')?.value || '').trim();

        if (!url && !key && !dbUrl) {
          this.dbTestStatus = 'error';
          this.dbTestMessage = 'Please enter either Supabase URL & Key or PostgreSQL DB URL to test.';
          this.render();
          return;
        }

        this.dbTestStatus = 'testing';
        this.dbTestMessage = 'Validating connection with Supabase cloud infrastructure...';
        this.render();

        try {
          const res = await fetch('http://127.0.0.1:8000/api/system/test-connection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              supabase_url: url,
              supabase_key: key,
              db_url: dbUrl
            })
          });
          const data = await res.json();
          if (data.success) {
            this.dbTestStatus = 'success';
            this.dbTestMessage = data.message || 'Connection successful!';
          } else {
            this.dbTestStatus = 'error';
            this.dbTestMessage = data.message || 'Connection test failed.';
          }
        } catch (e) {
          this.dbTestStatus = 'error';
          this.dbTestMessage = 'Network error while contacting backend diagnostics service.';
        }
        this.render();
      });
    }

    // Save Supabase Configuration
    const btnSaveSupabase = this.container.querySelector('#btn-save-supabase');
    if (btnSaveSupabase) {
      btnSaveSupabase.addEventListener('click', async () => {
        const url = (this.container.querySelector('#input-supabase-url')?.value || '').trim();
        const key = (this.container.querySelector('#input-supabase-key')?.value || '').trim();
        const dbUrl = (this.container.querySelector('#input-supabase-db-url')?.value || '').trim();

        if (url) localStorage.setItem('user_supabase_url', url);
        if (key) localStorage.setItem('user_supabase_key', key);
        if (dbUrl) localStorage.setItem('user_supabase_db_url', dbUrl);

        try {
          const res = await fetch('http://127.0.0.1:8000/api/system/save-db-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              supabase_url: url,
              supabase_key: key,
              supabase_db_url: dbUrl
            })
          });
          const data = await res.json();
          if (data.success) {
            this.showFeedback('Supabase credentials successfully saved & activated!');
            await this.loadDbStatus();
          } else {
            alert('Failed to save config: ' + (data.detail || 'Unknown error'));
          }
        } catch (e) {
          this.showFeedback('Saved locally in browser storage.');
        }
      });
    }

    // View SQL Migration Schema Modal
    const btnViewSql = this.container.querySelector('#btn-view-supabase-sql');
    if (btnViewSql) {
      btnViewSql.addEventListener('click', () => {
        this.openSqlSchemaModal();
      });
    }
  }

  openSqlSchemaModal() {
    const existing = document.getElementById('supabase-sql-modal');
    if (existing) existing.remove();

    const sqlScript = `-- KISAN GURU AI - SUPABASE SCHEMA INITIALIZATION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    phone VARCHAR(20) UNIQUE NOT NULL,
    hashed_password VARCHAR(128) NOT NULL,
    role VARCHAR(20) DEFAULT 'farmer' NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- CROPS TABLE
CREATE TABLE IF NOT EXISTS public.crops (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    sowing_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- DIAGNOSTIC REPORTS
CREATE TABLE IF NOT EXISTS public.diagnostic_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    crop_id VARCHAR(36) REFERENCES public.crops(id) ON DELETE SET NULL,
    image_url VARCHAR(512) NOT NULL,
    disease_detected VARCHAR(200) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    remedy VARCHAR(2000) NOT NULL,
    severity VARCHAR(50),
    affected_area DOUBLE PRECISION,
    location_latitude DOUBLE PRECISION,
    location_longitude DOUBLE PRECISION,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    notes VARCHAR(1000),
    report_json VARCHAR(8000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- PEST REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.pest_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    image_url VARCHAR(512) NOT NULL,
    pest_detected VARCHAR(200) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    severity VARCHAR(50) NOT NULL,
    damage_description VARCHAR(1000),
    spread_risk_percentage DOUBLE PRECISION NOT NULL,
    treatment_plan_json VARCHAR(4000) NOT NULL,
    crop_loss_percentage DOUBLE PRECISION NOT NULL,
    urgency_level VARCHAR(50) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- PEST LIBRARY TABLE
CREATE TABLE IF NOT EXISTS public.pest_library (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    pest_name VARCHAR(100) UNIQUE NOT NULL,
    scientific_name VARCHAR(150) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    damage_symptoms VARCHAR(1000) NOT NULL,
    organic_control VARCHAR(1000) NOT NULL,
    chemical_control VARCHAR(1000) NOT NULL,
    biological_control VARCHAR(1000) NOT NULL,
    mechanical_control VARCHAR(1000) NOT NULL,
    ipm_strategy VARCHAR(1000) NOT NULL,
    pesticide_name VARCHAR(200) NOT NULL,
    pesticide_dosage VARCHAR(200) NOT NULL,
    application_timing VARCHAR(200) NOT NULL,
    safety_precautions VARCHAR(1000) NOT NULL,
    waiting_period_days INTEGER DEFAULT 7 NOT NULL,
    crop_vulnerability VARCHAR(500) NOT NULL
);

-- RENTAL LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.rental_listings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    owner_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    price_per_hour DOUBLE PRECISION NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- CHAT SESSIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'General' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id VARCHAR(36) NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL,
    text VARCHAR(2000) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow public read/write" ON public.crops FOR ALL USING (true);
CREATE POLICY "Allow public read/write" ON public.diagnostic_reports FOR ALL USING (true);
CREATE POLICY "Allow public read/write" ON public.pest_reports FOR ALL USING (true);
CREATE POLICY "Allow public read/write" ON public.pest_library FOR ALL USING (true);
CREATE POLICY "Allow public read/write" ON public.rental_listings FOR ALL USING (true);
CREATE POLICY "Allow public read/write" ON public.chat_sessions FOR ALL USING (true);
CREATE POLICY "Allow public read/write" ON public.chat_messages FOR ALL USING (true);`;

    const modal = document.createElement('div');
    modal.id = 'supabase-sql-modal';
    modal.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <i data-lucide="database" class="w-5 h-5 text-emerald-500"></i>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Supabase SQL Migration Script</h3>
          </div>
          <button id="btn-close-sql-modal" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        <div class="p-5 overflow-y-auto flex-1 font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/70 select-all">
          <pre class="whitespace-pre-wrap">${sqlScript}</pre>
        </div>
        <div class="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <span class="text-xs text-slate-400 font-sans">Paste into Supabase Dashboard &gt; SQL Editor &gt; Run</span>
          <button id="btn-copy-sql" class="py-2 px-5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md">
            <i data-lucide="copy" class="w-4 h-4"></i>
            <span>Copy SQL Script</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons();

    modal.querySelector('#btn-close-sql-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    modal.querySelector('#btn-copy-sql').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(sqlScript);
        const copyBtn = modal.querySelector('#btn-copy-sql span');
        if (copyBtn) copyBtn.textContent = 'Copied to Clipboard!';
        setTimeout(() => { if (copyBtn) copyBtn.textContent = 'Copy SQL Script'; }, 2500);
      } catch (e) {
        alert('Copied! (Or select all text inside code box)');
      }
    });

  showFeedback(msg) {
    this.saveMessage = msg;
    this.render();
    setTimeout(() => {
      this.saveMessage = '';
      const feedbackEl = this.container.querySelector('.animate-fade-in');
      if (feedbackEl) feedbackEl.remove();
    }, 3000);
  }
}
