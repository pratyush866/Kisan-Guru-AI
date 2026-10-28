import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class GovernmentSchemes {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6 pb-24';

    // Interactive Calculator state
    this.farmAcreage = '';
    this.socialCategory = 'General';
    this.schemeChoice = 'PM-KISAN';
    this.eligibilityResult = null;

    // Schemes catalog
    this.schemes = [
      {
        id: 'PM-KISAN',
        name: 'PM Kisan Samman Nidhi Yojana',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        subsidy: '₹6,000 per year (in 3 equal instalments)',
        criteria: 'Small & marginal farmers holding up to 2 Hectares (approx 5 Acres) of cultivable land.',
        description: 'Direct cash transfer support to supplement financial requirements for purchasing agricultural inputs.',
        icon: 'landmark'
      },
      {
        id: 'PM-KUSUM',
        name: 'PM-KUSUM Solar Pump Scheme',
        ministry: 'Ministry of New & Renewable Energy',
        subsidy: 'Up to 60% subsidy on solar irrigation pumps',
        criteria: 'All landowners. Priority given to small/marginal farmers and locations with dark zones.',
        description: 'Enables farmers to install solar water pumps and grid-connected solar power plants on barren lands.',
        icon: 'sun'
      },
      {
        id: 'PM-FBY',
        name: 'Pradhan Mantri Fasal Bima Yojana',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        subsidy: 'Low premium caps (1.5% to 5%) for crop insurance',
        criteria: 'All farmers growing notified crops in notified areas are eligible, including tenant farmers.',
        description: 'Financial support to farmers suffering crop loss/damage arising out of natural calamities and pests.',
        icon: 'shield-check'
      },
      {
        id: 'SOIL-HEALTH',
        name: 'Soil Health Card Scheme',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        subsidy: 'Free soil testing & analysis report card',
        criteria: 'All operating farmers across the country are eligible through state agricultural extension officers.',
        description: 'Provides soil health cards outlining nutrient status, enabling targeted chemical splits and macro dosing.',
        icon: 'file-text'
      }
    ];
  }

  render() {
    this.container.innerHTML = '';

    const lang = context.state.language;

    // Header
    const header = document.createElement('div');
    header.className = 'flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200 dark:border-slate-800';
    const sourceLabel = lang === 'hindi' ? 'डेटा स्रोत: सत्यापित ऑफ़लाइन रजिस्ट्री (भारत सरकार दिशानिर्देश)' :
                        lang === 'bhojpuri' ? 'डेटा स्रोत: सत्यापित ऑफ़लाइन जानकारी (भारत सरकार)' :
                        'Data Source: Verified Offline Registry (Government of India Guidelines)';

    header.innerHTML = `
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <i data-lucide="landmark" class="w-6 h-6 text-brand-500"></i>
          <span>${lang === 'hindi' ? 'सरकारी योजना केंद्र' : lang === 'bhojpuri' ? 'सरकारी योजना जानकारी' : 'Government Schemes Hub'}</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Discover, compute eligibility, and simulate applications for central agricultural benefits</p>
        <span class="inline-block mt-2 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-green-400 border border-brand-500/20 rounded-full">
          ${sourceLabel}
        </span>
      </div>
    `;
    this.container.appendChild(header);

    // Main layout
    const mainGrid = document.createElement('div');
    mainGrid.className = 'grid grid-cols-1 lg:grid-cols-12 gap-6';

    // Left Panel: Calculator and dynamic output (5 cols)
    const leftPanel = document.createElement('div');
    leftPanel.className = 'lg:col-span-5 space-y-6';
    leftPanel.innerHTML = `
      <!-- ELIGIBILITY CALCULATOR -->
      <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
        <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center space-x-2">
          <i data-lucide="calculator" class="w-4 h-4 text-brand-500"></i>
          <span>Eligibility Checker</span>
        </h3>
        
        <form id="scheme-eligibility-form" class="space-y-4">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Scheme</label>
            <select id="elig-scheme-choice" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer">
              ${this.schemes.map(s => `<option value="${s.id}" ${this.schemeChoice === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Land Size (Acres)</label>
              <input type="number" id="elig-acreage" min="0.1" step="0.1" placeholder="e.g. 3.5" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none" value="${this.farmAcreage}" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
              <select id="elig-category" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer">
                <option value="General" ${this.socialCategory === 'General' ? 'selected' : ''}>General</option>
                <option value="OBC" ${this.socialCategory === 'OBC' ? 'selected' : ''}>OBC</option>
                <option value="SC/ST" ${this.socialCategory === 'SC/ST' ? 'selected' : ''}>SC/ST</option>
              </select>
            </div>
          </div>
          
          <button type="submit" class="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5">
            <i data-lucide="check-square" class="w-3.5 h-3.5"></i>
            <span>Check Eligibility</span>
          </button>
        </form>

        <!-- Eligibility Result Wrapper -->
        ${this.eligibilityResult ? `
          <div class="p-4 rounded-2xl border ${this.eligibilityResult.eligible ? 'bg-green-500/10 border-green-500/20 text-green-800 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-400'} space-y-2 animate-fade-in text-xs">
            <div class="font-bold flex items-center space-x-1.5">
              <i data-lucide="${this.eligibilityResult.eligible ? 'check-circle' : 'x-circle'}" class="w-4.5 h-4.5"></i>
              <span>${this.eligibilityResult.eligible ? 'Eligible to Apply!' : 'Not Eligible'}</span>
            </div>
            <p class="text-[10px] leading-relaxed opacity-90">${this.eligibilityResult.reason}</p>
            ${this.eligibilityResult.eligible ? `
              <button id="btn-scheme-apply" class="w-full mt-2 py-2 bg-brand-500 text-white font-bold rounded-xl text-[10px] hover:bg-brand-600 transition-all">
                Simulate Direct Application
              </button>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;

    // Right Panel: Catalog (7 cols)
    const rightPanel = document.createElement('div');
    rightPanel.className = 'lg:col-span-7 space-y-6';

    this.schemes.forEach(s => {
      const card = document.createElement('div');
      card.className = 'glass-card rounded-2xl p-5 border border-white/10 space-y-3 relative group';
      card.innerHTML = `
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <span class="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">${s.ministry}</span>
            <h4 class="font-extrabold text-slate-800 dark:text-white text-sm">${s.name}</h4>
          </div>
          <span class="p-2.5 bg-brand-500/10 text-brand-500 rounded-2xl inline-flex"><i data-lucide="${s.icon === 'file-text' ? 'file-text' : s.icon === 'sun' ? 'sun' : s.icon === 'shield-check' ? 'shield-check' : 'landmark'}" class="w-5 h-5"></i></span>
        </div>
        
        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">${s.description}</p>
        
        <div class="grid grid-cols-2 gap-4 pt-2 text-[10px] border-t border-slate-100 dark:border-slate-800">
          <div>
            <span class="text-slate-400 font-bold uppercase block tracking-wider">Benefits</span>
            <span class="font-extrabold text-brand-600 dark:text-green-400">${s.subsidy}</span>
          </div>
          <div>
            <span class="text-slate-400 font-bold uppercase block tracking-wider">Target Criteria</span>
            <span class="text-slate-700 dark:text-slate-300 font-semibold line-clamp-2">${s.criteria}</span>
          </div>
        </div>
      `;
      rightPanel.appendChild(card);
    });

    mainGrid.appendChild(leftPanel);
    mainGrid.appendChild(rightPanel);
    this.container.appendChild(mainGrid);

    this.bindEvents();
    if (window.lucide) {
      window.lucide.createIcons();
    }
    return this.container;
  }

  bindEvents() {
    const form = this.container.querySelector('#scheme-eligibility-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const acreage = parseFloat(this.container.querySelector('#elig-acreage').value) || 0;
        const category = this.container.querySelector('#elig-category').value;
        const scheme = this.container.querySelector('#elig-scheme-choice').value;

        this.farmAcreage = acreage;
        this.socialCategory = category;
        this.schemeChoice = scheme;

        // Perform calculation
        let eligible = true;
        let reason = '';

        if (scheme === 'PM-KISAN') {
          if (acreage > 5) {
            eligible = false;
            reason = 'PM-KISAN is limited to small and marginal farmers owning up to 5 Acres of cultivable land. Your acreage exceeds this limit.';
          } else {
            reason = `Congratulations! Based on your land size of ${acreage} Acres, you qualify. Direct Cash Transfer will credit ₹2,000 thrice a year.`;
          }
        } else if (scheme === 'PM-KUSUM') {
          if (acreage < 1) {
            eligible = false;
            reason = 'Solar pump installations require a minimum cultivable land spacing of 1 Acre.';
          } else {
            reason = 'You qualify. Solar pump subsidies cover 60% of pump deployment rates. Reserved slots active for SC/ST and dark zone blocks.';
          }
        } else if (scheme === 'PM-FBY') {
          reason = 'You are eligible. Crop Insurance premiums cap at 2% for Kharif and 1.5% for Rabi food crops.';
        } else {
          reason = 'Free Soil Health check card eligible. Samples can be submitted to block extension officials.';
        }

        this.eligibilityResult = { eligible, reason };
        this.render();
      });
    }

    // Apply button click simulator
    const applyBtn = this.container.querySelector('#btn-scheme-apply');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        alert('Application Simulated successfully!\nCreating file record with Department of Agriculture. An SMS will be dispatched with reference details.');
        this.eligibilityResult = null;
        this.farmAcreage = '';
        this.render();
      });
    }
  }
}
