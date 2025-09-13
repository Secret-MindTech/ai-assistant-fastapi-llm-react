// Pydantic-style TypeScript interfaces matching the Python backend models

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  is_active: boolean;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  user_message: ChatMessage;
  ai_response: ChatMessage;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  total: number;
  limit: number;
  offset: number;
}

export interface APIError {
  error: string;
  type?: string;
}

// Request validation (client-side Pydantic-style)
export function validateChatMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    throw new Error('Message is required and must be a string');
  }
  
  const trimmed = message.trim();
  if (trimmed.length === 0) {
    throw new Error('Message cannot be empty');
  }
  
  if (trimmed.length > 4000) {
    throw new Error('Message too long (max 4000 characters)');
  }
  
  return trimmed;
}