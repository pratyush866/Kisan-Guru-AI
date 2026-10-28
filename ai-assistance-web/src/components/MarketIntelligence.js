import { TranslationUtils } from '../utils/translator.js';
import { context } from '../context/AppContext.js';

export class MarketIntelligence {
  constructor(reportData, onBack) {
    this.container = document.createElement('div');
    this.container.className = 'w-full glass-card rounded-2xl p-6 shadow-xl animate-fade-in border border-white/20 space-y-6';
    
    this.report = reportData;
    this.onBack = onBack;
  }

  render() {
    const crops = this.report.recommendations;
    this.container.innerHTML = '';

    if (!crops || crops.length === 0) {
      this.container.innerHTML = `
        <div class="p-6 text-center text-gray-500">
          No crop details available. Please run recommendation advisory first.
        </div>
      `;
      return this.container;
    }

    // Default to displaying details of the top recommended crop
    const mainCrop = crops[0];

    // Header Back action
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4';
    header.innerHTML = `
      <div class="flex items-center space-x-2">
        <button id="btn-market-back" class="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <i data-lucide="arrow-left" class="w-5 h-5"></i>
        </button>
        <div>
          <h3 class="font-bold text-gray-900 dark:text-white">Mandi Market Intelligence</h3>
          <p class="text-xs text-gray-500">Historical pricing trends, storage advisories, and selling strategies.</p>
        </div>
      </div>
      <span class="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
        Mandi Trend: ${mainCrop.price_trend === 'up' ? 'Bullish (बढ़त)' : 'Bearish (मंदी)'}
      </span>
    `;
    this.container.appendChild(header);

    // Mandi Price Trend Grid
    const infoGrid = document.createElement('div');
    infoGrid.className = 'grid grid-cols-1 md:grid-cols-3 gap-6';
    
    // SVG Price Chart Renderer
    // Draw line connecting: (50, y1), (150, y2), (250, y3), (350, y4), (450, y5)
    // Map price array: let's scale Y between 200 (max) and 20 (min)
    const prices = mainCrop.historical_prices;
    const minVal = Math.min(...prices) * 0.95;
    const maxVal = Math.max(...prices) * 1.05;
    const range = maxVal - minVal;

    const scaleY = (val) => {
      // Map val to Y coordinates: 150 (bottom) to 30 (top)
      const ratio = (val - minVal) / range;
      return 150 - (ratio * 120);
    };

    const points = prices.map((val, idx) => {
      return { x: 60 + idx * 95, y: scaleY(val), val: val };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    const svgChartHtml = `
      <div class="glass-card rounded-2xl p-5 border border-white/10 md:col-span-2 space-y-4">
        <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Historical Mandi Price (Last 5 Months) - ${mainCrop.crop_name}</h4>
        
        <div class="relative w-full h-52 bg-white/40 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-center justify-center">
          <svg class="w-full h-full" viewBox="0 0 500 180">
            <!-- Grid Lines -->
            <line x1="40" y1="30" x2="480" y2="30" class="stroke-gray-200 dark:stroke-gray-800" stroke-dasharray="4,4"/>
            <line x1="40" y1="90" x2="480" y2="90" class="stroke-gray-200 dark:stroke-gray-800" stroke-dasharray="4,4"/>
            <line x1="40" y1="150" x2="480" y2="150" class="stroke-gray-200 dark:stroke-gray-800"/>
            
            <!-- Line Path -->
            <path d="${pathD}" fill="none" class="stroke-brand-500" stroke-width="3" stroke-linecap="round"/>
            
            <!-- Nodes and labels -->
            ${points.map((p, i) => `
              <circle cx="${p.x}" cy="${p.y}" r="5" class="fill-brand-500 stroke-white dark:stroke-gray-900" stroke-width="2"/>
              <text x="${p.x}" y="${p.y - 12}" text-anchor="middle" class="fill-gray-700 dark:fill-gray-300 font-extrabold text-[10px]">₹${p.val}</text>
              <text x="${p.x}" y="170" text-anchor="middle" class="fill-gray-400 font-semibold text-[9px]">Month ${i + 1}</text>
            `).join('')}
            
            <!-- Y-Axis indicators -->
            <text x="35" y="34" text-anchor="end" class="fill-gray-400 text-[8px]">₹${Math.round(maxVal)}</text>
            <text x="35" y="94" text-anchor="end" class="fill-gray-400 text-[8px]">₹${Math.round(minVal + range/2)}</text>
            <text x="35" y="154" text-anchor="end" class="fill-gray-400 text-[8px]">₹${Math.round(minVal)}</text>
          </svg>
        </div>
      </div>
    `;

    infoGrid.innerHTML = `
      <!-- Left 2 Cols: Historical pricing chart -->
      ${svgChartHtml}

      <!-- Right 1 Col: storage and selling strategies -->
      <div class="space-y-4">
        <!-- Cold Storage card -->
        <div class="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between h-[48%]">
          <div>
            <div class="flex items-center space-x-2 text-brand-500 font-bold mb-2">
              <i data-lucide="warehouse" class="w-4 h-4"></i>
              <span class="text-xs uppercase tracking-wider">Cold Storage Advisory</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              ${mainCrop.storage_recommendation}
            </p>
          </div>
          <span class="text-[9px] font-bold text-gray-400 mt-2 block">Source: National Cold Chain Development board</span>
        </div>

        <!-- Selling strategy card -->
        <div class="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between h-[48%]">
          <div>
            <div class="flex items-center space-x-2 text-amber-500 font-bold mb-2">
              <i data-lucide="trending-up" class="w-4 h-4"></i>
              <span class="text-xs uppercase tracking-wider">Mandi Selling Advice</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              ${mainCrop.selling_advice}
            </p>
          </div>
          <span class="text-[9px] font-bold text-gray-400 mt-2 block">Source: APMC Mandi Indices & Futures</span>
        </div>
      </div>
    `;
    this.container.appendChild(infoGrid);

    this.bindEvents();
    if (window.lucide) {
      window.lucide.createIcons();
    }

    return this.container;
  }

  bindEvents() {
    const backBtn = this.container.querySelector('#btn-market-back');
    if (backBtn && this.onBack) {
      backBtn.addEventListener('click', () => this.onBack());
    }
  }
}
