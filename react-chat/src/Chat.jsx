import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'

const EMOJI_LIST = [
  '😀', '😂', '😍', '😊', '😎', '👍', '❤️', '🔥', 
  '🎉', '🚀', '✨', '🙌', '💯', '💩', '💡', '🙏'
]

const formatMessageTime = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export default function Chat({ session, recipient, onOpenChat }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Chat Room Name state & editing mode
  const [chatName, setChatName] = useState(recipient?.full_name || recipient?.name || recipient?.username || 'Group Chat')
  const [isEditingName, setIsEditingName] = useState(false)
  
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const user = session.user

  useEffect(() => {
    if (recipient?.full_name || recipient?.name || recipient?.username) {
      setChatName(recipient.full_name || recipient.name || recipient.username)
      onOpenChat?.(recipient)
    }
  }, [recipient, onOpenChat])

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error) setMessages(data)
    }

    fetchMessages()

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const content = newMessage
    setNewMessage('')
    setShowEmojiPicker(false)

    if (recipient) {
      onOpenChat?.(recipient)
    }

    const { error } = await supabase.from('messages').insert([
      {
        content,
        user_email: user.email,
        user_id: user.id,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) alert(error.message)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}_${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, file)

    if (uploadError) {
      alert('Upload failed: Ensure a public bucket named "chat-attachments" exists in Supabase.\n' + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(filePath)

    if (recipient) {
      onOpenChat?.(recipient)
    }

    const { error: msgError } = await supabase.from('messages').insert([
      {
        content: data.publicUrl,
        user_email: user.email,
        user_id: user.id,
        created_at: new Date().toISOString(),
      },
    ])

    if (msgError) alert(msgError.message)
    setUploading(false)
    e.target.value = ''
  }

  const addEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji)
  }

  const isImageUrl = (url) => {
    return typeof url === 'string' && (
      url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ||
      url.includes('/chat-attachments/')
    )
  }

  return (
    <div style={{ 
      maxWidth: '650px', 
      margin: '20px auto', 
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: '#fff',
      border: '1px solid #eaeaea'
    }}>
      {/* Dynamic Header with Editable Name */}
      <div style={{ 
        padding: '16px 20px', 
        backgroundColor: '#0084ff', 
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          {isEditingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <input 
                type="text" 
                value={chatName} 
                onChange={(e) => setChatName(e.target.value)}
                style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  border: 'none', 
                  outline: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 'bold'
                }}
                autoFocus
              />
              <button 
                onClick={() => setIsEditingName(false)}
                style={{
                  backgroundColor: '#fff',
                  color: '#0084ff',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{chatName}</h3>
              <button 
                onClick={() => setIsEditingName(true)}
                title="Rename Chat"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: 0,
                  opacity: 0.8
                }}
              >
                ✏️
              </button>
            </div>
          )}
          <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>{recipient ? (recipient.full_name || recipient.name || recipient.username) : user.email}</span>
        </div>

        <button 
          onClick={() => supabase.auth.signOut()} 
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Log Out
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        height: '420px',
        overflowY: 'auto',
        padding: '16px',
        backgroundColor: '#f9f9fb',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg) => {
          const isMe = msg.user_id === user.id
          const isImage = isImageUrl(msg.content)
          const time = formatMessageTime(msg.created_at)

          return (
            <div 
              key={msg.id} 
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '4px', padding: '0 4px' }}>
                {isMe ? 'You' : msg.user_email.split('@')[0]}
              </div>

              <div style={{
                backgroundColor: isMe ? '#0084ff' : '#ffffff',
                color: isMe ? '#fff' : '#333',
                padding: isImage ? '6px' : '10px 14px',
                borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                wordBreak: 'break-word'
              }}>
                {isImage ? (
                  <a href={msg.content} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={msg.content} 
                      alt="Attachment" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '220px', 
                        borderRadius: '10px',
                        display: 'block'
                      }} 
                    />
                  </a>
                ) : (
                  msg.content
                )}
              </div>

              <div style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '3px', padding: '0 4px' }}>
                {time}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {uploading && (
        <div style={{ padding: '6px 16px', fontSize: '0.85rem', color: '#0084ff', backgroundColor: '#eef6ff' }}>
          ⏳ Uploading attachment...
        </div>
      )}

      {showEmojiPicker && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fff',
          borderTop: '1px solid #eee',
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '8px',
          fontSize: '1.3rem'
        }}>
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Footer input form */}
      <form onSubmit={sendMessage} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        borderTop: '1px solid #eee',
        backgroundColor: '#fff'
      }}>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          style={{ display: 'none' }} 
          accept="image/*,application/pdf,text/*"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach document or picture"
          style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '6px', color: '#666' }}
        >
          📎
        </button>

        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Choose Emoji"
          style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '6px', color: '#666' }}
        >
          😊
        </button>

        <input 
          type="text" 
          placeholder="Type a message..." 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          onFocus={() => setShowEmojiPicker(false)}
          style={{ 
            flex: 1, 
            padding: '10px 14px', 
            borderRadius: '20px', 
            border: '1px solid #ddd',
            outline: 'none',
            fontSize: '0.95rem'
          }}
        />

        <button 
          type="submit"
          style={{
            backgroundColor: '#0084ff',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          ➔
        </button>
      </form>
    </div>
  )
}