import { useState } from 'react'
import Auth from './Auth'

const features = [
  {
    icon: '💬',
    title: 'Real-time Messaging',
    description: 'Instant message delivery with Supabase realtime subscriptions. See messages appear as they\'re sent.'
  },
  {
    icon: '📎',
    title: 'File Sharing',
    description: 'Share images, documents, and files seamlessly. Attachments stored securely in Supabase Storage.'
  },
  {
    icon: '😊',
    title: 'Rich Expressions',
    description: 'Express yourself with emoji reactions and a built-in emoji picker for every conversation.'
  },
  {
    icon: '👥',
    title: 'Contact Management',
    description: 'Add and manage contacts easily. Start new conversations with a single click.'
  },
  {
    icon: '🔒',
    title: 'Secure Authentication',
    description: 'Email/password authentication powered by Supabase Auth. Your data stays private and secure.'
  },
  {
    icon: '📱',
    title: 'Fully Responsive',
    description: 'Beautiful experience on any device - desktop, tablet, or mobile. Chat on the go.'
  }
]

const steps = [
  {
    number: '01',
    title: 'Create Account',
    description: 'Sign up with your email and password. Verify your email to activate your account.'
  },
  {
    number: '02',
    title: 'Add Contacts',
    description: 'Search for friends by email or username. Send contact requests to start chatting.'
  },
  {
    number: '03',
    title: 'Start Chatting',
    description: 'Send messages, share files, react with emojis. All in real-time with zero latency.'
  }
]

export default function LandingPage({ onLoginClick, onSignUpClick }) {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const handleGetStarted = () => {
    setShowAuth(true)
    setAuthMode('signup')
    onSignUpClick?.()
  }

  const handleLogin = () => {
    setShowAuth(true)
    setAuthMode('login')
    onLoginClick?.()
  }

  if (showAuth) {
    return (
      <div className="app-shell">
        <div className="auth-card" style={{ maxWidth: '480px', width: '100%' }}>
          <button
            onClick={() => setShowAuth(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              lineHeight: 1
            }}
            aria-label="Close"
          >
            ×
          </button>
          <Auth 
            initialMode={authMode} 
            onSwitchMode={setAuthMode}
            onBack={() => setShowAuth(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-container">
          <div className="nav-brand" aria-label="React Chat Home">
            <span className="brand-icon" aria-hidden="true">💬</span>
            <span className="brand-text">React Chat</span>
          </div>
          <div className="nav-actions">
            <button 
              className="btn btn-ghost" 
              onClick={handleLogin}
              aria-label="Log in to your account"
            >
              Log In
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleGetStarted}
              aria-label="Create a new account"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero" role="banner">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge" aria-label="New release">
              <span className="badge-dot" aria-hidden="true"></span>
              <span>Version 2.0 - Now with Real-time Sync</span>
            </div>
            <h1 className="hero-title">
              Chat <span className="hero-highlight">Instantly</span>, Connect <span className="hero-highlight">Effortlessly</span>
            </h1>
            <p className="hero-description">
              A modern, real-time messaging application built with React and Supabase. 
              Share messages, files, and moments with friends and colleagues - all in a beautiful, secure interface.
            </p>
            <div className="hero-cta">
              <button 
                className="btn btn-primary btn-lg" 
                onClick={handleGetStarted}
                aria-label="Create your free account"
              >
                Start Chatting Free
                <span className="btn-arrow" aria-hidden="true">→</span>
              </button>
              <button 
                className="btn btn-secondary btn-lg" 
                onClick={handleLogin}
                aria-label="Sign in to existing account"
              >
                Sign In
              </button>
            </div>
            <p className="hero-trust">
              No credit card required · Setup in seconds · Secure by default
            </p>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="chat-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="preview-title">Messages</div>
              </div>
              <div className="preview-messages">
                <div className="preview-message them">
                  <div className="preview-avatar">A</div>
                  <div className="preview-bubble">Hey! Welcome to React Chat 👋</div>
                </div>
                <div className="preview-message me">
                  <div className="preview-bubble me">Thanks! This looks amazing.</div>
                </div>
                <div className="preview-message them">
                  <div className="preview-avatar">S</div>
                  <div className="preview-bubble">Share files, react with emojis, chat in real-time!</div>
                </div>
                <div className="preview-message me">
                  <div className="preview-bubble me">😊 👍 🚀</div>
                </div>
                <div className="preview-message them">
                  <div className="preview-avatar">A</div>
                  <div className="preview-bubble">Try it out - it\'s free to start!</div>
                </div>
              </div>
              <div className="preview-input">
                <div className="preview-input-inner">
                  <span className="preview-input-icon">📎</span>
                  <span className="preview-input-placeholder">Type a message...</span>
                  <span className="preview-input-icon">😊</span>
                  <span className="preview-input-send">➤</span>
                </div>
              </div>
            </div>
            <div className="hero-glow"></div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="landing-features" aria-labelledby="features-heading">
        <div className="features-container">
          <div className="features-header">
            <h2 id="features-heading" className="section-title">Everything you need to <span className="text-primary">stay connected</span></h2>
            <p className="section-description">
              Powerful features built for modern communication. Fast, secure, and delightful to use.
            </p>
          </div>
          <div className="features-grid" role="list">
            {features.map((feature, index) => (
              <article key={index} className="feature-card" role="listitem">
                <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="landing-steps" aria-labelledby="steps-heading">
        <div className="steps-container">
          <div className="steps-header">
            <h2 id="steps-heading" className="section-title">Get started in <span className="text-primary">three easy steps</span></h2>
            <p className="section-description">
              From zero to chatting in under a minute. No complex setup required.
            </p>
          </div>
          <div className="steps-grid" role="list">
            {steps.map((step, index) => (
              <article key={index} className="step-card" role="listitem">
                <div className="step-number" aria-hidden="true">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta" aria-labelledby="cta-heading">
        <div className="cta-container">
          <div className="cta-content">
            <h2 id="cta-heading" className="cta-title">Ready to start chatting?</h2>
            <p className="cta-description">
              Join thousands of users already enjoying fast, secure, and beautiful messaging.
            </p>
            <div className="cta-actions">
              <button 
                className="btn btn-primary btn-lg" 
                onClick={handleGetStarted}
                aria-label="Create your free account now"
              >
                Create Free Account
                <span className="btn-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" role="contentinfo">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo" aria-hidden="true">
              <span className="brand-icon">💬</span>
              <span className="brand-text">React Chat</span>
            </div>
            <p className="footer-tagline">
              Modern messaging built with React + Supabase. 
              Fast, secure, and open source.
            </p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#docs">Documentation</a></li>
                <li><a href="#changelog">Changelog</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                <li><a href="#community">Community</a></li>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Connect</h4>
              <ul>
                <li><a href="#github" aria-label="GitHub">GitHub</a></li>
                <li><a href="#twitter" aria-label="Twitter">Twitter</a></li>
                <li><a href="#discord" aria-label="Discord">Discord</a></li>
                <li><a href="#email" aria-label="Email">Email</a></li>
              </ul>
            </div>
          </nav>
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2025 React Chat. Built with ❤️ using React, Vite, and Supabase.
            </p>
            <div className="footer-social" aria-label="Social links">
              <a href="#github" className="social-link" aria-label="GitHub">⌘</a>
              <a href="#twitter" className="social-link" aria-label="Twitter">𝕏</a>
              <a href="#discord" className="social-link" aria-label="Discord">💬</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}