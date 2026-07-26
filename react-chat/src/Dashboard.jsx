import { useState } from 'react'
import { supabase } from './supabaseClient'
import Contacts from './Contacts'
import RecentChats from './RecentChats'
import Chat from './Chat'
import SettingsModal from './SettingsModal'

export default function Dashboard({ session }) {
  const [activeTab, setActiveTab] = useState('chats')
  const [activeChatRecipient, setActiveChatRecipient] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {activeTab === 'contacts' && (
          <Contacts session={session} onSelectContact={(c) => { setActiveChatRecipient(c); setActiveTab('chats'); }} />
        )}

        {activeTab === 'chats' && (
          activeChatRecipient ? (
            <div>
              <button onClick={() => setActiveChatRecipient(null)} style={{ marginBottom: '10px' }}>← Back to Conversations</button>
              <Chat session={session} recipient={activeChatRecipient} />
            </div>
          ) : (
            <RecentChats session={session} onSelectChat={(p) => setActiveChatRecipient(p)} />
          )
        )}
      </div>

      {/* Bottom-Right Floating Settings Button */}
      <button 
        onClick={() => setIsSettingsOpen(true)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          width: '48px', height: '48px', borderRadius: '50%',
          backgroundColor: '#4f46e5', color: '#fff', border: 'none',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontSize: '1.2rem',
          cursor: 'pointer', zIndex: 999
        }}
        title="Settings"
      >
        ⚙️
      </button>

      {/* Settings Modal */}
      <SettingsModal session={session} isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}