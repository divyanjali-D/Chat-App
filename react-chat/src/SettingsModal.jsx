import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

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
      setMsg('Profile saved!')
      setTimeout(() => { setMsg(''); onClose(); }, 1000)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '24px', borderRadius: '12px',
        width: '320px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Settings</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        {msg && <p style={{ fontSize: '0.85rem', color: msg.includes('Error') ? 'red' : 'green' }}>{msg}</p>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
          <label style={{ fontSize: '0.8rem', color: '#666' }}>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <label style={{ fontSize: '0.8rem', color: '#666' }}>Full Name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <label style={{ fontSize: '0.8rem', color: '#666' }}>Avatar URL</label>
          <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />

          <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '10px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}