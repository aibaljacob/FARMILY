import React, { useState } from 'react';
import './Chat.css';

const Chat = ({ messages, onSend }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim() === '') return;
    onSend(newMessage);
    setNewMessage('');
  };

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`chat-message ${msg.isFarmer ? 'farmer' : 'buyer'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input 
          type="text" 
          placeholder="Type your message..." 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
