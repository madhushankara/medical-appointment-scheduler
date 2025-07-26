import React, { useState, useRef, useEffect } from 'react';
import '../styles/confetti.css'; // Will create this later

// Simplified production ChatBot with no external API dependencies
function ProductionChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your medical assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Show welcome popup on first visit
  useEffect(() => {
    // Always show the popup and confetti during development for testing
    const hasSeenPopup = process.env.NODE_ENV === 'development' ? false : localStorage.getItem('chatBotPopupSeen');
    
    if (!hasSeenPopup) {
      console.log("Showing welcome popup and confetti");
      setTimeout(() => {
        setShowWelcomePopup(true);
        createConfetti(); // Create the confetti animation
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowWelcomePopup(false);
        }, 5000);
        
        localStorage.setItem('chatBotPopupSeen', 'true');
      }, 2000);
    }
  }, []);
  
  // Create confetti animation
  const createConfetti = () => {
    try {
      const confettiContainer = document.createElement('div');
      confettiContainer.className = 'confetti-container';
      document.body.appendChild(confettiContainer);
      
      // Create colored confetti pieces
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4'];
      
      // Create 50 confetti pieces
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.animationDelay = `${Math.random() * 3}s`;
        confetti.style.animationDuration = `${Math.random() * 2 + 3}s`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confettiContainer.appendChild(confetti);
      }
      
      console.log("Confetti animation created with", confettiContainer.children.length, "pieces");
      
      // Remove after animation completes
      setTimeout(() => {
        if (document.body.contains(confettiContainer)) {
          document.body.removeChild(confettiContainer);
          console.log("Confetti animation removed");
        }
      }, 6000);
    } catch (error) {
      console.error("Error creating confetti:", error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    const userInput = input.toLowerCase();
    setInput('');
    setIsTyping(true);
    
    // Process response after a delay to simulate typing
    setTimeout(() => {
      let botResponse;
      
      // Simple pattern matching for common medical queries
      if (userInput.includes('appointment')) {
        botResponse = "You can schedule an appointment by clicking the 'Schedule Appointment' button on the main page.";
      } else if (userInput.includes('doctor') || userInput.includes('physician')) {
        botResponse = "Our clinic has several qualified doctors specialized in various fields. You can see their profiles when scheduling an appointment.";
      } else if (userInput.includes('hour') || userInput.includes('open')) {
        botResponse = "Our clinic is open Monday through Friday, 9 AM to 5 PM, and Saturday from 10 AM to 2 PM.";
      } else if (userInput.includes('emergency')) {
        botResponse = "If you're experiencing a medical emergency, please call 911 or go to your nearest emergency room immediately.";
      } else if (userInput.includes('thank')) {
        botResponse = "You're welcome! I'm here to help. Let me know if you have any other questions.";
      } else {
        botResponse = "Thank you for your message. For specific medical advice, I'd recommend scheduling an appointment with one of our doctors who can provide personalized care.";
      }
      
      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="chatbot-wrapper">
      {/* Welcome popup notification */}
      {showWelcomePopup && (
        <div className="chatbot-welcome-popup">
          <span>Try our new AI Chat! 🎉</span>
        </div>
      )}
      
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Medical Assistant</h3>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}
              >
                {msg.isBot && <div className="bot-avatar">🤖</div>}
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-message bot">
                <div className="bot-avatar">🤖</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef}></div>
          </div>
          
          <form onSubmit={handleSendMessage} className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isTyping}
            />
            <button type="submit" disabled={isTyping || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      ) : (
        <button className="chatbot-button" onClick={() => setIsOpen(true)}>
          Chat
        </button>
      )}
    </div>
  );
}

export default ProductionChatBot;
