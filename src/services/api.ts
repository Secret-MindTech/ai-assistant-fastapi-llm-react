// FastAPI-style API client service

import { ChatRequest, ChatResponse, ChatHistoryResponse, APIError, validateChatMessage } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL 
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : 'http://localhost:54321/functions/v1';

class APIError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'APIError';
  }
}

class ChatAPI {
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-token'}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: APIError = await response.json();
      throw new APIError(error.error || 'Request failed', response.status);
    }
    return response.json();
  }

  // POST /chat/ - Send message to AI
  async sendMessage(message: string): Promise<ChatResponse> {
    // Client-side validation (Pydantic-style)
    const validatedMessage = validateChatMessage(message);
    
    const request: ChatRequest = {
      message: validatedMessage
    };

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ChatResponse>(response);
  }

  // GET /chat/history - Get chat history with pagination
  async getChatHistory(limit: number = 50, offset: number = 0): Promise<ChatHistoryResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/chat-history?${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<ChatHistoryResponse>(response);
  }
}

export const chatAPI = new ChatAPI();