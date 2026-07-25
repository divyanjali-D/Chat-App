import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'

export default function Chat({ session }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const user = session.user

  useEffect(() => {
    // 1. Fetch initial message history
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error) setMessages(data)
    }

    fetchMessages()

    // 2. Subscribe to real-time INSERT changes on the messages table
    const channel = supabase
      .channel('chat_room')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const content = newMessage
    setNewMessage('') // clear input immediately

    const { error } = await supabase.from('messages').insert([
      {
        content,
        user_email: user.email,
        user_id: user.id,
      },
    ])

    if (error) alert(error.message)
  }

  return (
    <div className="app-shell">
      <div className="chat-card">
        <div className="chat-header">
          <div>
            <p className="chat-eyebrow">Live chat</p>
            <h3 className="chat-title">Logged in as: {user.email}</h3>
          </div>
          <button className="btn btn-secondary" onClick={() => supabase.auth.signOut()}>
            Log Out
          </button>
        </div>

        <div className="message-list">
          {messages.map((msg) => {
            const isMe = msg.user_id === user.id
            return (
              <div key={msg.id} className={`message-bubble ${isMe ? 'me' : 'them'}`}>
                <div className="message-meta">{msg.user_email}</div>
                <div>{msg.content}</div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="chat-form">
          <input
            className="input-field"
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}