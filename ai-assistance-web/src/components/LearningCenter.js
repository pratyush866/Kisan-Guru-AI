import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class LearningCenter {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6 pb-24';
    
    // Learning states
    this.activeCategory = 'all'; // 'all' | 'compost' | 'diseases' | 'machinery'
    this.searchQuery = '';
    this.selectedCropName = 'Wheat';

    // Articles data
    this.articles = [
      { id: 'a1', title: 'How to prepare Organic Neemastra Pesticide', cat: 'compost', read: '5 min read', author: 'Dr. S. K. Singh (ICAR)', desc: 'Step-by-step guidance on crushing neem leaves, mixing Jivamrit solutions, and fermenting bio-pest agents.' },
      { id: 'a2', title: 'Identifying and treating Wheat Yellow Rust', cat: 'diseases', read: '7 min read', author: 'Agronomy Extension Board', desc: 'How to recognize early symptoms of Puccinia striiformis spores and schedule propiconazole EC sprays.' },
      { id: 'a3', title: 'Calibrating drip irrigation flow rates', cat: 'machinery', read: '6 min read', author: 'B. Tech Agriculture Dept', desc: 'Adjust water discharge pressure settings based on soil clay consistency to avoid root saturation.' },
      { id: 'a4', title: 'Micro-nutrient management for Paddy transplanting', cat: 'compost', read: '4 min read', author: 'Kisan Vigyan Kendra', desc: 'Zinc sulphate application schedules for nursery beds and initial transplanting timelines.' }
    ];

    // Crop calendars timeline data
    this.calendars = {
      Wheat: [
        { phase: 'Land Preparation (अक्टूबर-नवंबर)', task: 'Plough field to fine tilth, incorporate organic manure, ensure soil moisture.' },
        { phase: 'Sowing (नवंबर)', task: 'Sow certified DBW-187 seeds at 4-5 cm depth using seed drills.' },
        { phase: 'First Irrigation / CRI Stage (दिसंबर)', task: 'Water wheat exactly 21 days after sowing. Critical for crown root initiation.' },
        { phase: 'Fertilization (जनवरी)', task: 'Top-dress first split of urea after first irrigation passes.' },
        { phase: 'Flowering & Grain Filling (फरवरी-मार्च)', task: 'Maintain soil moisture. Monitor leaves for yellow rust spores.' },
        { phase: 'Harvesting (अप्रैल)', task: 'Harvest crop when grains turn golden and moisture drops below 14%.' }
      ],
      Rice: [
        { phase: 'Nursery Bed Preparation (मई-जून)', task: 'Prepare soil nursery beds, apply compost, select high-yield IR-64 seeds.' },
        { phase: 'Transplanting (जुलाई)', task: 'Transplant 25-day old paddy seedlings with standing water depth of 2-3 cm.' },
        { phase: 'Tillering & Weeding (अगस्त)', task: 'Maintain water level. Apply hand-weeding or bio-pesticides for stem borers.' },
        { phase: 'Panicle Initiation (सितंबर)', task: 'Apply second split of nitrogen fertilizers. Monitor for bacterial blight.' },
        { phase: 'Grain Maturity (अक्टूबर)', task: 'Drain water 10-15 days prior to harvest to promote uniform ripening.' },
        { phase: 'Harvesting (नवंबर)', task: 'Reap paddy, dry stalks in fields before threshing and storage.' }
      ],
      Tomato: [
        { phase: 'Nursery Sowing (सितंबर-अक्टूबर)', task: 'Sow hybrid tomato seeds in raised beds under nylon net protection.' },
        { phase: 'Transplanting (नवंबर)', task: 'Transplant seedlings into ridges spaced 60cm apart. Install drip tubes.' },
        { phase: 'Staking & Pruning (दिसंबर)', task: 'Tie vines to stakes to keep foliage off soil. Prune lower shoots.' },
        { phase: 'Foliar Spray & Irrigation (जनवरी)', task: 'Spray Mancozeb to ward off early blight. Schedule weekly watering.' },
        { phase: 'Harvesting (फरवरी-मार्च)', task: 'Pick tomatoes at breaker stage (pink blush) for long-distance mandi sales.' }
      ]
    };
  }

  render() {
    const state = context.state;
    const lang = state.language;

    this.container.innerHTML = '';

    // Title Header
    const header = document.createElement('div');
    header.className = 'pb-4 border-b border-slate-200 dark:border-slate-800';
    header.innerHTML = `
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
        <i data-lucide="book-open" class="w-6 h-6 text-brand-500"></i>
        <span>Agronomy Learning Center</span>
      </h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Read certified ICAR farming manuals and crop calendar schedules</p>
    `;
    this.container.appendChild(header);

    // Grid layout: Left 7 Cols (Articles), Right 5 Cols (Crop Calendar)
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 lg:grid-cols-12 gap-6';

    // RENDER ARTICLES COLUMN
    const articlesCol = document.createElement('div');
    articlesCol.className = 'lg:col-span-7 space-y-4';

    // Filters and Search row
    const filterCard = document.createElement('div');
    filterCard.className = 'glass-card rounded-2xl p-4 border border-white/10 space-y-3';
    filterCard.innerHTML = `
      <div class="relative">
        <input type="text" id="learn-search" placeholder="Search guides, organic recipes, diseases..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none" value="${this.searchQuery}" />
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><i data-lucide="search" class="w-3.5 h-3.5"></i></span>
      </div>
      <div class="flex flex-wrap gap-1.5 pt-1">
        <button class="learn-cat-btn px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${this.activeCategory === 'all' ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}" data-cat="all">All Topics</button>
        <button class="learn-cat-btn px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${this.activeCategory === 'compost' ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}" data-cat="compost">Composting & Organics</button>
        <button class="learn-cat-btn px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${this.activeCategory === 'diseases' ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}" data-cat="diseases">Disease Control</button>
        <button class="learn-cat-btn px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${this.activeCategory === 'machinery' ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}" data-cat="machinery">Irrigation & Machinery</button>
      </div>
    `;
    articlesCol.appendChild(filterCard);

    // List Articles
    const articlesContainer = document.createElement('div');
    articlesContainer.className = 'space-y-4';

    const filtered = this.articles.filter(art => {
      const matchCat = this.activeCategory === 'all' || art.cat === this.activeCategory;
      const matchSearch = art.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || art.desc.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      articlesContainer.innerHTML = `<div class="py-12 text-center text-slate-400 text-xs">No learning guides found.</div>`;
    } else {
      articlesContainer.innerHTML = filtered.map(art => `
        <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-brand-500/10 text-brand-600 dark:text-green-400 uppercase">${art.cat}</span>
            <span class="text-[9px] font-bold text-slate-400 flex items-center"><i data-lucide="clock" class="w-3 h-3 mr-0.5"></i>${art.read}</span>
          </div>
          <div>
            <h4 class="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">${art.title}</h4>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">${art.desc}</p>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/50 text-[9px] font-bold text-slate-400">
            <span>Author: ${art.author}</span>
            <button class="btn-read-article text-brand-500 hover:underline flex items-center space-x-0.5">
              <span>Read Manual</span>
              <i data-lucide="arrow-right" class="w-3 h-3"></i>
            </button>
          </div>
        </div>
      `).join('');
    }
    articlesCol.appendChild(articlesContainer);
    grid.appendChild(articlesCol);

    // RENDER CROP CALENDAR COLUMN (5 COLS)
    const calendarCol = document.createElement('div');
    calendarCol.className = 'lg:col-span-5';
    calendarCol.innerHTML = `
      <div class="glass-card rounded-3xl p-5 border border-white/10 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 class="font-bold text-slate-800 dark:text-white text-sm flex items-center space-x-2">
            <i data-lucide="calendar" class="w-4 h-4 text-brand-500"></i>
            <span>Interactive Crop Calendar</span>
          </h3>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Target Crop</label>
          <select id="calendar-crop-selector" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none text-slate-700 dark:text-slate-300">
            <option value="Wheat" ${this.selectedCropName === 'Wheat' ? 'selected' : ''}>Wheat (गेहूं)</option>
            <option value="Rice" ${this.selectedCropName === 'Rice' ? 'selected' : ''}>Rice (धान)</option>
            <option value="Tomato" ${this.selectedCropName === 'Tomato' ? 'selected' : ''}>Tomato (टमाटर)</option>
          </select>
        </div>

        <!-- Timeline steps layout -->
        <div class="relative pl-4 border-l border-brand-500/20 space-y-4 pt-2 max-h-96 overflow-y-auto pr-1">
          ${(this.calendars[this.selectedCropName] || []).map(step => `
            <div class="relative space-y-1">
              <!-- dot -->
              <span class="absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white dark:border-slate-900"></span>
              <div class="text-[10px] font-bold text-brand-600 dark:text-green-400">${step.phase}</div>
              <p class="text-[9px] text-slate-500 dark:text-slate-400 leading-normal font-semibold">${step.task}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    grid.appendChild(calendarCol);

    this.container.appendChild(grid);

    this.bindEvents();

    if (window.lucide) {
      window.lucide.createIcons();
    }
    return this.container;
  }

  bindEvents() {
    // Category click filters
    const catBtns = this.container.querySelectorAll('.learn-cat-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.getAttribute('data-cat');
        this.render();
      });
    });

    // Search input
    const search = this.container.querySelector('#learn-search');
    if (search) {
      search.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
      });
      search.addEventListener('change', () => this.render());
    }

    // Crop Calendar dropdown selection
    const cropSelector = this.container.querySelector('#calendar-crop-selector');
    if (cropSelector) {
      cropSelector.addEventListener('change', (e) => {
        this.selectedCropName = e.target.value;
        this.render();
      });
    }

    // Read manual alert simulation
    const readBtns = this.container.querySelectorAll('.btn-read-article');
    readBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        alert('Opening full agricultural manual details...\nLoading PDF data from ICAR extensions...');
      });
    });
  }
}
