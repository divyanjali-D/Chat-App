import { useState, useEffect, useRef } from 'react'
import { 
  Edit2, 
  Check, 
  Paperclip, 
  Smile, 
  Send, 
  LogOut, 
  X, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const EMOJI_LIST = [
  '😀', '😂', '😍', '😊', '😎', '👍', '❤️', '🔥', 
  '🎉', '🚀', '✨', '🙌', '💯', '💩', '💡', '🙏',
  '🥳', '🤖', '⚡', '🌟', '💖', '💬', '🏆', '👀'
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
  const [previewImage, setPreviewImage] = useState(null)
  
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

      if (!error) setMessages(data || [])
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
    <div className="glass-panel" style={{
      maxWidth: '850px',
      margin: '0 auto',
      width: '100%',
      height: '100%',
      maxHeight: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Dynamic Header */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--surface-header)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#13010c',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px var(--glow-primary)',
            flexShrink: 0
          }}>
            {recipient?.avatar_url ? (
              <img src={recipient.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              chatName.charAt(0).toUpperCase()
            )}
          </div>

          <div>
            {isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="text" 
                  value={chatName} 
                  onChange={(e) => setChatName(e.target.value)}
                  className="cyber-input"
                  style={{ padding: '4px 10px', fontSize: '0.95rem', height: '32px' }}
                  autoFocus
                />
                <button 
                  onClick={() => setIsEditingName(false)}
                  className="btn-cyber-accent"
                  style={{ padding: '4px 10px', fontSize: '0.8rem', height: '32px' }}
                >
                  <Check size={14} /> Save
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="text-gradient-primary" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                  {chatName}
                </h3>
                <button 
                  onClick={() => setIsEditingName(true)}
                  title="Rename Chat"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--accent)',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
            <div style={{ fontSize: '0.78rem', color: 'rgba(252, 217, 239, 0.7)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }}></span>
              {recipient ? (recipient.full_name || recipient.name || `@${recipient.username}`) : user.email}
            </div>
          </div>
        </div>

        <button 
          onClick={() => supabase.auth.signOut()} 
          className="btn-cyber-secondary"
          style={{ padding: '6px 14px', fontSize: '0.85rem' }}
        >
          <LogOut size={15} /> Log Out
        </button>
      </div>

      {/* Messages Feed Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: 'rgba(19, 1, 12, 0.4)'
      }}>
        {messages.length === 0 ? (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: 'rgba(252, 217, 239, 0.5)',
            padding: '30px',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '16px'
          }}>
            <ImageIcon size={36} style={{ marginBottom: '10px', color: 'var(--primary)', opacity: 0.7 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No messages yet</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Send a message or attach a file to start chatting!</p>
          </div>
        ) : (
          messages.map((msg) => {
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
                <div style={{ fontSize: '0.72rem', color: 'rgba(252, 217, 239, 0.6)', marginBottom: '4px', padding: '0 4px' }}>
                  {isMe ? 'You' : (msg.user_email?.split('@')[0] || 'User')}
                </div>

                <div style={{
                  backgroundColor: isMe ? 'var(--primary)' : 'rgba(38, 9, 29, 0.95)',
                  color: isMe ? '#13010c' : 'var(--text)',
                  fontWeight: isMe ? 600 : 400,
                  padding: isImage ? '6px' : '10px 16px',
                  borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  boxShadow: isMe ? '0 4px 18px var(--glow-primary)' : '0 4px 14px rgba(0, 0, 0, 0.4)',
                  border: isMe ? 'none' : '1px solid var(--border-subtle)',
                  wordBreak: 'break-word',
                  fontSize: '0.95rem'
                }}>
                  {isImage ? (
                    <img 
                      src={msg.content} 
                      alt="Attachment" 
                      onClick={() => setPreviewImage(msg.content)}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '260px', 
                        borderRadius: '12px',
                        display: 'block',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }} 
                    />
                  ) : (
                    msg.content
                  )}
                </div>

                <div style={{ fontSize: '0.65rem', color: 'rgba(252, 217, 239, 0.4)', marginTop: '4px', padding: '0 4px' }}>
                  {time}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Uploading Status */}
      {uploading && (
        <div style={{
          padding: '8px 20px',
          fontSize: '0.85rem',
          color: 'var(--accent)',
          backgroundColor: 'rgba(177, 240, 40, 0.1)',
          borderTop: '1px solid rgba(177, 240, 40, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Loader2 size={16} className="animate-spin" /> Uploading attachment to cloud...
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div style={{
          padding: '12px',
          backgroundColor: 'var(--surface-header)',
          borderTop: '1px solid var(--border-subtle)',
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
                padding: '6px',
                borderRadius: '8px',
                transition: 'transform 0.15s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Footer Form */}
      <form onSubmit={sendMessage} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 20px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--surface-header)'
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
          title="Attach Document or Photo"
          style={{
            background: 'rgba(246, 126, 198, 0.1)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--primary)',
            borderRadius: '12px',
            padding: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <Paperclip size={18} />
        </button>

        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Choose Emoji"
          style={{
            background: 'rgba(177, 240, 40, 0.1)',
            border: '1px solid rgba(177, 240, 40, 0.3)',
            color: 'var(--accent)',
            borderRadius: '12px',
            padding: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <Smile size={18} />
        </button>

        <input 
          type="text" 
          placeholder="Type a message..." 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          onFocus={() => setShowEmojiPicker(false)}
          className="cyber-input"
          style={{ flex: 1, borderRadius: '999px' }}
        />

        <button 
          type="submit"
          className="btn-cyber-primary"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            padding: 0,
            flexShrink: 0
          }}
        >
          <Send size={18} />
        </button>
      </form>

      {/* Fullscreen Image Preview Lightbox */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img 
              src={previewImage} 
              alt="Expanded Preview" 
              style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '16px', border: '1px solid var(--primary)' }} 
            />
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '-16px',
                right: '-16px',
                backgroundColor: 'var(--primary)',
                color: '#13010c',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
