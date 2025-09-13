import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat } from '../hooks/useChat';
import { MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';

export function ChatWindow() {
  const { messages, isLoading, error, sendMessage, clearMessages, loadHistory } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={24} />
            <h1 className="text-xl font-semibold">AI Chat Assistant</h1>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={loadHistory}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              title="Refresh chat history"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={clearMessages}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              title="Clear messages"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-400" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Welcome to AI Chat!</p>
              <p>Start a conversation by typing a message below.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-gray-50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-900">AI Assistant</span>
                <span className="text-xs text-gray-500">typing...</span>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput 
        onSendMessage={sendMessage} 
        isLoading={isLoading}
        disabled={!!error}
      />
    </div>
  );
}