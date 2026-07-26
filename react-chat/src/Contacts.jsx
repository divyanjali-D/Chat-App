import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

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
    <div style={{ padding: '20px' }}>
      <h2>Contacts</h2>

      {/* 1. Add New Contact Search Box */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Add New Contact</h4>
        <form onSubmit={handleSearchContact} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Search by username or name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '8px 14px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Search</button>
        </form>

        {searchError && <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: 0 }}>{searchError}</p>}

        {searchResult && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '10px', backgroundColor: '#fff', borderRadius: '6px' }}>
            <div>
              <strong>{searchResult.full_name || searchResult.username}</strong>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>@{searchResult.username}</div>
            </div>
            <button 
              onClick={() => onSelectContact(searchResult)}
              style={{ padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Start Chat
            </button>
          </div>
        )}
      </div>

      {/* 2. Text Yourself (Note to Self) Button */}
      <div 
        onClick={() => onSelectContact({ id: myUserId, full_name: 'Message Yourself', username: 'you', isSelf: true })}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
          backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px',
          cursor: 'pointer', marginBottom: '20px'
        }}
      >
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          You
        </div>
        <div>
          <strong>Message Yourself (Saved Notes)</strong>
          <div style={{ fontSize: '0.8rem', color: '#4f46e5' }}>Send drafts, links, or quick reminders</div>
        </div>
      </div>

      {/* 3. Existing Contacts List */}
      <h4>All Users</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {contacts.map((contact) => (
          <div key={contact.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
            <div>
              <strong>{contact.full_name || contact.username}</strong>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>@{contact.username}</div>
            </div>
            <button onClick={() => onSelectContact(contact)} style={{ padding: '6px 12px', cursor: 'pointer' }}>Chat</button>
          </div>
        ))}
      </div>
    </div>
  )
}