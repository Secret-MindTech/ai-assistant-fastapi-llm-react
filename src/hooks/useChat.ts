// Custom React hook for chat functionality

import { useState, useCallback } from 'react'
import { ChatMessage } from '../types/api'
import { chatAPI } from '../services/api'

interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (message: string) => Promise<void>
  clearMessages: () => void
  loadHistory: () => void
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (message: string) => {
      if (isLoading) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await chatAPI.sendMessage(message)

        // Add both user message and AI response to the chat
        setMessages((prev) => [
          ...prev,
          response.user_message,
          response.ai_response,
        ])
      } catch (err) {
        if (err instanceof Error && err.message === 'User not authenticated') {
          setError('Please login to chat.')
        } else {
          console.error('Error sending message:', err)
          setError(
            err instanceof Error ? err.message : 'Failed to send message'
          )
        }
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const loadHistory = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    loadHistory,
  }
}
