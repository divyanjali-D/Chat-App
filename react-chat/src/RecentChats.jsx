import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function RecentChats({ session, onSelectChat }) {
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    fetchChatsWithUnread()
  }, [])

  const fetchChatsWithUnread = async () => {
    const myId = session.user.id

    // Get all user profiles
    const { data: profiles } = await supabase.from('profiles').select('*')
    if (!profiles) return

    // Get unread counts per sender, if the column exists.
    let unreadMap = {}
    try {
      const { data: unreadMsgs, error } = await supabase
        .from('messages')
        .select('user_id')
        .eq('recipient_id', myId)
        .eq('is_read', false)

      if (!error && unreadMsgs) {
        unreadMsgs.forEach(m => {
          unreadMap[m.user_id] = (unreadMap[m.user_id] || 0) + 1
        })
      }
    } catch (err) {
      console.warn('Unread count unavailable:', err)
      unreadMap = {}
    }

    const enriched = profiles
      .filter(p => p.id !== myId)
      .map(p => ({
        ...p,
        unreadCount: unreadMap[p.id] || 0
      }))

    // Add self-chat as a recent conversation item for notes to yourself.
    enriched.unshift({
      id: myId,
      username: 'you',
      full_name: 'Message Yourself',
      unreadCount: unreadMap[myId] || 0,
      isSelf: true
    })

    setConversations(enriched)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Recent Conversations</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {conversations.map((partner) => (
          <div 
            key={partner.id}
            onClick={() => onSelectChat(partner)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px', border: '1px solid #eee', borderRadius: '8px',
              cursor: 'pointer', backgroundColor: '#fff'
            }}
          >
            <div>
              <strong>{partner.full_name || partner.username}</strong>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>@{partner.username}</div>
            </div>

            {/* Unread Notification Badge */}
            {partner.unreadCount > 0 && (
              <span style={{
                backgroundColor: '#ef4444', color: '#fff', fontSize: '0.75rem',
                fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px'
              }}>
                {partner.unreadCount} new
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}