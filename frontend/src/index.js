import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Create root and render app with error boundary
const root = ReactDOM.createRoot(document.getElementById('root'));
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  // Render a fallback UI
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h2>Something went wrong</h2>
      <p>Please try refreshing the page or contact support.</p>
    </div>
  `;
}

// Create a script for clearing the localStorage for testing
if (process.env.NODE_ENV === 'development') {
  window.clearChatPopupSeen = () => {
    localStorage.removeItem('chatBotPopupSeen');
    console.log('chatBotPopupSeen cleared from localStorage. Refresh to see popup again.');
  };
}