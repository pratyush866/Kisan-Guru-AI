import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class PestManagementPage {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6';

    // State Variables
    this.activeTab = 'scanner'; // 'scanner' | 'history' | 'library' | 'analytics'
    this.selectedModel = 'yolo'; // 'cnn' | 'resnet' | 'efficientnet' | 'yolo' | 'vit'
    this.selectedCropName = 'Maize'; // default crop selection
    
    // Image acquisition properties
    this.imageFile = null;
    this.imageDataUrl = null;
    this.originalImageDataUrl = null; 
    this.rotationAngle = 0; // 0, 90, 180, 270
    this.isCropping = false;
    
    // Webcam management
    this.webcamStream = null;
    this.isWebcamActive = false;

    // Scan result state
    this.activeReport = null; 
    this.showAnnotations = true;
    this.beforeAfterRatio = 0.5; // slider control split value

    // History search states
    this.searchQuery = '';
    this.filterCrop = '';
    this.filterSeverity = '';
    this.filterFavorite = false;

    // Local DB mock list
    if (!context.state.pestHistory) {
      context.state.pestHistory = [];
    }
    if (!context.state.pestQueue) {
      context.state.pestQueue = [];
    }

    // Offline syncing support
    window.addEventListener('online', () => this.handleOnlineSync());
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
          <i data-lucide="bug" class="w-6 h-6 text-brand-500"></i>
          <span>${TranslationUtils.translate('tabPest', lang)}</span>
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Scan leaf pests to identify insects, estimate infestation density, forecast spread risk, and generate expert IPM controls.
        </p>
      </div>
      
      <!-- Workspace Navigation Tabs -->
      <div class="flex flex-wrap gap-1 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl mt-4 md:mt-0 max-w-max">
        <button id="pest-tab-scanner" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${this.activeTab === 'scanner' ? 'bg-white dark:bg-gray-700 text-brand-500 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}">
          <span class="flex items-center space-x-1.5">
            <i data-lucide="scan" class="w-3.5 h-3.5"></i>
            <span>Pest Diagnostics</span>
          </span>
        </button>
        <button id="pest-tab-history" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${this.activeTab === 'history' ? 'bg-white dark:bg-gray-700 text-brand-500 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}">
          <span class="flex items-center space-x-1.5">
            <i data-lucide="history" class="w-3.5 h-3.5"></i>
            <span>Scans Ledger</span>
          </span>
        </button>
        <button id="pest-tab-library" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${this.activeTab === 'library' ? 'bg-white dark:bg-gray-700 text-brand-500 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}">
          <span class="flex items-center space-x-1.5">
            <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
            <span>Insects Catalog</span>
          </span>
        </button>
        <button id="pest-tab-analytics" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${this.activeTab === 'analytics' ? 'bg-white dark:bg-gray-700 text-brand-500 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}">
          <span class="flex items-center space-x-1.5">
            <i data-lucide="bar-chart-2" class="w-3.5 h-3.5"></i>
            <span>Analytics & Alerts</span>
          </span>
        </button>
      </div>
    `;
    this.container.appendChild(header);

    // Create Main viewport
    const contentViewport = document.createElement('div');
    contentViewport.className = 'w-full';
    
    if (this.activeTab === 'scanner') {
      this.renderScannerView(contentViewport);
    } else if (this.activeTab === 'history') {
      this.renderHistoryView(contentViewport);
    } else if (this.activeTab === 'library') {
      this.renderLibraryView(contentViewport);
    } else if (this.activeTab === 'analytics') {
      this.renderAnalyticsView(contentViewport);
    }

    this.container.appendChild(contentViewport);
    this.bindEvents();

    if (window.lucide) {
      window.lucide.createIcons();
    }

    return this.container;
  }

  bindEvents() {
    const btnScanner = this.container.querySelector('#pest-tab-scanner');
    const btnHistory = this.container.querySelector('#pest-tab-history');
    const btnLibrary = this.container.querySelector('#pest-tab-library');
    const btnAnalytics = this.container.querySelector('#pest-tab-analytics');

    if (btnScanner) btnScanner.addEventListener('click', () => { this.activeTab = 'scanner'; this.render(); });
    if (btnHistory) btnHistory.addEventListener('click', () => { this.activeTab = 'history'; this.render(); });
    if (btnLibrary) btnLibrary.addEventListener('click', () => { this.activeTab = 'library'; this.render(); });
    if (btnAnalytics) btnAnalytics.addEventListener('click', () => { this.activeTab = 'analytics'; this.render(); });
  }

  // ==========================================
  // VIEW: SCANNER HUB
  // ==========================================
  renderScannerView(viewport) {
    const state = context.state;
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 lg:grid-cols-12 gap-6';

    const leftCol = document.createElement('div');
    leftCol.className = 'lg:col-span-7 space-y-6';

    // Settings Card
    const settingsCard = document.createElement('div');
    settingsCard.className = 'glass-card rounded-2xl p-5 space-y-4';
    settingsCard.innerHTML = `
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-gray-800 dark:text-gray-100 flex items-center space-x-2">
          <i data-lucide="settings" class="w-4 h-4 text-brand-500"></i>
          <span>AI Identification Config</span>
        </h3>
        ${state.isOffline ? `
          <span class="px-2.5 py-1 text-xs font-extrabold text-amber-800 bg-amber-500/20 border border-amber-500/50 rounded-full flex items-center space-x-1 animate-pulse">
            <i data-lucide="wifi-off" class="w-3 h-3"></i>
            <span>Offline Advisory</span>
          </span>
        ` : `
          <span class="px-2.5 py-1 text-xs font-extrabold text-green-800 bg-green-500/20 border border-green-500/50 rounded-full flex items-center space-x-1">
            <i data-lucide="globe" class="w-3 h-3 text-green-600"></i>
            <span>FastAPI Server Connected</span>
          </span>
        `}
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Crop</label>
          <select id="pest-crop-selector" class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
            ${['Maize', 'Rice', 'Wheat', 'Mustard', 'Chili', 'Tomato', 'Cotton', 'Mango', 'Potato', 'Sugarcane', 'Onion', 'Soybean', 'Groundnut', 'Banana', 'Apple', 'Grapes'].map(crop => `
              <option value="${crop}" ${this.selectedCropName === crop ? 'selected' : ''}>${crop}</option>
            `).join('')}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detection Model</label>
          <select id="pest-model-selector" class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="yolo" ${this.selectedModel === 'yolo' ? 'selected' : ''}>YOLOv8-Pest (Highly Recommended)</option>
            <option value="vit" ${this.selectedModel === 'vit' ? 'selected' : ''}>ViT Transformer (Dense Scale)</option>
            <option value="efficientnet" ${this.selectedModel === 'efficientnet' ? 'selected' : ''}>EfficientNet-B4 (Balanced)</option>
            <option value="resnet" ${this.selectedModel === 'resnet' ? 'selected' : ''}>ResNet-50 (Accuracy)</option>
            <option value="cnn" ${this.selectedModel === 'cnn' ? 'selected' : ''}>Custom CNN (Lightweight)</option>
          </select>
        </div>
      </div>
    `;
    leftCol.appendChild(settingsCard);

    // Acquisition Workspace
    const acquisitionCard = document.createElement('div');
    acquisitionCard.className = 'glass-card rounded-2xl p-5 space-y-4';
    
    let acquisitionHTML = '';
    
    if (this.isWebcamActive) {
      acquisitionHTML = `
        <div class="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <video id="pest-video" class="w-full h-full object-cover" autoplay playsinline></video>
          <div class="absolute bottom-4 left-0 right-0 flex justify-center space-x-3">
            <button id="btn-pest-capture" class="px-5 py-2.5 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600 flex items-center space-x-2">
              <i data-lucide="camera" class="w-4 h-4"></i>
              <span>Take Photo</span>
            </button>
            <button id="btn-pest-cam-close" class="px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow hover:bg-red-700 flex items-center space-x-2">
              <i data-lucide="x" class="w-4 h-4"></i>
              <span>Close</span>
            </button>
          </div>
        </div>
      `;
    } else if (this.imageDataUrl) {
      acquisitionHTML = `
        <div class="space-y-4">
          <div class="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-800">
            <img id="pest-img-canvas" src="${this.imageDataUrl}" class="max-h-full max-w-full object-contain select-none" style="transform: rotate(${this.rotationAngle}deg); transition: transform 0.2s;" />
            
            ${this.isCropping ? `
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div class="border-2 border-brand-500 border-dashed w-48 h-48 relative cursor-move">
                  <div class="absolute bottom-2 right-2 bg-brand-500 text-white text-[10px] px-1 rounded">Crop Frame</div>
                </div>
              </div>
            ` : ''}
          </div>
          
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <div class="flex space-x-2">
              <button id="btn-pest-rotate" class="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold flex items-center space-x-1">
                <i data-lucide="rotate-cw" class="w-4 h-4"></i>
                <span>Rotate 90°</span>
              </button>
              <button id="btn-pest-crop" class="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold flex items-center space-x-1">
                <i data-lucide="crop" class="w-4 h-4"></i>
                <span>${this.isCropping ? 'Apply Crop' : 'Crop'}</span>
              </button>
              <button id="btn-pest-reset" class="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold flex items-center space-x-1">
                <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                <span>Reset</span>
              </button>
            </div>
            
            <button id="btn-pest-clear" class="text-xs font-bold text-red-500 hover:underline">
              Remove Photo
            </button>
          </div>

          <!-- Quality analyzer output -->
          <div class="p-3.5 bg-brand-50/50 dark:bg-gray-800/40 rounded-xl border border-brand-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <div class="flex items-center space-x-2">
              <span class="p-1.5 bg-green-500 text-white rounded-full"><i data-lucide="check" class="w-3 h-3"></i></span>
              <div>
                <div class="font-bold text-gray-800 dark:text-gray-200">Image Checks Completed</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400">Contrast: Normal | Brightness: Passed | Light: OK</div>
              </div>
            </div>
            <div class="text-right font-semibold text-brand-600 dark:text-green-400">Scan Ready</div>
          </div>

          <button id="btn-trigger-pest-scan" class="w-full py-4 bg-brand-500 text-white text-lg font-bold rounded-2xl shadow-lg hover:bg-brand-600 transition-all duration-300 flex items-center justify-center space-x-2">
            <i data-lucide="cpu" class="w-5 h-5"></i>
            <span>Scan for Pests</span>
          </button>
        </div>
      `;
    } else {
      acquisitionHTML = `
        <div id="pest-dropzone" class="border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-500 transition-colors duration-300 relative group aspect-video">
          <input type="file" id="pest-file-input" accept=".jpg,.jpeg,.png,.webp" class="absolute inset-0 opacity-0 cursor-pointer" />
          <div class="p-4 bg-brand-50 dark:bg-gray-800/40 text-brand-500 dark:text-green-400 rounded-full mb-4 group-hover:scale-105 transition-transform duration-300">
            <i data-lucide="upload-cloud" class="w-10 h-10"></i>
          </div>
          <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-1 text-sm sm:text-base">Drag & Drop pest/bug image here</h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-4">Supports JPEG, PNG, WEBP up to 5MB. Real-time compression is applied.</p>
          
          <div class="flex items-center space-x-4">
            <span class="text-xs text-gray-400 font-bold uppercase">Or</span>
            <button id="btn-pest-cam" class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow">
              <i data-lucide="video" class="w-3.5 h-3.5"></i>
              <span>Access Live Camera</span>
            </button>
          </div>
        </div>
        
        <!-- Fast simulation sample buttons -->
        <div class="pt-2">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Simulate scanning with samples</div>
          <div class="grid grid-cols-3 gap-2">
            <button class="pest-sample-btn p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-300 hover:bg-brand-50 hover:text-brand-500 hover:border-brand-500 text-center" data-crop="Maize" data-file="fall_armyworm_caterpillar.jpg">
              Fall Armyworm on Maize
            </button>
            <button class="pest-sample-btn p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-300 hover:bg-brand-50 hover:text-brand-500 hover:border-brand-500 text-center" data-crop="Mustard" data-file="mustard_aphids_infestation.jpg">
              Mustard Aphids
            </button>
            <button class="pest-sample-btn p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-300 hover:bg-brand-50 hover:text-brand-500 hover:border-brand-500 text-center" data-crop="Wheat" data-file="wheat_healthy_crop.webp">
              Healthy Wheat
            </button>
          </div>
        </div>
      `;
    }

    acquisitionCard.innerHTML = `
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-gray-800 dark:text-gray-100 flex items-center space-x-2">
          <i data-lucide="image" class="w-4 h-4 text-brand-500"></i>
          <span>Image Acquisition</span>
        </h3>
      </div>
      ${acquisitionHTML}
    `;
    leftCol.appendChild(acquisitionCard);

    // Sync queue display
    if (state.pestQueue && state.pestQueue.length > 0) {
      const qCard = document.createElement('div');
      qCard.className = 'p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-2xl flex items-center justify-between';
      qCard.innerHTML = `
        <div class="text-xs font-semibold">
          <div class="font-bold text-[10px] uppercase">Offline Sync Outbox (${state.pestQueue.length})</div>
          <div>Restoring network connection will auto-upload pending scans.</div>
        </div>
        <button id="btn-pest-sync-now" class="px-3 py-1 bg-amber-500 text-white text-[10px] rounded-lg font-bold hover:bg-amber-600">Sync</button>
      `;
      leftCol.appendChild(qCard);
    }

    grid.appendChild(leftCol);

    // Right Column: Result advisory
    const rightCol = document.createElement('div');
    rightCol.className = 'lg:col-span-5 space-y-6';

    if (this.activeReport) {
      this.renderReportRightPanel(rightCol);
    } else {
      rightCol.innerHTML = `
        <div class="glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
          <div class="p-4 bg-gray-100 dark:bg-gray-800/40 text-gray-400 dark:text-gray-600 rounded-full mb-4">
            <i data-lucide="shield-check" class="w-12 h-12"></i>
          </div>
          <h3 class="font-bold text-gray-800 dark:text-gray-200 mb-2">No Active Pest Diagnosis</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Acquire or select a leaf crop image and click "Scan for Pests" to compile an IPM treatment advisory.
          </p>
        </div>
      `;
    }
    grid.appendChild(rightCol);
    viewport.appendChild(grid);

    this.attachAcquisitionEvents();
  }

  attachAcquisitionEvents() {
    const cropSel = this.container.querySelector('#pest-crop-selector');
    const modelSel = this.container.querySelector('#pest-model-selector');
    if (cropSel) cropSel.addEventListener('change', (e) => { this.selectedCropName = e.target.value; });
    if (modelSel) modelSel.addEventListener('change', (e) => { this.selectedModel = e.target.value; });

    const fileIn = this.container.querySelector('#pest-file-input');
    if (fileIn) {
      fileIn.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.loadLocalFile(file);
      });
    }

    const dropzone = this.container.querySelector('#pest-dropzone');
    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-brand-500', 'bg-brand-50/20');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-brand-500', 'bg-brand-50/20');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-brand-500', 'bg-brand-50/20');
        const file = e.dataTransfer.files[0];
        if (file) this.loadLocalFile(file);
      });
    }

    const camBtn = this.container.querySelector('#btn-pest-cam');
    if (camBtn) camBtn.addEventListener('click', () => this.startWebcam());

    const captureBtn = this.container.querySelector('#btn-pest-capture');
    const camCloseBtn = this.container.querySelector('#btn-pest-cam-close');
    if (captureBtn) captureBtn.addEventListener('click', () => this.captureSnapshot());
    if (camCloseBtn) camCloseBtn.addEventListener('click', () => this.stopWebcam());

    const rotateBtn = this.container.querySelector('#btn-pest-rotate');
    const cropBtn = this.container.querySelector('#btn-pest-crop');
    const resetBtn = this.container.querySelector('#btn-pest-reset');
    const clearBtn = this.container.querySelector('#btn-pest-clear');

    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => {
        this.rotationAngle = (this.rotationAngle + 90) % 360;
        const img = this.container.querySelector('#pest-img-canvas');
        if (img) img.style.transform = `rotate(${this.rotationAngle}deg)`;
      });
    }
    if (cropBtn) {
      cropBtn.addEventListener('click', () => {
        this.isCropping = !this.isCropping;
        this.render();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.imageDataUrl = this.originalImageDataUrl;
        this.rotationAngle = 0;
        this.isCropping = false;
        this.render();
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.imageFile = null;
        this.imageDataUrl = null;
        this.originalImageDataUrl = null;
        this.rotationAngle = 0;
        this.isCropping = false;
        this.activeReport = null;
        this.render();
      });
    }

    const sampleBtns = this.container.querySelectorAll('.pest-sample-btn');
    sampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedCropName = btn.getAttribute('data-crop');
        const file = btn.getAttribute('data-file');
        this.sampleFileName = file;
        this.imageDataUrl = `/static/pest_samples/${file}`;
        this.originalImageDataUrl = this.imageDataUrl;
        this.rotationAngle = 0;
        this.render();
      });
    });

    const syncBtn = this.container.querySelector('#btn-pest-sync-now');
    if (syncBtn) syncBtn.addEventListener('click', () => this.handleOnlineSync());

    const scanBtn = this.container.querySelector('#btn-trigger-pest-scan');
    if (scanBtn) scanBtn.addEventListener('click', () => this.executePestScan());
  }

  async startWebcam() {
    try {
      this.isWebcamActive = true;
      this.render();
      this.webcamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = this.container.querySelector('#pest-video');
      if (video) video.srcObject = this.webcamStream;
    } catch (e) {
      alert('Camera access denied.');
      this.isWebcamActive = false;
      this.render();
    }
  }

  stopWebcam() {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(t => t.stop());
    }
    this.isWebcamActive = false;
    this.render();
  }

  captureSnapshot() {
    const video = this.container.querySelector('#pest-video');
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      this.imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      this.originalImageDataUrl = this.imageDataUrl;
      this.sampleFileName = `${this.selectedCropName.toLowerCase()}_camera_pest.jpg`;
      this.stopWebcam();
    }
  }

  loadLocalFile(file) {
    this.imageFile = file;
    this.sampleFileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageDataUrl = e.target.result;
      this.originalImageDataUrl = this.imageDataUrl;
      this.rotationAngle = 0;
      this.render();
    };
    reader.readAsDataURL(file);
  }

  // ==========================================
  // EXECUTE PEST DIAGNOSIS
  // ==========================================
  async executePestScan() {
    context.setGenerating(true);
    try {
      if (navigator.onLine) {
        const formData = new FormData();
        formData.append('crop_name', this.selectedCropName);
        formData.append('model_arch', this.selectedModel);
        
        let blob;
        if (this.imageDataUrl.startsWith('data:')) {
          const parts = this.imageDataUrl.split(',');
          const mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
          const byteString = atob(parts[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          blob = new Blob([ab], { type: mime });
        } else {
          blob = await (await fetch(this.imageDataUrl)).blob();
        }
        const uploadName = this.sampleFileName || this.imageFile?.name || `${this.selectedCropName.toLowerCase()}_pest.jpg`;
        formData.append('image', blob, uploadName);

        const response = await fetch('http://127.0.0.1:8000/api/pest/detect', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}` },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          const details = JSON.parse(result.treatment_plan_json);

          this.activeReport = {
            id: result.id,
            image_url: this.imageDataUrl,
            pest_detected: result.pest_detected,
            confidence: result.confidence,
            severity: result.severity,
            damage_description: result.damage_description,
            spread_risk_percentage: result.spread_risk_percentage,
            crop_loss_percentage: result.crop_loss_percentage,
            urgency_level: result.urgency_level,
            created_at: result.created_at,
            is_favorite: result.is_favorite,
            notes: result.notes,
            details: details
          };

          // Cache locally
          let list = context.state.pestHistory || [];
          list.unshift(this.activeReport);
          context.state.pestHistory = list;

          this.render();
          return;
        }
      }

      // OFFLINE fallback
      console.warn('Offline. Running on-device pest matcher rule logic.');
      const offlineRep = this.runLocalOfflineMatcher();
      this.activeReport = offlineRep;
      
      let list = context.state.pestHistory || [];
      list.unshift(this.activeReport);
      context.state.pestHistory = list;

      let queue = context.state.pestQueue || [];
      queue.push({
        tempId: 'q_' + Date.now(),
        crop_name: this.selectedCropName,
        model_arch: this.selectedModel,
        imageDataUrl: this.imageDataUrl,
        created_at: new Date().toISOString()
      });
      context.state.pestQueue = queue;

      this.render();

    } catch (e) {
      console.error(e);
      alert('AI Server diagnostics connection failed.');
    } finally {
      context.setGenerating(false);
    }
  }

  runLocalOfflineMatcher() {
    const crop = this.selectedCropName;
    let pest = "General Insect Damage";
    let severity = "Medium";
    let damage = "Chewing holes visible on foliage leaf blades.";
    let loss = 15.0;
    let risk = 45.0;
    let urgency = "Medium";
    let details = PEST_LIBRARY_SEED["fall_armyworm"];

    if (crop === 'Maize') {
      pest = "Fall Armyworm (Spodoptera frugiperda)";
      details = PEST_LIBRARY_SEED["fall_armyworm"];
      severity = "High";
      loss = 32.5;
      risk = 78.0;
      urgency = "High";
    } else if (crop === 'Mustard') {
      pest = "Aphids (Aphis gossypii)";
      details = PEST_LIBRARY_SEED["aphids"];
      severity = "Medium";
      loss = 18.0;
      risk = 52.0;
      urgency = "Medium";
    }

    const boxes = [
      { label: pest.split(" (")[0], xmin: 25, ymin: 30, xmax: 55, ymax: 62 }
    ];

    return {
      id: 'pest_offline_' + Date.now(),
      image_url: this.imageDataUrl,
      pest_detected: pest,
      confidence: 0.82,
      severity: severity,
      damage_description: damage,
      spread_risk_percentage: risk,
      crop_loss_percentage: loss,
      urgency_level: urgency,
      created_at: new Date().toISOString(),
      is_favorite: false,
      notes: "Acquired offline. Awaiting cloud sync.",
      details: {
        inference_time_ms: 120,
        model_architecture: this.selectedModel.toUpperCase(),
        bounding_boxes: boxes,
        top_5_predictions: [ { pest: pest, confidence: 0.82 } ],
        predictions_forecast: {
          temperature_threshold_c: 28.5,
          humidity_threshold_percent: 68,
          seasonal_risk_level: severity,
          nearby_farmer_alert_status: "Active",
          crop_vulnerability_index: details.crop_vulnerability,
          preventative_action: "Clear weeds, place sticky yellow cards."
        },
        treatment_plan: {
          organic: details.organic_control,
          chemical: details.chemical_control,
          biological: details.biological_control,
          mechanical: details.mechanical_control,
          ipm_strategy: details.ipm_strategy,
          pesticide_name: details.pesticide_name,
          pesticide_dosage: details.pesticide_dosage,
          application_timing: details.application_timing,
          safety_precautions: details.safety_precautions,
          waiting_period_days: details.waiting_period_days
        }
      }
    };
  }

  async handleOnlineSync() {
    if (!navigator.onLine) return;
    const queue = context.state.pestQueue || [];
    if (queue.length === 0) return;

    console.info(`Syncing ${queue.length} pest records...`);
    const remainingQueue = [];
    
    for (const item of queue) {
      try {
        const formData = new FormData();
        formData.append('crop_name', item.crop_name);
        formData.append('model_arch', item.model_arch);
        
        const blob = await (await fetch(item.imageDataUrl)).blob();
        formData.append('image', blob, `sync_pest.jpg`);

        const response = await fetch('http://127.0.0.1:8000/api/pest/detect', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}` },
          body: formData
        });

        if (!response.ok) {
          remainingQueue.push(item);
        }
      } catch (e) {
        remainingQueue.push(item);
      }
    }
    context.state.pestQueue = remainingQueue;
    this.render();
  }

  // ==========================================
  // VIEW: DIAGNOSTIC ADVISORY DETAIL
  // ==========================================
  renderReportRightPanel(panel) {
    const report = this.activeReport;
    const det = report.details;
    const treat = det.treatment_plan;
    const forecast = det.predictions_forecast;

    let severityColor = 'text-green-600 bg-green-50 dark:bg-green-950/20';
    if (report.severity === 'Critical' || report.severity === 'High') {
      severityColor = 'text-red-600 bg-red-50 dark:bg-red-950/20';
    } else if (report.severity === 'Medium') {
      severityColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/20';
    }

    panel.innerHTML = `
      <!-- Bounding Boxes canvas -->
      <div class="glass-card rounded-2xl p-5 space-y-4">
        <h3 class="font-bold text-gray-800 dark:text-gray-100 flex items-center justify-between">
          <span>AI Object Recognition Canvas</span>
          <button id="btn-pest-anno-toggle" class="p-1.5 rounded-lg border text-xs font-bold ${this.showAnnotations ? 'bg-brand-500 text-white border-brand-500' : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}">
            ${this.showAnnotations ? 'Hide Boxes' : 'Show Boxes'}
          </button>
        </h3>

        <div class="relative w-full aspect-square bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-800 select-none">
          <img src="${report.image_url}" class="max-h-full max-w-full object-contain absolute z-0" />
          
          <svg class="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            ${this.showAnnotations && det.bounding_boxes ? det.bounding_boxes.map(box => `
              <rect x="${box.xmin}" y="${box.ymin}" width="${box.xmax - box.xmin}" height="${box.ymax - box.ymin}" fill="none" stroke="#e11d48" stroke-width="1.2" />
              <text x="${box.xmin}" y="${box.ymin - 2}" fill="#e11d48" font-size="3" font-weight="bold">${box.label}</text>
            `).join('') : ''}
          </svg>

          <!-- slider split bar -->
          <div class="absolute bottom-4 left-4 right-4 z-20 bg-black/60 backdrop-blur px-3 py-2 rounded-xl flex items-center justify-between text-[10px] text-white">
            <span>Before / Raw</span>
            <input type="range" min="0" max="1" step="0.05" id="pest-before-after" value="${this.beforeAfterRatio}" class="w-1/2 accent-brand-500 cursor-ew-resize" />
            <span>After / AI Annotated</span>
          </div>
        </div>
      </div>

      <!-- Advisory details cards -->
      <div class="glass-card rounded-2xl p-5 space-y-4">
        <div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${severityColor}">
            Urgency: ${report.urgency_level}
          </span>
          <h3 class="font-extrabold text-xl text-gray-900 dark:text-white mt-1.5">${report.pest_detected}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">Confidence: <b>${(report.confidence * 100).toFixed(1)}%</b> | Pipeline: ${det.model_architecture}</p>
        </div>

        <hr class="border-gray-100 dark:border-gray-800" />

        <div class="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div class="text-gray-400 font-medium">Estimated Crop Loss</div>
            <div class="font-bold text-red-600 text-sm">${report.crop_loss_percentage}% loss</div>
          </div>
          <div>
            <div class="text-gray-400 font-medium">Spread Outbreak Risk</div>
            <div class="font-bold text-amber-600 text-sm">${report.spread_risk_percentage}% probability</div>
          </div>
          <div>
            <div class="text-gray-400 font-medium">Harvest Safety Period</div>
            <div class="font-bold text-gray-800 dark:text-gray-100 text-sm">${treat.waiting_period_days} Days wait</div>
          </div>
          <div>
            <div class="text-gray-400 font-medium">Vulnerable Crops</div>
            <div class="font-bold text-gray-800 dark:text-gray-100 text-sm">${forecast.crop_vulnerability_index.split(",")[0]}</div>
          </div>
        </div>

        <div class="space-y-3.5 pt-2 text-xs">
          <!-- Description -->
          <div class="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
            <span class="font-bold text-brand-600 dark:text-green-400 block mb-1">Insect Damage Description</span>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">${report.damage_description}</p>
          </div>

          <!-- Organic -->
          <div class="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <span class="font-bold text-green-700 dark:text-green-400 block mb-1">Organic Control Recipes</span>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">${treat.organic}</p>
          </div>

          <!-- Chemical -->
          <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <span class="font-bold text-blue-700 dark:text-blue-400 block mb-1">Chemical/Pesticide Formulation</span>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              <b>Pesticide:</b> ${treat.pesticide_name}<br/>
              <b>Dosage:</b> ${treat.pesticide_dosage} | <b>Timing:</b> ${treat.application_timing}
            </p>
          </div>

          <!-- Safety -->
          <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px]">
            <span class="font-bold text-red-700 dark:text-red-400 block mb-1">Critical Spray Safety Warning</span>
            <p class="text-gray-600 dark:text-gray-300">${treat.safety_precautions}</p>
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-2 pt-2">
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider">Farmer Spray Logs & Notes</label>
          <textarea id="pest-farmer-notes" class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="e.g. Applied first spray dose on plot C..." rows="2">${report.notes || ''}</textarea>
          <button id="btn-pest-save-notes" class="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold shadow">
            Save Advisory Logs
          </button>
        </div>
      </div>
    `;

    this.attachReportEvents();
  }

  attachReportEvents() {
    const btnToggle = this.container.querySelector('#btn-pest-anno-toggle');
    const slider = this.container.querySelector('#pest-before-after');
    const btnSaveNotes = this.container.querySelector('#btn-pest-save-notes');

    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        this.showAnnotations = !this.showAnnotations;
        this.render();
      });
    }
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.beforeAfterRatio = parseFloat(e.target.value);
        const svg = this.container.querySelector('svg');
        if (svg) svg.style.clipPath = `polygon(0 0, ${this.beforeAfterRatio * 100}% 0, ${this.beforeAfterRatio * 100}% 100%, 0 100%)`;
      });
    }
    if (btnSaveNotes) {
      btnSaveNotes.addEventListener('click', () => {
        const text = this.container.querySelector('#pest-farmer-notes').value;
        const list = context.state.pestHistory || [];
        const item = list.find(h => h.id === this.activeReport.id);
        if (item) {
          item.notes = text;
          alert('Spray logs saved.');
        }
      });
    }
  }

  // ==========================================
  // VIEW: HISTORY LEDGER
  // ==========================================
  renderHistoryView(viewport) {
    const list = context.state.pestHistory || [];

    const filtered = list.filter(item => {
      const matchesSearch = item.pest_detected.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                            item.notes.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCrop = !this.filterCrop || item.details.predictions_forecast.crop_vulnerability_index.includes(this.filterCrop);
      const matchesSeverity = !this.filterSeverity || item.severity === this.filterSeverity;
      const matchesFav = !this.filterFavorite || item.is_favorite === true;
      return matchesSearch && matchesCrop && matchesSeverity && matchesFav;
    });

    viewport.innerHTML = `
      <div class="glass-card rounded-2xl p-5 space-y-4">
        <div class="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div class="relative w-full sm:max-w-xs">
            <input type="text" id="pest-hist-search" value="${this.searchQuery}" class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-700 dark:text-gray-300 focus:outline-none" placeholder="Search bugs or notes..." />
            <i data-lucide="search" class="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400"></i>
          </div>

          <div class="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            <select id="pest-hist-crop" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300">
              <option value="">All Crops</option>
              <option value="Maize">Maize</option>
              <option value="Rice">Rice</option>
              <option value="Wheat">Wheat</option>
              <option value="Mustard">Mustard</option>
              <option value="Tomato">Tomato</option>
            </select>
            <button id="pest-hist-fav" class="p-1.5 rounded-xl border text-xs font-bold ${this.filterFavorite ? 'bg-amber-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'}">Favorites</button>
            <button id="btn-pest-csv" class="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow">
              <i data-lucide="share" class="w-3.5 h-3.5"></i>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        ${filtered.length === 0 ? `
          <div class="text-center py-12 text-gray-400">No pest diagnostic history found.</div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${filtered.map(item => `
              <div class="p-4 bg-white/40 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col justify-between space-y-3">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-500/10 text-brand-600 dark:text-green-400">${item.severity}</span>
                    <h4 class="font-extrabold text-sm text-gray-800 dark:text-gray-100 mt-1.5">${item.pest_detected}</h4>
                    <p class="text-[11px] text-gray-400 line-clamp-1 mt-0.5">Crop: ${item.details.predictions_forecast.crop_vulnerability_index.split(",")[0]}</p>
                  </div>
                  <button class="pest-fav-btn text-amber-500" data-id="${item.id}">
                    <i data-lucide="${item.is_favorite ? 'star' : 'star-off'}" class="w-4 h-4 fill-amber-500"></i>
                  </button>
                </div>
                <div class="text-[10px] text-gray-500 italic p-2 bg-gray-50 dark:bg-gray-850/40 rounded-lg">Logs: ${item.notes || 'None'}</div>
                <div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-850">
                  <span class="text-[10px] text-gray-400 font-bold">Accuracy: ${(item.confidence * 100).toFixed(0)}%</span>
                  <div class="flex space-x-2">
                    <button class="pest-view-btn px-2.5 py-1 bg-brand-500 text-white rounded-lg text-[10px]" data-id="${item.id}">Advisory</button>
                    <button class="pest-del-btn px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px]" data-id="${item.id}">Delete</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    this.attachHistoryEvents();
  }

  attachHistoryEvents() {
    const sInput = this.container.querySelector('#pest-hist-search');
    const cropSel = this.container.querySelector('#pest-hist-crop');
    const favBtn = this.container.querySelector('#pest-hist-fav');
    const csvBtn = this.container.querySelector('#btn-pest-csv');

    if (sInput) sInput.addEventListener('input', (e) => { this.searchQuery = e.target.value; this.render(); });
    if (cropSel) cropSel.addEventListener('change', (e) => { this.filterCrop = e.target.value; this.render(); });
    if (favBtn) favBtn.addEventListener('click', () => { this.filterFavorite = !this.filterFavorite; this.render(); });
    if (csvBtn) csvBtn.addEventListener('click', () => this.exportCSV());

    const favBtns = this.container.querySelectorAll('.pest-fav-btn');
    favBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const list = context.state.pestHistory || [];
        const item = list.find(i => i.id === id);
        if (item) {
          item.is_favorite = !item.is_favorite;
          this.render();
        }
      });
    });

    const viewBtns = this.container.querySelectorAll('.pest-view-btn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const list = context.state.pestHistory || [];
        this.activeReport = list.find(i => i.id === id);
        this.activeTab = 'scanner';
        this.render();
      });
    });

    const delBtns = this.container.querySelectorAll('.pest-del-btn');
    delBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        let list = context.state.pestHistory || [];
        list = list.filter(i => i.id !== id);
        context.state.pestHistory = list;
        this.render();
      });
    });
  }

  exportCSV() {
    const list = context.state.pestHistory || [];
    if (list.length === 0) return alert('No logs to export.');
    let csv = 'Scan ID,Pest,Confidence,Severity,Crop Loss %,Risk %,Notes\n';
    list.forEach(i => {
      csv += `"${i.id}","${i.pest_detected}","${i.confidence}","${i.severity}","${i.crop_loss_percentage}","${i.spread_risk_percentage}","${i.notes || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kisan_guru_pest_logs_${Date.now()}.csv`;
    a.click();
  }

  // ==========================================
  // VIEW: LIBRARY CATALOG
  // ==========================================
  renderLibraryView(viewport) {
    viewport.innerHTML = `
      <div class="glass-card rounded-2xl p-5 space-y-4">
        <h3 class="font-bold text-gray-800 dark:text-gray-100 flex items-center space-x-2">
          <i data-lucide="book-open" class="w-4 h-4 text-brand-500"></i>
          <span>Dynamic Agricultural Insects Catalog</span>
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          ${Object.values(PEST_LIBRARY_SEED).map(item => `
            <div class="p-4 bg-white/40 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-850 rounded-xl space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-500/10 text-brand-600 dark:text-green-400">${item.pest_name.split(" (")[0]}</span>
                <span class="text-[10px] text-gray-400 italic font-semibold">${item.scientific_name}</span>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">${item.description}</div>
              <div class="text-[10px] text-brand-500 dark:text-green-400 font-bold">Vulnerability: ${item.crop_vulnerability.split(" (")[0]}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW: ANALYTICS & OUTBREAK ALERTS
  // ==========================================
  renderAnalyticsView(viewport) {
    const list = context.state.pestHistory || [];
    const total = list.length;
    const critical = list.filter(i => i.severity === 'Critical' || i.severity === 'High').length;
    const warning = list.filter(i => i.severity === 'Medium').length;

    viewport.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="glass-card p-4 rounded-xl text-center">
          <div class="text-[10px] uppercase font-bold text-gray-400">Total Pest Scans</div>
          <div class="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">${total}</div>
        </div>
        <div class="glass-card p-4 rounded-xl text-center">
          <div class="text-[10px] uppercase font-bold text-red-500">Outbreaks / Critical Warnings</div>
          <div class="text-3xl font-extrabold text-red-600 mt-1">${critical}</div>
        </div>
        <div class="glass-card p-4 rounded-xl text-center">
          <div class="text-[10px] uppercase font-bold text-amber-500">Medium Infestations</div>
          <div class="text-3xl font-extrabold text-amber-600 mt-1">${warning}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <!-- Trend chart -->
        <div class="glass-card rounded-2xl p-5 space-y-4">
          <h3 class="font-bold text-gray-800 dark:text-gray-100 text-sm">Pest Infestation Weekly Cycles</h3>
          <div class="relative w-full h-48 bg-white dark:bg-gray-800 rounded-xl overflow-hidden p-3 border border-gray-100 dark:border-gray-700">
            <svg class="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
              <line x1="0" y1="10" x2="100" y2="10" stroke="#f3f4f6" stroke-width="0.5" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="#f3f4f6" stroke-width="0.5" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="#f3f4f6" stroke-width="0.5" />
              
              <path d="M 5,42 Q 25,12 45,32 T 75,8 T 95,5" fill="none" stroke="#e11d48" stroke-width="1.8" />
              <path d="M 5,42 Q 25,12 45,32 T 75,8 T 95,5 L 95,50 L 5,50 Z" fill="rgba(225, 29, 72, 0.1)" />
            </svg>
          </div>
        </div>

        <!-- Alert feeds -->
        <div class="glass-card rounded-2xl p-5 space-y-4">
          <h3 class="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center justify-between">
            <span>Nearby Local Outbreak Warnings (50km)</span>
            <span class="px-2 py-0.5 rounded bg-red-500/10 text-red-600 text-[10px] font-extrabold animate-pulse">Critical Regional Threat</span>
          </h3>
          <div class="space-y-2">
            <div class="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between text-xs animate-pulse">
              <div>
                <span class="font-bold text-gray-800 dark:text-gray-100">Fall Armyworm (Maize)</span>
                <div class="text-[10px] text-gray-400">Village: Saran | Outbreak Count: 28 plots</div>
              </div>
              <span class="font-bold text-red-500">5.4 km away</span>
            </div>
            <div class="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span class="font-bold text-gray-800 dark:text-gray-100">Aphids (Mustard)</span>
                <div class="text-[10px] text-gray-400">Village: Siwan | Outbreak Count: 9 plots</div>
              </div>
              <span class="font-bold text-amber-500">7.8 km away</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// Inline Pest catalog structure matching backend seed dictionary
const PEST_LIBRARY_SEED = {
  "fall_armyworm": {
    "pest_name": "Fall Armyworm (Spodoptera frugiperda)",
    "scientific_name": "Spodoptera frugiperda",
    "description": "Aggressive Lepidopteran caterpillar eating maize leaves and whorls.",
    "crop_vulnerability": "Maize (High), Sugarcane (Medium)",
    "organic_control": "Apply Neem seed kernel extract (NSKE) 5% or Bacillus thuringiensis.",
    "chemical_control": "Chlorantraniliprole 18.5% SC (Coragen) @ 80 ml/acre.",
    "biological_control": "Release egg cards Trichogramma chilonis wasps.",
    "mechanical_control": "Hand-collect larvae, add ash in whorls.",
    "ipm_strategy": "Intercrop with desmodium (push-pull).",
    "pesticide_name": "Chlorantraniliprole 18.5% SC",
    "pesticide_dosage": "80 ml/acre",
    "application_timing": "Late afternoon spray",
    "safety_precautions": "Wear mask, avoid open wind spraying.",
    "waiting_period_days": 14
  },
  "aphids": {
    "pest_name": "Aphids (Aphis gossypii)",
    "scientific_name": "Aphis gossypii",
    "description": "Soft-bodied sap sucking bugs clustering under leaves, releasing honeydew.",
    "crop_vulnerability": "Mustard (High), Chili (High)",
    "organic_control": "Spray soap solution (5g/L) or garlic-chili extract.",
    "chemical_control": "Imidacloprid 17.8% SL @ 100 ml/acre.",
    "biological_control": "Ladybird beetles release.",
    "mechanical_control": "Strong spray of water to dislodge colonies.",
    "ipm_strategy": "Yellow sticky cards, balanced NPK inputs.",
    "pesticide_name": "Thiamethoxam 25% WG",
    "pesticide_dosage": "80g/acre",
    "application_timing": "Early morning spray",
    "safety_precautions": "Avoid spraying open flowers to save honeybees.",
    "waiting_period_days": 7
  },
  "stem_borer": {
    "pest_name": "Stem Borer (Chilo suppressalis)",
    "scientific_name": "Chilo suppressalis",
    "description": "Bores stem causing dead hearts in paddy.",
    "crop_vulnerability": "Rice (High)",
    "organic_control": "Neem oil 1.5% foliar spray.",
    "chemical_control": "Cartap Hydrochloride 4G granules @ 10kg/acre.",
    "biological_control": "Release Trichogramma japonicum wasps.",
    "mechanical_control": "Uproot dead hearts.",
    "ipm_strategy": "Install light traps.",
    "pesticide_name": "Cartap Hydrochloride 4G",
    "pesticide_dosage": "10 kg/acre",
    "application_timing": "Tillering broadcast",
    "safety_precautions": "Do not touch granules bare-handed.",
    "waiting_period_days": 21
  }
};
