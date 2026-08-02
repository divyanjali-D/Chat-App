import { useState, useEffect } from 'react'
import { Save, User, Check, AlertCircle } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Settings({ session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    getProfile()
  }, [session])

  const getProfile = async () => {
    try {
      setLoading(true)
      const { user } = session

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, full_name, avatar_url`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) throw error

      if (data) {
        setUsername(data.username || '')
        setFullName(data.full_name || '')
        setAvatarUrl(data.avatar_url || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { user } = session

      const updates = {
        id: user.id,
        username,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      setStatusMsg('Profile updated successfully!')
    } catch (error) {
      setStatusMsg(`Update failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '28px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 className="text-gradient-primary" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
          Profile Settings
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'rgba(252, 217, 239, 0.7)' }}>
          Keep your display profile details updated.
        </p>
      </div>

      {statusMsg && (
        <div className={`status-message ${statusMsg.includes('failed') ? 'error' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {statusMsg.includes('failed') ? <AlertCircle size={16} /> : <Check size={16} />}
          {statusMsg}
        </div>
      )}

      <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(252, 217, 239, 0.8)', display: 'block', marginBottom: '4px' }}>
            Email
          </label>
          <input className="cyber-input" type="text" value={session.user.email} disabled style={{ opacity: 0.6 }} />
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(252, 217, 239, 0.8)', display: 'block', marginBottom: '4px' }}>
            Username
          </label>
          <input className="cyber-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(252, 217, 239, 0.8)', display: 'block', marginBottom: '4px' }}>
            Full Name
          </label>
          <input className="cyber-input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(252, 217, 239, 0.8)', display: 'block', marginBottom: '4px' }}>
            Avatar Image URL
          </label>
          <input className="cyber-input" type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
        </div>

        <button className="btn-cyber-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '6px' }}>
          <Save size={18} /> {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </div>
  )
}
