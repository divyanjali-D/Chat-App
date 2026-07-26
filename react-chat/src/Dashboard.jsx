import { useState } from 'react'
import { supabase } from './supabaseClient'
import Contacts from './Contacts'
import Settings from './Settings'
import Chat from './Chat'
import RecentChats from './RecentChats'

export default function Dashboard({ session }) {
  const [activeTab, setActiveTab] = useState('contacts')
  const [activeChatRecipient, setActiveChatRecipient] = useState(null)

  const handleStartChat = (contact) => {
    setActiveChatRecipient(contact)
    setActiveTab('chats')
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div>
          <h3 className="sidebar-brand">React Chat</h3>
          <nav className="sidebar-nav">
            <button
              className={`nav-button ${activeTab === 'chats' ? 'active' : ''}`}
              onClick={() => setActiveTab('chats')}
            >
              💬 Chats
            </button>
            <button
              className={`nav-button ${activeTab === 'contacts' ? 'active' : ''}`}
              onClick={() => setActiveTab('contacts')}
            >
              👥 Contacts
            </button>
            <button
              className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Settings
            </button>
          </nav>
        </div>

        <button className="btn-danger" onClick={() => supabase.auth.signOut()}>
          Log Out
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="content-panel">
          {activeTab === 'contacts' && (
            <Contacts session={session} onSelectContact={handleStartChat} />
          )}

          {activeTab === 'chats' && (
            activeChatRecipient ? (
              <div className="content-card">
                <button className="btn btn-secondary back-button" onClick={() => setActiveChatRecipient(null)}>
                  ← Back to Recent Chats
                </button>
                <Chat session={session} recipient={activeChatRecipient} />
              </div>
            ) : (
              <RecentChats session={session} onSelectChat={(partner) => setActiveChatRecipient(partner)} />
            )
          )}

          {activeTab === 'settings' && <Settings session={session} />}
        </div>
      </main>
    </div>
  )
}