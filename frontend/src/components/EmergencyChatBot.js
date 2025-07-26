import React, { useState } from 'react';

function EmergencyChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  
  const styles = {
    button: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '60px',
      height: '60px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      fontSize: '16px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      zIndex: 9999
    },
    container: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '320px',
      height: '450px',
      backgroundColor: 'white',
      boxShadow: '0 0 20px rgba(0,0,0,0.2)',
      borderRadius: '10px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999
    },
    header: {
      backgroundColor: '#4f46e5',
      color: 'white',
      padding: '15px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    body: {
      padding: '15px',
      flex: 1,
      overflowY: 'auto'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer'
    },
    message: {
      margin: '0 0 15px 0'
    }
  };

  if (!isOpen) {
    return <button onClick={() => setIsOpen(true)} style={styles.button}>Chat</button>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={{margin: 0}}>Medical Assistant</h3>
        <button onClick={() => setIsOpen(false)} style={styles.closeButton}>×</button>
      </div>
      <div style={styles.body}>
        <p style={styles.message}>
          Our chat assistant is temporarily offline. Please use one of these options:
        </p>
        <p style={styles.message}>
          1. Schedule an appointment through our booking page
        </p>
        <p style={styles.message}>
          2. Contact us at support@medicalscheduler.com
        </p>
        <p style={styles.message}>
          3. Call our office during business hours: (555) 123-4567
        </p>
      </div>
    </div>
  );
}

export default EmergencyChatBot;
