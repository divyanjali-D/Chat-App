import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

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
    <div className="content-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Profile Settings</h2>
          <p className="section-subtitle">Keep your profile details tidy and current.</p>
        </div>
      </div>
      {statusMsg && <p className={`status-message ${statusMsg.includes('failed') ? 'error' : ''}`}>{statusMsg}</p>}

      <form onSubmit={updateProfile} className="settings-form">
        <div className="form-field">
          <label className="form-label">Email (Cannot be changed)</label>
          <input className="form-input" type="text" value={session.user.email} disabled />
        </div>

        <div className="form-field">
          <label className="form-label">Username</label>
          <input className="form-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="form-field">
          <label className="form-label">Full Name</label>
          <input className="form-input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="form-field">
          <label className="form-label">Avatar Image URL</label>
          <input className="form-input" type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </div>
  )
}