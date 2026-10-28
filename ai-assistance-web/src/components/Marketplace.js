import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';

export class Marketplace {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'w-full animate-fade-in space-y-6 pb-24';

    // State parameters
    this.activeCategory = 'all'; // 'all' | 'seeds' | 'fertilizer' | 'pest' | 'rentals'
    this.searchQuery = '';
    this.wishlist = [];
    this.cart = []; // array of { product, quantity }
    this.cartOpen = false;

    // Mock products catalog
    this.products = [
      { id: 1, name: 'Pusa Yashasvi Wheat Seeds (HD 3226)', category: 'seeds', price: 1250, unit: '40 kg bag', rating: 4.8, image: '🌱', description: 'High-yield wheat variety, resistant to rust diseases.' },
      { id: 2, name: 'Premium Paddy Basmati Seeds (Pusa 1121)', category: 'seeds', price: 1680, unit: '25 kg bag', rating: 4.9, image: '🌾', description: 'Long grain basmati seeds, excellent aroma and mill output.' },
      { id: 3, name: 'Organic Vermicompost fertilizer', category: 'fertilizer', price: 450, unit: '50 kg bag', rating: 4.7, image: '🪱', description: 'Rich in organic carbon, trace minerals and soil microbes.' },
      { id: 4, name: 'NPK Water Soluble Mix (19:19:19)', category: 'fertilizer', price: 680, unit: '25 kg bag', rating: 4.6, image: '🧪', description: 'Balanced fertilizer splits for drip irrigation fertigation.' },
      { id: 5, name: 'Organic Neem Oil Extract Concentrate', category: 'pest', price: 320, unit: '1 Litre bottle', rating: 4.5, image: '🍃', description: 'Natural insect growth regulator for organic pest mitigation.' },
      { id: 6, name: 'John Deere 5050D Tractor (Rental)', category: 'rentals', price: 800, unit: 'per hour (diesel extra)', rating: 4.9, image: '🚜', description: '50 HP powerful utility tractor with modern rotavator attachments.' },
      { id: 7, name: 'Laser Land Leveller (Rental)', category: 'rentals', price: 1200, unit: 'per day', rating: 4.8, image: '📐', description: 'Automated hydraulic grader for perfect water conservation pooling.' },
      { id: 8, name: 'Pusa Hydrogel Water Retainer', category: 'fertilizer', price: 950, unit: '1 kg packet', rating: 4.6, image: '💧', description: 'Improves soil hydration capacity, saves up to 30% water.' }
    ];
  }

  render() {
    this.container.innerHTML = '';

    // Filter products
    const filteredProducts = this.products.filter(p => {
      const matchCat = this.activeCategory === 'all' || p.category === this.activeCategory;
      const matchSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    // Main header
    const header = document.createElement('div');
    header.className = 'flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800';
    header.innerHTML = `
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <i data-lucide="shopping-bag" class="w-6 h-6 text-brand-500"></i>
          <span>Krishi Marketplace</span>
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Buy authentic crop inputs and lease modern farm machinery</p>
      </div>

      <!-- Action buttons: Cart & Wishlist -->
      <div class="flex items-center space-x-3 mt-4 sm:mt-0">
        <button id="btn-market-wishlist" class="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center space-x-1.5">
          <i data-lucide="heart" class="w-4 h-4 text-red-500"></i>
          <span>Wishlist (${this.wishlist.length})</span>
        </button>
        <button id="btn-market-cart-trigger" class="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-bold hover:bg-brand-600 transition-all flex items-center space-x-1.5 relative shadow-md">
          <i data-lucide="shopping-cart" class="w-4 h-4"></i>
          <span>View Cart</span>
          ${this.cart.reduce((sum, item) => sum + item.quantity, 0) > 0 ? `
            <span class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-[9px] font-extrabold w-5 h-5 flex items-center justify-center animate-bounce shadow">
              ${this.cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          ` : ''}
        </button>
      </div>
    `;
    this.container.appendChild(header);

    // Search and Category Filters
    const controls = document.createElement('div');
    controls.className = 'grid grid-cols-1 md:grid-cols-12 gap-4 items-center';
    controls.innerHTML = `
      <!-- Search Input -->
      <div class="md:col-span-4 relative">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <i data-lucide="search" class="w-4 h-4"></i>
        </span>
        <input type="text" id="market-search" placeholder="Search seeds, rentals, organic compost..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none" value="${this.searchQuery}" />
      </div>

      <!-- Categories Buttons row -->
      <div class="md:col-span-8 flex flex-wrap gap-2 justify-start md:justify-end">
        ${['all', 'seeds', 'fertilizer', 'pest', 'rentals'].map(cat => {
          const label = cat === 'all' ? 'All Products' :
                        cat === 'seeds' ? 'Certified Seeds' :
                        cat === 'fertilizer' ? 'Fertilizers' :
                        cat === 'pest' ? 'Pest Mitigation' : 'Lease Rentals';
          const isActive = this.activeCategory === cat;
          return `
            <button class="market-cat-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${isActive ? 'bg-brand-500 text-white shadow' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}" data-cat="${cat}">
              ${label}
            </button>
          `;
        }).join('')}
      </div>
    `;
    this.container.appendChild(controls);

    // Products Grid View
    const grid = document.createElement('div');
    grid.id = 'market-products-grid';
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';

    if (filteredProducts.length === 0) {
      grid.className = 'w-full py-16 text-center text-slate-400 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3';
      grid.innerHTML = `
        <i data-lucide="package-open" class="w-12 h-12 text-slate-300"></i>
        <div class="text-sm font-bold">No products found matching filters</div>
        <p class="text-xs text-slate-400">Try modifying your search query or reset categories.</p>
      `;
    } else {
      filteredProducts.forEach(prod => {
        const isInWish = this.wishlist.includes(prod.id);
        const card = document.createElement('div');
        card.className = 'glass-card rounded-2xl p-4 border border-white/10 flex flex-col justify-between relative overflow-hidden group';
        card.innerHTML = `
          <!-- Category chip & Wishlist Icon -->
          <div class="flex items-center justify-between mb-3">
            <span class="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-green-400">
              ${prod.category}
            </span>
            <button class="market-row-wish-btn text-slate-300 hover:text-red-500 transition-colors" data-id="${prod.id}">
              <i data-lucide="heart" class="w-4.5 h-4.5 ${isInWish ? 'fill-red-500 text-red-500' : ''}"></i>
            </button>
          </div>

          <!-- Product Media Placeholder and Identity -->
          <div class="space-y-2 flex-1">
            <div class="h-32 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-4xl shadow-inner relative group-hover:scale-102 transition-transform duration-300">
              ${prod.image}
              <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            </div>
            
            <div class="space-y-1">
              <h4 class="font-bold text-slate-800 dark:text-white text-xs line-clamp-1" title="${prod.name}">${prod.name}</h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">${prod.description}</p>
            </div>
          </div>

          <!-- Price & Buy details -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-extrabold text-slate-900 dark:text-white">₹${prod.price.toLocaleString('en-IN')}</div>
              <div class="text-[8px] text-slate-400 font-semibold">${prod.unit}</div>
            </div>
            
            <button class="market-add-cart-btn p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all flex items-center justify-center" data-id="${prod.id}">
              <i data-lucide="plus" class="w-4.5 h-4.5"></i>
            </button>
          </div>
        `;
        grid.appendChild(card);
      });
    }
    this.container.appendChild(grid);

    // Cart Sidebar Drawer overlay
    if (this.cartOpen) {
      const cartOverlay = document.createElement('div');
      cartOverlay.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end';
      cartOverlay.id = 'cart-drawer-overlay';
      
      const cartContent = document.createElement('div');
      cartContent.className = 'w-full max-w-sm h-full bg-white dark:bg-slate-950 p-6 flex flex-col justify-between shadow-2xl animate-slide-in-right relative';
      
      // Calculate totals
      const totalCost = this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      cartContent.innerHTML = `
        <div>
          <!-- Cart Header -->
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-950 pb-4 mb-4">
            <div class="flex items-center space-x-2">
              <i data-lucide="shopping-cart" class="w-5 h-5 text-brand-500"></i>
              <h3 class="font-bold text-slate-800 dark:text-white">Shopping Cart</h3>
            </div>
            <button id="btn-cart-close" class="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Cart items list -->
          <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            ${this.cart.length === 0 ? `
              <div class="text-center py-16 text-slate-400 space-y-2">
                <i data-lucide="shopping-cart" class="w-8 h-8 mx-auto text-slate-300"></i>
                <div class="text-xs font-bold">Your cart is empty</div>
              </div>
            ` : this.cart.map(item => `
              <div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/40">
                <div class="flex items-center space-x-2.5">
                  <span class="text-2xl">${item.product.image}</span>
                  <div>
                    <div class="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[150px]">${item.product.name}</div>
                    <div class="text-[9px] text-slate-400">₹${item.product.price} / ${item.product.unit.split(' ')[0]}</div>
                  </div>
                </div>

                <!-- Quantity adjust -->
                <div class="flex items-center space-x-2">
                  <button class="cart-qty-minus p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" data-id="${item.product.id}">-</button>
                  <span class="text-xs font-extrabold">${item.quantity}</span>
                  <button class="cart-qty-plus p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" data-id="${item.product.id}">+</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Cart Summary & Checkout -->
        <div class="border-t border-slate-100 dark:border-slate-900 pt-4 space-y-4">
          <div class="flex justify-between text-xs font-bold">
            <span class="text-slate-500">Order Subtotal:</span>
            <span class="text-slate-900 dark:text-white text-sm">₹${totalCost.toLocaleString('en-IN')}</span>
          </div>
          <button id="btn-market-checkout" class="w-full py-3 bg-brand-500 text-white font-extrabold rounded-2xl shadow-lg hover:bg-brand-600 transition-all flex items-center justify-center space-x-1.5" ${this.cart.length === 0 ? 'disabled' : ''}>
            <i data-lucide="credit-card" class="w-4 h-4"></i>
            <span>Confirm Order (COD)</span>
          </button>
        </div>
      `;
      cartOverlay.appendChild(cartContent);
      this.container.appendChild(cartOverlay);
    }

    this.bindEvents();
    if (window.lucide) {
      window.lucide.createIcons();
    }
    return this.container;
  }

    // Search input typing - dynamic in-place filtering without destroying focus
    const search = this.container.querySelector('#market-search');
    if (search) {
      search.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.updateProductGrid();
      });
    }

    // Category click filters
    const catBtns = this.container.querySelectorAll('.market-cat-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCategory = btn.getAttribute('data-cat');
        this.render();
      });
    });

    // Wishlist toggle
    const wishBtns = this.container.querySelectorAll('.market-row-wish-btn');
    wishBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        if (this.wishlist.includes(id)) {
          this.wishlist = this.wishlist.filter(w => w !== id);
        } else {
          this.wishlist.push(id);
        }
        this.render();
      });
    });

    // Wishlist main button
    const wishlistBtn = this.container.querySelector('#btn-market-wishlist');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', () => {
        const savedItems = this.products.filter(p => this.wishlist.includes(p.id));
        alert(savedItems.length > 0 ? `Wishlist items:\n` + savedItems.map(p => `- ${p.name}`).join('\n') : 'Your wishlist is empty.');
      });
    }

    // Add to Cart
    const addBtns = this.container.querySelectorAll('.market-add-cart-btn');
    addBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        const cartItem = this.cart.find(c => c.product.id === id);
        if (cartItem) {
          cartItem.quantity++;
        } else {
          this.cart.push({ product, quantity: 1 });
        }
        this.render();
      });
    });

    // Cart trigger open
    const cartTrigger = this.container.querySelector('#btn-market-cart-trigger');
    if (cartTrigger) {
      cartTrigger.addEventListener('click', () => {
        this.cartOpen = true;
        this.render();
      });
    }

    // Cart drawer controls
    const cartClose = this.container.querySelector('#btn-cart-close');
    if (cartClose) {
      cartClose.addEventListener('click', () => {
        this.cartOpen = false;
        this.render();
      });
    }

    const cartOverlay = this.container.querySelector('#cart-drawer-overlay');
    if (cartOverlay) {
      cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) {
          this.cartOpen = false;
          this.render();
        }
      });
    }

    // Qty adjustments
    const minusBtns = this.container.querySelectorAll('.cart-qty-minus');
    minusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const cartItem = this.cart.find(c => c.product.id === id);
        if (cartItem) {
          cartItem.quantity--;
          if (cartItem.quantity <= 0) {
            this.cart = this.cart.filter(c => c.product.id !== id);
          }
        }
        this.render();
      });
    });

    const plusBtns = this.container.querySelectorAll('.cart-qty-plus');
    plusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const cartItem = this.cart.find(c => c.product.id === id);
        if (cartItem) {
          cartItem.quantity++;
        }
        this.render();
      });
    });

    // Checkout COD
    const btnCheckout = this.container.querySelector('#btn-market-checkout');
    if (btnCheckout) {
      btnCheckout.addEventListener('click', () => {
        alert('Order Placed Successfully!\nTotal Amount: ₹' + 
              this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toLocaleString('en-IN') + 
              '\nYour items will be dispatched to your registered address. Cash On Delivery (COD) confirmed.');
        this.cart = [];
        this.cartOpen = false;
        this.render();
      });
    }
  }

  updateProductGrid() {
    const grid = this.container.querySelector('#market-products-grid');
    if (!grid) return;

    const filteredProducts = this.products.filter(p => {
      const matchCat = this.activeCategory === 'all' || p.category === this.activeCategory;
      const matchSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    grid.innerHTML = '';
    if (filteredProducts.length === 0) {
      grid.className = 'w-full py-16 text-center text-slate-400 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3';
      grid.innerHTML = `
        <i data-lucide="package-open" class="w-12 h-12 text-slate-300"></i>
        <div class="text-sm font-bold">No products found matching filters</div>
        <p class="text-xs text-slate-400">Try modifying your search query or reset categories.</p>
      `;
    } else {
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
      filteredProducts.forEach(prod => {
        const isInWish = this.wishlist.includes(prod.id);
        const card = document.createElement('div');
        card.className = 'glass-card rounded-2xl p-4 border border-white/10 flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1';
        card.innerHTML = `
          <div class="flex items-center justify-between mb-3">
            <span class="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-green-400">
              ${prod.category}
            </span>
            <button class="market-row-wish-btn text-slate-300 hover:text-red-500 transition-colors" data-id="${prod.id}">
              <i data-lucide="heart" class="w-4.5 h-4.5 ${isInWish ? 'fill-red-500 text-red-500' : ''}"></i>
            </button>
          </div>
          <div class="space-y-2 flex-1">
            <div class="h-32 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-4xl shadow-inner relative group-hover:scale-105 transition-transform duration-300">
              ${prod.image}
              <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            </div>
            <div class="space-y-1">
              <h4 class="font-bold text-slate-800 dark:text-white text-xs line-clamp-1" title="${prod.name}">${prod.name}</h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">${prod.description}</p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-extrabold text-slate-900 dark:text-white">₹${prod.price.toLocaleString('en-IN')}</div>
              <div class="text-[8px] text-slate-400 font-semibold">${prod.unit}</div>
            </div>
            <button class="market-add-cart-btn p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all flex items-center justify-center shadow-md shadow-brand-500/20 active:scale-95" data-id="${prod.id}">
              <i data-lucide="plus" class="w-4.5 h-4.5"></i>
            </button>
          </div>
        `;
        grid.appendChild(card);
      });
    }

    // Rebind newly rendered card buttons
    const wishBtns = grid.querySelectorAll('.market-row-wish-btn');
    wishBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        if (this.wishlist.includes(id)) {
          this.wishlist = this.wishlist.filter(w => w !== id);
        } else {
          this.wishlist.push(id);
        }
        this.updateProductGrid();
        const wishCount = this.container.querySelector('#btn-market-wishlist span');
        if (wishCount) wishCount.textContent = `Wishlist (${this.wishlist.length})`;
      });
    });

    const addBtns = grid.querySelectorAll('.market-add-cart-btn');
    addBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        const cartItem = this.cart.find(c => c.product.id === id);
        if (cartItem) {
          cartItem.quantity++;
        } else {
          this.cart.push({ product, quantity: 1 });
        }
        this.render();
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}
