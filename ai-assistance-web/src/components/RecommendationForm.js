import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class RecommendationForm {
  constructor(onSubmit) {
    this.container = document.createElement('div');
    this.container.className = 'w-full max-w-4xl mx-auto glass-card rounded-2xl p-6 shadow-xl animate-fade-in-up border border-white/20';
    this.onSubmit = onSubmit;
    
    this.currentStep = 1;
    this.totalSteps = 5;
    
    // Form model inputs
    this.formData = {
      name: '',
      state: 'Uttar Pradesh',
      district: '',
      farm_size: '',
      irrigation: 'yes',
      water_source: 'Borewell',
      soil_type: 'Loam',
      pH: '',
      N: '',
      P: '',
      K: '',
      temperature: '',
      humidity: '',
      rainfall: '',
      season: 'Kharif',
      prev_crop: 'None',
      budget: '',
      organic_pref: 'chemical',
      notes: ''
    };

    // Load initial draft if available
    this.loadDraft();
  }

  loadDraft() {
    try {
      const draft = localStorage.getItem('crop_recommendation_draft');
      if (draft) {
        this.formData = { ...this.formData, ...JSON.parse(draft) };
        this.hasDraft = true;
      } else {
        this.hasDraft = false;
      }
      // Pre-fill from profile if user logged in
      const user = context.state.user || {};
      if (!this.formData.name && user.name) this.formData.name = user.name;
      if (!this.formData.state && user.state) this.formData.state = user.state;
      if (!this.formData.district && (user.district || user.city)) this.formData.district = user.district || user.city;
      if (!this.formData.farm_size && user.farm_size) this.formData.farm_size = user.farm_size;
    } catch (e) {
      console.warn('Failed to load form inputs draft from local storage:', e);
    }
  }

  applySmartDefaults() {
    this.formData.name = this.formData.name || context.state.user?.name || 'Kisan Mitra';
    this.formData.state = this.formData.state || 'Uttar Pradesh';
    this.formData.district = this.formData.district || 'Varanasi';
    this.formData.farm_size = this.formData.farm_size || '2.5';
    this.formData.water_source = this.formData.water_source || 'Borewell';
    this.formData.irrigation = 'yes';
    this.formData.soil_type = 'Loam';
    this.formData.pH = '6.8';
    this.formData.N = '85';
    this.formData.P = '42';
    this.formData.K = '45';
    this.formData.temperature = '27.5';
    this.formData.humidity = '68';
    this.formData.rainfall = '950';
    this.formData.season = 'Kharif';
    this.formData.prev_crop = 'Wheat';
    this.formData.budget = '30000';
    this.formData.organic_pref = 'organic';
    this.saveDraft();
    this.render();
  }

  saveDraft() {
    try {
      localStorage.setItem('crop_recommendation_draft', JSON.stringify(this.formData));
      this.hasDraft = true;
    } catch (e) {
      console.error('Failed to auto-save inputs draft:', e);
    }
  }

  clearDraft() {
    try {
      localStorage.removeItem('crop_recommendation_draft');
      this.hasDraft = false;
      this.formData = {
        name: '',
        state: 'Uttar Pradesh',
        district: '',
        farm_size: '',
        irrigation: 'yes',
        water_source: 'Borewell',
        soil_type: 'Loam',
        pH: '',
        N: '',
        P: '',
        K: '',
        temperature: '',
        humidity: '',
        rainfall: '',
        season: 'Kharif',
        prev_crop: 'None',
        budget: '',
        organic_pref: 'chemical',
        notes: ''
      };
      this.currentStep = 1;
      this.render();
    } catch (e) {
      console.error('Failed to clear inputs draft:', e);
    }
  }

  loadInputs(inputs) {
    this.formData = { ...this.formData, ...inputs };
    this.saveDraft();
    this.currentStep = 1;
    this.render();
  }

  resetForm() {
    this.clearDraft();
  }

  render() {
    const state = context.state;
    const lang = state.language;
    
    this.container.innerHTML = '';

    // Step calculations
    const percent = Math.round(((this.currentStep - 1) / (this.totalSteps - 1)) * 100);

    // Render Draft Alert
    let draftAlertHtml = '';
    if (this.hasDraft && this.currentStep === 1) {
      draftAlertHtml = `
        <div class="mb-6 p-4 bg-brand-50/60 dark:bg-brand-950/20 border border-brand-500/30 rounded-xl flex items-center justify-between text-xs font-semibold animate-fade-in text-brand-700 dark:text-green-300">
          <div class="flex items-center space-x-2">
            <i data-lucide="info" class="w-4 h-4 text-brand-500"></i>
            <span>${TranslationUtils.translate('formDraftFound', lang)}</span>
          </div>
          <div class="flex space-x-2">
            <button id="btn-discard-draft" class="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors">
              ${TranslationUtils.translate('formBtnDiscard', lang)}
            </button>
          </div>
        </div>
      `;
    }

    // Dynamic Step Indicators
    let stepsIndicatorHtml = '<div class="flex justify-between items-center mb-6">';
    for (let i = 1; i <= this.totalSteps; i++) {
      let stepLabel = '';
      if (i === 1) stepLabel = TranslationUtils.translate('stepLabelPersonal', lang);
      if (i === 2) stepLabel = TranslationUtils.translate('stepLabelFarm', lang);
      if (i === 3) stepLabel = TranslationUtils.translate('stepLabelSoil', lang);
      if (i === 4) stepLabel = TranslationUtils.translate('stepLabelWeather', lang);
      if (i === 5) stepLabel = TranslationUtils.translate('stepLabelPreferences', lang);

      const isActive = i === this.currentStep;
      const isCompleted = i < this.currentStep;
      
      stepsIndicatorHtml += `
        <div class="flex flex-col items-center flex-1">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${isActive ? 'bg-brand-500 text-white ring-4 ring-brand-500/20 shadow-md' : isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}">
            ${isCompleted ? '<i data-lucide="check" class="w-4 h-4"></i>' : i}
          </div>
          <span class="text-[10px] font-semibold mt-1.5 hidden md:block text-center ${isActive ? 'text-brand-500 dark:text-green-400' : 'text-gray-400'}">
            ${stepLabel}
          </span>
        </div>
        ${i < this.totalSteps ? `<div class="h-0.5 flex-1 bg-gray-200 dark:bg-gray-800 transition-colors duration-300 ${isCompleted ? 'bg-green-600' : ''}"></div>` : ''}
      `;
    }
    stepsIndicatorHtml += '</div>';

    // Build Current Step Input Fields
    let stepFieldsHtml = '';
    if (this.currentStep === 1) {
      stepFieldsHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Farmer Name *</label>
            <input type="text" id="input-name" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value="${this.formData.name}" placeholder="e.g. Ramesh Kumar">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">State *</label>
            <select id="input-state" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="Bihar" ${this.formData.state === 'Bihar' ? 'selected' : ''}>Bihar (बिहार)</option>
              <option value="Uttar Pradesh" ${this.formData.state === 'Uttar Pradesh' ? 'selected' : ''}>Uttar Pradesh (उत्तर प्रदेश)</option>
              <option value="Madhya Pradesh" ${this.formData.state === 'Madhya Pradesh' ? 'selected' : ''}>Madhya Pradesh (मध्य प्रदेश)</option>
              <option value="Punjab" ${this.formData.state === 'Punjab' ? 'selected' : ''}>Punjab (पंजाब)</option>
              <option value="Haryana" ${this.formData.state === 'Haryana' ? 'selected' : ''}>Haryana (हरियाणा)</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">District / City *</label>
            <input type="text" id="input-district" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value="${this.formData.district}" placeholder="e.g. Patna or Lucknow">
          </div>
        </div>
      `;
    } else if (this.currentStep === 2) {
      stepFieldsHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Farm Size (Acres) *</label>
            <input type="number" step="0.1" id="input-farm_size" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value="${this.formData.farm_size}" placeholder="e.g. 2.5">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Water Source *</label>
            <select id="input-water_source" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="Borewell" ${this.formData.water_source === 'Borewell' ? 'selected' : ''}>Borewell (ट्यूबवेल)</option>
              <option value="Canal" ${this.formData.water_source === 'Canal' ? 'selected' : ''}>Irrigation Canal (नहर)</option>
              <option value="River" ${this.formData.water_source === 'River' ? 'selected' : ''}>River Lift System (नदी सिंचाई)</option>
              <option value="Rainfed" ${this.formData.water_source === 'Rainfed' ? 'selected' : ''}>Rainwater Harvesting Only (वर्षा जल)</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Irrigation System Availability *</label>
            <div class="flex space-x-6">
              <label class="flex items-center space-x-2 text-sm font-semibold cursor-pointer">
                <input type="radio" name="irrigation" value="yes" ${this.formData.irrigation === 'yes' ? 'checked' : ''} class="w-4 h-4 accent-brand-500">
                <span>Yes, fully active canal/drip system</span>
              </label>
              <label class="flex items-center space-x-2 text-sm font-semibold cursor-pointer">
                <input type="radio" name="irrigation" value="no" ${this.formData.irrigation === 'no' ? 'checked' : ''} class="w-4 h-4 accent-brand-500">
                <span>No, dependent mostly on seasonal rain</span>
              </label>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentStep === 3) {
      stepFieldsHtml = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
          <div class="md:col-span-3">
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Soil Type *</label>
            <select id="input-soil_type" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="Loam" ${this.formData.soil_type === 'Loam' ? 'selected' : ''}>Alluvial Loam (दोमट मिट्टी)</option>
              <option value="Clay" ${this.formData.soil_type === 'Clay' ? 'selected' : ''}>Clayey (चिकनी मिट्टी)</option>
              <option value="Sandy" ${this.formData.soil_type === 'Sandy' ? 'selected' : ''}>Sandy (बलुई मिट्टी)</option>
              <option value="Black Soil" ${this.formData.soil_type === 'Black Soil' ? 'selected' : ''}>Regur Black Soil (काली मिट्टी)</option>
              <option value="Red Soil" ${this.formData.soil_type === 'Red Soil' ? 'selected' : ''}>Red Laterite (लाल मिट्टी)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Soil pH (0.0 - 14.0) *</label>
            <input type="number" step="0.1" id="input-pH" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value="${this.formData.pH}" placeholder="e.g. 6.5">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Nitrogen (N) (kg/ha) *</label>
            <input type="number" id="input-N" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value="${this.formData.N}" placeholder="e.g. 80">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Phosphorus (P) (kg/ha) *</label>
            <input type="number" id="input-P" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value="${this.formData.P}" placeholder="e.g. 50">
          </div>
          <div class="md:col-span-3">
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Potassium (K) (kg/ha) *</label>
            <input type="number" id="input-K" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value="${this.formData.K}" placeholder="e.g. 50">
          </div>
        </div>
      `;
    } else if (this.currentStep === 4) {
      stepFieldsHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Temperature (°C) *</label>
            <input type="number" step="0.5" id="input-temperature" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value="${this.formData.temperature}" placeholder="e.g. 28.5">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Humidity (%) *</label>
            <input type="number" id="input-humidity" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value="${this.formData.humidity}" placeholder="e.g. 70">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Rainfall (Annual/Seasonal mm) *</label>
            <input type="number" id="input-rainfall" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value="${this.formData.rainfall}" placeholder="e.g. 1200">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Current Season *</label>
            <select id="input-season" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="Kharif" ${this.formData.season === 'Kharif' ? 'selected' : ''}>Kharif (Monsoon/गर्मी)</option>
              <option value="Rabi" ${this.formData.season === 'Rabi' ? 'selected' : ''}>Rabi (Winter/ठंडी)</option>
              <option value="Zaid" ${this.formData.season === 'Zaid' ? 'selected' : ''}>Zaid (Summer/बसंत)</option>
            </select>
          </div>
        </div>
      `;
    } else if (this.currentStep === 5) {
      stepFieldsHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Previous Cultivated Crop *</label>
            <select id="input-prev_crop" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="Wheat" ${this.formData.prev_crop === 'Wheat' ? 'selected' : ''}>Wheat (गेहूं)</option>
              <option value="Rice" ${this.formData.prev_crop === 'Rice' ? 'selected' : ''}>Rice (धान)</option>
              <option value="Cotton" ${this.formData.prev_crop === 'Cotton' ? 'selected' : ''}>Cotton (कपास)</option>
              <option value="Maize" ${this.formData.prev_crop === 'Maize' ? 'selected' : ''}>Maize (मक्का)</option>
              <option value="Potato" ${this.formData.prev_crop === 'Potato' ? 'selected' : ''}>Potato (आलू)</option>
              <option value="Legumes/Pulses" ${this.formData.prev_crop === 'Legumes/Pulses' ? 'selected' : ''}>Legumes/Pulses (दालें)</option>
              <option value="None" ${this.formData.prev_crop === 'None' ? 'selected' : ''}>None / Fallow land (खाली)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Farming Budget (Total INR) *</label>
            <input type="number" id="input-budget" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value="${this.formData.budget}" placeholder="e.g. 35000">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Cultivation Preference *</label>
            <div class="flex space-x-6">
              <label class="flex items-center space-x-2 text-sm font-semibold cursor-pointer">
                <input type="radio" name="organic_pref" value="organic" ${this.formData.organic_pref === 'organic' ? 'checked' : ''} class="w-4 h-4 accent-brand-500">
                <span>Jaivik (100% Organic)</span>
              </label>
              <label class="flex items-center space-x-2 text-sm font-semibold cursor-pointer">
                <input type="radio" name="organic_pref" value="chemical" ${this.formData.organic_pref === 'chemical' ? 'checked' : ''} class="w-4 h-4 accent-brand-500">
                <span>Chemical / Mixed Inputs</span>
              </label>
            </div>
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Additional Soil Notes (Optional)</label>
            <textarea id="input-notes" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g., White larvae reports in area, soil smells high in iron...">${this.formData.notes}</textarea>
          </div>
        </div>
      `;
    }

    // Build Form Layout
    this.container.innerHTML = `
      <div class="mb-4">
        <!-- Progress Bar and Steps -->
        ${stepsIndicatorHtml}
        
        <div class="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
          <div class="h-full bg-brand-500 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
        </div>
      </div>

      <!-- Error Validation alert -->
      <div id="validation-error-banner" class="hidden mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-xl flex items-center space-x-2">
        <i data-lucide="alert-octagon" class="w-4 h-4"></i>
        <span id="validation-error-msg">${TranslationUtils.translate('formValidationErr', lang)}</span>
      </div>

      <!-- Draft Status details -->
      ${draftAlertHtml}

      <!-- Form Inputs container -->
      <div class="py-4">
        ${stepFieldsHtml}
      </div>

      <!-- Action Panel Buttons -->
      <div class="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-5 mt-6">
        <div class="flex items-center space-x-2">
          ${this.currentStep > 1 ? `
            <button id="btn-form-prev" class="px-5 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              ${TranslationUtils.translate('formBtnPrev', lang)}
            </button>
          ` : ''}
          <button id="btn-form-smart-defaults" type="button" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center space-x-1.5" title="Auto-fill recommended soil and climate values">
            <i data-lucide="wand-2" class="w-3.5 h-3.5"></i>
            <span>सुझावित डिफ़ॉल्ट भरें</span>
          </button>
        </div>
        
        <div class="flex space-x-3">
          ${this.currentStep < this.totalSteps ? `
            <button id="btn-form-next" class="px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 shadow-md transition-all">
              ${TranslationUtils.translate('formBtnNext', lang)}
            </button>
          ` : `
            <button id="btn-form-submit" class="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 shadow-md hover:scale-[1.02] transition-all">
              ${TranslationUtils.translate('formBtnSubmit', lang)}
            </button>
          `}
        </div>
      </div>
    `;

    this.bindFormEvents();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  bindFormEvents() {
    // Discard draft
    const discardBtn = this.container.querySelector('#btn-discard-draft');
    if (discardBtn) {
      discardBtn.addEventListener('click', () => this.clearDraft());
    }

    // Smart defaults auto-fill
    const defaultsBtn = this.container.querySelector('#btn-form-smart-defaults');
    if (defaultsBtn) {
      defaultsBtn.addEventListener('click', () => this.applySmartDefaults());
    }

    // Step navigators
    const nextBtn = this.container.querySelector('#btn-form-next');
    const prevBtn = this.container.querySelector('#btn-form-prev');
    const submitBtn = this.container.querySelector('#btn-form-submit');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.validateCurrentStep()) {
          this.currentStep++;
          this.render();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.saveCurrentStepValues();
        this.currentStep--;
        this.render();
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (this.validateCurrentStep()) {
          this.saveCurrentStepValues();
          if (this.onSubmit) {
            this.onSubmit(this.formData);
          }
        }
      });
    }

    // Live capture bindings
    this.bindLiveInputs();
  }

  saveCurrentStepValues() {
    if (this.currentStep === 1) {
      const name = this.container.querySelector('#input-name');
      const state = this.container.querySelector('#input-state');
      const district = this.container.querySelector('#input-district');
      if (name) this.formData.name = name.value.trim();
      if (state) this.formData.state = state.value;
      if (district) this.formData.district = district.value.trim();
    } else if (this.currentStep === 2) {
      const farmSize = this.container.querySelector('#input-farm_size');
      const waterSource = this.container.querySelector('#input-water_source');
      const irrigation = this.container.querySelector('input[name="irrigation"]:checked');
      if (farmSize) this.formData.farm_size = parseFloat(farmSize.value);
      if (waterSource) this.formData.water_source = waterSource.value;
      if (irrigation) this.formData.irrigation = irrigation.value;
    } else if (this.currentStep === 3) {
      const soilType = this.container.querySelector('#input-soil_type');
      const pH = this.container.querySelector('#input-pH');
      const N = this.container.querySelector('#input-N');
      const P = this.container.querySelector('#input-P');
      const K = this.container.querySelector('#input-K');
      if (soilType) this.formData.soil_type = soilType.value;
      if (pH) this.formData.pH = parseFloat(pH.value);
      if (N) this.formData.N = parseFloat(N.value);
      if (P) this.formData.P = parseFloat(P.value);
      if (K) this.formData.K = parseFloat(K.value);
    } else if (this.currentStep === 4) {
      const temp = this.container.querySelector('#input-temperature');
      const hum = this.container.querySelector('#input-humidity');
      const rain = this.container.querySelector('#input-rainfall');
      const season = this.container.querySelector('#input-season');
      if (temp) this.formData.temperature = parseFloat(temp.value);
      if (hum) this.formData.humidity = parseFloat(hum.value);
      if (rain) this.formData.rainfall = parseFloat(rain.value);
      if (season) this.formData.season = season.value;
    } else if (this.currentStep === 5) {
      const prevCrop = this.container.querySelector('#input-prev_crop');
      const budget = this.container.querySelector('#input-budget');
      const organic = this.container.querySelector('input[name="organic_pref"]:checked');
      const notes = this.container.querySelector('#input-notes');
      if (prevCrop) this.formData.prev_crop = prevCrop.value;
      if (budget) this.formData.budget = parseFloat(budget.value);
      if (organic) this.formData.organic_pref = organic.value;
      if (notes) this.formData.notes = notes.value.trim();
    }
    
    // Auto save draft to local storage
    this.saveDraft();
  }

  bindLiveInputs() {
    // Bind all inputs in the current step to save on blur / change
    const inputs = this.container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('change', () => this.saveCurrentStepValues());
      input.addEventListener('input', () => this.saveCurrentStepValues());
    });
  }

  showError(msg) {
    const errorBanner = this.container.querySelector('#validation-error-banner');
    const errorMsg = this.container.querySelector('#validation-error-msg');
    if (errorBanner && errorMsg) {
      errorMsg.textContent = msg;
      errorBanner.classList.remove('hidden');
    }
  }

  hideError() {
    const errorBanner = this.container.querySelector('#validation-error-banner');
    if (errorBanner) {
      errorBanner.classList.add('hidden');
    }
  }

  validateCurrentStep() {
    this.hideError();
    this.saveCurrentStepValues();
    const lang = context.state.language;

    if (this.currentStep === 1) {
      if (!this.formData.name) {
        this.showError('Farmer name is required.');
        this.highlightField('#input-name');
        return false;
      }
      if (!this.formData.district) {
        this.showError('District is required.');
        this.highlightField('#input-district');
        return false;
      }
    } else if (this.currentStep === 2) {
      if (isNaN(this.formData.farm_size) || this.formData.farm_size <= 0) {
        this.showError('Farm size must be a positive number greater than 0.');
        this.highlightField('#input-farm_size');
        return false;
      }
    } else if (this.currentStep === 3) {
      if (isNaN(this.formData.pH) || this.formData.pH < 0 || this.formData.pH > 14) {
        this.showError('Soil pH must be a scientific scale number between 0.0 and 14.0.');
        this.highlightField('#input-pH');
        return false;
      }
      if (isNaN(this.formData.N) || this.formData.N < 0) {
        this.showError('Nitrogen (N) value must be positive.');
        this.highlightField('#input-N');
        return false;
      }
      if (isNaN(this.formData.P) || this.formData.P < 0) {
        this.showError('Phosphorus (P) value must be positive.');
        this.highlightField('#input-P');
        return false;
      }
      if (isNaN(this.formData.K) || this.formData.K < 0) {
        this.showError('Potassium (K) value must be positive.');
        this.highlightField('#input-K');
        return false;
      }
    } else if (this.currentStep === 4) {
      if (isNaN(this.formData.temperature)) {
        this.showError('Temperature is required.');
        this.highlightField('#input-temperature');
        return false;
      }
      if (isNaN(this.formData.humidity) || this.formData.humidity < 0 || this.formData.humidity > 100) {
        this.showError('Humidity must be a percentage between 0 and 100.');
        this.highlightField('#input-humidity');
        return false;
      }
      if (isNaN(this.formData.rainfall) || this.formData.rainfall < 0) {
        this.showError('Rainfall must be a positive number (mm).');
        this.highlightField('#input-rainfall');
        return false;
      }
    } else if (this.currentStep === 5) {
      if (isNaN(this.formData.budget) || this.formData.budget < 0) {
        this.showError('Farming budget must be a positive currency amount (INR).');
        this.highlightField('#input-budget');
        return false;
      }
    }
    return true;
  }

  highlightField(selector) {
    const el = this.container.querySelector(selector);
    if (el) {
      el.focus();
      el.classList.add('border-red-500', 'ring-2', 'ring-red-500/20');
      el.addEventListener('input', () => {
        el.classList.remove('border-red-500', 'ring-2', 'ring-red-500/20');
      }, { once: true });
    }
  }
}
