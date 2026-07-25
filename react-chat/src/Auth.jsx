import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('Check your email for the confirmation link!')
    setLoading(false)
  }

  return (
    <div className="app-shell">
      <div className="auth-card">
        <h2 className="auth-title">Welcome to React Chat</h2>
        <p className="auth-subtitle">Sign in to join the conversation.</p>
        <form className="auth-form">
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
            {loading ? 'Please wait...' : 'Log In'}
          </button>
          <button className="btn btn-secondary" onClick={handleSignUp} disabled={loading}>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  )
}