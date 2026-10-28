import { TranslationUtils } from '../utils/translator.js';
import { context } from '../context/AppContext.js';

export class CropComparison {
  constructor(reportData, onBack) {
    this.container = document.createElement('div');
    this.container.className = 'w-full glass-card rounded-2xl p-6 shadow-xl animate-fade-in border border-white/20 space-y-6';
    
    this.report = reportData;
    this.onBack = onBack;
  }

  render() {
    const lang = context.state.language;
    const crops = this.report.recommendations;

    this.container.innerHTML = '';

    if (!crops || crops.length < 2) {
      this.container.innerHTML = `
        <div class="p-6 text-center text-gray-500">
          Not enough recommendations generated to perform side-by-side comparison (Requires at least 2 crops).
        </div>
      `;
      return this.container;
    }

    // Header Back button
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4';
    header.innerHTML = `
      <div class="flex items-center space-x-2">
        <button id="btn-compare-back" class="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <i data-lucide="arrow-left" class="w-5 h-5"></i>
        </button>
        <div>
          <h3 class="font-bold text-gray-900 dark:text-white">Crop Comparison Matrix</h3>
          <p class="text-xs text-gray-500">Compare ranked suitability options side-by-side to make the best choice.</p>
        </div>
      </div>
      <span class="text-xs font-bold text-brand-500 dark:text-green-400 bg-brand-500/10 px-3 py-1 rounded-full">
        Comparing ${crops.length} Crops
      </span>
    `;
    this.container.appendChild(header);

    // Responsive Table Wrapper
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'w-full overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800 bg-white/20 dark:bg-gray-900/10';
    
    // Compare table rows matrix
    tableWrapper.innerHTML = `
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-800/20">
            <th class="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Agronomic Metrics</th>
            ${crops.map((c, i) => `
              <th class="p-4 text-sm font-black text-gray-900 dark:text-white">
                <div class="flex items-center space-x-2">
                  <span class="w-5 h-5 rounded bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold">#${i + 1}</span>
                  <span>${c.crop_name}</span>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800/40 text-xs font-medium text-gray-700 dark:text-gray-200">
          
          <!-- Row 1: Confidence Match -->
          <tr>
            <td class="p-4 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-gray-50/10">Suitability Match</td>
            ${crops.map(c => `
              <td class="p-4 text-sm font-black text-brand-500 dark:text-green-400">${c.confidence}% Match</td>
            `).join('')}
          </tr>

          <!-- Row 2: Growing Time -->
          <tr>
            <td class="p-4 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-gray-50/10">Growing Duration</td>
            ${crops.map(c => `
              <td class="p-4 font-semibold">${c.growing_duration}</td>
            `).join('')}
          </tr>

          <!-- Row 3: Yield -->
          <tr>
            <td class="p-4 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-gray-50/10">Expected Yield</td>
            ${crops.map(c => `
              <td class="p-4 font-semibold">${c.expected_yield.split(' (')[0]}</td>
            `).join('')}
          </tr>

          <!-- Row 4: Total Cost -->
          <tr>
            <td class="p-4 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-gray-50/10">Investment / Acre</td>
            ${crops.map(c => `
              <td class="p-4 font-bold text-red-500">${c.estimated_investment.split(' (')[0]}</td>
            `).join('')}
          </tr>

          <!-- Row 5: Total Net Profit -->
          <tr>
            <td class="p-4 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-gray-50/10">Estimated Net Profit</td>
            ${crops.map(c => `
              <td class="p-4 font-bold text-green-500 bg-green-500/5 dark:bg-green-500/10">${c.estimated_profit.split(' (')[0]}</td>
            `).join('')}
          </tr>

          <!-- Row 6: Water requirement -->
          <tr>
            <td class="p-4 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-gray-50/10">Water Requirement</td>
            ${crops.map(c => `
              <td class="p-4">
                <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] ${c.water_requirement.toLowerCase() === 'high' ? 'bg-blue-500/10 text-blue-600' : 'bg-sky-500/10 text-sky-600'}">
                  ${c.water_requirement}
                </span>
              </td>
            `).join('')}
          </tr>

          <!-- Row 7: Disease Risk -->
          <tr>
            <td class="p-4 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-gray-50/10">Pathogen Risk</td>
            ${crops.map(c => `
              <td class="p-4 font-semibold text-red-400">${c.risk_level.split(' (')[0]}</td>
            `).join('')}
          </tr>

          <!-- Row 8: Mandi MSP rates -->
          <tr>
            <td class="p-4 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-gray-50/10">Market Value</td>
            ${crops.map(c => `
              <td class="p-4 font-semibold">${c.mandi_price}</td>
            `).join('')}
          </tr>

          <!-- Row 9: Seed subsidy and gov support -->
          <tr>
            <td class="p-4 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-gray-50/10">Export / Subsidy Support</td>
            ${crops.map(c => `
              <td class="p-4 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">${c.government_support.substring(0, 80)}...</td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    `;
    this.container.appendChild(tableWrapper);

    this.bindEvents();
    if (window.lucide) {
      window.lucide.createIcons();
    }

    return this.container;
  }

  bindEvents() {
    const backBtn = this.container.querySelector('#btn-compare-back');
    if (backBtn && this.onBack) {
      backBtn.addEventListener('click', () => this.onBack());
    }
  }
}
