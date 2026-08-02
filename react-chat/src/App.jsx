import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Dashboard from './components/Dashboard'
import SettingsModal from './components/SettingsModal'
import LandingPage from './components/LandingPage'

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
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {!session ? (
        <LandingPage />
      ) : (
        <>
          <Dashboard 
            session={session} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
          />
          <SettingsModal 
            session={session} 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
          />
        </>
      )}
    </div>
  )
}
