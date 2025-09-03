// lib/conversation-manager.ts - New file to create

import { QueryMessage, ConversationContext } from './types';

export class ConversationManager {
  private static conversations = new Map<string, ConversationContext>();
  private static readonly MAX_CONTEXT_MESSAGES = 10;
  private static readonly CONTEXT_WINDOW_HOURS = 2;

  static createSession(city: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.conversations.set(sessionId, {
      messages: [],
      currentCity: city,
      sessionId,
      lastQueryTime: new Date(),
      relevantFiles: []
    });

    return sessionId;
  }

  static addMessage(
    sessionId: string, 
    message: Omit<QueryMessage, 'id' | 'timestamp'>
  ): void {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) return;

    const newMessage: QueryMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date()
    };

    conversation.messages.push(newMessage);
    conversation.lastQueryTime = new Date();

    // Keep only recent messages within context window
    this.pruneOldMessages(sessionId);
  }

  static getContext(sessionId: string): ConversationContext | null {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) return null;

    // Check if conversation is still active (within time window)
    const timeDiff = Date.now() - conversation.lastQueryTime.getTime();
    const hoursOld = timeDiff / (1000 * 60 * 60);

    if (hoursOld > this.CONTEXT_WINDOW_HOURS) {
      this.conversations.delete(sessionId);
      return null;
    }

    return conversation;
  }

  static buildContextPrompt(context: ConversationContext): string {
    if (context.messages.length === 0) return '';

    const recentMessages = context.messages
      .slice(-this.MAX_CONTEXT_MESSAGES)
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n');

    const relevantFiles = context.relevantFiles.length > 0 
      ? `\nPreviously analyzed files: ${context.relevantFiles.join(', ')}`
      : '';

    return `\n\n=== CONVERSATION CONTEXT ===
Current city: ${context.currentCity}
Recent conversation:
${recentMessages}${relevantFiles}
=== END CONTEXT ===\n`;
  }

  private static pruneOldMessages(sessionId: string): void {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) return;

    if (conversation.messages.length > this.MAX_CONTEXT_MESSAGES) {
      conversation.messages = conversation.messages.slice(-this.MAX_CONTEXT_MESSAGES);
    }
  }

  static updateRelevantFiles(sessionId: string, files: string[]): void {
    const conversation = this.conversations.get(sessionId);
    if (!conversation) return;

    // Merge with existing relevant files, keep unique
    const allFiles = new Set([...conversation.relevantFiles, ...files]);
    conversation.relevantFiles = Array.from(allFiles).slice(-20); // Keep last 20 files
  }
}

export class SmartQueryRouter {
  private static readonly QUERY_PATTERNS = {
    financial: /\b(revenue|cost|profit|budget|price|financial|money|dollar|\$|roi|investment|cash|income|expense)\b/i,
    design: /\b(rendering|image|design|architecture|floor plan|layout|visual|photo|picture|facade|elevation)\b/i,
    timeline: /\b(timeline|schedule|completion|deadline|phase|milestone|when|date|time)\b/i,
    comparison: /\b(compare|versus|vs|difference|better|similar|contrast)\b/i,
    location: /\b(address|location|neighborhood|area|zone|district|where)\b/i,
    legal: /\b(permit|zoning|regulation|compliance|legal|approval|code|ordinance)\b/i
  };

  static analyzeQuery(query: string): {
    categories: string[];
    priority: string[];
    suggestedFiles: string[];
  } {
    const categories: string[] = [];
    const priority: string[] = [];

    // Detect query categories
    for (const [category, pattern] of Object.entries(this.QUERY_PATTERNS)) {
      if (pattern.test(query)) {
        categories.push(category);
      }
    }

    // Set priority based on categories
    if (categories.includes('financial')) priority.push('excel', 'csv');
    if (categories.includes('design')) priority.push('images', 'png', 'jpg');
    if (categories.includes('timeline')) priority.push('word', 'docx');

    return {
      categories,
      priority,
      suggestedFiles: this.getSuggestedFiles(categories)
    };
  }

  private static getSuggestedFiles(categories: string[]): string[] {
    const suggestions: string[] = [];

    if (categories.includes('financial')) {
      suggestions.push('financial_model.xlsx', 'budget.csv', 'revenue_projections.xlsx');
    }
    if (categories.includes('design')) {
      suggestions.push('renderings/', 'floor_plans/', 'architectural_drawings/');
    }
    if (categories.includes('timeline')) {
      suggestions.push('project_timeline.docx', 'development_schedule.docx');
    }

    return suggestions;
  }

  static generateFollowupQuestions(
    query: string, 
    categories: string[], 
    city: string
  ): string[] {
    const followups: string[] = [];

    if (categories.includes('financial')) {
      followups.push(
        `What's the ROI projection for the ${city} project?`,
        "How do construction costs break down?",
        "What are the revenue projections by unit type?"
      );
    }

    if (categories.includes('design')) {
      followups.push(
        "Show me the latest architectural renderings",
        "What's the building height and unit count?",
        "How does the design fit the neighborhood?"
      );
    }

    if (categories.includes('timeline')) {
      followups.push(
        "When is the expected completion date?",
        "What are the major project milestones?",
        "Are there any potential delays?"
      );
    }

    return followups.slice(0, 3); // Return max 3 suggestions
  }
}