import React, { useState, useEffect } from 'react'
import { ChatWindow } from './components/ChatWindow'
import { LoginButton } from './components/LoginButton'
import { AuthModal } from './components/AuthModal'
import { parseJwt } from './utils/jwt'

function App() {
  const [authOpen, setAuthOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // On mount, check for JWT in localStorage
    const jwt = localStorage.getItem('jwt')
    if (jwt) {
      setToken(jwt)
      const payload = parseJwt(jwt)
      setUserName(payload?.name || null)
    }
  }, [])

  const handleAuthSuccess = (jwt: string) => {
    setToken(jwt)
    localStorage.setItem('jwt', jwt)
    const payload = parseJwt(jwt)
    setUserName(payload?.name || null)
  }

  const handleLogout = () => {
    setToken(null)
    setUserName(null)
    localStorage.removeItem('jwt')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      <div className='container mx-auto px-4 py-8 h-screen max-w-4xl'>
        <div className='h-full flex flex-col'>
          {/* Header */}
          <header className='mb-8 flex items-center justify-between'>
            <div className='text-center flex-1'>
              <h1 className='text-4xl font-bold text-gray-800 mb-2'>
                FastAPI + React Chat POC
              </h1>
              <p className='text-gray-600 max-w-2xl mx-auto'>
                Demonstrating FastAPI, SQLAlchemy, and Pydantic patterns with a
                React frontend and AI chat functionality.
              </p>
            </div>
            <div className='ml-4'>
              {userName ? (
                <div className='flex items-center gap-2'>
                  <span className='font-semibold text-gray-700'>
                    {userName}
                  </span>
                  <button
                    className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm ml-2'
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <LoginButton onLoginClick={() => setAuthOpen(true)} />
              )}
            </div>
          </header>

          {/* Chat Window */}
          <div className='flex-1 min-h-0'>
            <ChatWindow />
          </div>

          {/* Footer */}
          <footer className='text-center mt-4 text-sm text-gray-500'>
            <p>
              Built with React, TypeScript, Tailwind CSS, and Supabase Edge
              Functions
            </p>
          </footer>
        </div>
      </div>
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default App
