import { useState } from 'react'

export default function ContactList() {
  // Pre-populated "necessary" contacts
  const [contacts] = useState([
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

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        Directory
      </h2>
      
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
            {/* Contact Info Section */}
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

            {/* Call Option Button */}
            <a 
              href={`tel:${contact.phone}`}
              style={{
                textDecoration: 'none',
                backgroundColor: '#0084ff',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📞 Call
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}