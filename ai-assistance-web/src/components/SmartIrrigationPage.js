import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class SmartIrrigationPage {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6';

    // State parameters
    this.activeCalendarTab = 'daily'; // 'daily' | 'weekly' | 'monthly' | 'growth' | 'emergency'
    this.simulatedSensorType = 'moisture';
    this.simulatedSensorValue = 45;
    
    // Default dashboard states (dynamically loaded on init/telemetry push)
    this.moisturePct = 42.5;
    this.soilTempC = 25.8;
    this.humidityPct = 68.0;
    this.tankLevelPct = 78.0;
    this.flowRateLMin = 18.5;
    
    // Soil reports state
    this.soilType = 'Clay Loam';
    this.soilHealth = 84.5;
    this.soilFertility = 79.2;
    this.nitrogen = 68.0;
    this.phosphorus = 44.0;
    this.potassium = 48.0;
    this.pH = 6.7;
    this.organicMatter = 2.8;
    this.compaction = 135.0;
    this.drainage = 'Good';
    this.waterCapacity = 65.0;
    
    // AI Recommendation values
    this.activeRecommendation = {
      recommended_water_liters: 14200,
      recommended_duration_minutes: 45,
      irrigation_method: 'Drip Irrigation',
      confidence_score: 0.94,
      explanation: 'The current soil moisture is 42.5% against a target of 70.0% for Clay Loam soil. Transpiration is moderate based on local temperature (28°C) and humidity (68%). Applying 14,200 Liters via Drip will restore root moisture with 90% water application efficiency.',
      best_irrigation_time: '6:30 PM (Evening Cool)'
    };
    
    // Alerts
    this.alertsList = [
      { id: 1, type: 'warning', title: 'Soil Moisture Depletion', message: 'Soil moisture is approaching critical wilt threshold in Block A. Keep drip lines cleared.' },
      { id: 2, type: 'info', title: 'Monsoon Rain Buffer', message: 'Precipitation expected in 24 hours. Natural moisture will downscale manual watering demands.' }
    ];

    // Analytics Usage Arrays (Simulated)
    this.analytics = {
      total_water_used_liters: 67200,
      total_water_saved_liters: 32400,
      water_efficiency_score: 88.5,
      expected_savings_pct: 32.5,
      monthly_usage: [12000, 15000, 9500, 14000, 11000, 5700]
    };

    // Calendar Plans
    this.calendarSchedules = {
      daily: [
        { day: 'Today (आज)', action: 'Irrigate at 6:30 PM (Drip)', water_quantity_liters: 14200, notes: 'Restores target field capacity.' },
        { day: 'Tomorrow (कल)', action: 'No Action Required', water_quantity_liters: 0, notes: 'Root zone saturation buffer phase.' }
      ],
      weekly: [
        { day: 'Monday', action: 'Irrigate (Drip) - 45 mins', water_quantity_liters: 14200, notes: 'Standard scheduling cycle.' },
        { day: 'Wednesday', action: 'Irrigate (Drip) - 30 mins', water_quantity_liters: 9500, notes: 'Mid-week moisture top-off.' },
        { day: 'Friday', action: 'Skip Irrigation', water_quantity_liters: 0, notes: 'Inspect leaf canopy status.' }
      ],
      monthly: [
        { day: 'Week 1', action: 'Early Vegetative Routine', water_quantity_liters: 38000, notes: '3 schedules total.' },
        { day: 'Week 2', action: 'Crop Growth Support Cycle', water_quantity_liters: 42000, notes: '3 schedules total.' },
        { day: 'Week 3', action: 'Peak Flowering Saturation', water_quantity_liters: 55000, notes: 'Increase watering frequency.' },
        { day: 'Week 4', action: 'Dry-down phase adjustment', water_quantity_liters: 22000, notes: 'Transitioning to yield phase.' }
      ],
      growth: [
        { day: 'Seedling Phase', action: 'Light Sprinklers - 15m', water_quantity_liters: 4000, notes: 'Maintain surface moist, avoid seed displacement.' },
        { day: 'Tillering Phase', action: 'Drip lines - 35m', water_quantity_liters: 11000, notes: 'Promotes root expansion.' },
        { day: 'Flowering Stage', action: 'Drip lines - 50m (Critical)', water_quantity_liters: 16000, notes: 'Strict moisture replenishment required.' },
        { day: 'Ripening Stage', action: 'Gradual Dry down', water_quantity_liters: 0, notes: 'Encourages starch storage and drying.' }
      ],
      emergency: [
        { day: 'Heat Wave Warning', action: 'Run Drip for 60m at 5:00 AM', water_quantity_liters: 18000, notes: 'Cool soil before high evaporation spikes.' },
        { day: 'Heavy Rain Forecast', action: 'Controller Emergency Stop', water_quantity_liters: 0, notes: 'Prevent waterlogging and nutrient runoff.' }
      ]
    };
    this.hasLoadedBackendData = false;
  }

  render() {
    const state = context.state;
    const lang = state.language;

    if (!this.hasLoadedBackendData) {
      this.hasLoadedBackendData = true;
      this.syncWithBackend();
    }

    this.container.innerHTML = `
      <!-- Page Header -->
      <div class="pb-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <i data-lucide="droplet" class="w-6 h-6 text-brand-500 fill-brand-500/20"></i>
            <span>${TranslationUtils.translate('tabIrrigation', lang)}</span>
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Precision soil moisture intelligence, weather-adaptive calendars, IoT sensor integrations, and AI water savings.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Section (2/3 width) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Animated Dashboard Gauges -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <!-- Moisture Gauge (Circular Animated SVG) -->
            <div class="glass-card p-4 flex flex-col items-center justify-between text-center relative overflow-hidden rounded-2xl">
              <span class="text-xs font-bold text-gray-400 mb-2">Soil Moisture</span>
              <div class="relative w-28 h-28 flex items-center justify-center">
                <!-- SVG Circle Track -->
                <svg class="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="currentColor" stroke-width="8" class="text-gray-100 dark:text-gray-850" fill="transparent" />
                  <circle cx="56" cy="56" r="48" stroke="url(#moistureGrad)" stroke-width="8" 
                    stroke-dasharray="301.6" 
                    stroke-dashoffset="${301.6 - (301.6 * this.moisturePct) / 100}" 
                    class="transition-all duration-1000 ease-out" 
                    stroke-linecap="round" fill="transparent" />
                  <defs>
                    <linearGradient id="moistureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#3b82f6" />
                      <stop offset="100%" stop-color="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="absolute flex flex-col items-center">
                  <span class="text-2xl font-extrabold text-blue-600 dark:text-blue-400">${this.moisturePct}%</span>
                  <span class="text-[10px] font-semibold text-gray-400">Target: 70%</span>
                </div>
              </div>
              <span class="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full mt-3 flex items-center gap-1">
                <i data-lucide="alert-circle" class="w-3 h-3"></i> Suboptimal
              </span>
            </div>

            <!-- Water Tank Level Card -->
            <div class="glass-card p-4 flex flex-col items-center justify-between text-center rounded-2xl">
              <span class="text-xs font-bold text-gray-400 mb-2">Water Tank Level</span>
              <div class="relative w-20 h-28 border-2 border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/40 flex flex-col justify-end">
                <!-- Liquid Fill Animation -->
                <div style="height: ${this.tankLevelPct}%" class="w-full bg-gradient-to-t from-blue-600 to-blue-400 relative transition-all duration-1000 ease-out">
                  <!-- Wave Animation overlays -->
                  <div class="absolute top-0 left-0 right-0 h-1.5 bg-blue-300/40 animate-pulse"></div>
                </div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-xl font-extrabold text-gray-800 dark:text-white drop-shadow">${this.tankLevelPct}%</span>
                </div>
              </div>
              <span class="text-[11px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full mt-3">
                Stable Capacity
              </span>
            </div>

            <!-- Flow Rate Sensor Card -->
            <div class="glass-card p-4 flex flex-col items-center justify-between text-center rounded-2xl">
              <span class="text-xs font-bold text-gray-400 mb-3">Flow Rate</span>
              <div class="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full animate-pulse">
                <i data-lucide="activity" class="w-10 h-10"></i>
              </div>
              <div class="mt-3">
                <span class="text-xl font-extrabold text-gray-800 dark:text-white">${this.flowRateLMin} L/min</span>
                <p class="text-[10px] text-gray-400 mt-0.5 font-medium">Valve Status: Open</p>
              </div>
            </div>

            <!-- Temperature & Humidity Card -->
            <div class="glass-card p-4 flex flex-col justify-between rounded-2xl">
              <span class="text-xs font-bold text-gray-400 text-center mb-3">Field Micro-climate</span>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-2 rounded-xl bg-white/40 dark:bg-gray-800/20 border border-gray-100/50 dark:border-gray-800">
                  <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <i data-lucide="thermometer" class="w-3.5 h-3.5 text-orange-500"></i> Soil Temp
                  </span>
                  <span class="text-sm font-bold text-gray-800 dark:text-white">${this.soilTempC}°C</span>
                </div>
                <div class="flex items-center justify-between p-2 rounded-xl bg-white/40 dark:bg-gray-800/20 border border-gray-100/50 dark:border-gray-800">
                  <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <i data-lucide="droplet" class="w-3.5 h-3.5 text-blue-500"></i> Air Humid
                  </span>
                  <span class="text-sm font-bold text-gray-800 dark:text-white">${this.humidityPct}%</span>
                </div>
              </div>
            </div>

          </div>

          <!-- AI Recommendation Panel -->
          <div class="p-6 bg-gradient-to-br from-brand-500/10 via-green-600/5 to-transparent border border-brand-500/20 rounded-2xl shadow-sm relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-5">
              <i data-lucide="brain-circuit" class="w-48 h-48 text-brand-500"></i>
            </div>
            
            <div class="flex items-center justify-between mb-4 border-b border-brand-500/10 pb-3">
              <div class="flex items-center space-x-2">
                <div class="p-1.5 bg-brand-500 text-white rounded-lg">
                  <i data-lucide="sparkles" class="w-4 h-4"></i>
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white text-base">Kisan Guru AI Watering Advice</h3>
              </div>
              <div class="flex items-center space-x-1.5 bg-brand-500/15 text-brand-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                <i data-lucide="percent" class="w-3.5 h-3.5"></i>
                <span>Confidence: ${parseInt(this.activeRecommendation.confidence_score * 100)}%</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="p-3 bg-white/40 dark:bg-gray-800/30 rounded-xl border border-gray-150/40 dark:border-gray-800">
                <span class="text-xs font-medium text-gray-400">Target Volume</span>
                <p class="text-lg font-black text-brand-600 dark:text-green-400 mt-0.5">${this.activeRecommendation.recommended_water_liters.toLocaleString()} Liters</p>
              </div>
              <div class="p-3 bg-white/40 dark:bg-gray-800/30 rounded-xl border border-gray-150/40 dark:border-gray-800">
                <span class="text-xs font-medium text-gray-400">Run Duration</span>
                <p class="text-lg font-black text-brand-600 dark:text-green-400 mt-0.5">${this.activeRecommendation.recommended_duration_minutes} Minutes</p>
              </div>
              <div class="p-3 bg-white/40 dark:bg-gray-800/30 rounded-xl border border-gray-150/40 dark:border-gray-800">
                <span class="text-xs font-medium text-gray-400">Best Irrigation Time</span>
                <p class="text-lg font-black text-brand-600 dark:text-green-400 mt-0.5">${this.activeRecommendation.best_irrigation_time}</p>
              </div>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              "${this.activeRecommendation.explanation}"
            </p>
            
            <div class="mt-4 flex flex-wrap gap-2">
              <span class="text-xs font-semibold px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">Drip Lines</span>
              <span class="text-xs font-semibold px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md">Budget Checked</span>
              <span class="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md">Evaporation Guarded</span>
            </div>
          </div>

          <!-- Interactive Calendar Schedules -->
          <div class="glass-card rounded-2xl p-5 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                <i data-lucide="calendar" class="w-5 h-5 text-brand-500"></i> Smart Irrigation Schedule
              </h3>
              <!-- Tab select buttons -->
              <div class="flex flex-wrap gap-1 p-0.5 bg-gray-100 dark:bg-gray-800/50 rounded-xl text-[11px] font-bold">
                <button id="btn-cal-daily" class="px-3 py-1 rounded-lg transition ${this.activeCalendarTab === 'daily' ? 'bg-white dark:bg-gray-700 text-brand-500 dark:text-white shadow-sm' : 'text-gray-500'}">Daily</button>
                <button id="btn-cal-weekly" class="px-3 py-1 rounded-lg transition ${this.activeCalendarTab === 'weekly' ? 'bg-white dark:bg-gray-700 text-brand-500 dark:text-white shadow-sm' : 'text-gray-500'}">Weekly</button>
                <button id="btn-cal-monthly" class="px-3 py-1 rounded-lg transition ${this.activeCalendarTab === 'monthly' ? 'bg-white dark:bg-gray-700 text-brand-500 dark:text-white shadow-sm' : 'text-gray-500'}">Monthly</button>
                <button id="btn-cal-growth" class="px-3 py-1 rounded-lg transition ${this.activeCalendarTab === 'growth' ? 'bg-white dark:bg-gray-700 text-brand-500 dark:text-white shadow-sm' : 'text-gray-500'}">Growth Stage</button>
                <button id="btn-cal-emergency" class="px-3 py-1 rounded-lg transition ${this.activeCalendarTab === 'emergency' ? 'bg-red-500 text-white shadow-sm' : 'text-red-500/80'}">Emergency</button>
              </div>
            </div>

            <!-- Schedule Items viewport -->
            <div class="space-y-3">
              ${this.calendarSchedules[this.activeCalendarTab].map(item => `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-gray-850/20 gap-3">
                  <div>
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">${item.day}</span>
                    <h4 class="text-sm font-extrabold text-gray-850 dark:text-gray-100 mt-0.5">${item.action}</h4>
                    <p class="text-xs text-gray-500 mt-1">${item.notes}</p>
                  </div>
                  <div class="text-right sm:border-l border-gray-150 dark:border-gray-800 sm:pl-4 min-w-[120px]">
                    <span class="text-xs text-gray-400">Water volume</span>
                    <p class="text-sm font-black text-brand-500 dark:text-green-400">${item.water_quantity_liters > 0 ? `${item.water_quantity_liters.toLocaleString()} Liters` : '0 (No Water)'}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- SVG Analytics Usage Chart -->
          <div class="glass-card rounded-2xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                  <i data-lucide="bar-chart" class="w-5 h-5 text-brand-500"></i> Water Efficiency Analytics
                </h3>
                <p class="text-[11px] text-gray-400">Consolidated liters applied over the past six crop periods.</p>
              </div>
              <div class="bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <i data-lucide="trending-down" class="w-3.5 h-3.5"></i>
                <span>-${this.analytics.expected_savings_pct}% Consumption</span>
              </div>
            </div>

            <!-- Custom Interactive SVG Bar Chart -->
            <div class="relative w-full pt-4">
              <!-- Grid values -->
              <div class="flex items-end justify-between h-48 w-full border-b border-gray-200 dark:border-gray-800 px-2 relative">
                
                <!-- SVG Bars rendering -->
                ${this.analytics.monthly_usage.map((val, idx) => {
                  const maxVal = Math.max(...this.analytics.monthly_usage);
                  const barHeightPct = (val / maxVal) * 85; // cap height at 85%
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                  return `
                    <div class="flex flex-col items-center w-1/6 group cursor-pointer relative z-10">
                      <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -top-8 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                        ${val.toLocaleString()} L
                      </span>
                      <div style="height: ${barHeightPct}%" class="w-10 bg-gradient-to-t from-brand-600/90 to-brand-500 rounded-t-lg group-hover:from-blue-600 group-hover:to-blue-400 transition-all duration-500 ease-out shadow-sm"></div>
                      <span class="text-[10px] font-bold text-gray-400 mt-2">${months[idx]}</span>
                    </div>
                  `;
                }).join('')}

                <!-- Chart background guidelines -->
                <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
                  <div class="border-t border-gray-400 w-full h-px"></div>
                  <div class="border-t border-gray-400 w-full h-px"></div>
                  <div class="border-t border-gray-400 w-full h-px"></div>
                  <div class="border-t border-gray-400 w-full h-px"></div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
              <div>
                <span class="text-[10px] text-gray-400 font-bold block uppercase">Water Consumption</span>
                <span class="text-sm font-black text-gray-800 dark:text-white">${this.analytics.total_water_used_liters.toLocaleString()} L</span>
              </div>
              <div>
                <span class="text-[10px] text-gray-400 font-bold block uppercase">Water Saved</span>
                <span class="text-sm font-black text-brand-500 dark:text-green-400">${this.analytics.total_water_saved_liters.toLocaleString()} L</span>
              </div>
              <div>
                <span class="text-[10px] text-gray-400 font-bold block uppercase">Efficiency Index</span>
                <span class="text-sm font-black text-blue-600 dark:text-blue-400">${this.analytics.water_efficiency_score}%</span>
              </div>
            </div>
          </div>

        </div>
        
        <!-- Right Section (1/3 width) -->
        <div class="space-y-6">
          
          <!-- Smart Alerts Log -->
          <div class="glass-card rounded-2xl p-5 space-y-4">
            <h3 class="font-bold text-gray-800 dark:text-white flex items-center justify-between">
              <span class="flex items-center gap-1.5"><i data-lucide="bell" class="w-5 h-5 text-red-500"></i> Active Alerts</span>
              <span class="text-[10px] bg-red-100 dark:bg-red-950/20 text-red-600 px-2 py-0.5 rounded-full font-bold">2 Warnings</span>
            </h3>
            
            <div class="space-y-3">
              ${this.alertsList.map(alert => `
                <div class="p-3 rounded-xl border flex items-start gap-2.5 ${alert.type === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-400' : alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-850 dark:text-sky-400'}">
                  <i data-lucide="${alert.type === 'critical' || alert.type === 'warning' ? 'alert-triangle' : 'info'}" class="w-4 h-4 mt-0.5 shrink-0"></i>
                  <div>
                    <h5 class="text-xs font-black uppercase tracking-wider">${alert.title}</h5>
                    <p class="text-xs font-medium mt-1 leading-relaxed">${alert.message}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Soil Health Ledger -->
          <div class="glass-card rounded-2xl p-5 space-y-4">
            <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
              <i data-lucide="microscope" class="w-5 h-5 text-brand-500"></i> Soil Diagnostics Report
            </h3>
            
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-green-500/5 border border-green-500/10 rounded-xl text-center">
                <span class="text-[10px] font-bold text-gray-400 block uppercase">Soil Health</span>
                <span class="text-lg font-black text-green-600 dark:text-green-400">${this.soilHealth}/100</span>
              </div>
              <div class="p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl text-center">
                <span class="text-[10px] font-bold text-gray-400 block uppercase">Fertility Index</span>
                <span class="text-lg font-black text-brand-500 dark:text-green-400">${this.soilFertility}/100</span>
              </div>
            </div>

            <!-- Parameters checklist -->
            <div class="space-y-2.5 text-xs font-bold text-gray-500 dark:text-gray-400">
              <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>Soil Type</span>
                <span class="text-gray-800 dark:text-white">${this.soilType}</span>
              </div>
              <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>Soil pH</span>
                <span class="text-gray-800 dark:text-white">${this.pH}</span>
              </div>
              <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>Organic Matter</span>
                <span class="text-gray-800 dark:text-white">${this.organicMatter}%</span>
              </div>
              <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>Compaction</span>
                <span class="text-gray-850 dark:text-gray-200">${this.compaction} PSI</span>
              </div>
              <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>NPK Ratios (kg/ac)</span>
                <span class="text-gray-850 dark:text-gray-200">N:${parseInt(this.nitrogen)} P:${parseInt(this.phosphorus)} K:${parseInt(this.potassium)}</span>
              </div>
              <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                <span>Water Holding Cap.</span>
                <span class="text-gray-850 dark:text-gray-200">${this.waterCapacity}%</span>
              </div>
            </div>
          </div>

          <!-- IoT Controller panel & Simulator -->
          <div class="glass-card rounded-2xl p-5 space-y-4 border border-blue-500/20">
            <h3 class="font-bold text-gray-800 dark:text-white flex items-center justify-between">
              <span class="flex items-center gap-1.5"><i data-lucide="cpu" class="w-5 h-5 text-blue-500"></i> IoT Controller Simulator</span>
              <span class="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-bold">MQTT Configured</span>
            </h3>
            
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Simulate soil moisture probes or tank sensors sending live MQTT telemetry back to the Kisan Guru server.
            </p>

            <div class="space-y-3">
              <div>
                <label class="text-[11px] font-bold text-gray-400 block mb-1">Select Sensor Node</label>
                <select id="sim-sensor-type" class="w-full bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="moisture" ${this.simulatedSensorType === 'moisture' ? 'selected' : ''}>Soil Moisture Probe (Moisture %)</option>
                  <option value="water_level" ${this.simulatedSensorType === 'water_level' ? 'selected' : ''}>Water Tank Sensor (Volume %)</option>
                  <option value="flow_meter" ${this.simulatedSensorType === 'flow_meter' ? 'selected' : ''}>Flow Meter Sensor (Flow rate L/min)</option>
                </select>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-[11px] font-bold text-gray-400">Simulation Value</label>
                  <span id="sim-val-display" class="text-xs font-black text-blue-500">${this.simulatedSensorValue}</span>
                </div>
                <input type="range" id="sim-sensor-range" min="0" max="100" value="${this.simulatedSensorValue}" class="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>

              <button id="btn-sim-transmit" class="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-transform duration-300">
                <i data-lucide="radio" class="w-4 h-4"></i> Send Telemetry Signal
              </button>

              <div id="sim-success-toast" class="hidden p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-center text-xs font-bold animate-pulse">
                Telemetry Transmitted Successfully!
              </div>
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
    // 1. Calendar scheduling tab bindings
    const calTabs = ['daily', 'weekly', 'monthly', 'growth', 'emergency'];
    calTabs.forEach(tab => {
      const btn = this.container.querySelector(`#btn-cal-${tab}`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.activeCalendarTab = tab;
          this.render();
        });
      }
    });

    // 2. Simulator telemetry selectors
    const selectSensor = this.container.querySelector('#sim-sensor-type');
    const rangeSensor = this.container.querySelector('#sim-sensor-range');
    const valDisplay = this.container.querySelector('#sim-val-display');

    if (selectSensor) {
      selectSensor.addEventListener('change', (e) => {
        this.simulatedSensorType = e.target.value;
        if (this.simulatedSensorType === 'flow_meter') {
          rangeSensor.max = 50; // Flow rate range max 50 L/min
          rangeSensor.value = 18;
          this.simulatedSensorValue = 18;
        } else {
          rangeSensor.max = 100;
          rangeSensor.value = 45;
          this.simulatedSensorValue = 45;
        }
        valDisplay.innerText = this.simulatedSensorValue;
      });
    }

    if (rangeSensor) {
      rangeSensor.addEventListener('input', (e) => {
        this.simulatedSensorValue = e.target.value;
        if (valDisplay) {
          valDisplay.innerText = this.simulatedSensorValue;
        }
      });
    }

    // 3. Simulated MQTT transmitter execution
    const btnTransmit = this.container.querySelector('#btn-sim-transmit');
    const successToast = this.container.querySelector('#sim-success-toast');

    if (btnTransmit) {
      btnTransmit.addEventListener('click', async () => {
        // Build payload matching database requirements
        const payload = {
          device_id: 'ESP32_SIMULATOR_NODE',
          sensor_type: this.simulatedSensorType,
          value: parseFloat(this.simulatedSensorValue)
        };

        // UI optimistic feedback updates
        if (this.simulatedSensorType === 'moisture') {
          this.moisturePct = payload.value;
        } else if (this.simulatedSensorType === 'water_level') {
          this.tankLevelPct = payload.value;
        } else if (this.simulatedSensorType === 'flow_meter') {
          this.flowRateLMin = payload.value;
        }

        try {
          if (navigator.onLine) {
            const response = await fetch('http://127.0.0.1:8000/api/irrigation/sensors', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });
            if (response.ok) {
              console.log('IoT telemetry synced to FastAPI backend:', await response.json());
            }
          }
        } catch (err) {
          console.warn('FastAPI offline, proceeding with simulated execution:', err);
        }

        // Show verification toast and redraw panel
        if (successToast) {
          successToast.classList.remove('hidden');
          setTimeout(() => {
            successToast.classList.add('hidden');
            this.syncWithBackend();
          }, 1200);
        }
      });
    }
  }

  async syncWithBackend() {
    try {
      const token = localStorage.getItem('access_token') || '';
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      // 1. Fetch latest sensors
      const sensResp = await fetch('http://127.0.0.1:8000/api/irrigation/sensors/latest', { headers, signal: AbortSignal.timeout(3000) });
      if (sensResp.ok) {
        const sensors = await sensResp.json();
        if (Array.isArray(sensors) && sensors.length > 0) {
          sensors.forEach(s => {
            if (s.sensor_type === 'moisture') this.moisturePct = parseFloat(s.value);
            else if (s.sensor_type === 'water_level') this.tankLevelPct = parseFloat(s.value);
            else if (s.sensor_type === 'flow_meter') this.flowRateLMin = parseFloat(s.value);
          });
        }
      }

      // 2. Fetch alerts
      if (token) {
        const alertsResp = await fetch('http://127.0.0.1:8000/api/irrigation/alerts', { headers, signal: AbortSignal.timeout(3000) });
        if (alertsResp.ok) {
          const alertData = await alertsResp.json();
          if (alertData.alerts && alertData.alerts.length > 0) {
            this.alertsList = alertData.alerts.map((a, i) => ({
              id: i + 1,
              type: a.severity === 'Critical' ? 'critical' : a.severity === 'Warning' ? 'warning' : 'info',
              title: a.alert_type || 'Irrigation Advisory',
              message: a.message
            }));
          }
        }

        // 3. Fetch analytics
        const analyticsResp = await fetch('http://127.0.0.1:8000/api/irrigation/analytics', { headers, signal: AbortSignal.timeout(3000) });
        if (analyticsResp.ok) {
          const anData = await analyticsResp.json();
          this.analytics.total_water_used_liters = Math.round(anData.total_water_applied_liters || 67200);
          this.analytics.total_water_saved_liters = Math.round(anData.total_water_saved_liters || 32400);
          this.analytics.water_efficiency_score = Math.round(anData.water_efficiency_score || 88.5);
          if (anData.monthly_usage && anData.monthly_usage.length > 0) {
            this.analytics.monthly_usage = anData.monthly_usage;
          }
        }
      }
      this.render();
    } catch (e) {
      console.warn('Backend irrigation telemetry sync skipped:', e.message);
    }
  }
}
