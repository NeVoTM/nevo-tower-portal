// lib/types/index.ts - New file to create in new lib/types/ folder

export interface QueryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  city?: string;
  processingTime?: number;
  confidence?: number;
}

export interface ConversationContext {
  messages: QueryMessage[];
  currentCity: string;
  sessionId: string;
  lastQueryTime: Date;
  relevantFiles: string[];
}

export interface EnhancedQueryRequest {
  query: string;
  city: string;
  context?: ConversationContext;
  includeContext?: boolean;
}

export interface QueryResponse {
  answer: string;
  sources: string[];
  conversationId: string;
  suggestedFollowups?: string[];
  confidence: number;
  processingTime: number;
}

export interface FileData {
  filename: string;
  content: any;
  type: 'excel' | 'word' | 'image' | 'csv' | 'json' | 'text';
  size?: number;
  lastModified?: Date;
}