import React, { useState, useRef, useEffect } from 'react';

// Ultra-simplified chatbot for emergency fallback scenarios
function EmergencyFallbackChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your medical assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    
    // Save user input then clear input field
    const userInput = input;
    setInput('');
    
    // Simple fallback response
    setTimeout(() => {
      let response = "Thank you for your message. For specific medical advice, please schedule an appointment with one of our doctors.";
      
      if (userInput.toLowerCase().includes("appointment")) {
        response = "You can schedule an appointment by clicking on the 'Schedule Appointment' button at the top of this page.";
      } else if (userInput.toLowerCase().includes("contact") || userInput.toLowerCase().includes("help")) {
        response = "For assistance, please call our office at (555) 123-4567 or send an email to support@medicalscheduler.com";
      }
      
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    }, 500);
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Medical Assistant</h3>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}
              >
                {msg.isBot && <div className="bot-avatar">🩺</div>}
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit" disabled={!input.trim()}>
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

export default EmergencyFallbackChat;
