export class MessageModel {
  constructor({
    id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sender, // 'user' | 'assistant'
    text,
    timestamp = new Date().toISOString(),
    data = null // Null or structured response object
  }) {
    this.id = id;
    this.sender = sender;
    this.text = text;
    this.timestamp = timestamp;
    this.data = data ? {
      problem: data.problem || '',
      reason: data.reason || '',
      solution: data.solution || '',
      prevention: data.prevention || '',
      cost: data.cost || '',
      expectedResult: data.expectedResult || '',
      expertTip: data.expertTip || '',
      warning: data.warning || '',
    } : null;
  }
}

export class ChatModel {
  constructor({
    id = `chat_${Date.now()}`,
    title = 'New Conversation',
    category = 'General',
    createdAt = new Date().toISOString(),
    lastUpdated = new Date().toISOString(),
    messages = []
  }) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.createdAt = createdAt;
    this.lastUpdated = lastUpdated;
    this.messages = messages.map(msg => new MessageModel(msg));
  }
}
