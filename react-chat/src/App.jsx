import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Dashboard from './components/Dashboard'
import SettingsModal from './components/SettingsModal'
import LandingPage from './components/LandingPage'
import Auth from './components/Auth'

export default function App() {
  const [session, setSession] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState('login');

  const handleLoginOpen = (mode) => {
    setLoginMode(mode);
    setIsLoginOpen(true);
  };

  // Existing return stays unchanged

  const ensureProfile = async (user) => {
    if (!user) return
    try {
      const { data } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
      if (!data) {
        await supabase.from('profiles').upsert({
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          full_name: user.email?.split('@')[0] || 'User',
          updated_at: new Date().toISOString()
        })
      }
    } catch (err) {
      console.warn('Profile sync warning:', err)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) ensureProfile(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) ensureProfile(session.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {!session ? (
        <>
          <LandingPage onLoginClick={handleLoginOpen} onSignUpClick={handleLoginOpen} />
          {isLoginOpen && (
            <Auth
              initialMode={loginMode}
              onSwitchMode={setLoginMode}
              onBack={() => setIsLoginOpen(false)}
            />
          )}
        </>
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
