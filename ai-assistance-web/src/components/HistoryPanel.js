import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';
import { UseHistory } from '../hooks/useHistory.js';

export class HistoryPanel {
  constructor() {
    this.container = document.createElement('aside');
    this.container.className = 'w-full md:w-80 glass-panel rounded-2xl p-4 flex flex-col h-[calc(100vh-12rem)] border transition-colors duration-300';
  }

  render() {
    const state = context.state;
    const lang = state.language;

    // Split chats by category or recent lists
    this.container.innerHTML = `
      <div class="flex flex-col h-full space-y-4">
        
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <h3 class="font-bold text-gray-800 dark:text-white flex items-center space-x-2 text-sm">
            <i data-lucide="history" class="w-4 h-4 text-brand-500"></i>
            <span>${TranslationUtils.translate('historyTitle', lang)}</span>
          </h3>
          <span class="px-2 py-0.5 bg-brand-50 dark:bg-gray-800 text-brand-600 dark:text-green-400 text-xs font-bold rounded-full">
            ${state.chats.length}
          </span>
        </div>

        <!-- Chat Session Logs List -->
        <div class="flex-1 overflow-y-auto space-y-2 pr-1" id="history-sessions-list">
          ${state.chats.length === 0 ? `
            <div class="text-center py-8 text-xs text-gray-400">
              ${TranslationUtils.translate('historyEmpty', lang)}
            </div>
          ` : state.chats.map(chat => {
            const isActive = chat.id === state.activeChatId;
            return `
              <div class="group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-brand-50 dark:bg-gray-800/80 border-l-4 border-brand-500 text-brand-600 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30 text-gray-700 dark:text-gray-300'}" data-chat-id="${chat.id}">
                
                <!-- Chat details -->
                <div class="flex-1 min-w-0 pr-6 select-chat-trigger">
                  <div class="flex items-center space-x-1.5 text-xxs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                    <span>${chat.category || TranslationUtils.translate('generalLabel', lang)}</span>
                    <span>•</span>
                    <span>${new Date(chat.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 class="text-xs font-bold truncate leading-relaxed">
                    ${chat.title}
                  </h4>
                </div>

                <!-- Hover actions (Delete/Export) -->
                <div class="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity duration-300 bg-gradient-to-l from-white via-white dark:from-[#131d13] pl-4">
                  <button class="export-chat-trigger p-1.5 text-gray-400 hover:text-brand-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="${TranslationUtils.translate('exportChatTitle', lang)}" data-chat-id="${chat.id}">
                    <i data-lucide="download" class="w-3.5 h-3.5"></i>
                  </button>
                  <button class="delete-chat-trigger p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="${TranslationUtils.translate('deleteChatTitle', lang)}" data-chat-id="${chat.id}">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>

              </div>
            `;
          }).join('')}
        </div>

        <!-- Favorites Section inside Sidebar -->
        ${state.favorites.length > 0 ? `
          <div class="pt-4 border-t border-gray-100 dark:border-gray-800 h-48 flex flex-col min-h-0">
            <h4 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <i data-lucide="star" class="w-3.5 h-3.5 mr-1 fill-amber-400 stroke-amber-400"></i>
              <span>${TranslationUtils.translate('favorites', lang)}</span>
            </h4>
            <div class="flex-1 overflow-y-auto space-y-2 pr-1">
              ${state.favorites.map(f => `
                <div class="p-2.5 bg-amber-50/20 dark:bg-amber-950/5 border border-amber-100/50 dark:border-amber-900/10 rounded-xl text-xxs font-medium text-gray-600 dark:text-gray-300 flex items-start justify-between">
                  <div class="flex-1 min-w-0 mr-2">
                    <span class="font-bold text-amber-600 uppercase tracking-wider block mb-0.5">${f.category || TranslationUtils.translate('generalLabel', lang)}</span>
                    <p class="truncate font-semibold text-gray-800 dark:text-gray-200">${f.text}</p>
                  </div>
                  <button class="remove-fav-trigger text-gray-400 hover:text-red-500" data-fav-id="${f.id}">
                    <i data-lucide="x" class="w-3 h-3"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;

    this.bindEvents();
    return this.container;
  }

  bindEvents() {
    // Select active chat session
    const listItems = this.container.querySelectorAll('.select-chat-trigger');
    listItems.forEach(item => {
      item.addEventListener('click', () => {
        const parent = item.closest('[data-chat-id]');
        const chatId = parent.getAttribute('data-chat-id');
        context.setActiveChat(chatId);
      });
    });

    // Delete chat session
    const deleteBtns = this.container.querySelectorAll('.delete-chat-trigger');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chatId = btn.getAttribute('data-chat-id');
        if (confirm(TranslationUtils.translate('deleteConversationConfirm', context.state.language))) {
          UseHistory.deleteSession(chatId);
        }
      });
    });

    // Export chat session
    const exportBtns = this.container.querySelectorAll('.export-chat-trigger');
    exportBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chatId = btn.getAttribute('data-chat-id');
        UseHistory.exportSession(chatId);
      });
    });

    // Remove favorite response
    const favRemoveBtns = this.container.querySelectorAll('.remove-fav-trigger');
    favRemoveBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const favId = btn.getAttribute('data-fav-id');
        context.toggleFavorite(favId);
      });
    });
  }
}
