import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

function ChatBot() {
  // State variables
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your medical assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [apiStatus, setApiStatus] = useState('loading');
  const [apiStatusMessage, setApiStatusMessage] = useState('Connecting...');
  const [currentModel, setCurrentModel] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [apiError, setApiError] = useState(null);
  const apiAttempts = useRef(0);
  
  // Get HF token from environment if available, otherwise use the hardcoded one
  const HF_API_KEY = process.env.REACT_APP_HUGGINGFACE_TOKEN || "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";
  
  // Show welcome popup on first visit
  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('chatBotPopupSeen');
    if (!hasSeenPopup) {
      setTimeout(() => {
        setShowWelcomePopup(true);
        // Create confetti elements
        try {
          createConfetti();
        } catch (error) {
          console.error("Confetti creation error:", error);
          // Non-critical error, continue without confetti
        }
        
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
      
      // Create 50 confetti pieces
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.animationDelay = `${Math.random() * 3}s`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confettiContainer.appendChild(confetti);
      }
      
      // Remove after animation completes
      setTimeout(() => {
        if (document.body.contains(confettiContainer)) {
          document.body.removeChild(confettiContainer);
        }
      }, 6000);
    } catch (error) {
      console.error("Error in confetti animation:", error);
      // Non-critical animation error, just log and continue
    }
  };
  
  // Debug info for production troubleshooting
  useEffect(() => {
    console.log("ChatBot component mounted");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("API Key available:", !!HF_API_KEY);
  }, [HF_API_KEY]);

  const [conversationContext, setConversationContext] = useState({
    lastIntent: null,
    waitingForAppointmentConfirmation: false,
    followUpQuestion: null
  });

  // Medical doctor model configuration
  const MODEL = {
      name: "Medical Doctor AI",
      url: "https://api-inference.huggingface.co/models/google/gemma-2-9b-it", 
      type: "medical"
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Helper functions
  const containsAny = useCallback((input, terms) => {
    return terms.some(term => input.toLowerCase().includes(term.toLowerCase()));
  }, []);

  // Test API connection with more detailed status reporting
  useEffect(() => {
    const testApiConnection = async () => {
      setApiStatus('loading');
      setApiStatusMessage('Connecting to Medical Doctor AI...');
      
      try {
        if (apiAttempts.current >= 3) {
          // After 3 failed attempts, just use fallback mode
          console.log("Too many API connection attempts failed, using fallback mode");
          setApiStatus('offline');
          setApiStatusMessage('Using fallback mode');
          return;
        }

        apiAttempts.current += 1;
        
        const response = await axios.post(
          MODEL.url,
          {
            inputs: "Hello, I'm a patient with symptoms of fever.",
            parameters: {
              max_new_tokens: 50, // Reduce tokens for test
              temperature: 0.7,
              return_full_text: false,
              wait_for_model: true
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${HF_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 8000 // Reduce timeout for initial test
          }
        );
        
        console.log("Medical model connection successful");
        setCurrentModel(MODEL);
        setApiStatus('ready');
        setApiStatusMessage('Connected');
        setApiError(null);
        apiAttempts.current = 0;
        
      } catch (error) {
        console.error("Medical model connection failed:", error);
        setApiError(error.toString());
        
        if (error.response) {
          // Server responded with error
          setApiStatusMessage(`Error: ${error.response.status} - ${error.response.statusText || 'Server error'}`);
        } else if (error.request) {
          // Request made but no response
          setApiStatusMessage('Error: No response from server');
        } else {
          // Request setup error
          setApiStatusMessage(`Error: ${error.message}`);
        }
        
        setApiStatus('offline');
      }
    };
    
    testApiConnection();
    
    // Set up automatic retry every 2 minutes, but limit attempts
    const retryInterval = setInterval(() => {
      if (apiStatus === 'offline' && apiAttempts.current < 3) {
        console.log("Retrying API connection...");
        testApiConnection();
      }
    }, 120000); // 2 minutes
    
    return () => {
      clearInterval(retryInterval);
    };
  }, [MODEL.url, HF_API_KEY]);
  
  // Add session timeout to reset when no user is present
  useEffect(() => {
    // Reset memory if no user interaction for 1 minute
    const inactivityTimeout = setTimeout(() => {
      // Clear message history if no activity for 1 minute
      if (messages.length > 1) {
        console.log("Inactivity detected, clearing chat memory");
        setMessages([{ text: "Hi! How can I help you today?", isBot: true }]);
        setConversationContext({
          lastIntent: null,
          waitingForAppointmentConfirmation: false,
          followUpQuestion: null
        });
      }
    }, 60000); // 1 minute timeout
    
    return () => {
      // Clean up timeout when component unmounts or when messages change
      clearTimeout(inactivityTimeout);
    };
  }, [messages]); // Reset the timer when messages change (when there's activity)

  // Optimized message cleanup - keep only last 20 messages
  useEffect(() => {
    if (messages.length > 20) {
      setMessages(prev => {
        // Keep first message (greeting) and last 19 messages
        return [prev[0], ...prev.slice(prev.length - 19)];
      });
    }
  }, [messages]);

  // Send message to LLM API with enhanced status reporting and error handling
  const queryModel = useCallback(async (userMessage, conversationHistory) => {
    if (apiStatus !== 'ready' || !currentModel) {
      throw new Error("API not available");
    }
    
    setApiStatusMessage('Thinking...');
    
    // Format conversation history for the model with specific instructions
    const prompt = `<s>[INST] You are a medical doctor working at a healthcare clinic. Respond directly to patients as if you are having a conversation with them in person.

Important instructions:
- Respond in a warm, professional manner like a real doctor would
- Give only ONE clear response, not multiple options or numbered lists
- DO NOT include analysis of the conversation or meta-commentary
- DO NOT prefix your response with "Assistant:"
- DO NOT mention that you're an AI
- DO NOT say things like "The user is asking..." or "Conversation analysis"
- DO NOT offer multiple options in the form of "Option 1:", "Option 2:", etc.
- Keep responses concise and helpful
- Focus on providing medically sound advice while encouraging proper medical care

Previous conversation:
${conversationHistory.map(msg => msg.isBot ? `Doctor: ${msg.text}` : `Patient: ${msg.text}`).join('\n')}

Patient: ${userMessage}
Doctor: [/INST]</s>`;

    try {
      const controller = new AbortController();
      
      // Set a timeout to abort the request if it takes too long
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000); // 15 seconds timeout
      
      const response = await axios.post(
        MODEL.url,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000,
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      setApiStatusMessage('Connected'); // Reset status after successful query
      
      // Extract the generated text from the response
      let generatedText = "";
      if (Array.isArray(response.data) && response.data[0]?.generated_text) {
        generatedText = response.data[0].generated_text;
      } else if (response.data?.generated_text) {
        generatedText = response.data.generated_text;
      } else if (typeof response.data === 'string') {
        generatedText = response.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        setApiStatusMessage('Warning: Unusual response format');
        throw new Error("Invalid response format");
      }

      return generatedText.trim();
    } catch (error) {
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        console.error("Request timed out");
        setApiStatusMessage('Error: Request timed out');
      } else {
        console.error("API query failed:", error);
        
        if (error.response) {
          setApiStatusMessage(`Error: ${error.response.status} - ${error.response.statusText || 'Query failed'}`);
        } else if (error.request) {
          setApiStatusMessage('Error: No response from server');
        } else {
          setApiStatusMessage(`Error: ${error.message}`);
        }
      }
      
      setApiStatus('offline');
      throw error;
    }
  }, [apiStatus, currentModel, HF_API_KEY]);
  
  // Function to sanitize API responses
  const sanitizeResponse = useCallback((response) => {
    try {
      // Check if response is null/undefined
      if (!response) return null;
      
      // Remove any model self-references
      let cleanedResponse = response.replace(/As an AI|As a language model|I'm an AI|I am an AI|As an assistant|As a medical assistant/gi, "As a doctor");
      
      // Remove any "Assistant:" prefixes that might appear
      cleanedResponse = cleanedResponse.replace(/^Assistant:\s*/i, "");
      
      // Remove any analysis or meta commentary blocks
      cleanedResponse = cleanedResponse.replace(/\*\*Analysis of.*?\*\*/gs, "");
      cleanedResponse = cleanedResponse.replace(/\*\*Option \d+:.*?\*\*/gs, "");
      cleanedResponse = cleanedResponse.replace(/Option \d+:.*?(?=Option \d+:|$)/gs, "");
      
      // Handle common error patterns
      if (cleanedResponse.includes("I don't have information about") ||
          cleanedResponse.includes("I cannot provide") ||
          cleanedResponse.includes("I don't have access to")) {
        return null; // Signal that we should use the fallback
      }
      
      return cleanedResponse;
    } catch (error) {
      console.error("Error in sanitizeResponse:", error);
      return null; // Return null if any error occurs during sanitization
    }
  }, []);

  // Common health conditions information for fallback
  const healthConditions = {
    'cold': "Based on what you're describing, it sounds like you might have a common cold. I recommend rest, plenty of fluids, and over-the-counter medications to manage your symptoms. If you're not feeling better in a few days or if your symptoms worsen, please schedule an appointment so I can examine you properly.",
    'flu': "Your symptoms suggest you might have the flu. It's important to rest, stay hydrated, and take fever reducers if needed. Since influenza can sometimes lead to complications, monitoring your condition is important. Would you like to schedule an appointment so I can provide a more thorough evaluation?",
    'headache': "Headaches can stem from many causes including stress, dehydration, or underlying conditions. Try to rest in a dark, quiet room and consider an over-the-counter pain reliever. If you're experiencing severe or recurring headaches, I'd like to see you in person to rule out any serious conditions.",
    'fever': "A fever is your body's way of fighting infection. If it's below 103°F, rest and fluids are often sufficient. However, I'd recommend coming in for an evaluation, especially if the fever persists for more than three days or is accompanied by other concerning symptoms.",
    'covid': "Your symptoms are consistent with COVID-19. I recommend you take a test if possible and self-isolate. If you're experiencing difficulty breathing or your symptoms worsen, please seek immediate medical attention. Would you like to schedule a telehealth appointment to discuss your symptoms further?",
    'diabetes': "Diabetes requires comprehensive management and regular monitoring. I'd like to see you for proper evaluation and to develop a personalized treatment plan. We can discuss medication options, lifestyle modifications, and regular screening for complications. How soon can you come in?",
    'blood pressure': "Blood pressure concerns require proper medical evaluation. I'd like to check your readings in person and discuss potential causes and treatment options. Depending on your readings, we might consider lifestyle changes or medication. Let's schedule an appointment soon."
  };

  // General knowledge responses (doctor-like responses)
  const generalKnowledge = {
    'car': "While I'm happy to briefly address your question about cars, my primary focus is on your health. After we discuss any medical concerns you might have, I can point you to resources about automotive topics if you'd like.",
    'cat': "Pets can certainly impact health - especially for those with allergies or asthma. If you're experiencing any respiratory symptoms related to pet exposure, we should discuss management strategies. Is your cat causing any health concerns for you?",
    'dog': "Pets like dogs can sometimes affect our health, whether through allergies, potential injuries, or even the positive effects of companionship and exercise. Is your dog causing any health issues we should address?",
    'weather': "Weather changes can impact certain health conditions like joint pain, respiratory issues, and seasonal allergies. Are you experiencing any symptoms that might be related to the weather? If so, I'd be happy to discuss management strategies.",
    'difference between': "That's a good question. In medicine, understanding the differences between conditions is important for proper diagnosis and treatment. What specific conditions are you wondering about? I'd be happy to explain the key differences and what they might mean for treatment."
  };

  // Fallback response generation
  const getFallbackResponse = useCallback((userInput) => {
    try {
      userInput = userInput.toLowerCase();
      
      // First check for context-based responses
      if (conversationContext.waitingForAppointmentConfirmation) {
        if (containsAny(userInput, ['yes', 'yeah', 'sure', 'please', 'ok', 'okay'])) {
          setConversationContext({
            lastIntent: 'appointment_scheduled',
            waitingForAppointmentConfirmation: false,
            followUpQuestion: null
          });
          return "Excellent. I've made a note to schedule you. You can select a time through our appointment system. Just click the 'Schedule Appointment' button on the homepage, and you'll be able to select a preferred date, time, and the reason for your visit. Is there anything specific I should note in your chart before your appointment?";
        } else if (containsAny(userInput, ['no', 'nope', 'not', 'don\'t', 'dont'])) {
          setConversationContext({
            lastIntent: null,
            waitingForAppointmentConfirmation: false,
            followUpQuestion: null
          });
          return "I understand. If you change your mind or if your symptoms worsen, please don't hesitate to schedule an appointment. In the meantime, let me know if you have any other questions about your health.";
        } else {
          return "I recommend scheduling an appointment so I can properly evaluate your condition. Would you like to do that? A simple yes or no will help me assist you further.";
        }
      }

      // Check for health conditions
      for (const [condition, info] of Object.entries(healthConditions)) {
        if (userInput.includes(condition)) {
          setConversationContext({ 
            lastIntent: 'medical_info', 
            waitingForAppointmentConfirmation: false,
            followUpQuestion: condition
          });
          return info;
        }
      }

      // Check for general knowledge questions
      for (const [topic, info] of Object.entries(generalKnowledge)) {
        if (userInput.includes(topic)) {
          return info;
        }
      }

      // Handle different intents
      if (containsAny(userInput, ['appointment', 'schedule', 'book', 'reserve'])) {
        setConversationContext({
          lastIntent: 'appointment',
          waitingForAppointmentConfirmation: true,
          followUpQuestion: null
        });
        return "I'd be happy to see you for an appointment. You can schedule one through our online system. Would you like me to guide you through that process?";
      } 
      else if (containsAny(userInput, ['doctor', 'specialist', 'physician', 'provider'])) {
        return "Our clinic has several specialists including cardiologists, dermatologists, neurologists, family medicine doctors, and orthopedists. I can help recommend the right specialist based on your symptoms or concerns. What specific health issues are you experiencing?";
      } 
      else if (containsAny(userInput, ['cancel', 'reschedule', 'delete'])) {
        return "To cancel or reschedule your appointment, please go to the 'My Appointments' section and select the appropriate option next to your scheduled visit. If you're having any difficulties, our front desk staff would be happy to assist you.";
      } 
      else if (containsAny(userInput, ['hello', 'hi', 'hey', 'greetings', 'sup'])) {
        return "Hello there. It's good to hear from you. How are you feeling today? Is there something specific about your health that I can help you with?";
      } 
      else if (containsAny(userInput, ['thank', 'thanks', 'appreciate'])) {
        return "You're very welcome. Taking care of your health is important, and I'm glad I could be of assistance. Is there anything else you'd like to discuss about your health today?";
      } 
      else if (containsAny(userInput, ['pain', 'hurt', 'ache', 'sore', 'sick', 'treatment'])) {
        setConversationContext({
          lastIntent: 'pain',
          waitingForAppointmentConfirmation: true,
          followUpQuestion: null
        });
        return "I'm sorry to hear you're in pain. To properly diagnose and treat your condition, I'll need to conduct an examination. Would you like to schedule an appointment so we can address this properly?";
      } 
      else if (containsAny(userInput, ['who are you', 'what are you', 'are you real', 'are you human', 'are you a bot'])) {
        return "I'm Dr. Smith, a physician at this medical practice. I'm here to help with your health concerns and medical questions. While this is a digital consultation, my advice is based on medical best practices. For a thorough examination, I'd recommend an in-person visit.";
      }
      else if (containsAny(userInput, ['hours', 'open', 'close', 'when', 'time'])) {
        return "Our clinic is open Monday through Friday from 9:00 AM to 5:00 PM, and Saturdays from 10:00 AM to 2:00 PM. We're closed on Sundays and major holidays. If you're experiencing an emergency outside these hours, please go to the nearest emergency room or call 911.";
      } 
      
      // Default response for unrecognized queries
      return "I notice your question isn't specifically about a common medical condition. As your doctor, I'd be happy to discuss this further during an appointment where we can have a more comprehensive conversation. Is there a specific health concern I can help address today?";
    } catch (error) {
      console.error("Error in fallback response generation:", error);
      // Super safe default response if anything goes wrong
      return "Thank you for your question. I'd be happy to discuss your health concerns. Could you provide more details about what's troubling you, or would you like to schedule an appointment?";
    }
  }, [containsAny, conversationContext]); // Add dependencies
  
  // Handle form submission with API integration and error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      // Add user message
      const userMessage = { text: input, isBot: false };
      setMessages(prev => [...prev, userMessage]);
      const userInput = input;
      setInput('');
      setIsTyping(true);

      // Handle via API or fallback based on availability
      if (apiStatus === 'ready' && currentModel) {
        try {
          setApiStatusMessage('Thinking...');
          
          // Get recent conversation history (last 6 messages)
          const recentMessages = messages.slice(-6);
          
          // Add the new user message
          const conversationHistory = [...recentMessages, userMessage];
          
          // Query the model
          const apiResponse = await queryModel(userInput, conversationHistory);
          const cleanedResponse = sanitizeResponse(apiResponse);
          
          if (cleanedResponse) {
            // If we got a valid response from the API
            setApiStatusMessage('Connected');
            setTimeout(() => {
              setMessages(prev => [...prev, { 
                text: cleanedResponse, 
                isBot: true,
                fromApi: true,
                model: currentModel.name
              }]);
              setIsTyping(false);
            }, 600);
          } else {
            // If response was rejected, use fallback
            setApiStatusMessage('Using fallback (poor API response)');
            const fallbackResponse = getFallbackResponse(userInput);
            setTimeout(() => {
              setMessages(prev => [...prev, { 
                text: fallbackResponse, 
                isBot: true,
                fromApi: false
              }]);
              setIsTyping(false);
            }, 600);
          }
        } catch (error) {
          console.error("API error:", error);
          setApiStatusMessage('Using fallback (API error)');
          
          // Use fallback on API failure
          const fallbackResponse = getFallbackResponse(userInput);
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              text: fallbackResponse, 
              isBot: true,
              fromApi: false
            }]);
            setIsTyping(false);
          }, 600);
        }
      } else {
        // Use fallback if API is not available
        setApiStatusMessage('Using fallback (API offline)');
        const fallbackResponse = getFallbackResponse(userInput);
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            text: fallbackResponse, 
            isBot: true,
            fromApi: false
          }]);
          setIsTyping(false);
        }, 600);
      }
    } catch (error) {
      console.error("Critical error in handleSubmit:", error);
      // Recovery from complete failure
      setMessages(prev => [...prev, { 
        text: "I apologize, but I'm having technical difficulties at the moment. Please try again shortly.", 
        isBot: true,
        fromApi: false
      }]);
      setIsTyping(false);
    }
  };

  // Return status color based on API status
  const getStatusColor = () => {
    if (apiStatus === 'ready') return 'green';
    if (apiStatus === 'loading') return '#f39c12';
    return '#e74c3c'; // red for offline/error
  };

  // Add a visible error message when API connection fails
  const renderApiStatus = () => {
    if (apiStatus === 'offline' || apiStatus === 'error') {
      return (
        <div className="api-error-notice">
          <p>AI assistant unavailable. Using fallback responses.</p>
          <p className="error-details">{apiStatusMessage}</p>
        </div>
      );
    }
    return null;
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
          
          {renderApiStatus()}
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
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
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="chatbot-input">
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

export default ChatBot;