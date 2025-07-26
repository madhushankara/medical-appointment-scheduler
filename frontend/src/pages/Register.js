import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendRegistrationEmail } from '../services/emailService';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (name && email && password) {
        const newUser = {
          id: Date.now(),
          name: name,
          email: email,
          role: role
        };
        
        // Store in our mock user database
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        storedUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(storedUsers));
        
        // Send registration confirmation email
        try {
          await sendRegistrationEmail(name, email);
        } catch (error) {
          console.error("Failed to send registration email", error);
          // Don't block registration if email fails
        }
        
        // Log the user in
        login(newUser);
        
        // Navigate to dashboard
        navigate('/');
      } else {
        setError('All fields are required');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="page-heading">Create Account</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role">I am a:</label>
          <select
            id="role"
            className="input-field"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="auth-redirect">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}

export default Register;