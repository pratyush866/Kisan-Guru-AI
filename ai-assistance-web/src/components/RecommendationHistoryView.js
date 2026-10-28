import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class RecommendationHistoryView {
  constructor(onSelectReport, onReloadInputs) {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6';
    
    this.onSelectReport = onSelectReport;
    this.onReloadInputs = onReloadInputs;
    
    this.history = [];
    this.analytics = {
      total_queries: 0,
      avg_ph: 0,
      avg_nitrogen: 0,
      most_recommended_crop: 'None',
      favorite_count: 0
    };

    this.loading = false;
    this.refreshHistory();
  }

  async refreshHistory() {
    this.loading = true;
    this.render();

    try {
      let serverHistory = [];
      
      // 1. Fetch server history if online
      if (navigator.onLine) {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/recommendations/history', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
            }
          });
          if (response.ok) {
            serverHistory = await response.json();
            
            // Also fetch server analytics to sync dashboard
            const analyticsRes = await fetch('http://127.0.0.1:8000/api/recommendations/analytics', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
              }
            });
            if (analyticsRes.ok) {
              this.analytics = await analyticsRes.json();
            }
          }
        } catch (err) {
          console.warn('FastAPI server connection failed, reading offline records only:', err);
        }
      }

      // 2. Fetch local storage offline records
      const offlineLedger = JSON.parse(localStorage.getItem('offline_recommendations') || '[]');
      
      // Merge records, filter duplicates by id
      const combined = [...serverHistory];
      for (const off of offlineLedger) {
        if (!combined.some(c => c.id === off.id)) {
          combined.push(off);
        }
      }

      // Sort chronologically descending
      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      this.history = combined;

      // If offline or analytics fetch failed, calculate analytics locally
      if (!navigator.onLine || this.analytics.total_queries === 0) {
        this.calculateLocalAnalytics();
      }
    } catch (e) {
      console.error('Failed to reload historical logs:', e);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  calculateLocalAnalytics() {
    if (this.history.length === 0) {
      this.analytics = {
        total_queries: 0,
        avg_ph: 0.0,
        avg_nitrogen: 0.0,
        most_recommended_crop: 'None',
        favorite_count: 0
      };
      return;
    }

    const total = this.history.length;
    let phSum = 0;
    let nSum = 0;
    let favCount = 0;
    const cropCounts = {};

    for (const item of this.history) {
      phSum += item.inputs.pH || 0.0;
      nSum += item.inputs.N || 0.0;
      if (item.is_favorite) favCount++;
      
      if (item.results && item.results.length > 0) {
        const topCrop = item.results[0].crop_name;
        cropCounts[topCrop] = (cropCounts[topCrop] || 0) + 1;
      }
    }

    const mostRecommended = Object.keys(cropCounts).reduce((a, b) => cropCounts[a] > cropCounts[b] ? a : b, 'None');

    this.analytics = {
      total_queries: total,
      avg_ph: (phSum / total).toFixed(2),
      avg_nitrogen: (nSum / total).toFixed(1),
      most_recommended_crop: mostRecommended,
      favorite_count: favCount
    };
  }

  async toggleFavorite(recId, currentFavState) {
    const targetState = !currentFavState;
    
    // Toggle in local memory list for instant UI feedback
    const record = this.history.find(h => h.id === recId);
    if (record) {
      record.is_favorite = targetState;
    }
    
    // Update local storage
    const offlineLedger = JSON.parse(localStorage.getItem('offline_recommendations') || '[]');
    const localRec = offlineLedger.find(l => l.id === recId);
    if (localRec) {
      localRec.is_favorite = targetState;
      localStorage.setItem('offline_recommendations', JSON.stringify(offlineLedger));
    }

    // Toggle on server if online and record is not an offline temporary report
    if (navigator.onLine && !recId.startsWith('offline_')) {
      try {
        await fetch(`http://127.0.0.1:8000/api/recommendations/${recId}/favorite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
          },
          body: JSON.stringify({ is_favorite: targetState })
        });
      } catch (err) {
        console.error('Failed to toggle server favorite status:', err);
      }
    }

    this.refreshHistory();
  }

  render() {
    this.container.innerHTML = '';

    if (this.loading) {
      this.container.innerHTML = `
        <div class="flex items-center justify-center p-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
        </div>
      `;
      return this.container;
    }

    // 1. Render Aggregated Analytics Cards
    const analyticsRow = document.createElement('div');
    analyticsRow.className = 'grid grid-cols-2 md:grid-cols-4 gap-4';
    analyticsRow.innerHTML = `
      <div class="glass-card rounded-2xl p-4 border border-white/20">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Advisory Calls</span>
            <span class="text-2xl font-black text-gray-800 dark:text-white mt-1 block">${this.analytics.total_queries}</span>
          </div>
          <span class="p-2 bg-brand-50 dark:bg-gray-800 rounded-xl text-brand-500">
            <i data-lucide="calculator" class="w-4 h-4"></i>
          </span>
        </div>
      </div>
      <div class="glass-card rounded-2xl p-4 border border-white/20">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Soil pH</span>
            <span class="text-2xl font-black text-gray-800 dark:text-white mt-1 block">${this.analytics.avg_ph}</span>
          </div>
          <span class="p-2 bg-indigo-50 dark:bg-gray-800 rounded-xl text-indigo-500">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
          </span>
        </div>
      </div>
      <div class="glass-card rounded-2xl p-4 border border-white/20">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Primary Crop Choice</span>
            <span class="text-lg font-black text-gray-800 dark:text-white mt-1 block truncate">${this.analytics.most_recommended_crop}</span>
          </div>
          <span class="p-2 bg-emerald-50 dark:bg-gray-800 rounded-xl text-emerald-500">
            <i data-lucide="leaf" class="w-4 h-4"></i>
          </span>
        </div>
      </div>
      <div class="glass-card rounded-2xl p-4 border border-white/20">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Favorited Reports</span>
            <span class="text-2xl font-black text-gray-800 dark:text-white mt-1 block">${this.analytics.favorite_count}</span>
          </div>
          <span class="p-2 bg-rose-50 dark:bg-gray-800 rounded-xl text-rose-500">
            <i data-lucide="heart" class="w-4 h-4"></i>
          </span>
        </div>
      </div>
    `;
    this.container.appendChild(analyticsRow);

    // 2. Render Search/Filter Header
    const historyHeader = document.createElement('h3');
    historyHeader.className = 'text-sm font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2';
    historyHeader.textContent = 'Past Advisory Inquiries';
    this.container.appendChild(historyHeader);

    // 3. Render list of Queries
    if (this.history.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'glass-card rounded-2xl p-10 text-center text-gray-500 dark:text-gray-400 border border-white/10';
      emptyState.innerHTML = `
        <i data-lucide="archive" class="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-3"></i>
        <p class="font-semibold text-sm">No historical advisories found</p>
        <p class="text-xs text-gray-400 mt-1">Run a new Crop Recommendation check to populate reports.</p>
      `;
      this.container.appendChild(emptyState);
      return this.container;
    }

    const listContainer = document.createElement('div');
    listContainer.className = 'space-y-4';

    this.history.forEach(item => {
      const topCrop = item.results && item.results.length > 0 ? item.results[0] : null;
      const isOffline = item.id.startsWith('offline_');

      const card = document.createElement('div');
      card.className = 'glass-card rounded-2xl p-5 border border-white/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-300';
      card.innerHTML = `
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <span class="text-sm font-black text-gray-900 dark:text-white">
              ${item.inputs.name}'s Advisory
            </span>
            ${isOffline ? `
              <span class="px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-md text-[9px] font-bold">
                Offline
              </span>
            ` : ''}
            <span class="text-[10px] text-gray-400">${new Date(item.created_at).toLocaleDateString()}</span>
          </div>
          
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Soil Type: <b>${item.inputs.soil_type}</b></span>
            <span>pH: <b>${item.inputs.pH}</b></span>
            <span>NPK: <b>${item.inputs.N}-${item.inputs.P}-${item.inputs.K}</b></span>
            <span>Season: <b>${item.inputs.season}</b></span>
          </div>
        </div>

        <div class="flex items-center space-x-6">
          ${topCrop ? `
            <div class="text-right">
              <span class="text-[10px] text-gray-400 uppercase block">Top Recommended Match</span>
              <span class="text-sm font-bold text-brand-500 dark:text-green-400">${topCrop.crop_name} (${topCrop.confidence}%)</span>
            </div>
          ` : ''}

          <div class="flex items-center space-x-2">
            <button class="btn-fav-report p-2 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-rose-500 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all" data-id="${item.id}" data-fav="${item.is_favorite}">
              <i data-lucide="heart" class="w-4 h-4 ${item.is_favorite ? 'fill-rose-500 text-rose-500' : ''}"></i>
            </button>
            <button class="btn-reload-params px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all flex items-center space-x-1" data-id="${item.id}">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>Reload Inputs</span>
            </button>
            <button class="btn-view-report px-3 py-1.5 bg-brand-500 text-white rounded-xl text-xs font-bold hover:bg-brand-600 shadow-md transition-all flex items-center space-x-1" data-id="${item.id}">
              <span>View Report</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
      listContainer.appendChild(card);
    });

    this.container.appendChild(listContainer);
    this.bindEvents();

    if (window.lucide) {
      window.lucide.createIcons();
    }

    return this.container;
  }

  bindEvents() {
    // Click View Report
    const viewBtns = this.container.querySelectorAll('.btn-view-report');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const report = this.history.find(h => h.id === id);
        if (report && this.onSelectReport) {
          // Format report to fit display engine (it already has outputs)
          this.onSelectReport({
            id: report.id,
            recommendations: report.results,
            created_at: report.created_at
          });
        }
      });
    });

    // Click Reload Inputs
    const reloadBtns = this.container.querySelectorAll('.btn-reload-params');
    reloadBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const report = this.history.find(h => h.id === id);
        if (report && this.onReloadInputs) {
          this.onReloadInputs(report.inputs);
        }
      });
    });

    // Click Favorite
    const favBtns = this.container.querySelectorAll('.btn-fav-report');
    favBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const isFav = btn.getAttribute('data-fav') === 'true';
        this.toggleFavorite(id, isFav);
      });
    });
  }
}
