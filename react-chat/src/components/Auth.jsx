import { useState, useEffect } from 'react'
import { Mail, Lock, LogIn, UserPlus, ArrowLeft } from 'lucide-react'
import { supabase } from '../supabaseClient'

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--background)'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px var(--glow-primary)'
      }}>
        {onBack && (
          <button
            onClick={onBack}
            className="btn-cyber-ghost"
            style={{
              padding: '6px 12px',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <h2 className="text-gradient-primary" style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ margin: '0 0 24px', color: 'rgba(252, 217, 239, 0.7)', fontSize: '0.92rem' }}>
          {mode === 'login' 
            ? 'Sign in to join real-time cyber conversations.' 
            : 'Start chatting in seconds. Free & secure.'}
        </p>

        {error && (
          <div className="status-message error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <input
              className="cyber-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ paddingLeft: '40px' }}
            />
            <Mail size={18} color="var(--primary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }} />
          </div>

          <div style={{ position: 'relative' }}>
            <input
              className="cyber-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              style={{ paddingLeft: '40px' }}
            />
            <Lock size={18} color="var(--primary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }} />
          </div>

          <button className="btn-cyber-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '6px', padding: '12px' }}>
            {loading ? 'Please wait...' : (mode === 'login' ? <><LogIn size={18} /> Log In</> : <><UserPlus size={18} /> Create Account</>)}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 0 0' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(252, 217, 239, 0.6)' }}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button 
              type="button" 
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem',
                marginLeft: '4px'
              }}
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
