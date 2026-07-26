import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Contacts({ session, onSelectContact }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      // Fetch all users except current logged in user
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ne('id', session.user.id)

      if (error) throw error
      setContacts(data || [])
    } catch (err) {
      console.error('Error fetching contacts:', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="content-card">Loading contacts...</div>

  return (
    <div className="content-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Contacts</h2>
          <p className="section-subtitle">Pick someone to start a private conversation.</p>
        </div>
      </div>
      <div className="contacts-list">
        {contacts.length === 0 ? (
          <p className="section-subtitle">No other registered users found.</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="contact-item">
              <div className="contact-primary">
                <img
                  src={contact.avatar_url || 'https://via.placeholder.com/40'}
                  alt="avatar"
                  className="contact-avatar"
                />
                <div className="contact-info">
                  <span className="contact-name">{contact.full_name || contact.username}</span>
                  <span className="contact-username">@{contact.username}</span>
                </div>
              </div>
              <button className="btn btn-primary contact-action" onClick={() => onSelectContact(contact)}>
                Message
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}