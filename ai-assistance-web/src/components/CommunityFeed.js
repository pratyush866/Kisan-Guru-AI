import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class CommunityFeed {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6 pb-24';

    this.activeFilter = 'all'; // 'all' | 'pest' | 'sowing' | 'mandi' | 'equipment'
    this.newPostText = '';
    this.newPostCategory = 'general';

    // Mock initial posts feed database
    this.posts = [
      {
        id: 1,
        author: 'Satish Singh (Farmer, UP)',
        avatar: 'S',
        category: 'pest',
        time: '2 hours ago',
        content: 'Yellow spots visible on my crop borders in block A. Is anyone else noticing this? Sprayed Neemastra but needs visual validation.',
        likes: 12,
        comments: [
          { author: 'Amit Patel', text: 'Yes, yellow rust is spreading fast due to high humidity. Inspect lower leaves.' }
        ]
      },
      {
        id: 2,
        author: 'Gurpreet Singh (Farmer, Punjab)',
        avatar: 'G',
        category: 'mandi',
        time: '5 hours ago',
        content: 'Wheat selling rates in Khanna Mandi reached ₹2,310/Qtl today. Highly bullish! If you can, hold your inventory for another week.',
        likes: 24,
        comments: [
          { author: 'Satish Singh', text: 'Thanks for the live update! Will hold my crop.' },
          { author: 'Baldev Singh', text: 'Procurement is fast, queues are small too.' }
        ]
      },
      {
        id: 3,
        author: 'Ramesh Sawant (Farmer, Maharashtra)',
        avatar: 'R',
        category: 'equipment',
        time: '1 day ago',
        content: 'Leasing John Deere tractor rotavator attachments in Wardha block. Rate: ₹750/hr. Hit message if anyone wants to cooperate and share truck freight.',
        likes: 8,
        comments: []
      }
    ];
  }

  render() {
    this.container.innerHTML = '';

    const state = context.state;
    const lang = state.language;

    // Header
    const header = document.createElement('div');
    header.className = 'flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200 dark:border-slate-800';
    header.innerHTML = `
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <i data-lucide="users" class="w-6 h-6 text-brand-500"></i>
          <span>Farmer Chopal Community</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Share advice, ask questions, review mandi updates, and coordinate rentals with nearby farmers</p>
      </div>
    `;
    this.container.appendChild(header);

    // Filter controls
    const filterRow = document.createElement('div');
    filterRow.className = 'flex flex-wrap gap-2 items-center justify-start';
    filterRow.innerHTML = `
      ${['all', 'pest', 'sowing', 'mandi', 'equipment'].map(cat => {
        const label = cat === 'all' ? 'All Conversations' :
                      cat === 'pest' ? 'Pests & Diseases' :
                      cat === 'sowing' ? 'Sowing & Crops' :
                      cat === 'mandi' ? 'Mandi Rates' : 'Tractor & Shared Tools';
        const isActive = this.activeFilter === cat;
        return `
          <button class="chopal-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${isActive ? 'bg-brand-500 text-white shadow' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}" data-filter="${cat}">
            ${label}
          </button>
        `;
      }).join('')}
    `;
    this.container.appendChild(filterRow);

    // Layout: Create post (left 5 cols) and Feed (right 7 cols)
    const mainGrid = document.createElement('div');
    mainGrid.className = 'grid grid-cols-1 lg:grid-cols-12 gap-6';

    const leftCol = document.createElement('div');
    leftCol.className = 'lg:col-span-5 space-y-6';

    // Create New Post Box
    const authorName = state.user && state.user.name ? state.user.name : 'Farmer';
    leftCol.innerHTML = `
      <div class="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm uppercase">
            ${authorName[0]}
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-800 dark:text-white">Share a Post on Chopal</h4>
            <span class="text-[9px] text-slate-400">Posting as ${authorName}</span>
          </div>
        </div>

        <form id="chopal-post-form" class="space-y-3.5">
          <div>
            <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Topic</label>
            <select id="chopal-post-cat" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer">
              <option value="general">General (सामान्य)</option>
              <option value="pest">Pests & Diseases (कीट और बीमारी)</option>
              <option value="sowing">Sowing & Farming (बुवाई एवं कृषि)</option>
              <option value="mandi">Mandi Rates (मंडी भाव)</option>
              <option value="equipment">Shared tools & rentals (यंत्र साझाकरण)</option>
            </select>
          </div>

          <div>
            <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">What would you like to ask or share?</label>
            <textarea id="chopal-post-textarea" placeholder="Describe soil characteristics, spray schedules, crop varieties, or ask questions to local farmers..." rows="4" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none" required>${this.newPostText}</textarea>
          </div>

          <button type="submit" class="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5">
            <i data-lucide="send" class="w-3.5 h-3.5"></i>
            <span>Publish Post</span>
          </button>
        </form>
      </div>
    `;

    const rightCol = document.createElement('div');
    rightCol.className = 'lg:col-span-7 space-y-6';

    const filteredPosts = this.posts.filter(p => this.activeFilter === 'all' || p.category === this.activeFilter);

    if (filteredPosts.length === 0) {
      rightCol.innerHTML = `
        <div class="glass-card rounded-2xl p-12 border border-white/10 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
          <i data-lucide="message-square" class="w-8 h-8 text-slate-300"></i>
          <div class="text-xs font-bold">No discussions in this topic yet</div>
          <p class="text-[10px] text-slate-400">Be the first to publish a post on this topic!</p>
        </div>
      `;
    } else {
      filteredPosts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'glass-card rounded-2xl p-5 border border-white/10 space-y-4';
        postCard.innerHTML = `
          <!-- Post Author Header -->
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm uppercase shadow-inner">
                ${post.avatar}
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-800 dark:text-white">${post.author}</h4>
                <div class="flex items-center space-x-2 text-[9px] text-slate-400 font-semibold mt-0.5">
                  <span>${post.time}</span>
                  <span>•</span>
                  <span class="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-green-400 uppercase tracking-wider text-[8px]">${post.category}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Post Content -->
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            ${post.content}
          </p>

          <!-- Interaction Stats (Likes & Comments counts) -->
          <div class="flex items-center space-x-4 text-[10px] text-slate-400 font-bold border-y border-slate-100 dark:border-slate-800/60 py-2">
            <button class="btn-chopal-like flex items-center space-x-1 hover:text-red-500 transition-colors" data-id="${post.id}">
              <i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i>
              <span>${post.likes} Upvotes</span>
            </button>
            <div class="flex items-center space-x-1">
              <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
              <span>${post.comments.length} Comments</span>
            </div>
          </div>

          <!-- Thread Comments list -->
          ${post.comments.length > 0 ? `
            <div class="space-y-2.5 pl-3 border-l-2 border-slate-100 dark:border-slate-800">
              ${post.comments.map(c => `
                <div class="text-[10px] space-y-0.5 leading-normal">
                  <div class="font-extrabold text-slate-700 dark:text-slate-300">${c.author}</div>
                  <div class="text-slate-500 dark:text-slate-400 font-medium">${c.text}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Write comment input field -->
          <div class="flex items-center space-x-2">
            <input type="text" placeholder="Reply to Ramesh..." class="chopal-reply-input flex-1 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-[10px] focus:outline-none" data-id="${post.id}" />
            <button class="btn-chopal-reply px-3 py-1.5 bg-slate-100 hover:bg-brand-500 hover:text-white dark:bg-slate-800 dark:hover:bg-brand-600 rounded-xl text-[10px] font-bold transition-all" data-id="${post.id}">
              Reply
            </button>
          </div>
        `;
        rightCol.appendChild(postCard);
      });
    }

    mainGrid.appendChild(leftCol);
    mainGrid.appendChild(rightCol);
    this.container.appendChild(mainGrid);

    this.bindEvents();
    if (window.lucide) {
      window.lucide.createIcons();
    }
    return this.container;
  }

  bindEvents() {
    // Topic filtering buttons
    const filters = this.container.querySelectorAll('.chopal-filter-btn');
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.getAttribute('data-filter');
        this.render();
      });
    });

    // Form inputs monitoring
    const textarea = this.container.querySelector('#chopal-post-textarea');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        this.newPostText = e.target.value;
      });
    }

    const categorySelect = this.container.querySelector('#chopal-post-cat');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.newPostCategory = e.target.value;
      });
    }

    // Submit new post
    const form = this.container.querySelector('#chopal-post-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = context.state.user || { name: 'Guest Farmer' };
        const newPost = {
          id: Date.now(),
          author: `${user.name} (Farmer, ${user.state || 'Local'})`,
          avatar: user.name[0],
          category: this.newPostCategory,
          time: 'Just now',
          content: this.newPostText,
          likes: 0,
          comments: []
        };

        this.posts.unshift(newPost);
        this.newPostText = '';
        this.render();
      });
    }

    // Like click triggers
    const likeBtns = this.container.querySelectorAll('.btn-chopal-like');
    likeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const post = this.posts.find(p => p.id === id);
        if (post) {
          post.likes++;
          this.render();
        }
      });
    });

    // Comment submission triggers
    const replyBtns = this.container.querySelectorAll('.btn-chopal-reply');
    replyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const replyInput = this.container.querySelector(`.chopal-reply-input[data-id="${id}"]`);
        if (replyInput) {
          const val = replyInput.value.trim();
          if (val) {
            const post = this.posts.find(p => p.id === id);
            if (post) {
              const user = context.state.user || { name: 'Guest Farmer' };
              post.comments.push({
                author: user.name,
                text: val
              });
              this.render();
            }
          }
        }
      });
    });
  }
}
