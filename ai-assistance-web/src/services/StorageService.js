import { SecurityUtils } from '../utils/security.js';

const KEYS = {
  THEME: 'kg_theme',
  LANG: 'kg_lang',
  CHATS: 'kg_chats',
  FAVORITES: 'kg_favs',
  SEARCHES: 'kg_searches',
  DIAGNOSTICS_HISTORY: 'kg_diag_history',
  DIAGNOSTICS_QUEUE: 'kg_diag_queue',
  USER: 'kg_user'
};

export class StorageService {
  // User profile storage
  static saveUser(user) {
    const encrypted = SecurityUtils.encryptData(user);
    if (encrypted) {
      localStorage.setItem(KEYS.USER, encrypted);
    }
  }

  static getUser() {
    const encrypted = localStorage.getItem(KEYS.USER);
    if (!encrypted) return null;
    return SecurityUtils.decryptData(encrypted);
  }

  static clearUser() {
    localStorage.removeItem(KEYS.USER);
  }

  // Theme storage
  static saveTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
  }

  static getTheme() {
    return localStorage.getItem(KEYS.THEME) || 'light';
  }

  // Language storage
  static saveLanguage(lang) {
    localStorage.setItem(KEYS.LANG, lang);
  }

  static getLanguage() {
    return localStorage.getItem(KEYS.LANG) || 'english';
  }

  // Chat lists storage (Obfuscated for local storage encryption compliance)
  static saveChats(chats) {
    const encrypted = SecurityUtils.encryptData(chats);
    if (encrypted) {
      localStorage.setItem(KEYS.CHATS, encrypted);
    }
  }

  static getChats() {
    const encrypted = localStorage.getItem(KEYS.CHATS);
    if (!encrypted) return [];
    const decrypted = SecurityUtils.decryptData(encrypted);
    return decrypted || [];
  }

  // Favorites storage
  static saveFavorites(favs) {
    const encrypted = SecurityUtils.encryptData(favs);
    if (encrypted) {
      localStorage.setItem(KEYS.FAVORITES, encrypted);
    }
  }

  static getFavorites() {
    const encrypted = localStorage.getItem(KEYS.FAVORITES);
    if (!encrypted) return [];
    const decrypted = SecurityUtils.decryptData(encrypted);
    return decrypted || [];
  }

  // Search History storage
  static saveRecentSearches(searches) {
    localStorage.setItem(KEYS.SEARCHES, JSON.stringify(searches));
  }

  static getRecentSearches() {
    try {
      const searches = localStorage.getItem(KEYS.SEARCHES);
      return searches ? JSON.parse(searches) : [];
    } catch (e) {
      return [];
    }
  }

  // Diagnostics History Cache
  static saveDiagnosticsHistory(history) {
    const encrypted = SecurityUtils.encryptData(history);
    if (encrypted) {
      localStorage.setItem(KEYS.DIAGNOSTICS_HISTORY, encrypted);
    }
  }

  static getDiagnosticsHistory() {
    const encrypted = localStorage.getItem(KEYS.DIAGNOSTICS_HISTORY);
    if (!encrypted) return [];
    const decrypted = SecurityUtils.decryptData(encrypted);
    return decrypted || [];
  }

  // Diagnostics Queue for Offline Syncing
  static saveDiagnosticsQueue(queue) {
    const encrypted = SecurityUtils.encryptData(queue);
    if (encrypted) {
      localStorage.setItem(KEYS.DIAGNOSTICS_QUEUE, encrypted);
    }
  }

  static getDiagnosticsQueue() {
    const encrypted = localStorage.getItem(KEYS.DIAGNOSTICS_QUEUE);
    if (!encrypted) return [];
    const decrypted = SecurityUtils.decryptData(encrypted);
    return decrypted || [];
  }
}
