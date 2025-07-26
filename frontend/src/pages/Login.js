import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendLoginEmail } from '../services/emailService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (email && password) {
        // Look for existing user in localStorage
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = storedUsers.find(user => user.email === email);
        
        if (foundUser) {
          // In a real app, you would verify the password hash
          login(foundUser);
          
          // Send login notification email - this reuses the registration template
          try {
            await sendLoginEmail(foundUser.name, foundUser.email);
          } catch (error) {
            console.error("Failed to send login email notification", error);
            // Don't block login if email fails
          }
          
          navigate('/');
        } else {
          // For demo purposes, create a mock user
          const mockUser = {
            id: Date.now(),
            name: email.split('@')[0], // Use part of email as name
            email: email,
            role: 'patient'
          };
          login(mockUser);
          navigate('/');
        }
      } else {
        setError('Email and password are required');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="page-heading">Login</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
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
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="auth-redirect">
        Don't have an account? <Link to="/register">Create one</Link>
      </div>
    </div>
  );
}

export default Login;