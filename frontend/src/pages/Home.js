import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { user } = useAuth();
  
  return (
    <div>
      <div className="hero-section">
        <div className="hero-content">
          <h1>Healthcare Made Simple</h1>
          <p>Schedule appointments with top doctors, manage your medical visits, and get the care you need.</p>
          {!user && (
            <div className="hero-buttons">
              <Link to="/login" className="primary-button">Log In</Link>
              <Link to="/register" className="secondary-button">Create Account</Link>
            </div>
          )}
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
               alt="Doctor with patient" />
        </div>
      </div>
      
      {user && (
        <div className="page-content">
          <h2 className="page-heading">Welcome, {user.name}!</h2>
          <p className="welcome-text">
            Thank you for using our Medical Appointment Scheduler. Here you can manage all your healthcare appointments in one place.
          </p>
          
          <div className="dashboard-actions">
            <Link to="/appointments/new" className="action-card">
              <div className="action-icon">📅</div>
              <h3>Schedule New Appointment</h3>
              <p>Book a visit with one of our healthcare providers</p>
            </Link>
            
            <Link to="/appointments" className="action-card">
              <div className="action-icon">📋</div>
              <h3>My Appointments</h3>
              <p>View your upcoming and past appointments</p>
            </Link>
            
            <div className="action-card">
              <div className="action-icon">💬</div>
              <h3>Message a Doctor</h3>
              <p>Get in touch with your healthcare provider</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="features-section">
        <h2>Why Choose Our Medical Scheduler</h2>
        
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your medical data is protected with industry-leading security measures.</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">⏱️</div>
            <h3>Save Time</h3>
            <p>No more waiting on hold to schedule appointments by phone.</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">📱</div>
            <h3>Easy Access</h3>
            <p>Manage appointments from anywhere on any device.</p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🔔</div>
            <h3>Reminders</h3>
            <p>Get notifications before your appointments.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;