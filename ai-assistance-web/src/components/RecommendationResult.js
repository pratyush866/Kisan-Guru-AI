import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class RecommendationResult {
  constructor(reportData, onReset, onCompare, onMarket) {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6';
    
    this.report = reportData;
    this.onReset = onReset;
    this.onCompare = onCompare;
    this.onMarket = onMarket;

    // Default to displaying top crop (index 0)
    this.selectedCropIndex = 0;
  }

  render() {
    const lang = context.state.language;
    const recommendations = this.report.recommendations;
    
    if (!recommendations || recommendations.length === 0) {
      this.container.innerHTML = `
        <div class="glass-card rounded-2xl p-8 text-center text-gray-500 dark:text-gray-400">
          No crop recommendations generated. Please run the advisory engine.
        </div>
      `;
      return this.container;
    }

    const currentCrop = recommendations[this.selectedCropIndex];
    this.container.innerHTML = '';

    // Header Actions
    const actionHeader = document.createElement('div');
    actionHeader.className = 'flex flex-wrap items-center justify-between gap-4 bg-white/40 dark:bg-gray-900/40 p-4 rounded-2xl border border-white/10';
    actionHeader.innerHTML = `
      <div class="text-xs text-gray-500 dark:text-gray-400 font-semibold">
        Report ID: <span class="text-gray-800 dark:text-gray-200 font-bold">${this.report.id}</span> | 
        Generated: <span class="text-gray-800 dark:text-gray-200 font-bold">${new Date(this.report.created_at).toLocaleString()}</span>
      </div>
      <div class="flex items-center space-x-3">
        <button id="btn-result-compare" class="px-4 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-bold shadow-md hover:bg-brand-600 transition-all flex items-center space-x-1">
          <i data-lucide="columns" class="w-3.5 h-3.5"></i>
          <span>Compare Options</span>
        </button>
        <button id="btn-result-market" class="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-amber-700 transition-all flex items-center space-x-1">
          <i data-lucide="trending-up" class="w-3.5 h-3.5"></i>
          <span>Market Intelligence</span>
        </button>
        <button id="btn-result-reset" class="px-4 py-1.5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center space-x-1">
          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
          <span>New Advisory</span>
        </button>
      </div>
    `;
    this.container.appendChild(actionHeader);

    // Grid Layout: Left Col (Crop Selection & Core Metric Banner), Right Col (Detailed tabs/accordions)
    const gridLayout = document.createElement('div');
    gridLayout.className = 'grid grid-cols-1 lg:grid-cols-3 gap-6';

    // Left Column: Main Rank Gauge Card and Alternatives List
    const leftCol = document.createElement('div');
    leftCol.className = 'lg:col-span-1 space-y-6';

    // Circular gauge calculation (dash-array parameters)
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (currentCrop.confidence / 100) * circumference;

    leftCol.innerHTML = `
      <!-- Main Selection Gauge Card -->
      <div class="glass-card rounded-2xl p-6 border border-white/20 text-center relative overflow-hidden flex flex-col items-center">
        <div class="absolute -right-16 -top-16 opacity-5 pointer-events-none">
          <i data-lucide="sprout" class="w-48 h-48"></i>
        </div>
        
        <span class="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold tracking-wider uppercase mb-4">
          Recommended Crop Match
        </span>
        
        <!-- Large SVG Confidence Circular Progress -->
        <div class="relative w-40 h-40 flex items-center justify-center">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <!-- Background circle -->
            <circle cx="60" cy="60" r="${radius}" class="stroke-gray-200 dark:stroke-gray-800" stroke-width="10" fill="transparent"/>
            <!-- Active indicator -->
            <circle cx="60" cy="60" r="${radius}" class="stroke-brand-500 transition-all duration-1000" stroke-width="10" fill="transparent"
              stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round"/>
          </svg>
          <div class="absolute text-center">
            <span class="text-3xl font-extrabold text-gray-800 dark:text-white">${currentCrop.confidence}%</span>
            <span class="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-0.5">Confidence</span>
          </div>
        </div>

        <h3 class="text-2xl font-black text-gray-900 dark:text-white mt-5">${currentCrop.crop_name}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 italic px-4">
          "${currentCrop.why_this_crop}"
        </p>
      </div>

      <!-- Ranked Alternatives Selector -->
      <div class="glass-card rounded-2xl p-5 border border-white/20">
        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Ranked Options Selection</h4>
        <div class="space-y-3">
          ${recommendations.map((rec, index) => {
            const isSelected = index === this.selectedCropIndex;
            return `
              <button class="btn-select-crop w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-300 ${isSelected ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-green-300 ring-2 ring-brand-500/20 font-bold' : 'border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-gray-800/10 hover:border-gray-300 hover:translate-x-1'}" data-index="${index}">
                <div class="flex items-center space-x-3">
                  <span class="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-extrabold ${isSelected ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-300'}">
                    #${index + 1}
                  </span>
                  <div>
                    <span class="text-sm block">${rec.crop_name}</span>
                    <span class="text-[10px] text-gray-400 font-medium">MSP: ${rec.mandi_price}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs font-bold">${rec.confidence}%</span>
                  <span class="block text-[8px] text-gray-400 uppercase">Match</span>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
    gridLayout.appendChild(leftCol);

    // Right Column: Comprehensive Detail Cards (XAI metrics & agronomic specs)
    const rightCol = document.createElement('div');
    rightCol.className = 'lg:col-span-2 space-y-6';

    // Highlight metrics row
    const highlightsGrid = document.createElement('div');
    highlightsGrid.className = 'grid grid-cols-2 sm:grid-cols-4 gap-4';
    highlightsGrid.innerHTML = `
      <div class="p-4 bg-white/50 dark:bg-gray-900/30 border border-white/10 rounded-2xl text-center">
        <i data-lucide="clock" class="w-5 h-5 mx-auto text-brand-500 mb-1.5"></i>
        <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</span>
        <span class="text-xs font-extrabold text-gray-800 dark:text-white mt-1 block">${currentCrop.growing_duration}</span>
      </div>
      <div class="p-4 bg-white/50 dark:bg-gray-900/30 border border-white/10 rounded-2xl text-center">
        <i data-lucide="sprout" class="w-5 h-5 mx-auto text-brand-500 mb-1.5"></i>
        <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Yield / Acre</span>
        <span class="text-xs font-extrabold text-gray-800 dark:text-white mt-1 block">${currentCrop.expected_yield.split(' (')[0]}</span>
      </div>
      <div class="p-4 bg-white/50 dark:bg-gray-900/30 border border-white/10 rounded-2xl text-center">
        <i data-lucide="trending-up" class="w-5 h-5 mx-auto text-green-500 mb-1.5"></i>
        <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mandi Price</span>
        <span class="text-xs font-extrabold text-gray-800 dark:text-white mt-1 block">${currentCrop.mandi_price}</span>
      </div>
      <div class="p-4 bg-white/50 dark:bg-gray-900/30 border border-white/10 rounded-2xl text-center">
        <i data-lucide="shield-alert" class="w-5 h-5 mx-auto text-red-500 mb-1.5"></i>
        <span class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Risk Level</span>
        <span class="text-xs font-extrabold text-gray-800 dark:text-white mt-1 block">${currentCrop.risk_level.split(' (')[0]}</span>
      </div>
    `;
    rightCol.appendChild(highlightsGrid);

    // Explainable AI parameters visualization (XAI card)
    const xaiCard = document.createElement('div');
    xaiCard.className = 'glass-card rounded-2xl p-5 border border-white/20';
    
    // Status helper
    const getStatusBadge = (status) => {
      const s = status.toLowerCase();
      if (s === 'ideal' || s === 'compatible' || s === 'sufficient' || s === 'optimal' || s === 'balanced' || s === 'matches') {
        return `<span class="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold">Ideal</span>`;
      } else if (s === 'low' || s === 'deficit') {
        return `<span class="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold">Deficit</span>`;
      } else {
        return `<span class="px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold">${status}</span>`;
      }
    };

    // Budget check banner
    let budgetBanner = '';
    if (currentCrop.explainable_ai.budget_warning) {
      budgetBanner = `
        <div class="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl flex items-center space-x-2">
          <i data-lucide="alert-triangle" class="w-4 h-4"></i>
          <span>${currentCrop.explainable_ai.budget_warning}</span>
        </div>
      `;
    }

    xaiCard.innerHTML = `
      <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
        <span>Explainable AI (XAI) Fitment Report</span>
        <span class="text-[9px] font-medium bg-brand-500/10 text-brand-600 px-2 py-0.5 rounded">Calculated Live</span>
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/20">
          <span class="text-xs text-gray-500 dark:text-gray-400">Soil pH Match</span>
          <span>${getStatusBadge(currentCrop.explainable_ai.pH_match)}</span>
        </div>
        <div class="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/20">
          <span class="text-xs text-gray-500 dark:text-gray-400">Soil Type Match</span>
          <span>${getStatusBadge(currentCrop.explainable_ai.soil_match)}</span>
        </div>
        <div class="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/20">
          <span class="text-xs text-gray-500 dark:text-gray-400">Rainfall / Water Match</span>
          <span>${getStatusBadge(currentCrop.explainable_ai.rainfall_match)}</span>
        </div>
        <div class="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/20">
          <span class="text-xs text-gray-500 dark:text-gray-400">Temperature Suitability</span>
          <span>${getStatusBadge(currentCrop.explainable_ai.temperature_match)}</span>
        </div>
        <div class="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/20">
          <span class="text-xs text-gray-500 dark:text-gray-400">Season Fit</span>
          <span>${getStatusBadge(currentCrop.explainable_ai.season_match)}</span>
        </div>
        <div class="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/20">
          <span class="text-xs text-gray-500 dark:text-gray-400">NPK Nitrogen Level</span>
          <span>${getStatusBadge(currentCrop.explainable_ai.N_status)}</span>
        </div>
      </div>
      ${budgetBanner}
    `;
    rightCol.appendChild(xaiCard);

    // Detailed Accordion sections (Soil, water, fertilizer, economics)
    const accordionSec = document.createElement('div');
    accordionSec.className = 'space-y-3';
    accordionSec.innerHTML = `
      <!-- Accordion Item 1: Soil and Fertilizer Plan -->
      <div class="glass-card rounded-2xl border border-white/20 overflow-hidden">
        <button class="accordion-toggle w-full flex items-center justify-between p-4 text-left font-bold text-sm text-gray-800 dark:text-white">
          <span class="flex items-center space-x-2">
            <i data-lucide="test-tube" class="w-4 h-4 text-brand-500"></i>
            <span>Soil & Fertilization Schedule</span>
          </span>
          <i data-lucide="chevron-down" class="w-4 h-4 transition-transform duration-300"></i>
        </button>
        <div class="accordion-content border-t border-gray-100 dark:border-gray-800/60 p-4 text-xs text-gray-600 dark:text-gray-300 space-y-3">
          <div>
            <span class="font-extrabold uppercase text-[9px] tracking-wider block text-gray-400 mb-1">Suitable Soils</span>
            <p>${currentCrop.suitable_soil}</p>
          </div>
          <div>
            <span class="font-extrabold uppercase text-[9px] tracking-wider block text-gray-400 mb-1">Fertilization Application Plan</span>
            <p class="leading-relaxed font-medium bg-brand-50/50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-brand-500/10">${currentCrop.fertilizer_plan}</p>
          </div>
        </div>
      </div>

      <!-- Accordion Item 2: Water Requirements -->
      <div class="glass-card rounded-2xl border border-white/20 overflow-hidden">
        <button class="accordion-toggle w-full flex items-center justify-between p-4 text-left font-bold text-sm text-gray-800 dark:text-white">
          <span class="flex items-center space-x-2">
            <i data-lucide="droplet" class="w-4 h-4 text-sky-500"></i>
            <span>Water & Irrigation Guidelines</span>
          </span>
          <i data-lucide="chevron-down" class="w-4 h-4 transition-transform duration-300"></i>
        </button>
        <div class="accordion-content border-t border-gray-100 dark:border-gray-800/60 p-4 text-xs text-gray-600 dark:text-gray-300 space-y-3">
          <div>
            <span class="font-extrabold uppercase text-[9px] tracking-wider block text-gray-400 mb-1">Watering Level Requirement</span>
            <span class="px-2.5 py-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg text-[10px] font-bold inline-block mt-0.5">${currentCrop.water_requirement}</span>
          </div>
          <div>
            <span class="font-extrabold uppercase text-[9px] tracking-wider block text-gray-400 mb-1">Drip Spacing & Watering Schedule Advice</span>
            <p class="leading-relaxed">Keep crop fields saturated according to localized seasonal drying stages. Schedule sprays during cool wind periods (early mornings or sunset intervals) to restrict water evaporation losses.</p>
          </div>
        </div>
      </div>

      <!-- Accordion Item 3: Financials & Government Support -->
      <div class="glass-card rounded-2xl border border-white/20 overflow-hidden">
        <button class="accordion-toggle w-full flex items-center justify-between p-4 text-left font-bold text-sm text-gray-800 dark:text-white">
          <span class="flex items-center space-x-2">
            <i data-lucide="landmark" class="w-4 h-4 text-green-500"></i>
            <span>Financial Estimations & Government Subsidies</span>
          </span>
          <i data-lucide="chevron-down" class="w-4 h-4 transition-transform duration-300"></i>
        </button>
        <div class="accordion-content border-t border-gray-100 dark:border-gray-800/60 p-4 text-xs text-gray-600 dark:text-gray-300 space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="font-extrabold uppercase text-[9px] tracking-wider block text-gray-400 mb-1">Estimated Investment</span>
              <p class="text-sm font-bold text-red-600 dark:text-red-400">${currentCrop.estimated_investment}</p>
            </div>
            <div>
              <span class="font-extrabold uppercase text-[9px] tracking-wider block text-gray-400 mb-1">Estimated Net Profit</span>
              <p class="text-sm font-bold text-green-600 dark:text-green-400">${currentCrop.estimated_profit}</p>
            </div>
          </div>
          <div>
            <span class="font-extrabold uppercase text-[9px] tracking-wider block text-gray-400 mb-1">Government Assistance & Seed Subsidies</span>
            <p class="leading-relaxed font-medium bg-green-500/10 text-brand-700 dark:text-green-300 p-2.5 rounded-xl border border-green-500/10">${currentCrop.government_support}</p>
          </div>
        </div>
      </div>
    `;
    rightCol.appendChild(accordionSec);

    gridLayout.appendChild(rightCol);
    this.container.appendChild(gridLayout);

    this.bindResultEvents();
    if (window.lucide) {
      window.lucide.createIcons();
    }

    return this.container;
  }

  bindResultEvents() {
    // Accordion expand/collapse
    const accordions = this.container.querySelectorAll('.accordion-toggle');
    accordions.forEach(acc => {
      // Accordions start collapsed or expanded depending on preference.
      // Let's toggle open/close.
      acc.addEventListener('click', () => {
        const content = acc.nextElementSibling;
        const icon = acc.querySelector('[data-lucide="chevron-down"]');
        
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
          content.style.paddingTop = '0px';
          content.style.paddingBottom = '0px';
          if (icon) icon.style.transform = 'rotate(0deg)';
        } else {
          // Open
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.paddingTop = '16px';
          content.style.paddingBottom = '16px';
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
      
      // Auto trigger first open
      const content = acc.nextElementSibling;
      content.style.maxHeight = content.scrollHeight + 'px';
      content.style.padding = '16px';
      const icon = acc.querySelector('[data-lucide="chevron-down"]');
      if (icon) icon.style.transform = 'rotate(180deg)';
    });

    // Option selectors click bindings
    const cropBtns = this.container.querySelectorAll('.btn-select-crop');
    cropBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedCropIndex = parseInt(btn.getAttribute('data-index'));
        this.render();
      });
    });

    // Header actions
    const compBtn = this.container.querySelector('#btn-result-compare');
    const marketBtn = this.container.querySelector('#btn-result-market');
    const resetBtn = this.container.querySelector('#btn-result-reset');

    if (compBtn && this.onCompare) {
      compBtn.addEventListener('click', () => this.onCompare());
    }
    if (marketBtn && this.onMarket) {
      marketBtn.addEventListener('click', () => this.onMarket());
    }
    if (resetBtn && this.onReset) {
      resetBtn.addEventListener('click', () => this.onReset());
    }
  }
}
