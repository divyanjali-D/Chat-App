import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  Bookmark,
  User
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import Contacts from './Contacts'
import RecentChats from './RecentChats'
import Chat from './Chat'
import ContactList from './ContactList'

export default function Dashboard({ session, onOpenSettings }) {
  const [activeTab, setActiveTab] = useState('chats')
  const [activeChatRecipient, setActiveChatRecipient] = useState(null)
  const [recentChats, setRecentChats] = useState([])
  const [showAddContact, setShowAddContact] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const user = session?.user

  useEffect(() => {
    if (!user) return

    setRecentChats((prev) => {
      if (prev.some((chat) => chat.id === user.id)) return prev
      return [{
        id: user.id,
        username: 'you',
        full_name: 'Message Yourself',
        isSelf: true
      }, ...prev]
    })
  }, [user])

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
    setIsMobileMenuOpen(false)
  }

  const handleNavClick = (tab) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--background)' }}>
      {/* Mobile Top Navbar Header */}
      <div style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--surface-header)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50
      }} className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.4rem' }}>💬</span>
          <span className="text-gradient-primary" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>React Chat</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '6px' }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navigation Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: 'rgba(19, 1, 12, 0.95)',
        borderRight: '1px solid var(--border-subtle)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 40,
        transition: 'transform 0.3s ease'
      }} className={`dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div>
          {/* Logo Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px var(--glow-primary)'
            }}>
              <MessageSquare size={22} color="#13010c" />
            </div>
            <div>
              <h2 className="text-gradient-primary" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                React Chat
              </h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em' }}>REALTIME CYBER</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => { handleNavClick('chats'); setActiveChatRecipient(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: activeTab === 'chats' && !activeChatRecipient ? 'rgba(246, 126, 198, 0.18)' : 'transparent',
                color: activeTab === 'chats' && !activeChatRecipient ? 'var(--primary)' : 'var(--text)',
                boxShadow: activeTab === 'chats' && !activeChatRecipient ? 'inset 0 0 0 1px var(--primary)' : 'none',
                fontWeight: activeTab === 'chats' && !activeChatRecipient ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <MessageSquare size={18} color={activeTab === 'chats' ? 'var(--primary)' : 'var(--text)'} />
              <span>Chats</span>
            </button>

            <button
              onClick={() => handleNavClick('contacts')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: activeTab === 'contacts' ? 'rgba(246, 126, 198, 0.18)' : 'transparent',
                color: activeTab === 'contacts' ? 'var(--primary)' : 'var(--text)',
                boxShadow: activeTab === 'contacts' ? 'inset 0 0 0 1px var(--primary)' : 'none',
                fontWeight: activeTab === 'contacts' ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <Users size={18} color={activeTab === 'contacts' ? 'var(--primary)' : 'var(--text)'} />
              <span>Contacts</span>
            </button>

            <button
              onClick={() => handleSelectChat({ id: user?.id, username: 'you', full_name: 'Message Yourself', isSelf: true })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <Bookmark size={18} color="var(--accent)" />
              <span>Saved Notes</span>
            </button>

            <button
              onClick={() => { onOpenSettings?.(); setIsMobileMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <SettingsIcon size={18} color="var(--secondary)" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Profile */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px',
            backgroundColor: 'rgba(32, 7, 24, 0.8)',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#13010c',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {user?.email?.charAt(0).toUpperCase() || <User size={18} />}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email?.split('@')[0]}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'inline-block' }}></span>
                  Online
                </div>
              </div>
            </div>

            <button
              onClick={() => supabase.auth.signOut()}
              title="Log Out"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '8px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {activeTab === 'contacts' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <Contacts session={session} onSelectContact={handleSelectChat} />
            <div style={{ marginTop: '28px' }}>
              <ContactList 
                onStartMessage={handleSelectChat} 
                isAddFormOpen={showAddContact} 
                onToggleAddForm={() => setShowAddContact((prev) => !prev)} 
              />
            </div>
          </div>
        )}

        {activeTab === 'chats' && (
          activeChatRecipient ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <button 
                onClick={() => setActiveChatRecipient(null)} 
                className="btn-cyber-ghost"
                style={{ alignSelf: 'flex-start', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                ← Back to Conversations
              </button>
              <Chat session={session} recipient={activeChatRecipient} onOpenChat={ensureRecentChat} />
            </div>
          ) : (
            <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
              <RecentChats session={session} recentChats={recentChats} onSelectChat={handleSelectChat} />
            </div>
          )
        )}
      </main>
    </div>
  )
}
