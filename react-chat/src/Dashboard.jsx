import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Contacts from './Contacts'
import RecentChats from './RecentChats'
import Chat from './Chat'
import ContactList from './ContactList'

export default function Dashboard({ session }) {
  const [activeTab, setActiveTab] = useState('chats')
  const [activeChatRecipient, setActiveChatRecipient] = useState(null)
  const [recentChats, setRecentChats] = useState([])
  const [showAddContact, setShowAddContact] = useState(false)

  useEffect(() => {
    if (!session?.user) return

    setRecentChats((prev) => {
      if (prev.some((chat) => chat.id === session.user.id)) return prev
      return [{
        id: session.user.id,
        username: 'you',
        full_name: 'Message Yourself',
        isSelf: true
      }, ...prev]
    })
  }, [session])

  const ensureRecentChat = (recipient) => {
    if (!recipient) return

    setRecentChats((prev) => {
      if (prev.some((chat) => String(chat.id) === String(recipient.id))) return prev
      return [{ ...recipient }, ...prev]
    })
  }

  const handleSelectChat = (recipient) => {
    if (!recipient) return

    setActiveChatRecipient(recipient)
    setActiveTab('chats')
    ensureRecentChat(recipient)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', position: 'relative' }}>
      {/* Navigation Sidebar */}
      <div style={{ width: '200px', backgroundColor: '#1e1e2d', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ color: '#6366f1' }}>React Chat</h3>
          <button onClick={() => { setActiveTab('chats'); setActiveChatRecipient(null); }} style={{ display: 'block', width: '100%', padding: '10px', margin: '5px 0', border: 'none', background: activeTab === 'chats' ? '#323248' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>💬 Chats</button>
          <button onClick={() => setActiveTab('contacts')} style={{ display: 'block', width: '100%', padding: '10px', margin: '5px 0', border: 'none', background: activeTab === 'contacts' ? '#323248' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left' }}>👥 Contacts</button>
        </div>

        <button onClick={() => supabase.auth.signOut()} style={{ padding: '8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Log Out</button>
      </div>

      {/* Main Panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', position: 'relative' }}>
        {activeTab === 'contacts' && (
          <div>
            <Contacts session={session} onSelectContact={handleSelectChat} />
            <div style={{ marginTop: '24px' }}>
              <ContactList onStartMessage={handleSelectChat} isAddFormOpen={showAddContact} onToggleAddForm={() => setShowAddContact((prev) => !prev)} />
            </div>
          </div>
        )}

        {activeTab === 'chats' && (
          activeChatRecipient ? (
            <div>
              <button onClick={() => setActiveChatRecipient(null)} style={{ marginBottom: '10px' }}>← Back to Conversations</button>
              <Chat session={session} recipient={activeChatRecipient} onOpenChat={ensureRecentChat} />
            </div>
          ) : (
            <RecentChats session={session} recentChats={recentChats} onSelectChat={handleSelectChat} />
          )
        )}

        {activeTab === 'contacts' && !activeChatRecipient && (
          <button
            onClick={() => setShowAddContact((prev) => !prev)}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#4f46e5',
              color: '#fff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              zIndex: 1000
            }}
            title="Add Contact"
          >
            +
          </button>
        )}
      </div>

    </div>
  )
}