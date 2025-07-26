import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AppointmentForm from './pages/AppointmentForm';
import MyAppointments from './pages/MyAppointments';
import APITest from './components/APITest';
import EmailServiceTest from './components/EmailServiceTest';
import DebugEnvironment from './components/DebugEnvironment';

// Import chat components - use different ones based on environment
import ChatBot from './components/ChatBot';
import SimpleChatBot from './components/SimpleChatBot';
import ProductionChatBot from './components/ProductionChatBot';
import EmergencyFallbackChat from './components/EmergencyFallbackChat';

// Navigation component that changes based on auth state
function Navigation() {
  const { user, logout } = useAuth();
  
  return (
    <nav>
      <div className="container nav-flex">
        <div className="nav-title">
          <Link to="/" className="logo-link">Medical Appointment Scheduler</Link>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/appointments">My Appointments</Link>
              <span className="user-greeting">Hello, {user.name}</span>
              <button onClick={logout} className="logout-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Protected route component
const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return user ? element : <Navigate to="/login" />;
};

function App() {
  const [useFallbackChat, setUseFallbackChat] = useState(false);
  
  // Hide debug UI based on environment variable
  const showDebug = process.env.REACT_APP_DEBUG_MODE === "true";
  
  // Determine what chat component to use based on environment and state
  const getChatComponent = () => {
    // For production, always use ProductionChatBot for reliability
    if (process.env.NODE_ENV === 'production') {
      console.log('Using production chatbot');
      return <ProductionChatBot />;
    }
    
    // In development, use fallback if needed
    console.log('Using development chatbot:', useFallbackChat ? 'SimpleChatBot' : 'ChatBot');
    return useFallbackChat ? <SimpleChatBot /> : <ChatBot />;
  };
  
  // Error handler for ChatBot - this ensures we have a working chatbot at all times
  useEffect(() => {
    try {
      // Check if ChatBot fails to load
      const handleError = () => {
        console.log("Using fallback chat due to error");
        setUseFallbackChat(true);
      };
      
      // Set a timeout to switch to fallback if main chatbot doesn't render properly
      const timeoutId = setTimeout(() => {
        // Check if ChatBot has rendered its button
        const chatbotElement = document.querySelector('.chatbot-container, .chatbot-button');
        if (!chatbotElement) {
          console.log("ChatBot not detected, using fallback");
          handleError();
        }
      }, 5000);
      
      window.addEventListener('error', handleError);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('error', handleError);
      };
    } catch (e) {
      console.error('Error in ChatBot error handler:', e);
      setUseFallbackChat(true);
    }
  }, []);
  
  const renderChatBot = () => {
    try {
      return <ChatBot />;
    } catch (error) {
      console.error("Error rendering ChatBot:", error);
      return <EmergencyFallbackChat />;
    }
  };
  
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navigation />
          
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/appointments/new" 
                element={<ProtectedRoute element={<AppointmentForm />} />} 
              />
              <Route 
                path="/appointments" 
                element={<ProtectedRoute element={<MyAppointments />} />} 
              />
              {showDebug && (
                <>
                  <Route path="/api-test" element={<APITest />} />
                  <Route path="/email-test" element={<EmailServiceTest />} />
                  <Route path="/debug" element={<DebugEnvironment />} />
                </>
              )}
            </Routes>
          </div>
          
          {renderChatBot()}
          
          {/* Footer with conditional debug links */}
          <footer className="app-footer">
            <div className="container">
              {showDebug ? (
                <>
                  <Link to="/api-test">API Test</Link> | 
                  <Link to="/email-test">Email Test</Link> |
                  <Link to="/debug">Debug</Link>
                </>
              ) : (
                <span>&copy; {new Date().getFullYear()} Medical Scheduler</span>
              )}
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;