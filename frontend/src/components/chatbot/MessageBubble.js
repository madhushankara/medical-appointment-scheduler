import React from 'react';

const MessageBubble = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div 
        className={`max-w-3/4 rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-primary-600 text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
};

export default MessageBubble;