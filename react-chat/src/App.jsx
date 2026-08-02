import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Dashboard from './Dashboard'
import SettingsModal from './SettingsModal'
import LandingPage from './LandingPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {!session ? (
        <LandingPage />
      ) : (
        <>
          <Dashboard session={session} />
          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              fontSize: '1.2rem',
              cursor: 'pointer',
              zIndex: 999
            }}
            title="Settings"
          >
            ⚙️
          </button>
          <SettingsModal session={session} isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
      )}
    </div>
  )
}
