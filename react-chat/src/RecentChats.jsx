import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function RecentChats({ session, onSelectChat }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentContacts = async () => {
      if (!session?.user?.id) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', session.user.id)
        .order('updated_at', { ascending: false })

      if (!error) {
        setContacts(data || [])
      }

      setLoading(false)
    }

    fetchRecentContacts()
  }, [session?.user?.id])

  if (loading) {
    return <div className="content-card">Loading recent chats...</div>
  }

  return (
    <div className="content-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Recent Chats</h2>
          <p className="section-subtitle">Choose a contact to continue your conversation.</p>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="empty-state">
          <p className="section-subtitle">No recent chats yet. Open Contacts to start a conversation.</p>
        </div>
      ) : (
        <div className="contacts-list">
          {contacts.map((contact) => (
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
              <button className="btn btn-primary contact-action" onClick={() => onSelectChat?.(contact)}>
                Open chat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}