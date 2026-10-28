import { StorageService } from '../services/StorageService.js';
import { SecurityUtils } from '../utils/security.js';

class AppContext {
  constructor() {
    this.listeners = [];
    
    // Load initial states from LocalStorage via security wrapper
    this.state = {
      activeTab: 'home', // default main landing tab is home
      theme: StorageService.getTheme() || 'light',
      language: StorageService.getLanguage() || 'english', // 'english' | 'hindi' | 'hinglish' | 'bhojpuri' | 'awadhi'
      chats: StorageService.getChats() || [],
      activeChatId: null,
      favorites: StorageService.getFavorites() || [],
      recentSearches: StorageService.getRecentSearches() || [],
      searchQuery: '',
      isListening: false, // Voice ASR activation state
      voiceStatus: 'idle', // 'idle' | 'listening' | 'processing' | 'speaking' | 'error'
      isGenerating: false, // AI Loading state
      isOffline: !navigator.onLine, // Connection health tracking
      diagnosticsHistory: StorageService.getDiagnosticsHistory() || [],
      diagnosticsQueue: StorageService.getDiagnosticsQueue() || [],
      user: StorageService.getUser() || null,
      isAuthenticated: !!StorageService.getUser()
    };
    
    // Sync initial HTML theme state
    this.applyTheme(this.state.theme);

    // Bind network connectivity state tracking listeners
    window.addEventListener('online', () => this.setOffline(false));
    window.addEventListener('offline', () => this.setOffline(true));
  }

  // Subscribe components to state changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify all subscribed components
  notify() {
    this.listeners.forEach(callback => callback(this.state));
  }

  // Core Mutators
  setTab(tab) {
    this.state.activeTab = tab;
    this.notify();
  }

  setTheme(theme) {
    this.state.theme = theme;
    StorageService.saveTheme(theme);
    this.applyTheme(theme);
    this.notify();
  }

  setLanguage(lang) {
    this.state.language = lang;
    StorageService.saveLanguage(lang);
    this.notify();
  }

  setSearchQuery(query) {
    this.state.searchQuery = SecurityUtils.sanitizeInput(query);
    this.notify();
  }

  setGenerating(status) {
    this.state.isGenerating = status;
    this.notify();
  }

  setListening(status) {
    this.state.isListening = status;
    // Sync with voice status
    this.state.voiceStatus = status ? 'listening' : 'idle';
    this.notify();
  }

  setVoiceStatus(status) {
    this.state.voiceStatus = status;
    this.notify();
  }

  setOffline(status) {
    this.state.isOffline = status;
    this.notify();
  }

  login(isAuthenticated, userProfile) {
    this.state.isAuthenticated = isAuthenticated;
    this.state.user = userProfile;
    if (isAuthenticated) {
      StorageService.saveUser(userProfile);
    } else {
      StorageService.clearUser();
    }
    this.notify();
  }

  logout() {
    this.state.isAuthenticated = false;
    this.state.user = null;
    StorageService.clearUser();
    localStorage.removeItem('access_token');
    this.notify();
  }

  // Chat Actions
  setActiveChat(id) {
    this.state.activeChatId = id;
    this.notify();
  }

  addChat(chat) {
    this.state.chats.unshift(chat);
    StorageService.saveChats(this.state.chats);
    this.state.activeChatId = chat.id;
    this.notify();
  }

  updateChatMessages(chatId, messages) {
    const chat = this.state.chats.find(c => c.id === chatId);
    if (chat) {
      chat.messages = messages;
      chat.lastUpdated = new Date().toISOString();
      StorageService.saveChats(this.state.chats);
      this.notify();
    }
  }

  deleteChat(chatId) {
    this.state.chats = this.state.chats.filter(c => c.id !== chatId);
    StorageService.saveChats(this.state.chats);
    if (this.state.activeChatId === chatId) {
      this.state.activeChatId = this.state.chats.length > 0 ? this.state.chats[0].id : null;
    }
    this.notify();
  }

  // Favorite Responses management
  toggleFavorite(messageId, responseData) {
    const index = this.state.favorites.findIndex(f => f.id === messageId);
    if (index >= 0) {
      this.state.favorites.splice(index, 1);
    } else {
      this.state.favorites.push({ id: messageId, ...responseData });
    }
    StorageService.saveFavorites(this.state.favorites);
    this.notify();
  }

  isFavorite(messageId) {
    return this.state.favorites.some(f => f.id === messageId);
  }

  // Search History management
  addRecentSearch(query) {
    if (!query.trim()) return;
    const sanitized = SecurityUtils.sanitizeInput(query).trim();
    this.state.recentSearches = this.state.recentSearches.filter(s => s.toLowerCase() !== sanitized.toLowerCase());
    this.state.recentSearches.unshift(sanitized);
    if (this.state.recentSearches.length > 10) this.state.recentSearches.pop();
    StorageService.saveRecentSearches(this.state.recentSearches);
    this.notify();
  }

  clearSearchHistory() {
    this.state.recentSearches = [];
    StorageService.saveRecentSearches([]);
    this.notify();
  }

  // Diagnostics Actions
  setDiagnosticsHistory(history) {
    this.state.diagnosticsHistory = history;
    StorageService.saveDiagnosticsHistory(history);
    this.notify();
  }

  addDiagnostic(report) {
    this.state.diagnosticsHistory.unshift(report);
    StorageService.saveDiagnosticsHistory(this.state.diagnosticsHistory);
    this.notify();
  }

  deleteDiagnostic(id) {
    this.state.diagnosticsHistory = this.state.diagnosticsHistory.filter(d => d.id !== id);
    StorageService.saveDiagnosticsHistory(this.state.diagnosticsHistory);
    this.notify();
  }

  updateDiagnostic(id, updatedFields) {
    this.state.diagnosticsHistory = this.state.diagnosticsHistory.map(d => {
      if (d.id === id) {
        return { ...d, ...updatedFields };
      }
      return d;
    });
    StorageService.saveDiagnosticsHistory(this.state.diagnosticsHistory);
    this.notify();
  }

  // Offline Diagnostics Queue
  addDiagnosticToQueue(queuedItem) {
    this.state.diagnosticsQueue.push(queuedItem);
    StorageService.saveDiagnosticsQueue(this.state.diagnosticsQueue);
    this.notify();
  }

  removeDiagnosticFromQueue(tempId) {
    this.state.diagnosticsQueue = this.state.diagnosticsQueue.filter(q => q.tempId !== tempId);
    StorageService.saveDiagnosticsQueue(this.state.diagnosticsQueue);
    this.notify();
  }

  clearDiagnosticsQueue() {
    this.state.diagnosticsQueue = [];
    StorageService.saveDiagnosticsQueue([]);
    this.notify();
  }

  // Internal Theme DOM Helper
  applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

export const context = new AppContext();
