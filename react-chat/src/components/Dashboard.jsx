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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const user = session?.user

  useEffect(() => {
    if (!user) return

    const fetchRecentConversations = async () => {
      try {
        const { data: userMsgs } = await supabase
          .from('messages')
          .select('user_id, recipient_id')
          .or(`user_id.eq.${user.id},recipient_id.eq.${user.id}`)

        const partnerIds = new Set()
        if (userMsgs) {
          userMsgs.forEach((msg) => {
            if (msg.user_id && msg.user_id !== user.id) partnerIds.add(msg.user_id)
            if (msg.recipient_id && msg.recipient_id !== user.id) partnerIds.add(msg.recipient_id)
          })
        }

        let partners = []
        if (partnerIds.size > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', Array.from(partnerIds))

          if (profiles) partners = profiles
        }

        const selfChat = {
          id: user.id,
          username: 'you',
          full_name: 'Message Yourself',
          isSelf: true
        }

        setRecentChats([selfChat, ...partners])
      } catch (e) {
        console.error('Error fetching recent conversations:', e)
      }
    }

    fetchRecentConversations()
  }, [user])

  const ensureRecentChat = (recipient) => {
    if (!recipient) return

    setRecentChats((prev) => {
      const filtered = prev.filter((chat) => String(chat.id) !== String(recipient.id))
      return [{ ...recipient }, ...filtered]
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
            <div className="dash-logo-icon" style={{
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
              className="dash-nav-btn"
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
                textAlign: 'left'
              }}
            >
              <MessageSquare size={18} color={activeTab === 'chats' ? 'var(--primary)' : 'var(--text)'} />
              <span>Chats</span>
            </button>

            <button
              onClick={() => handleNavClick('contacts')}
              className="dash-nav-btn"
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
                textAlign: 'left'
              }}
            >
              <Users size={18} color={activeTab === 'contacts' ? 'var(--primary)' : 'var(--text)'} />
              <span>Contacts</span>
            </button>

            <button
              onClick={() => handleSelectChat({ id: user?.id, username: 'you', full_name: 'Message Yourself', isSelf: true })}
              className="dash-nav-btn"
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
                textAlign: 'left'
              }}
            >
              <Bookmark size={18} color="var(--accent)" />
              <span>Saved Notes</span>
            </button>

            <button
              onClick={() => { onOpenSettings?.(); setIsMobileMenuOpen(false); }}
              className="dash-nav-btn"
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
                textAlign: 'left'
              }}
            >
              <SettingsIcon size={18} color="var(--secondary)" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Profile */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div className="dash-user-card" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px',
            backgroundColor: 'rgba(32, 7, 24, 0.8)',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div className="dash-avatar" style={{
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
                  <span className="online-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'inline-block' }}></span>
                  Online
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              title="Log Out"
              className="dash-logout-btn"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '8px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
              <Chat session={session} recipient={activeChatRecipient} onOpenChat={ensureRecentChat} onLogout={() => setShowLogoutConfirm(true)} />
            </div>
          ) : (
            <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
              <RecentChats session={session} recentChats={recentChats} onSelectChat={handleSelectChat} />
            </div>
          )
        )}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutConfirm(false); }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(19, 1, 12, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div className="glass-panel" style={{
            maxWidth: '400px',
            width: '100%',
            padding: '28px',
            textAlign: 'center',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(239, 68, 68, 0.2)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <LogOut size={26} />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
              Confirm Log Out
            </h3>

            <p style={{ margin: '0 0 24px', fontSize: '0.92rem', color: 'rgba(252, 217, 239, 0.7)', lineHeight: 1.5 }}>
              Are you sure you want to log out of your session? You will need to sign in again to access your chats.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-cyber-ghost"
                style={{ flex: 1, padding: '10px 18px', border: '1px solid var(--border-subtle)' }}
              >
                Cancel
              </button>

              <button 
                onClick={() => supabase.auth.signOut()}
                style={{
                  flex: 1,
                  padding: '10px 18px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
