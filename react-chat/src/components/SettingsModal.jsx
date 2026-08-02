import { useState, useEffect } from 'react'
import { X, Save, User, Check, AlertCircle } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function SettingsModal({ session, isOpen, onClose }) {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (isOpen) fetchProfile()
  }, [isOpen])

  const fetchProfile = async () => {
    if (!session?.user) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (data) {
      setUsername(data.username || '')
      setFullName(data.full_name || '')
      setAvatarUrl(data.avatar_url || '')
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      username,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date()
    })

    setLoading(false)
    if (error) setMsg(`Error: ${error.message}`)
    else {
      setMsg('Profile saved successfully!')
      setTimeout(() => { setMsg(''); onClose(); }, 1200)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        padding: '28px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid var(--border-glow)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px var(--glow-primary)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 className="text-gradient-primary" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
              Profile Settings
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'rgba(252, 217, 239, 0.7)' }}>
              Update your display name and avatar details.
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              border: 'none', 
              background: 'rgba(246, 126, 198, 0.1)', 
              color: 'var(--text)', 
              cursor: 'pointer', 
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Avatar Preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#13010c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px var(--glow-primary)',
            border: '2px solid var(--accent)',
            overflow: 'hidden'
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              fullName?.charAt(0).toUpperCase() || username?.charAt(0).toUpperCase() || <User size={32} />
            )}
          </div>
        </div>

        {msg && (
          <div className={`status-message ${msg.includes('Error') ? 'error' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {msg.includes('Error') ? <AlertCircle size={16} /> : <Check size={16} />}
            {msg}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(252, 217, 239, 0.8)', display: 'block', marginBottom: '4px' }}>
              Email (Account Identifier)
            </label>
            <input 
              type="text" 
              value={session?.user?.email || ''} 
              disabled 
              className="cyber-input" 
              style={{ opacity: 0.6, cursor: 'not-allowed' }} 
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(252, 217, 239, 0.8)', display: 'block', marginBottom: '4px' }}>
              Username
            </label>
            <input 
              type="text" 
              placeholder="e.g. cyber_ninja"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="cyber-input" 
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(252, 217, 239, 0.8)', display: 'block', marginBottom: '4px' }}>
              Full Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Alex Mercer"
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              className="cyber-input" 
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(252, 217, 239, 0.8)', display: 'block', marginBottom: '4px' }}>
              Avatar Image URL
            </label>
            <input 
              type="text" 
              placeholder="https://example.com/avatar.png"
              value={avatarUrl} 
              onChange={(e) => setAvatarUrl(e.target.value)} 
              className="cyber-input" 
            />
          </div>

          <button type="submit" disabled={loading} className="btn-cyber-primary" style={{ marginTop: '8px', width: '100%' }}>
            <Save size={18} /> {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
