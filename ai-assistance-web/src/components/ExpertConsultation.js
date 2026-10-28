import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class ExpertConsultation {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6 pb-24';
    
    // Booking states
    this.selectedExpert = null;
    this.bookingDate = '';
    this.bookingTime = '10:00 AM';
    this.bookingDesc = '';
    this.callActive = false;
    this.callDuration = 0;
    this.callInterval = null;

    // Local experts catalog
    this.experts = [
      { id: 'ex1', name: 'Dr. Ramesh Chandra', role: 'Chief Agronomist', specialty: 'Cereals & Fertilizers', exp: '15 Yrs', rating: 4.9, img: '👨‍🌾', charge: 'Free (Govt. Sponsored)', availability: 'Available Today' },
      { id: 'ex2', name: 'Dr. Priya Sharma', role: 'Veterinary Surgeon', specialty: 'Cattle & Livestock', exp: '10 Yrs', rating: 4.8, img: '👩‍⚕️', charge: 'Free (Govt. Sponsored)', availability: 'Available Tomorrow' },
      { id: 'ex3', name: 'Dr. Amit Verma', role: 'Soil Pathologist', specialty: 'Soil Micro-nutrients', exp: '12 Yrs', rating: 4.7, img: '👨‍🔬', charge: 'Free (Govt. Sponsored)', availability: 'Available Today' }
    ];
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
        <i data-lucide="phone-call" class="w-6 h-6 text-brand-500"></i>
        <span>Krishi Expert Teleconsultation</span>
      </h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Book virtual voice or video consultations with government agronomists and veterinarians</p>
    `;
    this.container.appendChild(header);

    // Experts Grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-3 gap-6';
    grid.innerHTML = this.experts.map(ex => `
      <div class="glass-card rounded-3xl p-5 border border-white/10 flex flex-col justify-between space-y-4">
        <div class="space-y-3">
          <div class="flex items-center space-x-3">
            <span class="w-12 h-12 rounded-2xl bg-brand-500/10 text-2xl flex items-center justify-center">${ex.img}</span>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">${ex.name}</h4>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">${ex.role}</p>
            </div>
          </div>
          
          <div class="space-y-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
            <div class="flex justify-between">
              <span>Specialty:</span>
              <span class="text-slate-800 dark:text-slate-200">${ex.specialty}</span>
            </div>
            <div class="flex justify-between">
              <span>Experience:</span>
              <span class="text-slate-800 dark:text-slate-200">${ex.exp}</span>
            </div>
            <div class="flex justify-between">
              <span>Rating:</span>
              <span class="text-brand-600 dark:text-green-400 flex items-center"><i data-lucide="star" class="w-3 h-3 fill-current mr-0.5"></i>${ex.rating}</span>
            </div>
            <div class="flex justify-between">
              <span>Availability:</span>
              <span class="text-green-600">${ex.availability}</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex space-x-2">
          <button class="btn-expert-call flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-[10px] font-bold shadow flex items-center justify-center space-x-1.5" data-id="${ex.id}">
            <i data-lucide="phone" class="w-3.5 h-3.5"></i>
            <span>Call Now</span>
          </button>
          
          <button class="btn-expert-book py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold" data-id="${ex.id}">
            Book Slot
          </button>
        </div>
      </div>
    `).join('');
    this.container.appendChild(grid);

    // Dynamic scheduling modal & call popover
    this.renderBookingModal();
    this.renderCallSimulator();

    this.bindEvents();

    if (window.lucide) {
      window.lucide.createIcons();
    }
    return this.container;
  }

  // ==========================================
  // VIEW: BOOKING CALENDAR SCHEDULER
  // ==========================================
  renderBookingModal() {
    if (!this.selectedExpert) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4';
    modal.id = 'expert-booking-modal-bg';
    modal.innerHTML = `
      <div class="w-full max-w-md glass-panel rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-white/5 animate-fade-in-up bg-white dark:bg-slate-950 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider text-slate-400">Schedule Appointment</h3>
          <button id="btn-booking-close" class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <div class="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
          <span class="text-2xl">${this.selectedExpert.img}</span>
          <div>
            <h4 class="font-bold text-slate-800 dark:text-white text-xs">${this.selectedExpert.name}</h4>
            <span class="text-[9px] text-slate-400 font-bold uppercase">${this.selectedExpert.role}</span>
          </div>
        </div>

        <form id="expert-booking-form" class="space-y-3">
          <div>
            <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Appointment Date</label>
            <input type="date" id="booking-date" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none" required value="${this.bookingDate}" />
          </div>

          <div>
            <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Available Hour</label>
            <select id="booking-time" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none">
              <option value="10:00 AM">10:00 AM - 10:30 AM</option>
              <option value="11:30 AM">11:30 AM - 12:00 PM</option>
              <option value="02:00 PM">02:00 PM - 02:30 PM</option>
              <option value="04:30 PM">04:30 PM - 05:00 PM</option>
            </select>
          </div>

          <div>
            <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Problem / Query Notes</label>
            <textarea id="booking-desc" rows="2" placeholder="Mention yellow leaf spots count, crop irrigation date, animal symptoms..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none resize-none">${this.bookingDesc}</textarea>
          </div>

          <button type="submit" class="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-2xl shadow transition-all flex items-center justify-center space-x-1.5">
            <i data-lucide="check" class="w-4 h-4"></i>
            <span>Confirm Consultation</span>
          </button>
        </form>
      </div>
    `;
    this.container.appendChild(modal);
  }

  // ==========================================
  // VIEW: TELECONSULTATION CALL SIMULATOR
  // ==========================================
  renderCallSimulator() {
    if (!this.callActive) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4';
    
    const minutes = Math.floor(this.callDuration / 60).toString().padStart(2, '0');
    const seconds = (this.callDuration % 60).toString().padStart(2, '0');

    modal.innerHTML = `
      <div class="w-full max-w-sm glass-panel rounded-3xl p-8 shadow-2xl border border-white/10 bg-slate-900 text-center space-y-6 text-white">
        
        <div class="space-y-2">
          <div class="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg shadow-brand-500/20 animate-pulse">
            📞
          </div>
          <div>
            <h3 class="text-base font-extrabold">Krishi Call Center Link</h3>
            <span class="text-[10px] text-slate-400">Connecting with Agronomist Advisor...</span>
          </div>
          <div class="text-lg font-extrabold tracking-widest text-brand-400 mt-2">${minutes}:${seconds}</div>
        </div>

        <!-- Audio wave animation -->
        <div class="flex items-end justify-center space-x-1.5 h-16">
          <span class="voice-wave-bar"></span>
          <span class="voice-wave-bar"></span>
          <span class="voice-wave-bar"></span>
          <span class="voice-wave-bar"></span>
          <span class="voice-wave-bar"></span>
        </div>

        <!-- Controls row -->
        <div class="flex justify-center space-x-6">
          <button class="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300" title="Mute Mic">
            <i data-lucide="mic-off" class="w-5 h-5"></i>
          </button>
          <button id="btn-call-hangup" class="p-4 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg" title="End Call">
            <i data-lucide="phone-off" class="w-6 h-6"></i>
          </button>
          <button class="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300" title="Speaker">
            <i data-lucide="volume-2" class="w-5 h-5"></i>
          </button>
        </div>

      </div>
    `;
    this.container.appendChild(modal);
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  bindEvents() {
    // Open Booking modal
    const bookBtns = this.container.querySelectorAll('.btn-expert-book');
    bookBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.selectedExpert = this.experts.find(ex => ex.id === id);
        this.render();
      });
    });

    // Close Booking modal
    const btnBookingClose = this.container.querySelector('#btn-booking-close');
    if (btnBookingClose) {
      btnBookingClose.addEventListener('click', () => {
        this.selectedExpert = null;
        this.render();
      });
    }

    const modalBg = this.container.querySelector('#expert-booking-modal-bg');
    if (modalBg) {
      modalBg.addEventListener('click', (e) => {
        if (e.target === modalBg) {
          this.selectedExpert = null;
          this.render();
        }
      });
    }

    // Submit Booking
    const bookingForm = this.container.querySelector('#expert-booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const date = this.container.querySelector('#booking-date').value;
        const time = this.container.querySelector('#booking-time').value;
        const desc = this.container.querySelector('#booking-desc').value.trim();

        alert(`Consultation booked successfully!\nDate: ${date}\nTime Slot: ${time}\nExpert: ${this.selectedExpert.name}`);
        
        this.selectedExpert = null;
        this.bookingDate = '';
        this.bookingDesc = '';
        this.render();
      });
    }

    // Call Simulator
    const callBtns = this.container.querySelectorAll('.btn-expert-call');
    callBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.triggerCall();
      });
    });

    const hangupBtn = this.container.querySelector('#btn-call-hangup');
    if (hangupBtn) {
      hangupBtn.addEventListener('click', () => {
        this.endCall();
      });
    }
  }

  triggerCall() {
    this.callActive = true;
    this.callDuration = 0;
    this.render();

    this.callInterval = setInterval(() => {
      this.callDuration++;
      // Re-render only duration text to avoid full DOM redraw during call
      const timerEl = this.container.querySelector('.tracking-widest');
      if (timerEl) {
        const mins = Math.floor(this.callDuration / 60).toString().padStart(2, '0');
        const secs = (this.callDuration % 60).toString().padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  endCall() {
    if (this.callInterval) clearInterval(this.callInterval);
    this.callActive = false;
    this.callDuration = 0;
    this.render();
  }
}
