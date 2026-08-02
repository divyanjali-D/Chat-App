import { MessageSquare, User, ArrowRight, Bookmark } from 'lucide-react'

export default function RecentChats({ recentChats = [], onSelectChat }) {
  const conversations = recentChats

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 className="text-gradient-primary" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            Recent Conversations
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'rgba(252, 217, 239, 0.7)' }}>
            Jump right back into your recent chats.
          </p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          border: '1px dashed var(--border-subtle)',
          borderRadius: '16px'
        }}>
          <MessageSquare size={40} color="var(--primary)" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
          <h3 style={{ margin: 0, color: 'var(--text)' }}>No Active Chats</h3>
          <p style={{ margin: '6px 0 20px', fontSize: '0.9rem', color: 'rgba(252, 217, 239, 0.6)' }}>
            Start a conversation with a contact or send notes to yourself!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {conversations.map((partner) => (
            <div 
              key={partner.id}
              onClick={() => onSelectChat(partner)}
              className="glass-panel-interactive"
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: partner.isSelf ? 'var(--accent)' : 'var(--primary)',
                  color: '#13010c',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  boxShadow: partner.isSelf ? '0 4px 14px var(--glow-accent)' : '0 4px 14px var(--glow-primary)'
                }}>
                  {partner.isSelf ? <Bookmark size={20} /> : (partner.full_name?.charAt(0).toUpperCase() || partner.username?.charAt(0).toUpperCase() || <User size={18} />)}
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {partner.full_name || partner.username}
                    {partner.isSelf && (
                      <span style={{
                        fontSize: '0.68rem',
                        backgroundColor: 'rgba(177, 240, 40, 0.2)',
                        color: 'var(--accent)',
                        padding: '1px 8px',
                        borderRadius: '999px',
                        border: '1px solid rgba(177, 240, 40, 0.3)'
                      }}>
                        Saved Notes
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(252, 217, 239, 0.6)', marginTop: '2px' }}>
                    @{partner.username || 'user'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {partner.unreadCount > 0 && (
                  <span style={{
                    backgroundColor: 'var(--accent)',
                    color: '#13010c',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    boxShadow: '0 0 10px var(--glow-accent)'
                  }}>
                    {partner.unreadCount} new
                  </span>
                )}
                <ArrowRight size={18} color="rgba(252, 217, 239, 0.5)" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
