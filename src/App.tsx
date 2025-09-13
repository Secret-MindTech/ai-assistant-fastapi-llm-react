import React from 'react';
import { ChatWindow } from './components/ChatWindow';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 h-screen max-w-4xl">
        <div className="h-full flex flex-col">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              FastAPI + React Chat POC
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Demonstrating FastAPI, SQLAlchemy, and Pydantic patterns with 
              a React frontend and AI chat functionality.
            </p>
          </header>

          {/* Chat Window */}
          <div className="flex-1 min-h-0">
            <ChatWindow />
          </div>

          {/* Footer */}
          <footer className="text-center mt-4 text-sm text-gray-500">
            <p>Built with React, TypeScript, Tailwind CSS, and Supabase Edge Functions</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;