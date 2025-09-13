import React, { useState } from 'react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (token: string) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/login' : '/signup'
      const body =
        mode === 'login' ? { email, password } : { email, name, password }
      const res = await fetch(import.meta.env.VITE_API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.error || 'Auth failed')
      if (mode === 'login') {
        onAuthSuccess(data.access_token)
        onClose()
      } else {
        // After signup, switch to login mode
        setMode('login')
        setError('Signup successful! Please log in.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-sm'>
        <h2 className='text-xl font-bold mb-4 text-center'>
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type='email'
            className='w-full border rounded px-3 py-2'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {mode === 'signup' && (
            <input
              type='text'
              className='w-full border rounded px-3 py-2'
              placeholder='Name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type='password'
            className='w-full border rounded px-3 py-2'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className='text-red-600 text-sm'>{error}</div>}
          <button
            type='submit'
            className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors'
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Login'
              : 'Sign Up'}
          </button>
        </form>
        <div className='mt-4 text-center text-sm'>
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                className='text-blue-600 hover:underline'
                onClick={() => setMode('signup')}
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                className='text-blue-600 hover:underline'
                onClick={() => setMode('login')}
              >
                Login
              </button>
            </span>
          )}
        </div>
        <button
          className='absolute top-2 right-2 text-gray-400 hover:text-gray-600'
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  )
}
