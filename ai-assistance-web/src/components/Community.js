import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class Community {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6 pb-24';
    
    // Composer state
    this.newPostText = '';
    this.newPostCategory = 'general';
    
    // Community Feed data in-memory list
    this.posts = [
      {
        id: 1,
        author: 'Suresh Patel',
        location: 'Gujarat',
        time: '2 hours ago',
        category: 'pest',
        text: 'Found minor aphid infestations on my tomato plants this morning. I will spray organic Neemastra bio-pesticide. Anyone else seeing aphid migrations in Gujarat blocks?',
        likes: 12,
        liked: false,
        comments: [
          { author: 'Vikram Rao', text: 'Yes, same in my tomato blocks. Morning sprays are more effective.' }
        ]
      },
      {
        id: 2,
        author: 'Harpreet Singh',
        location: 'Punjab',
        time: '5 hours ago',
        category: 'seeds',
        text: 'DBW-187 wheat seed variety yielded 24.5 quintals per acre for me last season. Highly recommend other farmers to choose rust-resistant seeds for the upcoming sowing cycle.',
        likes: 28,
        liked: true,
        comments: []
      }
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
        <i data-lucide="users" class="w-6 h-6 text-brand-500"></i>
        <span>Kisan Chopal Forum</span>
      </h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Discuss crop treatments, APMC mandi rates, and rental bookings with farmers nationwide</p>
    `;
    this.container.appendChild(header);

    // Main layout grid (Left: Feed, Right: Hot Topics)
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 lg:grid-cols-12 gap-6';

    // Left Column: Feed + Composer (8 Cols)
    const feedCol = document.createElement('div');
    feedCol.className = 'lg:col-span-8 space-y-6';

    // 1. Post Composer Card
    const composer = document.createElement('div');
    composer.className = 'glass-card rounded-3xl p-5 border border-white/10 space-y-4';
    composer.innerHTML = `
      <h3 class="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider text-slate-400">Share with Chopal Community</h3>
      
      <div class="space-y-3">
        <textarea id="composer-textarea" rows="3" placeholder="Describe crop alerts, ask farming questions, or share yield results..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs focus:outline-none resize-none">${this.newPostText}</textarea>
        
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/50">
          <div class="flex items-center space-x-3">
            <!-- Category Tag selector -->
            <select id="composer-category" class="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 focus:outline-none">
              <option value="general">General Topic</option>
              <option value="pest">Pest Management</option>
              <option value="seeds">Seed Selection</option>
              <option value="market">Mandi Prices</option>
              <option value="rentals">Machinery Share</option>
            </select>
            
            <button id="btn-composer-attach" class="p-2 text-slate-400 hover:text-brand-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Attach Leaf Photo">
              <i data-lucide="image" class="w-4.5 h-4.5"></i>
            </button>
          </div>
          
          <button id="btn-post-submit" class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5">
            <i data-lucide="send" class="w-3.5 h-3.5"></i>
            <span>Publish Post</span>
          </button>
        </div>
      </div>
    `;
    feedCol.appendChild(composer);

    // 2. Posts Feed List
    const feed = document.createElement('div');
    feed.className = 'space-y-4';
    feed.innerHTML = this.posts.map(post => {
      let catBadgeColor = 'bg-brand-500/10 text-brand-600 dark:text-green-400';
      if (post.category === 'pest') catBadgeColor = 'bg-red-500/10 text-red-500';
      if (post.category === 'market') catBadgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      
      return `
        <div class="glass-card rounded-3xl p-5 border border-white/10 space-y-4 animate-fade-in">
          <!-- Card Author Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center uppercase">
                ${post.author[0]}
              </div>
              <div>
                <h4 class="font-bold text-slate-800 dark:text-white text-xs">${post.author}</h4>
                <span class="text-[9px] text-slate-400 font-semibold">${post.location} • ${post.time}</span>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold ${catBadgeColor} uppercase">${post.category}</span>
          </div>

          <!-- Body content -->
          <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">${post.text}</p>

          <!-- Interaction Actions -->
          <div class="flex items-center space-x-6 pt-3 border-t border-slate-100 dark:border-slate-800/50 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <button class="btn-post-like flex items-center space-x-1.5 hover:text-red-500 ${post.liked ? 'text-red-500' : ''}" data-id="${post.id}">
              <i data-lucide="heart" class="w-4 h-4" ${post.liked ? 'fill="currentColor"' : ''}></i>
              <span>${post.likes} Likes</span>
            </button>

            <button class="btn-post-comment flex items-center space-x-1.5 hover:text-brand-500" data-id="${post.id}">
              <i data-lucide="message-square" class="w-4 h-4"></i>
              <span>${post.comments.length} Comments</span>
            </button>

            <button class="btn-post-share flex items-center space-x-1.5 hover:text-blue-500" data-id="${post.id}">
              <i data-lucide="share-2" class="w-4 h-4"></i>
              <span>Share</span>
            </button>
          </div>

          <!-- Collapsible Comments List -->
          <div class="comments-section-panel space-y-2.5 hidden pt-3 border-t border-slate-100 dark:border-slate-800/20" id="comments-${post.id}">
            <div class="space-y-2">
              ${post.comments.map(c => `
                <div class="p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 text-[10px] space-y-1">
                  <div class="font-bold text-slate-800 dark:text-slate-200">${c.author}</div>
                  <p class="text-slate-500 dark:text-slate-400 leading-normal">${c.text}</p>
                </div>
              `).join('')}
            </div>
            
            <!-- Comment Input Box -->
            <div class="flex items-center space-x-2 pt-1">
              <input type="text" placeholder="Write a comment..." class="comment-input-field flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-[10px] focus:outline-none" />
              <button class="btn-comment-submit p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all" data-id="${post.id}">
                <i data-lucide="send" class="w-3 h-3"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    feedCol.appendChild(feed);
    grid.appendChild(feedCol);

    // Right Column: Hot categories (4 Cols)
    const rightCol = document.createElement('div');
    rightCol.className = 'lg:col-span-4 space-y-6';
    rightCol.innerHTML = `
      <div class="glass-card rounded-3xl p-5 border border-white/10 space-y-4">
        <h3 class="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider text-slate-400">Trending Topics</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-slate-700 dark:text-slate-200">#YellowRustWarning</span>
            <span class="text-[9px] text-slate-400">128 posts</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-slate-700 dark:text-slate-200">#PMKUSUMSubsidy</span>
            <span class="text-[9px] text-slate-400">92 posts</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-slate-700 dark:text-slate-200">#NeemastraRecipe</span>
            <span class="text-[9px] text-slate-400">74 posts</span>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-slate-700 dark:text-slate-200">#MandiPricesPatna</span>
            <span class="text-[9px] text-slate-400">54 posts</span>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(rightCol);

    this.container.appendChild(grid);

    this.bindEvents();

    if (window.lucide) {
      window.lucide.createIcons();
    }
    return this.container;
  }

  bindEvents() {
    // Textarea input
    const textarea = this.container.querySelector('#composer-textarea');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        this.newPostText = e.target.value;
      });
    }

    // Category input
    const category = this.container.querySelector('#composer-category');
    if (category) {
      category.addEventListener('change', (e) => {
        this.newPostCategory = e.target.value;
      });
    }

    // Attach picture mock
    const btnAttach = this.container.querySelector('#btn-composer-attach');
    if (btnAttach) {
      btnAttach.addEventListener('click', () => {
        alert('Simulator: Attached tomato_rust_spot.jpg leaf image.');
      });
    }

    // Submit post
    const btnPostSubmit = this.container.querySelector('#btn-post-submit');
    if (btnPostSubmit) {
      btnPostSubmit.addEventListener('click', () => {
        if (!this.newPostText.trim()) {
          alert('Please enter post description.');
          return;
        }

        const state = context.state;
        const newPost = {
          id: Date.now(),
          author: state.user && state.user.name ? state.user.name : 'Farmer Ramesh',
          location: state.user && state.user.state ? state.user.state : 'Uttar Pradesh',
          time: 'Just now',
          category: this.newPostCategory,
          text: this.newPostText,
          likes: 0,
          liked: false,
          comments: []
        };

        this.posts.unshift(newPost);
        this.newPostText = '';
        this.render();
      });
    }

    // Post Liking
    const likeBtns = this.container.querySelectorAll('.btn-post-like');
    likeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const post = this.posts.find(p => p.id === id);
        if (post) {
          if (post.liked) {
            post.likes--;
            post.liked = false;
          } else {
            post.likes++;
            post.liked = true;
          }
          this.render();
        }
      });
    });

    // Toggle comments panel
    const commentToggleBtns = this.container.querySelectorAll('.btn-post-comment');
    commentToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const commentPanel = this.container.querySelector(`#comments-${id}`);
        if (commentPanel) {
          commentPanel.classList.toggle('hidden');
        }
      });
    });

    // Submit Comment
    const commentSubmitBtns = this.container.querySelectorAll('.btn-comment-submit');
    commentSubmitBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const panel = this.container.querySelector(`#comments-${id}`);
        const input = panel.querySelector('.comment-input-field');
        const text = input.value.trim();
        
        if (text) {
          const post = this.posts.find(p => p.id === id);
          if (post) {
            const state = context.state;
            post.comments.push({
              author: state.user && state.user.name ? state.user.name : 'Farmer Ramesh',
              text: text
            });
            this.render();
          }
        }
      });
    });

    // Share link simulation
    const shareBtns = this.container.querySelectorAll('.btn-post-share');
    shareBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        alert('Copied share link of chopal thread to clipboard!');
      });
    });
  }
}
