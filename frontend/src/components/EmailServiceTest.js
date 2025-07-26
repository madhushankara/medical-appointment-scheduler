import React, { useState } from 'react';
import { sendRegistrationEmail } from '../services/emailService';

const EmailServiceTest = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState({});

  // Check for environment variables when component mounts
  React.useEffect(() => {
    const emailKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_REGISTRATION;
    
    setConfigStatus({
      key: emailKey ? `Set (${emailKey.substring(0, 4)}...)` : 'Missing',
      service: serviceId ? `Set (${serviceId})` : 'Missing',
      template: templateId ? `Set (${templateId})` : 'Missing'
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending test email...');
    
    try {
      const result = await sendRegistrationEmail(name, email);
      if (result) {
        setStatus('✅ Email sent successfully! Check your inbox.');
      } else {
        setStatus('❌ Failed to send email. Check console for details.');
      }
    } catch (error) {
      console.error('Email test error:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-test-container">
      <h3>Email Service Test</h3>
      
      <div className="config-status">
        <h4>Configuration Status:</h4>
        <ul>
          <li>EmailJS Public Key: <span className={configStatus.key?.includes('Set') ? 'success' : 'error'}>{configStatus.key}</span></li>
          <li>Service ID: <span className={configStatus.service?.includes('Set') ? 'success' : 'error'}>{configStatus.service}</span></li>
          <li>Template ID: <span className={configStatus.template?.includes('Set') ? 'success' : 'error'}>{configStatus.template}</span></li>
        </ul>
        <p className="note">Note: You need to set up a service and templates in your EmailJS account.</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-field"
          />
        </div>
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          className="submit-button"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
        
        {status && <div className="status-message">{status}</div>}
      </form>
    </div>
  );
};

export default EmailServiceTest;
