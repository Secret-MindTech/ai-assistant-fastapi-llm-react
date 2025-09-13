// FastAPI-style API client service

import { ChatRequest, ChatResponse, validateChatMessage } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL

class APIError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
    this.name = 'APIError'
  }
}

import { parseJwt } from '../utils/jwt'

class ChatAPI {
  private getHeaders(): Record<string, string> {
    const jwt = localStorage.getItem('jwt')
    return {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json()
      throw new APIError(
        errorData.error || errorData.message || 'Request failed',
        response.status
      )
    }
    return response.json()
  }

  // POST /chat/ - Send message to AI
  async sendMessage(message: string): Promise<ChatResponse> {
    // Client-side validation (Pydantic-style)
    const validatedMessage = validateChatMessage(message)
    const jwt = localStorage.getItem('jwt')
    let user_id: number | null = null
    if (jwt) {
      const payload = parseJwt(jwt)
      user_id = payload?.sub ? parseInt(payload.sub) : null
    }
    if (!user_id) {
      throw new Error('User not authenticated')
    }
    const request: ChatRequest = {
      message: validatedMessage,
      user_id,
    } as any

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    })

    return this.handleResponse<ChatResponse>(response)
  }
}

export const chatAPI = new ChatAPI()
