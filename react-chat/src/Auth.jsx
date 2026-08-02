import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Auth({ initialMode = 'login', onSwitchMode, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState(initialMode)
  const [error, setError] = useState('')

  useEffect(() => {
    setMode(initialMode)
    setError('')
  }, [initialMode])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else alert('Check your email for the confirmation link!')
    setLoading(false)
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
    onSwitchMode?.(newMode)
  }

  return (
    <div className="app-shell">
      <div className="auth-card">
        {onBack && (
          <button
            onClick={onBack}
            className="auth-back"
            aria-label="Back to landing page"
          >
            ← Back
          </button>
        )}
        <h2 className="auth-title">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="auth-subtitle">
          {mode === 'login' 
            ? 'Sign in to join the conversation.' 
            : 'Start chatting in seconds. Free forever.'}
        </p>
        {error && (
          <div className="status-message error" role="alert">
            {error}
          </div>
        )}
        <form className="auth-form" onSubmit={mode === 'login' ? handleLogin : handleSignUp}>
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={6}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Log In' : 'Create Account')}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            disabled={loading}
          >
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}
