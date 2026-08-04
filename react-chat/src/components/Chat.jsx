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
  Loader2,
  User,
  Trash2
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

export default function Chat({ session, recipient, onOpenChat, onLogout }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [messageToDelete, setMessageToDelete] = useState(null)
  
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

  const isMessageForCurrentChat = (msg, userId, recipientObj) => {
    if (!msg || !userId) return false
    const isSelf = recipientObj?.isSelf || String(recipientObj?.id) === String(userId)
    if (isSelf) {
      return String(msg.user_id) === String(userId) && (!msg.recipient_id || String(msg.recipient_id) === String(userId))
    }
    if (recipientObj?.id) {
      return (
        (String(msg.user_id) === String(userId) && String(msg.recipient_id) === String(recipientObj.id)) ||
        (String(msg.user_id) === String(recipientObj.id) && String(msg.recipient_id) === String(userId))
      )
    }
    return true
  }

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (!error && data) {
        const filtered = data.filter((msg) => isMessageForCurrentChat(msg, user.id, recipient))
        setMessages(filtered)
      }
    }

    fetchMessages()

    const channel = supabase
      .channel(`chat_${user.id}_${recipient?.id || 'global'}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new
          if (!newMsg) return

          if (isMessageForCurrentChat(newMsg, user.id, recipient)) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [recipient?.id, recipient?.isSelf, user.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const ensureProfilesExist = async (userObj, recipientObj) => {
    if (!userObj) return
    try {
      await supabase.from('profiles').upsert({
        id: userObj.id,
        username: userObj.email?.split('@')[0] || 'user',
        full_name: userObj.email?.split('@')[0] || 'User',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id', ignoreDuplicates: true })

      if (recipientObj?.id && recipientObj.id !== userObj.id) {
        await supabase.from('profiles').upsert({
          id: recipientObj.id,
          username: recipientObj.username || recipientObj.email?.split('@')[0] || 'user',
          full_name: recipientObj.full_name || recipientObj.name || 'User',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id', ignoreDuplicates: true })
      }
    } catch (e) {
      console.warn('Profile sync warning:', e)
    }
  }

  const insertMessageWithFallback = async (payload) => {
    let { data, error } = await supabase.from('messages').insert([payload]).select()

    if (error && (error.code === '23503' || error.message?.toLowerCase().includes('foreign key'))) {
      await ensureProfilesExist(user, recipient)
      const retryRes = await supabase.from('messages').insert([payload]).select()
      data = retryRes.data
      error = retryRes.error

      if (error && (error.code === '23503' || error.message?.toLowerCase().includes('foreign key'))) {
        const fallbackPayload = { ...payload }
        delete fallbackPayload.recipient_id
        const fallbackRes = await supabase.from('messages').insert([fallbackPayload]).select()
        data = fallbackRes.data
        error = fallbackRes.error
      }
    }

    if (!error && data && data.length > 0) {
      const createdMessage = data[0]
      setMessages((prev) => {
        if (prev.some((m) => m.id === createdMessage.id)) return prev
        return [...prev, createdMessage]
      })
    } else if (error) {
      alert(error.message)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const content = newMessage
    setNewMessage('')
    setShowEmojiPicker(false)

    if (recipient) {
      onOpenChat?.(recipient)
    }

    const targetRecipientId = recipient?.id || user.id

    await insertMessageWithFallback({
      content,
      user_email: user.email,
      user_id: user.id,
      recipient_id: targetRecipientId,
      created_at: new Date().toISOString(),
    })
  }

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    const { error } = await supabase.from('messages').delete().eq('id', messageToDelete.id);
    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
    } else {
      alert(error.message);
    }
    setMessageToDelete(null);
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

    const targetRecipientId = recipient?.id || user.id

    await insertMessageWithFallback({
      content: data.publicUrl,
      user_email: user.email,
      user_id: user.id,
      recipient_id: targetRecipientId,
      created_at: new Date().toISOString(),
    })

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
          onClick={onLogout || (() => supabase.auth.signOut())} 
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
                  display: 'flex',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  gap: '10px',
                  marginBottom: '16px'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isMe ? 'var(--primary)' : 'var(--surface-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                }}>
                  <User size={16} color={isMe ? '#13010c' : 'var(--text)'} />
                </div>

                {/* Message Content */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  gap: '4px'
                }}>
                  {/* Message Header */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'baseline', 
                    gap: '8px', 
                    padding: '0 4px', 
                    flexDirection: isMe ? 'row-reverse' : 'row',
                    marginBottom: '2px'
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
                      {isMe ? 'You' : (msg.user_email?.split('@')[0] || 'User')}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(252, 217, 239, 0.5)' }}>
                      {time}
                    </span>
                    {isMe && (
                      <button
                        onClick={() => setMessageToDelete(msg)}
                        title="Delete Message"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          opacity: 0.6,
                          transition: 'opacity 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div style={{
                    backgroundColor: isMe ? 'var(--primary)' : 'var(--surface-card)',
                    color: isMe ? '#13010c' : 'var(--text)',
                    padding: isImage ? '4px' : '10px 14px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    border: isMe ? 'none' : '1px solid var(--border-subtle)',
                    wordBreak: 'break-word',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
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
                          cursor: 'pointer'
                        }} 
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
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
                top: '-40px',
                right: '0px',
                background: 'rgba(246, 126, 198, 0.15)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--primary)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {messageToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 150
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setMessageToDelete(null); }}
        >
          <div className="glass-panel" style={{
            padding: '24px',
            maxWidth: '360px',
            width: '90%',
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)'
          }}>
            <Trash2 size={32} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: 'var(--text)' }}>Delete Message?</h3>
            <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: 'rgba(252, 217, 239, 0.7)' }}>
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-cyber-ghost" 
                onClick={() => setMessageToDelete(null)}
                style={{ flex: 1, padding: '10px' }}
              >
                Cancel
              </button>
              <button 
                className="btn-cyber-primary" 
                onClick={handleDeleteMessage}
                style={{ flex: 1, padding: '10px', background: 'rgba(246, 126, 198, 0.2)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
