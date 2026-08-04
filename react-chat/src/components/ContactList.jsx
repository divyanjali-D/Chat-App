import { useState, useEffect } from 'react'
import { Phone, UserPlus, MessageSquare, Briefcase, X, Check } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function ContactList({ onStartMessage = () => {}, isAddFormOpen = false, onToggleAddForm = () => {} }) {
  const [contacts, setContacts] = useState([
    { 
      id: '11111111-1111-1111-1111-111111111111', 
      name: 'Emergency Services', 
      role: 'Urgent Assistance', 
      phone: '911', 
      avatarColor: '#F44336' 
    },
    { 
      id: '22222222-2222-2222-2222-222222222222', 
      name: 'App Support', 
      role: 'Technical Help', 
      phone: '+18005550199', 
      avatarColor: '#4CAF50' 
    },
    { 
      id: '33333333-3333-3333-3333-333333333333', 
      name: 'Jane Doe', 
      role: 'System Admin', 
      phone: '+12345678900', 
      avatarColor: '#2196F3' 
    },
    { 
      id: '44444444-4444-4444-4444-444444444444', 
      name: 'John Smith', 
      role: 'Colleague', 
      phone: '+19876543210', 
      avatarColor: '#FF9800' 
    }
  ])

  // State for Add Contact form
  const [showAddForm, setShowAddForm] = useState(isAddFormOpen)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newPhone, setNewPhone] = useState('')

  useEffect(() => {
    setShowAddForm(isAddFormOpen)
  }, [isAddFormOpen])

  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data?.length > 0) {
        setContacts(
          data.map((contact) => ({
            ...contact,
            avatarColor: contact.avatar_color || '#f67ec6',
            role: contact.role || 'Contact'
          }))
        )
      }
    }

    fetchContacts()
  }, [])

  // Add new contact handler
  const handleAddContact = async (e) => {
    e.preventDefault()
    if (!newName.trim() || !newPhone.trim()) return

    const colors = ['#f67ec6', '#b1f028', '#9d8c0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name: newName,
          role: newRole || 'Contact',
          phone: newPhone,
          avatar_color: randomColor
        }
      ])
      .select()

    if (error) {
      alert('Error adding contact: ' + error.message)
      return
    }

    if (data) {
      setContacts((prev) => [...prev, {
        ...data[0],
        avatarColor: data[0].avatar_color || randomColor,
        role: data[0].role || 'Contact'
      }])
    }

    setNewName('')
    setNewRole('')
    setNewPhone('')
    setShowAddForm(false)
    onToggleAddForm()
  }

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 className="text-gradient-primary" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
            Directory Contacts
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'rgba(252, 217, 239, 0.6)' }}>
            Quick access to team leads, support, and custom phone contacts.
          </p>
        </div>

        <button
          onClick={() => { setShowAddForm(!showAddForm); onToggleAddForm(); }}
          className="btn-cyber-accent"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          {showAddForm ? <X size={16} /> : <UserPlus size={16} />}
          {showAddForm ? 'Close' : 'Add Contact'}
        </button>
      </div>

      {/* Add Contact Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddContact} className="glass-panel" style={{
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid var(--accent)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <h4 style={{ margin: 0, color: 'var(--accent)', fontSize: '0.95rem', fontWeight: 700 }}>
            New Contact Details
          </h4>
          <input 
            type="text" 
            placeholder="Full Name *" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            required 
            className="cyber-input"
          />
          <input 
            type="text" 
            placeholder="Role / Title (e.g., Manager, Developer)" 
            value={newRole} 
            onChange={(e) => setNewRole(e.target.value)} 
            className="cyber-input"
          />
          <input 
            type="tel" 
            placeholder="Phone Number *" 
            value={newPhone} 
            onChange={(e) => setNewPhone(e.target.value)} 
            required 
            className="cyber-input"
          />
          <button 
            type="submit" 
            className="btn-cyber-accent"
            style={{ width: '100%', marginTop: '4px' }}
          >
            <Check size={16} /> Save Contact
          </button>
        </form>
      )}

      {/* Contact List Rendering */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {contacts.map((contact) => (
          <div 
            key={contact.id} 
            className="glass-panel-interactive"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '14px 16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: contact.avatarColor || 'var(--primary)',
                color: '#13010c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                {contact.name.charAt(0)}
              </div>
              
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text)' }}>{contact.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(252, 217, 239, 0.7)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Briefcase size={12} color="var(--primary)" /> {contact.role}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(252, 217, 239, 0.5)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Phone size={12} color="var(--accent)" /> {contact.phone}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartMessage({
                id: contact.id,
                full_name: contact.name,
                username: contact.name.toLowerCase().replace(/\s+/g, ''),
                role: contact.role,
                phone: contact.phone,
                avatarColor: contact.avatarColor
              })}
              className="btn-cyber-primary"
              style={{
                padding: '8px 14px',
                fontSize: '0.82rem'
              }}
            >
              <MessageSquare size={15} /> Message
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
