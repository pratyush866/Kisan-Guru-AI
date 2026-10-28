export class ExporterUtils {
  /**
   * Generates a downloadable text block representing a conversation.
   */
  static exportToTXT(chat) {
    if (!chat || !chat.messages) return;

    let content = `==================================================\n`;
    content += `KISAN GURU AI - CHAT HISTORY EXPORT\n`;
    content += `Title: ${chat.title || 'Untitled Advice'}\n`;
    content += `Date: ${new Date(chat.createdAt).toLocaleDateString()}\n`;
    content += `Category: ${chat.category || 'General'}\n`;
    content += `==================================================\n\n`;

    chat.messages.forEach((msg, idx) => {
      const role = msg.sender === 'user' ? 'Farmer' : 'Kisan Guru AI';
      content += `[${role}] - ${new Date(msg.timestamp).toLocaleTimeString()}\n`;
      
      if (msg.sender === 'user') {
        content += `${msg.text}\n\n`;
      } else {
        // Formatted structured response blocks
        const data = msg.data || {};
        content += `Problem: ${data.problem || msg.text}\n`;
        content += `Reason: ${data.reason || 'N/A'}\n`;
        content += `Solution: ${data.solution || 'N/A'}\n`;
        content += `Preventive Measures: ${data.prevention || 'N/A'}\n`;
        content += `Estimated Cost: ${data.cost || 'N/A'}\n`;
        content += `Expected Result: ${data.expectedResult || 'N/A'}\n`;
        content += `Expert Tip: ${data.expertTip || 'N/A'}\n`;
        content += `Safety Warning: ${data.warning || 'N/A'}\n\n`;
      }
      content += `--------------------------------------------------\n`;
    });

    this.downloadFile(content, `kisan_guru_chat_${chat.id}.txt`, 'text/plain');
  }

  /**
   * Generates a downloadable JSON representation of the chat object.
   */
  static exportToJSON(chat) {
    if (!chat) return;
    const jsonString = JSON.stringify(chat, null, 2);
    this.downloadFile(jsonString, `kisan_guru_chat_${chat.id}.json`, 'application/json');
  }

  /**
   * Internal browser-triggered file downloader wrapper.
   */
  static downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Clean up anchor tag lifecycle
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
