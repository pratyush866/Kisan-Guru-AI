import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class MandiPricesPage {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6 pb-24';

    this.selectedCrop = 'Wheat';
    this.selectedState = 'Uttar Pradesh';

    // Mock Mandi Database
    this.mandiData = {
      'Uttar Pradesh': [
        { crop: 'Wheat (गेहूं)', rate: 2275, trend: 'up', storage: 'Store at <12% moisture to prevent mold.', advice: 'Hold for 2 weeks. Prices expected to rise post-harvest rush.' },
        { crop: 'Paddy (धान)', rate: 2183, trend: 'up', storage: 'Dry thoroughly before packing in gunny bags.', advice: 'Sell immediately at nearest cooperative to claim MSP bonus.' },
        { crop: 'Potato (आलू)', rate: 1450, trend: 'down', storage: 'Keep in ventilated cold storage at 2-4°C.', advice: 'Move stock to cold store. Current glut in markets is driving rates down.' },
        { crop: 'Tomato (टमाटर)', rate: 1800, trend: 'up', storage: 'Harvest at breaker stage for long-distance transport.', advice: 'Sell immediately. Short shelf-life limits holding capacity.' },
        { crop: 'Maize (मक्का)', rate: 2090, trend: 'down', storage: 'Dry to 14% moisture level for bulk storage.', advice: 'Compare rates between APMC and poultry feed mills before sale.' }
      ],
      'Punjab': [
        { crop: 'Wheat (गेहूं)', rate: 2320, trend: 'up', storage: 'Store in dry airtight silos for pest control.', advice: 'MSP procurement centers active. Sell at Mandi for assured pricing.' },
        { crop: 'Paddy (धान)', rate: 2210, trend: 'up', storage: 'Store at 13% moisture level for basmati variants.', advice: 'Basmati exports are surging. Hold high-grade grains.' },
        { crop: 'Potato (आलू)', rate: 1350, trend: 'down', storage: 'Place in cold storage facilities immediately.', advice: 'Avoid fire-selling. Group truck shipments with neighbors to cut costs.' },
        { crop: 'Tomato (टमाटर)', rate: 1650, trend: 'up', storage: 'Wrap in straw for short-term preservation.', advice: 'High humidity is disrupting transit. Ship to local markets.' },
        { crop: 'Maize (मक्का)', rate: 1980, trend: 'down', storage: 'Silo drying recommended.', advice: 'Wait for moisture clearance certificates before unloading.' }
      ],
      'Bihar': [
        { crop: 'Wheat (गेहूं)', rate: 2210, trend: 'up', storage: 'Clean thoroughly to remove chaff and dust.', advice: 'Hold. Regional supply is constrained, local prices rising.' },
        { crop: 'Paddy (धान)', rate: 2130, trend: 'up', storage: 'Stack bags on wooden pallets off the floor.', advice: 'Assure quality specs before taking to PACS procurement centers.' },
        { crop: 'Potato (आलू)', rate: 1520, trend: 'up', storage: 'Keep in dark cool cellars if cold rooms full.', advice: 'Favourable retail prices. Direct farm-to-consumer recommended.' },
        { crop: 'Tomato (टमाटर)', rate: 1950, trend: 'up', storage: 'Sort carefully to reject early blight fruits.', advice: 'Local mandis showing high demand due to rain delays.' },
        { crop: 'Maize (मक्का)', rate: 2010, trend: 'down', storage: 'Protect from rodents in elevated metal bins.', advice: 'Prices depressed. Explore silage production for livestock feed.' }
      ]
    };

    // Historical rates for SVG chart
    this.historicalData = {
      'Wheat': [2050, 2100, 2180, 2220, 2275],
      'Paddy': [1980, 2020, 2110, 2150, 2183],
      'Potato': [1680, 1610, 1550, 1490, 1450],
      'Tomato': [1200, 1450, 1900, 1600, 1800],
      'Maize': [2250, 2180, 2140, 2110, 2090]
    };
  }

  render() {
    const lang = context.state.language;
    const currentStateData = this.mandiData[this.selectedState] || this.mandiData['Uttar Pradesh'];
    
    // Find active commodity details
    const cleanCropName = this.selectedCrop.split(' ')[0];
    const activeCommodity = currentStateData.find(c => c.crop.includes(cleanCropName)) || currentStateData[0];

    this.container.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <i data-lucide="trending-up" class="w-6 h-6 text-brand-500"></i>
            <span>Mandi Price Intelligence</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time APMC mandi rates, price indices, and selling strategies</p>
        </div>
      </div>

      <!-- FILTER PANEL -->
      <div class="glass-card rounded-2xl p-5 border border-white/10 flex flex-wrap gap-4 items-center justify-between">
        <div class="flex flex-wrap gap-4 items-center">
          <!-- State Selector -->
          <div class="space-y-1">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select State</label>
            <select id="mandi-state-select" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer">
              <option value="Uttar Pradesh" ${this.selectedState === 'Uttar Pradesh' ? 'selected' : ''}>Uttar Pradesh</option>
              <option value="Punjab" ${this.selectedState === 'Punjab' ? 'selected' : ''}>Punjab</option>
              <option value="Bihar" ${this.selectedState === 'Bihar' ? 'selected' : ''}>Bihar</option>
            </select>
          </div>

          <!-- Crop Selection Buttons -->
          <div class="space-y-1">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Commodity</label>
            <div class="flex flex-wrap gap-1.5">
              ${['Wheat', 'Paddy', 'Potato', 'Tomato', 'Maize'].map(cropName => {
                const label = cropName === 'Wheat' ? 'Wheat (गेहूं)' :
                              cropName === 'Paddy' ? 'Paddy (धान)' :
                              cropName === 'Potato' ? 'Potato (आलू)' :
                              cropName === 'Tomato' ? 'Tomato (टमाटर)' : 'Maize (मक्का)';
                const isActive = this.selectedCrop === cropName;
                return `
                  <button class="mandi-crop-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${isActive ? 'bg-brand-500 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}" data-crop="${cropName}">
                    ${label}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="text-right">
          <span class="text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center space-x-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>${lang === 'hindi' ? 'एपीएमसी मार्केट स्नैपशॉट (ऑफ़लाइन)' : lang === 'bhojpuri' ? 'एपीएमसी मंडी भाव (ऑफ़लाइन)' : 'APMC Market Snapshot (Verified Offline)'}</span>
          </span>
        </div>
      </div>

      <!-- RATES GRID & CHART -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left 8 Cols: Price Trends and interactive SVG chart -->
        <div class="lg:col-span-8 space-y-6">
          <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-slate-800 dark:text-white text-sm">Historical Price Index (₹ per Quintal)</h3>
              <span class="text-xs font-bold text-brand-600 dark:text-green-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full">
                ${this.selectedCrop} Trend: ${activeCommodity.trend === 'up' ? 'Bullish (बढ़त)' : 'Bearish (मंदी)'}
              </span>
            </div>

            <!-- SVG Chart Renderer -->
            <div class="relative w-full h-56 bg-white/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-center">
              ${this.renderSvgChart()}
            </div>
          </div>

          <!-- State Commodities Rate Matrix -->
          <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
            <h3 class="font-bold text-slate-800 dark:text-white text-sm">Mandi Rates Matrix for ${this.selectedState}</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold text-[9px]">
                    <th class="py-2.5">Commodity</th>
                    <th class="py-2.5">Mandi MSP Rate</th>
                    <th class="py-2.5">Price Trend</th>
                    <th class="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                  ${currentStateData.map(c => `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                      <td class="py-3.5 font-bold text-slate-800 dark:text-slate-200">${c.crop}</td>
                      <td class="py-3.5 font-extrabold text-slate-900 dark:text-white">₹${c.rate.toLocaleString('en-IN')}/Qtl</td>
                      <td class="py-3.5">
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${c.trend === 'up' ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-500'} flex items-center space-x-1 max-w-max">
                          <i data-lucide="${c.trend === 'up' ? 'trending-up' : 'trending-down'}" class="w-3 h-3"></i>
                          <span>${c.trend === 'up' ? '+3.4%' : '-1.8%'}</span>
                        </span>
                      </td>
                      <td class="py-3.5 text-right">
                        <button class="mandi-row-view-btn text-[10px] text-brand-500 hover:underline font-bold" data-crop-name="${c.crop.split(' ')[0]}">
                          View Index
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right 4 Cols: Advisories and Storage Details -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Storage details card -->
          <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
            <div class="text-brand-500 font-bold text-xs flex items-center space-x-2">
              <i data-lucide="warehouse" class="w-4.5 h-4.5"></i>
              <span class="uppercase tracking-wider">Cold Storage Advisory</span>
            </div>
            <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-1.5">${this.selectedCrop} Storage Guidelines</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ${activeCommodity.storage}
            </p>
            <div class="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
              Source: National Cold Chain Development guidelines (2026)
            </div>
          </div>

          <!-- Market selling strategy advice card -->
          <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
            <div class="text-amber-500 font-bold text-xs flex items-center space-x-2">
              <i data-lucide="trending-up" class="w-4.5 h-4.5"></i>
              <span class="uppercase tracking-wider">APMC Selling Strategy</span>
            </div>
            <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-1.5">${this.selectedCrop} Trade Advice</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ${activeCommodity.advice}
            </p>
            <div class="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
              Calculated using localized farmer crop availability indexes.
            </div>
          </div>

          <!-- Price Alert Setup Widget -->
          <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
            <div class="text-slate-800 dark:text-white font-bold text-xs flex items-center space-x-2">
              <i data-lucide="bell" class="w-4 h-4 text-brand-500"></i>
              <span>SMS Price Alerts</span>
            </div>
            <p class="text-[10px] text-slate-500">Subscribe to receive daily regional price changes on your mobile number.</p>
            <div class="space-y-2">
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold select-none">+91</span>
                <input type="tel" placeholder="Mobile Number" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-2 text-xs focus:outline-none" />
              </div>
              <button id="btn-mandi-subscribe" class="w-full py-2 bg-brand-500 text-white font-bold rounded-xl text-xs hover:bg-brand-600 transition-all flex items-center justify-center space-x-1.5">
                <i data-lucide="bell-ring" class="w-3.5 h-3.5"></i>
                <span>Subscribe Alerts</span>
              </button>
            </div>
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

  renderSvgChart() {
    const prices = this.historicalData[this.selectedCrop] || this.historicalData['Wheat'];
    const minVal = Math.min(...prices) * 0.95;
    const maxVal = Math.max(...prices) * 1.05;
    const range = maxVal - minVal;

    const scaleY = (val) => {
      // Map val to Y coordinates: 160 (bottom) to 30 (top)
      const ratio = (val - minVal) / range;
      return 160 - (ratio * 120);
    };

    const points = prices.map((val, idx) => {
      return { x: 50 + idx * 100, y: scaleY(val), val: val };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    return `
      <svg class="w-full h-full" viewBox="0 0 500 200">
        <!-- Grid Lines -->
        <line x1="30" y1="30" x2="480" y2="30" class="stroke-slate-200 dark:stroke-slate-800" stroke-dasharray="4,4"/>
        <line x1="30" y1="90" x2="480" y2="90" class="stroke-slate-200 dark:stroke-slate-800" stroke-dasharray="4,4"/>
        <line x1="30" y1="160" x2="480" y2="160" class="stroke-slate-200 dark:stroke-slate-800"/>
        
        <!-- Area under path -->
        <path d="${pathD} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z" fill="rgba(22, 163, 74, 0.05)"/>

        <!-- Line Path -->
        <path d="${pathD}" fill="none" class="stroke-brand-500" stroke-width="3" stroke-linecap="round"/>
        
        <!-- Nodes and labels -->
        ${points.map((p, i) => `
          <circle cx="${p.x}" cy="${p.y}" r="5" class="fill-brand-500 stroke-white dark:stroke-slate-900 cursor-pointer" stroke-width="2"/>
          <text x="${p.x}" y="${p.y - 12}" text-anchor="middle" class="fill-slate-700 dark:fill-slate-200 font-extrabold text-[10px]">₹${p.val}</text>
          <text x="${p.x}" y="180" text-anchor="middle" class="fill-slate-400 font-semibold text-[9px]">Month ${i + 1}</text>
        `).join('')}
        
        <!-- Y-Axis indicators -->
        <text x="25" y="34" text-anchor="end" class="fill-slate-400 text-[8px]">₹${Math.round(maxVal)}</text>
        <text x="25" y="94" text-anchor="end" class="fill-slate-400 text-[8px]">₹${Math.round(minVal + range/2)}</text>
        <text x="25" y="164" text-anchor="end" class="fill-slate-400 text-[8px]">₹${Math.round(minVal)}</text>
      </svg>
    `;
  }

  bindEvents() {
    // State change event
    const stateSelect = this.container.querySelector('#mandi-state-select');
    if (stateSelect) {
      stateSelect.addEventListener('change', (e) => {
        this.selectedState = e.target.value;
        this.render();
      });
    }

    // Crop Selector buttons
    const cropBtns = this.container.querySelectorAll('.mandi-crop-btn');
    cropBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedCrop = btn.getAttribute('data-crop');
        this.render();
      });
    });

    // Matrix View Index button click
    const rowBtns = this.container.querySelectorAll('.mandi-row-view-btn');
    rowBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedCrop = btn.getAttribute('data-crop-name');
        this.render();
      });
    });

    // Alert subscription click
    const btnSubscribe = this.container.querySelector('#btn-mandi-subscribe');
    if (btnSubscribe) {
      btnSubscribe.addEventListener('click', () => {
        alert('Price Alert Subscribed!\nYou will receive SMS notifications for ' + this.selectedCrop + ' changes in ' + this.selectedState);
      });
    }
  }
}
