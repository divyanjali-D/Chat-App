import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'

export default function Chat({ session, recipient }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  if (!session) {
    return <div>Loading session...</div>
  }

  const user = session.user
  const defaultRecipient = recipient || user
  const safeRecipient = {
    id: defaultRecipient.id,
    full_name: defaultRecipient.full_name || defaultRecipient.username || defaultRecipient.email || 'Unknown',
    username: defaultRecipient.username || defaultRecipient.email || 'Unknown'
  }
  const isSelf = safeRecipient.id === user.id

  useEffect(() => {
    fetchMessages()
    markAsRead()

    const channel = supabase
      .channel(`chat_${user.id}_${safeRecipient.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new
          const isCurrent = isSelf 
            ? (msg.user_id === user.id && msg.recipient_id === user.id)
            : (msg.user_id === user.id && msg.recipient_id === safeRecipient.id) ||
              (msg.user_id === safeRecipient.id && msg.recipient_id === user.id)

          if (isCurrent) {
            setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg])
            markAsRead()
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [safeRecipient.id])

  const fetchMessages = async () => {
    try {
      let query = supabase.from('messages').select('*').order('created_at', { ascending: true })

      if (isSelf) {
        query = query.eq('user_id', user.id).eq('recipient_id', user.id)
      } else {
        query = query.or(`and(user_id.eq.${user.id},recipient_id.eq.${safeRecipient.id}),and(user_id.eq.${safeRecipient.id},recipient_id.eq.${user.id})`)
      }

      const { data, error } = await query
      if (error) {
        console.error('Failed to fetch messages:', error)
        return
      }
      setMessages(data || [])
    } catch (error) {
      console.error('Unexpected error fetching messages:', error)
    }
  }

  const markAsRead = async () => {
    if (!isSelf) {
      try {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('user_id', safeRecipient.id)
          .eq('recipient_id', user.id)
      } catch (error) {
        console.error('Failed to mark messages as read:', error)
      }
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    const content = newMessage.trim()
    if (!content) return

    const tempId = `tmp-${Date.now()}`
    const optimisticMessage = {
      id: tempId,
      content,
      user_id: user.id,
      recipient_id: safeRecipient.id,
      created_at: new Date().toISOString(),
      user_email: user.email,
      isPending: true
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setNewMessage('')

    const { data, error } = await supabase.from('messages')
      .insert([{
        content,
        user_id: user.id,
        user_email: user.email,
        recipient_id: safeRecipient.id
      }])
      .select()

    if (error) {
      console.error('Failed to send message:', error)
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId))
      return
    }

    if (data?.length) {
      setMessages((prev) => prev.map((msg) => msg.id === tempId ? data[0] : msg))
    } else {
      await fetchMessages()
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h3>{isSelf ? '📝 Note to Self' : `Chat with ${safeRecipient.full_name}`}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9fb' }}>
        {messages.map((msg) => {
          const isMe = msg.user_id === user.id
          return (
            <div key={msg.id || msg.created_at} style={{
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              backgroundColor: isMe ? '#4f46e5' : '#e5e7eb',
              color: isMe ? '#fff' : '#000',
              padding: '8px 12px', borderRadius: '12px', maxWidth: '70%',
              marginLeft: isMe ? 'auto' : '0'
            }}>
              <div>{msg.content}</div>
              {/* Message Timestamp */}
              <div style={{ fontSize: '0.65rem', opacity: 0.7, textAlign: 'right', marginTop: '3px' }}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Send</button>
      </form>
    </div>
  )
}