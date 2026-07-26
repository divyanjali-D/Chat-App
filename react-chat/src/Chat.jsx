import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'

export default function Chat({ session, recipient }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const user = session.user

  useEffect(() => {
    // 1. Fetch existing messages between logged-in user & selected recipient
    const fetchDirectMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(user_id.eq.${user.id},recipient_id.eq.${recipient.id}),and(user_id.eq.${recipient.id},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error.message)
      } else {
        setMessages(data || [])
      }
    }

    fetchDirectMessages()

    // 2. Subscribe to new incoming messages in real-time
    const channel = supabase
      .channel(`chat_${user.id}_${recipient.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new
          // Only append if the message belongs to this active conversation
          const isCurrentConversation =
            (msg.user_id === user.id && msg.recipient_id === recipient.id) ||
            (msg.user_id === recipient.id && msg.recipient_id === user.id)

          if (isCurrentConversation) {
            setMessages((prev) => [...prev, msg])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [recipient.id, user.id])

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const content = newMessage
    setNewMessage('')

    const { error } = await supabase.from('messages').insert([
      {
        content,
        user_id: user.id,
        user_email: user.email,
        recipient_id: recipient.id,
      },
    ])

    if (error) alert(`Error sending message: ${error.message}`)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header showing active chat user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
        <img 
          src={recipient.avatar_url || 'https://via.placeholder.com/40'} 
          alt="avatar" 
          style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
        />
        <div>
          <h3 style={{ margin: 0 }}>{recipient.full_name || recipient.username}</h3>
          <span style={{ fontSize: '0.8rem', color: '#666' }}>@{recipient.username}</span>
        </div>
      </div>

      {/* Message History Box */}
      <div style={{
        height: '420px',
        overflowY: 'auto',
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '8px',
        backgroundColor: '#f9f9fb',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.map((msg) => {
          const isMe = msg.user_id === user.id
          return (
            <div 
              key={msg.id} 
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                backgroundColor: isMe ? '#4f46e5' : '#ffffff',
                color: isMe ? '#ffffff' : '#111827',
                padding: '10px 14px',
                borderRadius: '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                maxWidth: '75%'
              }}
            >
              <div>{msg.content}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <input 
          type="text" 
          placeholder="Type your message..." 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '12px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Send
        </button>
      </form>
    </div>
  )
}