import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function ContactList({ onStartMessage = () => {}, isAddFormOpen = false, onToggleAddForm = () => {} }) {
  const [contacts, setContacts] = useState([
    { 
      id: 1, 
      name: 'Emergency Services', 
      role: 'Urgent Assistance', 
      phone: '911', 
      avatarColor: '#F44336' 
    },
    { 
      id: 2, 
      name: 'App Support', 
      role: 'Technical Help', 
      phone: '+18005550199', 
      avatarColor: '#4CAF50' 
    },
    { 
      id: 3, 
      name: 'Jane Doe', 
      role: 'System Admin', 
      phone: '+12345678900', 
      avatarColor: '#2196F3' 
    },
    { 
      id: 4, 
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
            avatarColor: contact.avatar_color || '#0084ff',
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

    const colors = ['#F44336', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4']
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
    <div style={{ maxWidth: '400px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ margin: '0 0 12px 0', fontSize: '1.4rem' }}>Directory</h2>

      {/* Add Contact Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddContact} style={{
          backgroundColor: '#f9f9fb',
          padding: '12px',
          borderRadius: '8px',
          marginTop: '12px',
          border: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>New Contact Details</h4>
          <input 
            type="text" 
            placeholder="Full Name *" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            required 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="text" 
            placeholder="Role / Title (e.g., Manager)" 
            value={newRole} 
            onChange={(e) => setNewRole(e.target.value)} 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="tel" 
            placeholder="Phone Number *" 
            value={newPhone} 
            onChange={(e) => setNewPhone(e.target.value)} 
            required 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button 
            type="submit" 
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            Save Contact
          </button>
        </form>
      )}

      {/* Contact List Rendering */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
        {contacts.map((contact) => (
          <div 
            key={contact.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: contact.avatarColor,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>
                {contact.name.charAt(0)}
              </div>
              
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{contact.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>{contact.role}</div>
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
              style={{
                border: 'none',
                backgroundColor: '#0084ff',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              💬 Message
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}