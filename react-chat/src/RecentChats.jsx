export default function RecentChats({ recentChats = [], onSelectChat }) {
  const conversations = recentChats

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