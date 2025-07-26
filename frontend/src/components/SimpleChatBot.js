import React, { useState, useRef } from 'react';

// A simple fallback ChatBot when the main one has issues
function SimpleChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your medical assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    
    // Save user input then clear input field
    const userInput = input.toLowerCase();
    setInput('');
    
    // Simple response generation based on keywords
    setTimeout(() => {
      let response;
      
      if (userInput.includes('appointment')) {
        response = "You can schedule an appointment by clicking on 'Schedule Appointment' in the navigation menu.";
      } else if (userInput.includes('doctor')) {
        response = "Our clinic has several doctors specializing in different areas. You can see the list when you schedule an appointment.";
      } else if (userInput.includes('help')) {
        response = "I can help you with scheduling appointments, answering basic medical questions, and navigating our platform. What do you need assistance with?";
      } else if (userInput.includes('thank')) {
        response = "You're welcome! Let me know if you need anything else.";
      } else {
        response = "Thank you for your message. For specific medical advice, please schedule an appointment with one of our doctors.";
      }
      
      setMessages(prev => [...prev, { text: response, isBot: true }]);
      
      // Scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chatbot-wrapper">
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Medical Assistant</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: msg.isBot ? '#f1f1f1' : '#4285f4',
                  color: msg.isBot ? '#000' : '#fff',
                  maxWidth: '80%',
                  alignSelf: msg.isBot ? 'flex-start' : 'flex-end'
                }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} style={{ display: 'flex', borderTop: '1px solid #eee', padding: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <button 
              type="submit"
              style={{ 
                marginLeft: '10px', 
                padding: '10px 15px', 
                backgroundColor: '#4285f4', 
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Chat
        </button>
      )}
    </div>
  );
}

export default SimpleChatBot;
