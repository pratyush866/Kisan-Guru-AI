import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class FarmDashboard {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6 pb-24';
    
    // Yield predictor state
    this.predictCrop = 'Wheat';
    this.predictAcreage = 5;
    this.predictSoil = 'clay_loam';
    this.predictedYield = null;
  }

  render() {
    const state = context.state;
    const lang = state.language;

    // Crop data definitions
    const crops = [
      { name: 'Wheat (गेहूं)', area: '4 Acres', health: 'Excellent', stage: 'Tillering', moisture: '34%' },
      { name: 'Tomato (टमाटर)', area: '1.5 Acres', health: 'Fair (Early Blight alert)', stage: 'Flowering', moisture: '28%' }
    ];

    // Timeline actions
    const timeline = [
      { date: 'Today, 08:30 AM', event: 'Sensor telemetry upload completed. Soil moisture at 34%.' },
      { date: 'Yesterday, 04:00 PM', event: 'Added 50kg Zinc Sulphate top-dress in Tomato Block B.' },
      { date: '05 July, 10:00 AM', event: 'Disease scanning compiled early blight spots on tomatoes.' },
      { date: '02 July, 07:00 AM', event: 'Irrigation cycle triggered manually for Rice nursery beds.' }
    ];

    this.container.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <i data-lucide="layout-dashboard" class="w-6 h-6 text-brand-500"></i>
            <span>Farm Operations Ledger</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Track crop growth, yield predictions, and cashflow details</p>
        </div>
      </div>

      <!-- STATS OVERVIEW CARDS -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="glass-card rounded-2xl p-4 space-y-2">
          <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Farm Area</span>
          <div class="text-xl font-extrabold text-slate-800 dark:text-white">5.5 Acres</div>
          <span class="text-[9px] text-green-500 font-bold flex items-center"><i data-lucide="trending-up" class="w-3 h-3 mr-0.5"></i>100% Cultivated</span>
        </div>
        <div class="glass-card rounded-2xl p-4 space-y-2">
          <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Avg Soil Moisture</span>
          <div class="text-xl font-extrabold text-slate-800 dark:text-white">31.2 %</div>
          <span class="text-[9px] text-amber-500 font-bold">Needs hydration soon</span>
        </div>
        <div class="glass-card rounded-2xl p-4 space-y-2">
          <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Seasonal Expenses</span>
          <div class="text-xl font-extrabold text-slate-800 dark:text-white">₹18,450</div>
          <span class="text-[9px] text-slate-400">Seeds, Urea, Rentals</span>
        </div>
        <div class="glass-card rounded-2xl p-4 space-y-2">
          <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Estimated Revenue</span>
          <div class="text-xl font-extrabold text-slate-800 dark:text-white">₹1,24,500</div>
          <span class="text-[9px] text-green-500 font-bold flex items-center"><i data-lucide="trending-up" class="w-3 h-3 mr-0.5"></i>Optimistic forecast</span>
        </div>
      </div>

      <!-- MAIN OPERATION PANEL GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- LEFT 8 COLS: CROP STATUS & CHARTS -->
        <div class="lg:col-span-8 space-y-6">
          
          <!-- CROP STATUS LIST -->
          <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
            <h3 class="font-bold text-slate-800 dark:text-white text-sm">Active Crop Health Indexes</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${crops.map(crop => `
                <div class="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 dark:text-white">${crop.name}</span>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${crop.health.includes('alert') ? 'bg-red-500/15 text-red-500' : 'bg-green-500/15 text-green-500'}">${crop.health}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <div>Area: <b>${crop.area}</b></div>
                    <div>Growth: <b>${crop.stage}</b></div>
                    <div class="col-span-2">Moisture: <b>${crop.moisture}</b></div>
                  </div>
                  <!-- Progress bar represent growth status -->
                  <div class="space-y-1">
                    <div class="flex justify-between text-[9px] font-bold text-slate-400">
                      <span>Vegetative</span>
                      <span>Harvest</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-brand-500 rounded-full" style="width: ${crop.stage === 'Tillering' ? '40%' : '65%'}"></div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- FINANCIAL CASHFLOW SVG BAR CHART -->
          <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
            <h3 class="font-bold text-slate-800 dark:text-white text-sm">Monthly Operational Cashflow (₹)</h3>
            
            <div class="relative w-full h-52 bg-white/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-end justify-between">
              <!-- Y-Axis guidelines -->
              <div class="absolute inset-y-4 left-4 right-4 flex flex-col justify-between pointer-events-none text-[8px] text-slate-400 font-bold">
                <div class="border-b border-slate-100 dark:border-slate-800 w-full pb-1 text-right">₹30,000</div>
                <div class="border-b border-slate-100 dark:border-slate-800 w-full pb-1 text-right">₹20,000</div>
                <div class="border-b border-slate-100 dark:border-slate-800 w-full pb-1 text-right">₹10,000</div>
                <div class="w-full text-right">₹0</div>
              </div>

              <!-- Bar groups (April, May, June, July) -->
              <div class="flex-1 flex justify-around items-end h-32 relative z-10">
                <!-- April: Exp=8000, Rev=15000 -->
                <div class="flex flex-col items-center justify-end h-full w-12 space-y-1">
                  <div class="flex items-end space-x-1.5">
                    <div class="w-4 bg-red-400 rounded-t" style="height: 32px;" title="Expense: ₹8,000"></div>
                    <div class="w-4 bg-brand-500 rounded-t" style="height: 60px;" title="Revenue: ₹15,000"></div>
                  </div>
                  <span class="text-[9px] font-bold text-slate-400">April</span>
                </div>
                <!-- May: Exp=12000, Rev=18000 -->
                <div class="flex flex-col items-center justify-end h-full w-12 space-y-1">
                  <div class="flex items-end space-x-1.5">
                    <div class="w-4 bg-red-400 rounded-t" style="height: 48px;" title="Expense: ₹12,000"></div>
                    <div class="w-4 bg-brand-500 rounded-t" style="height: 72px;" title="Revenue: ₹18,000"></div>
                  </div>
                  <span class="text-[9px] font-bold text-slate-400">May</span>
                </div>
                <!-- June: Exp=15000, Rev=25000 -->
                <div class="flex flex-col items-center justify-end h-full w-12 space-y-1">
                  <div class="flex items-end space-x-1.5">
                    <div class="w-4 bg-red-400 rounded-t" style="height: 60px;" title="Expense: ₹15,000"></div>
                    <div class="w-4 bg-brand-500 rounded-t" style="height: 100px;" title="Revenue: ₹25,000"></div>
                  </div>
                  <span class="text-[9px] font-bold text-slate-400">June</span>
                </div>
                <!-- July: Exp=18450, Rev=30000 -->
                <div class="flex flex-col items-center justify-end h-full w-12 space-y-1">
                  <div class="flex items-end space-x-1.5">
                    <div class="w-4 bg-red-400 rounded-t" style="height: 74px;" title="Expense: ₹18,450"></div>
                    <div class="w-4 bg-brand-500 rounded-t" style="height: 120px;" title="Revenue: ₹30,000"></div>
                  </div>
                  <span class="text-[9px] font-bold text-slate-400">July</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-center space-x-6 text-[10px] font-bold">
              <div class="flex items-center space-x-1.5">
                <span class="w-3 h-3 bg-red-400 rounded"></span>
                <span class="text-slate-600 dark:text-slate-400">Expenses</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <span class="w-3 h-3 bg-brand-500 rounded"></span>
                <span class="text-slate-600 dark:text-slate-400">Revenues</span>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT 4 COLS: YIELD PREDICTOR & LOG TIMELINE -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- YIELD PREDICTOR CALCULATOR -->
          <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
            <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center space-x-2">
              <i data-lucide="cpu" class="w-4 h-4 text-brand-500"></i>
              <span>AI Yield Predictor</span>
            </h3>
            
            <form id="yield-predict-form" class="space-y-3">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Crop</label>
                <select id="predict-crop" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none">
                  <option value="Wheat" ${this.predictCrop === 'Wheat' ? 'selected' : ''}>Wheat (गेहूं)</option>
                  <option value="Rice" ${this.predictCrop === 'Rice' ? 'selected' : ''}>Rice (धान)</option>
                  <option value="Tomato" ${this.predictCrop === 'Tomato' ? 'selected' : ''}>Tomato (टमाटर)</option>
                  <option value="Potato" ${this.predictCrop === 'Potato' ? 'selected' : ''}>Potato (आलू)</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cultivated Acreage</label>
                <input type="number" id="predict-acreage" min="1" max="100" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none" value="${this.predictAcreage}" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Soil Consistency</label>
                <select id="predict-soil" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none">
                  <option value="clay_loam" ${this.predictSoil === 'clay_loam' ? 'selected' : ''}>Clay Loam (चिकनी बलुई)</option>
                  <option value="sandy_loam" ${this.predictSoil === 'sandy_loam' ? 'selected' : ''}>Sandy Loam (बलुई दोमट)</option>
                  <option value="black_cotton" ${this.predictSoil === 'black_cotton' ? 'selected' : ''}>Black Cotton (काली मिट्टी)</option>
                  <option value="alluvial" ${this.predictSoil === 'alluvial' ? 'selected' : ''}>Alluvial Soil (जलोढ़)</option>
                </select>
              </div>
              
              <button type="submit" class="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5">
                <i data-lucide="calculator" class="w-3.5 h-3.5"></i>
                <span>Forecast Yield</span>
              </button>
            </form>

            ${this.predictedYield ? `
              <div class="p-3 bg-brand-500/5 dark:bg-slate-800/40 rounded-xl border border-brand-500/10 space-y-2 animate-fade-in text-xs">
                <div class="font-bold text-slate-800 dark:text-white text-center">Prediction Results</div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Total Output (Est):</span>
                  <span class="font-extrabold text-brand-600 dark:text-green-400">${this.predictedYield.output} Tons</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Gross Value (Msp):</span>
                  <span class="font-extrabold text-slate-800 dark:text-white">₹${this.predictedYield.value}</span>
                </div>
                <div class="text-[9px] text-slate-500 leading-normal border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1.5">
                  <b>AI Insight:</b> ${this.predictedYield.insight}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- ACTIVITIES LOG TIMELINE -->
          <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
            <h3 class="font-bold text-slate-800 dark:text-white text-sm">Farm Activities Logs</h3>
            <div class="relative pl-4 border-l border-slate-100 dark:border-slate-800 space-y-4">
              ${timeline.map(item => `
                <div class="relative space-y-1">
                  <!-- dot overlay -->
                  <span class="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white dark:border-slate-900 shadow"></span>
                  <div class="text-[9px] font-bold text-slate-400">${item.date}</div>
                  <p class="text-[10px] text-slate-600 dark:text-slate-300 leading-normal">${item.event}</p>
                </div>
              `).join('')}
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

  bindEvents() {
    const yieldForm = this.container.querySelector('#yield-predict-form');
    if (yieldForm) {
      yieldForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const crop = this.container.querySelector('#predict-crop').value;
        const acreage = parseFloat(this.container.querySelector('#predict-acreage').value) || 1;
        const soil = this.container.querySelector('#predict-soil').value;

        this.predictCrop = crop;
        this.predictAcreage = acreage;
        this.predictSoil = soil;

        // Simple calculation mock matching agronomy values
        let factor = 1.8; // default tons per acre
        let pricePerTon = 22750; // Wheat price per ton

        if (crop === 'Rice') {
          factor = 2.2;
          pricePerTon = 21830;
        } else if (crop === 'Tomato') {
          factor = 8.5;
          pricePerTon = 15000;
        } else if (crop === 'Potato') {
          factor = 10.0;
          pricePerTon = 14500;
        }

        const totalOutput = (acreage * factor).toFixed(1);
        const grossValue = Math.round(parseFloat(totalOutput) * pricePerTon).toLocaleString('en-IN');
        
        let insight = 'Apply balanced NPK. Soil profile indicates high organic carbon.';
        if (soil === 'clay_loam' && crop === 'Wheat') {
          insight = 'Clay loam holds nitrogen well. Limit synthetic split inputs before rainfall.';
        } else if (soil === 'sandy_loam') {
          insight = 'Sandy soils drain rapidly. Break irrigation cycles into smaller frequencies.';
        }

        this.predictedYield = {
          output: totalOutput,
          value: grossValue,
          insight: insight
        };

        this.render();
      });
    }
  }
}
