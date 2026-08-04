import { 
  MessageSquare, 
  Paperclip, 
  Smile, 
  Users, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react'
import LiquidEther from '../LiquidEther'

const features = [
  {
    icon: <MessageSquare size={24} color="var(--primary)" />,
    title: 'Real-time Messaging',
    description: 'Instant message delivery powered by Supabase realtime subscriptions. Zero latency sync.'
  },
  {
    icon: <Paperclip size={24} color="var(--accent)" />,
    title: 'File Sharing',
    description: 'Share photos, documents, and attachments seamlessly. Stored securely in Supabase Storage.'
  },
  {
    icon: <Smile size={24} color="var(--primary)" />,
    title: 'Rich Expressiveness',
    description: 'Express yourself with built-in emoji pickers and reactions for every message.'
  },
  {
    icon: <Users size={24} color="var(--accent)" />,
    title: 'Contact Management',
    description: 'Discover friends by username, manage directory phone contacts, or save personal notes.'
  },
  {
    icon: <ShieldCheck size={24} color="var(--primary)" />,
    title: 'Secure Authentication',
    description: 'Email/password authentication powered by Supabase Auth with encrypted data.'
  },
  {
    icon: <Smartphone size={24} color="var(--accent)" />,
    title: '100% Responsive UI',
    description: 'Stunning dark neon cyber design optimized for desktop, tablet, and mobile devices.'
  }
]

const steps = [
  {
    number: '01',
    title: 'Create Account',
    description: 'Sign up with your email in under 10 seconds.'
  },
  {
    number: '02',
    title: 'Find Contacts',
    description: 'Search friends by username or save notes to yourself.'
  },
  {
    number: '03',
    title: 'Start Chatting',
    description: 'Send instant messages, react with emojis, and share files.'
  }
]

export default function LandingPage({ onLoginClick, onSignUpClick }) {
  const handleGetStarted = () => {
    onSignUpClick?.('signup');
  };

  const handleLogin = () => {
    onLoginClick?.('login');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--text)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <LiquidEther
          colors={[ '#5227FF', '#e80b0b', '#000000' ]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {/* Top Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(19, 1, 12, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="nav-logo-icon" style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img src="/favicon.svg" alt="React Chat Logo" style={{ width: '100%', height: '100%' }} />
            </div>
            <span className="text-gradient-primary" style={{ fontWeight: 800, fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>
              React Chat
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn-cyber-ghost" onClick={handleLogin}>
              Log In
            </button>
            <button className="btn-cyber-primary" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
        </div>
      </nav>
      
      

      {/* Hero Section */}
      <header style={{ padding: '140px 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(177, 240, 40, 0.15)',
              border: '1px solid rgba(177, 240, 40, 0.3)',
              color: 'var(--accent)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '20px'
            }}>
              <Sparkles size={14} /> Next-Gen Cyber Messaging
            </div>

            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px', fontFamily: 'Outfit, sans-serif' }}>
              Chat <span className="text-gradient-primary">Instantly</span>, Connect <span className="text-gradient-accent">Effortlessly</span>
            </h1>

            <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'rgba(252, 217, 239, 0.75)', margin: '0 0 32px' }}>
              A ultra-fast, real-time messaging application built with React and Supabase. Share messages, photos, and files in a sleek neon dark aesthetic.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <button className="btn-cyber-primary" onClick={handleGetStarted} style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
                Start Chatting Free <ArrowRight size={18} />
              </button>
              <button className="btn-cyber-secondary" onClick={handleLogin} style={{ padding: '14px 24px', fontSize: '1rem' }}>
                Sign In
              </button>
            </div>
          </div>

          {/* Hero Visual Chat Preview Card */}
          <div className="glass-panel animate-float" style={{ padding: '24px', border: '1px solid var(--border-glow)', boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px var(--glow-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
              <span style={{ fontSize: '0.85rem', color: 'rgba(252, 217, 239, 0.6)', marginLeft: 'auto' }}>React Chat v2.0</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(38, 9, 29, 0.95)', padding: '10px 14px', borderRadius: '14px', border: '1px solid var(--border-subtle)', maxWidth: '85%' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'block', fontWeight: 600 }}>Alex</span>
                Welcome to the new Cyber Chat! 👋
              </div>

              <div style={{ alignSelf: 'flex-end', backgroundColor: 'var(--primary)', color: '#13010c', fontWeight: 600, padding: '10px 14px', borderRadius: '14px', maxWidth: '85%', boxShadow: '0 4px 14px var(--glow-primary)' }}>
                This dark neon UI looks insane! 🚀🔥
              </div>

              <div style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(38, 9, 29, 0.95)', padding: '10px 14px', borderRadius: '14px', border: '1px solid var(--border-subtle)', maxWidth: '85%' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'block', fontWeight: 600 }}>Alex</span>
                Share photos, emoji reactions & saved notes in real-time.
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature Cards Grid */}
      <section style={{ padding: '80px 24px', backgroundColor: 'rgba(19, 1, 12, 0.6)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 className="text-gradient-primary" style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 12px', fontFamily: 'Outfit, sans-serif' }}>
              Everything you need for instant messaging
            </h2>
            <p style={{ color: 'rgba(252, 217, 239, 0.7)', fontSize: '1.05rem', margin: 0 }}>
              Packed with high-performance real-time capabilities and sleek design.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {features.map((f, i) => (
              <div key={i} className="glass-panel-interactive" style={{ padding: '28px' }}>
                <div style={{ marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: 'var(--text)' }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(252, 217, 239, 0.65)', lineHeight: 1.6 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Steps */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 className="text-gradient-accent" style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 12px', fontFamily: 'Outfit, sans-serif' }}>
            Get started in three easy steps
          </h2>
          <p style={{ color: 'rgba(252, 217, 239, 0.7)', fontSize: '1.05rem', margin: 0 }}>
            From sign up to chatting in under 60 seconds.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {steps.map((s, i) => (
            <div key={i} className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-subtle)' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--accent)',
                fontFamily: 'Outfit, sans-serif',
                marginBottom: '12px'
              }}>
                {s.number}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: 'var(--text)' }}>{s.title}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(252, 217, 239, 0.65)' }}>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <footer style={{
        padding: '60px 24px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(19, 1, 12, 0.95)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="text-gradient-primary" style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 14px', fontFamily: 'Outfit, sans-serif' }}>
            Ready to experience React Chat?
          </h2>
          <p style={{ color: 'rgba(252, 217, 239, 0.7)', fontSize: '1rem', margin: '0 0 28px' }}>
            Join now and chat in real-time with custom dark theme support.
          </p>
          <button className="btn-cyber-primary" onClick={handleGetStarted} style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
            Create Free Account <ArrowRight size={18} />
          </button>
        </div>
      </footer>
      </div>
    </div>
  )
}
