import { useState, useEffect } from 'react'
import { Search, Bookmark, MessageSquare, User, Sparkles } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Contacts({ session, onSelectContact }) {
  const [contacts, setContacts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchError, setSearchError] = useState('')

  const myUserId = session.user.id

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', myUserId)

    setContacts(data || [])
  }

  const handleSearchContact = async (e) => {
    e.preventDefault()
    setSearchError('')
    setSearchResult(null)

    if (!searchQuery.trim()) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      .neq('id', myUserId)
      .maybeSingle()

    if (error || !data) {
      setSearchError('No user found with that username or name.')
    } else {
      setSearchResult(data)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="text-gradient-primary" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
            Contacts & Users
          </h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(252, 217, 239, 0.7)', fontSize: '0.9rem' }}>
            Discover people on React Chat or keep quick notes to yourself.
          </p>
        </div>
      </div>

      {/* 1. Message Yourself (Notes to Self) Hero Card */}
      <div 
        onClick={() => onSelectContact({ id: myUserId, full_name: 'Message Yourself', username: 'you', isSelf: true })}
        className="glass-panel-interactive"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          border: '1px solid var(--accent)'
        }}
      >
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          color: '#13010c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px var(--glow-accent)',
          flexShrink: 0
        }}>
          <Bookmark size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{ fontSize: '1.05rem', color: 'var(--text)' }}>Message Yourself (Saved Notes)</strong>
            <span style={{
              backgroundColor: 'rgba(177, 240, 40, 0.2)',
              color: 'var(--accent)',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              border: '1px solid rgba(177, 240, 40, 0.4)'
            }}>
              SPECIAL
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(252, 217, 239, 0.7)', marginTop: '2px' }}>
            Send quick drafts, file attachments, or personal reminders
          </div>
        </div>
        <button className="btn-cyber-accent" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          Open Notes
        </button>
      </div>

      {/* 2. Search & Add User */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={18} color="var(--primary)" />
          <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--primary)' }}>Find New People</h4>
        </div>
        
        <form onSubmit={handleSearchContact} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Search by username or full name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cyber-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-cyber-primary" style={{ padding: '10px 20px' }}>
            <Search size={18} /> Search
          </button>
        </form>

        {searchError && (
          <div className="status-message error" style={{ marginTop: '12px', marginBottom: 0 }}>
            {searchError}
          </div>
        )}

        {searchResult && (
          <div className="glass-panel-interactive" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#13010c',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {searchResult.username?.charAt(0).toUpperCase() || <User size={18} />}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{searchResult.full_name || searchResult.username}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(252, 217, 239, 0.6)' }}>@{searchResult.username}</div>
              </div>
            </div>

            <button 
              onClick={() => onSelectContact(searchResult)}
              className="btn-cyber-accent"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <MessageSquare size={16} /> Start Chat
            </button>
          </div>
        )}
      </div>

      {/* 3. Existing User Profiles */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: 'var(--text)' }}>
          All Registered Users ({contacts.length})
        </h4>

        {contacts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(252, 217, 239, 0.5)', padding: '20px 0' }}>
            No other users found yet. Invite friends to sign up!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                className="glass-panel-interactive"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(246, 126, 198, 0.2)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {contact.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{contact.full_name || contact.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(252, 217, 239, 0.6)' }}>@{contact.username || 'user'}</div>
                  </div>
                </div>

                <button 
                  onClick={() => onSelectContact(contact)} 
                  className="btn-cyber-primary"
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  <MessageSquare size={15} /> Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
