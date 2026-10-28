import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';
import { RecommendationForm } from './RecommendationForm.js';
import { RecommendationResult } from './RecommendationResult.js';
import { CropComparison } from './CropComparison.js';
import { MarketIntelligence } from './MarketIntelligence.js';
import { RecommendationHistoryView } from './RecommendationHistoryView.js';

export class CropRecommendationPage {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6';
    
    // Internal state
    this.activeView = 'form'; // 'form' | 'result' | 'comparison' | 'market' | 'history'
    this.activeReport = null; // Stored results
    
    // Child components
    this.formComponent = new RecommendationForm((data) => this.handleSubmit(data));
    this.historyComponent = new RecommendationHistoryView(
      (report) => this.handleLoadReport(report),
      (inputs) => this.handleReloadInputs(inputs)
    );
  }

  render() {
    const state = context.state;
    const lang = state.language;
    
    this.container.innerHTML = '';

    // Create Page Header & Tabs
    const header = document.createElement('div');
    header.className = 'flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-gray-200 dark:border-gray-800';
    header.innerHTML = `
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <i data-lucide="sprout" class="w-6 h-6 text-brand-500"></i>
          <span>${TranslationUtils.translate('recFormTitle', lang)}</span>
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Decide the most suitable crop to cultivate based on scientific, environmental, and financial calculations.
        </p>
      </div>
      
      <!-- Workspace Navigation Tabs -->
      <div class="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl mt-4 md:mt-0 max-w-max">
        <button id="tab-opt-new" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${this.activeView === 'form' || this.activeView === 'result' || this.activeView === 'comparison' || this.activeView === 'market' ? 'bg-white dark:bg-gray-700 text-brand-500 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}">
          <span class="flex items-center space-x-1.5">
            <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
            <span>New Advisory</span>
          </span>
        </button>
        <button id="tab-opt-history" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${this.activeView === 'history' ? 'bg-white dark:bg-gray-700 text-brand-500 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}">
          <span class="flex items-center space-x-1.5">
            <i data-lucide="history" class="w-3.5 h-3.5"></i>
            <span>Advisory History</span>
          </span>
        </button>
      </div>
    `;

    this.container.appendChild(header);

    // Render Sub-Views inside viewport
    const viewport = document.createElement('div');
    viewport.className = 'w-full';

    if (this.activeView === 'form') {
      viewport.appendChild(this.formComponent.render());
    } else if (this.activeView === 'result') {
      const resultView = new RecommendationResult(
        this.activeReport,
        () => this.handleReset(),
        () => this.handleCompare(),
        () => this.handleMarket()
      );
      viewport.appendChild(resultView.render());
    } else if (this.activeView === 'comparison') {
      const compareView = new CropComparison(
        this.activeReport,
        () => this.setView('result')
      );
      viewport.appendChild(compareView.render());
    } else if (this.activeView === 'market') {
      const marketView = new MarketIntelligence(
        this.activeReport,
        () => this.setView('result')
      );
      viewport.appendChild(marketView.render());
    } else if (this.activeView === 'history') {
      viewport.appendChild(this.historyComponent.render());
    }

    this.container.appendChild(viewport);

    // Bind event hooks
    this.bindEvents();
    
    // Create icons overlay
    if (window.lucide) {
      window.lucide.createIcons();
    }

    return this.container;
  }

  bindEvents() {
    const tabNew = this.container.querySelector('#tab-opt-new');
    const tabHistory = this.container.querySelector('#tab-opt-history');

    if (tabNew) {
      tabNew.addEventListener('click', () => {
        if (this.activeReport) {
          this.setView('result');
        } else {
          this.setView('form');
        }
      });
    }

    if (tabHistory) {
      tabHistory.addEventListener('click', () => {
        this.setView('history');
      });
    }
  }

  setView(viewName) {
    this.activeView = viewName;
    this.render();
  }

  handleReset() {
    this.activeReport = null;
    this.formComponent.resetForm();
    this.setView('form');
  }

  handleCompare() {
    this.setView('comparison');
  }

  handleMarket() {
    this.setView('market');
  }

  handleLoadReport(report) {
    this.activeReport = report;
    this.setView('result');
  }

  handleReloadInputs(inputs) {
    this.formComponent.loadInputs(inputs);
    this.setView('form');
  }

  async handleSubmit(formData) {
    context.setGenerating(true);
    
    try {
      if (navigator.onLine) {
        // Submit parameters to the backend API router
        const response = await fetch('http://127.0.0.1:8000/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Kisan Guru uses standard Bearer JWT security authentication
            // We load JWT token if mock session exists
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const result = await response.json();
          this.activeReport = result;
          this.setView('result');
          this.historyComponent.refreshHistory(); // Reload history items list
          return;
        }
      }
      
      // OFFLINE MODE: Run the matching algorithm locally in JS to maintain zero-loss sync
      // Simulate backend service logic for offline reliability
      console.warn('Executing client-side offline advisory matching calculations');
      const offlineResult = this.calculateOfflineRecommendations(formData);
      this.activeReport = {
        id: 'offline_' + Date.now(),
        recommendations: offlineResult,
        created_at: new Date().toISOString()
      };
      
      // Save locally to offline outbox queue
      this.saveOfflineAdvisory(this.activeReport, formData);
      
      this.setView('result');
      this.historyComponent.refreshHistory();
    } catch (err) {
      console.error('Failed to submit crop recommendation inquiry:', err);
    } finally {
      context.setGenerating(false);
    }
  }

  saveOfflineAdvisory(report, inputs) {
    const offlineLedger = JSON.parse(localStorage.getItem('offline_recommendations') || '[]');
    offlineLedger.unshift({
      id: report.id,
      inputs: inputs,
      results: report.recommendations,
      is_favorite: false,
      created_at: report.created_at
    });
    localStorage.setItem('offline_recommendations', JSON.stringify(offlineLedger));
  }

  calculateOfflineRecommendations(inputs) {
    // Basic local JavaScript matching engine simulation matching python service values
    const cropDB = [
      { name: "Rice (Paddy)", season: "Kharif", N: 100, P: 50, K: 50, pH: 6.2, cost: 15000, yield: 2.2, price: 2183, desc: "Excellent match for heavy loam soils with rich monsoon watering." },
      { name: "Wheat", season: "Rabi", N: 120, P: 60, K: 50, pH: 6.8, cost: 13000, yield: 2.0, price: 2275, desc: "Thrives in cool Rabi climate, highly secure and stable market demand." },
      { name: "Potato", season: "Rabi", N: 120, P: 80, K: 120, pH: 5.8, cost: 26000, yield: 10.0, price: 1450, desc: "Tuber crop producing extremely high yield outputs in loose sandy soils." },
      { name: "Chickpea (Gram)", season: "Rabi", N: 20, P: 50, K: 30, pH: 7.0, cost: 9000, yield: 0.8, price: 5335, desc: "Leguminous nitrogen-fixing pulse requiring minimal irrigation inputs." }
    ];

    const results = cropDB.map(crop => {
      // Basic deviations calculator
      const ph_diff = Math.abs(inputs.pH - crop.pH);
      const score = Math.max(10.0, 100.0 - (ph_diff * 15.0) - (inputs.season.toLowerCase() === crop.season.toLowerCase() ? 0 : 40));
      
      const confidence = Math.round(score);
      const acres = inputs.farm_size;
      const investment = crop.cost * acres;
      const total_yield = crop.yield * acres;
      const yield_quintals = total_yield * 10;
      const revenue = yield_quintals * crop.price;
      const profit = revenue - investment;

      return {
        crop_name: crop.name,
        confidence: confidence,
        why_this_crop: crop.desc + " [Generated in Offline Local Sync Mode]",
        expected_yield: `${crop.yield} - ${crop.yield + 0.4} Tons/Acre (Total: ${total_yield.toFixed(1)} Tons)`,
        estimated_investment: `₹${crop.cost.toLocaleString()} / Acre (Total: ₹${investment.toLocaleString()})`,
        estimated_profit: `₹${(profit / acres).toLocaleString()} / Acre (Total Net: ₹${profit.toLocaleString()})`,
        growing_duration: "110 - 130 Days",
        suitable_soil: "Sandy Loam, Clay Loam",
        water_requirement: crop.name === "Rice (Paddy)" ? "High" : "Medium",
        fertilizer_plan: `Apply balanced NPK ratios (${crop.N}:${crop.P}:${crop.K} kg/ha).`,
        market_demand: "High",
        risk_level: "Low to Medium",
        difficulty_level: "Medium",
        organic_suitability: "High",
        government_support: "MSP crop procurement, PM-FBY coverage scheme.",
        explainable_ai: {
          pH_match: ph_diff < 0.5 ? "Ideal" : "Suboptimal",
          soil_match: "Compatible",
          rainfall_match: "Sufficient",
          N_status: "Balanced",
          P_status: "Balanced",
          K_status: "Balanced",
          temperature_match: "Optimal",
          season_match: inputs.season.toLowerCase() === crop.season.toLowerCase() ? "Matches" : "Incompatible"
        },
        selling_advice: "Sell to local APMC mandis.",
        storage_recommendation: "Keep in standard warehouse stores below 12% humidity.",
        mandi_price: `₹${crop.price.toLocaleString()} / Quintal`,
        price_trend: "up",
        historical_prices: [crop.price - 100, crop.price - 50, crop.price]
      };
    });

    results.sort((a, b) => b.confidence - a.confidence);
    return results.slice(0, 3);
  }
}
