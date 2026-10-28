import { context } from '../context/AppContext.js';
import { ExporterUtils } from '../utils/exporter.js';

export class UseHistory {
  /**
   * Delete a chat session by ID.
   */
  static deleteSession(chatId) {
    context.deleteChat(chatId);
  }

  /**
   * Clear all recent searches.
   */
  static clearSearches() {
    context.clearSearchHistory();
  }

  /**
   * Toggles a message's favorite state.
   */
  static toggleFavoriteResponse(messageId, text, data, category) {
    context.toggleFavorite(messageId, {
      text,
      data,
      category,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Triggers file download of the conversation.
   */
  static exportSession(chatId, format = 'txt') {
    const chat = context.state.chats.find(c => c.id === chatId);
    if (!chat) return;
    
    if (format === 'json') {
      ExporterUtils.exportToJSON(chat);
    } else {
      ExporterUtils.exportToTXT(chat);
    }
  }
}
