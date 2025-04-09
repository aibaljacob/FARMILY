import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, List, Typography, Avatar, Badge, Spin, Empty, message } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Chat.css';

const { Text, Title } = Typography;

const Chat = ({ dealId, dealType, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatRoom, setChatRoom] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  
  // Create or get chat room and fetch messages
  useEffect(() => {
    if (!dealId || !dealType) return;
    
    const fetchChatRoom = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          message.error('Authentication token not found. Please log in again.');
          return;
        }
        
        console.log(`Fetching chat room for dealType=${dealType}, dealId=${dealId}`);
        
        // Get chat room details or create a new one
        const response = await axios.get(`http://127.0.0.1:8000/api/chat/rooms/${dealType}/${dealId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Chat room API response:', response.data);
        
        if (response.data) {
          setChatRoom(response.data);
          
          // If there are messages, set them
          if (response.data.messages && Array.isArray(response.data.messages)) {
            setMessages(response.data.messages);
          }
          
          // Start polling for new messages
          if (response.data.id) {
            startPolling(response.data.id);
          } else {
            console.error('Chat room has no ID');
            message.error('Error initializing chat. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error fetching chat room:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error status:', error.response.status);
          
          if (error.response.status === 403) {
            message.error('You do not have permission to access this chat.');
          } else if (error.response.status === 404) {
            message.error('Chat room not found.');
          } else {
            message.error('Failed to load chat messages. Please try again later.');
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
          message.error('Server did not respond. Please check your connection.');
        } else {
          message.error('Failed to load chat messages. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatRoom();
    
    // Cleanup function for polling
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [dealId, dealType]);
  
  // Mark messages as read after they are loaded and displayed
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!loading && chatRoom && chatRoom.id) {
        try {
          const token = localStorage.getItem('access_token');
          
          if (!token) {
            console.error('Cannot mark messages as read: No authentication token found');
            return;
          }
          
          await axios.post(`http://127.0.0.1:8000/api/chat/rooms/${chatRoom.id}/mark-read/`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Messages marked as read');
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    };
    
    markMessagesAsRead();
  }, [loading, chatRoom]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Start polling for new messages
  const startPolling = (roomId) => {
    console.log('Starting polling for new messages for room:', roomId);
    
    if (!roomId) {
      console.error('Cannot start polling: No room ID provided');
      return;
    }
    
    // Get the JWT token
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Cannot start polling: No authentication token found');
      message.error('Authentication token not found. Please log in again.');
      return;
    }
    
    // Clear existing interval if any
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    
    // Set up polling every 3 seconds
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/chat/rooms/${dealType}/${dealId}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.messages) {
          // Update messages only if there are new ones
          if (response.data.messages.length !== messages.length) {
            setMessages(response.data.messages);
            
            // Mark messages as read
            await axios.post(`http://127.0.0.1:8000/api/chat/rooms/${roomId}/mark-read/`, {}, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          }
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    }, 3000);
    
    setPollInterval(interval);
  };
  
  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRoom) return;
    
    try {
      setSending(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }
      
      // Send message via HTTP POST request
      const response = await axios.post(
        `http://127.0.0.1:8000/api/chat/rooms/${chatRoom.deal_type}/${chatRoom.deal_id}/`,
        { message: newMessage },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Add the new message to the list
      if (response.data) {
        setMessages(prevMessages => [...prevMessages, response.data]);
        
        // Immediately fetch updated message list to ensure consistency
        const roomResponse = await axios.get(`http://127.0.0.1:8000/api/chat/rooms/${chatRoom.deal_type}/${chatRoom.deal_id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (roomResponse.data && roomResponse.data.messages) {
          setMessages(roomResponse.data.messages);
        }
      }
      
      // Clear the input field
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  // Format timestamp to a readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const renderMessageItem = (item) => {
    const isCurrentUser = item.sender_id === currentUser.id;
    
    return (
      <List.Item className={`message-item ${isCurrentUser ? 'my-message' : 'other-message'}`}>
        <div className={`message-content ${isCurrentUser ? 'my-content' : 'other-content'}`}>
          {!isCurrentUser && (
            <div className="sender-info">
              <Avatar 
                icon={<UserOutlined />} 
                className="sender-avatar"
              />
              <Text strong className="sender-name">{item.sender_name}</Text>
            </div>
          )}
          <div className="message-bubble">
            <Text>{item.message}</Text>
            <div className="message-time">
              <Text type="secondary" className="timestamp-text">
                {formatTimestamp(item.timestamp)}
              </Text>
              {isCurrentUser && (
                <Badge 
                  status={item.is_read ? "success" : "default"} 
                  text={item.is_read ? "Read" : "Sent"} 
                  className="read-status"
                />
              )}
            </div>
          </div>
        </div>
      </List.Item>
    );
  };
  
  // Handle form submission for sending message
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage();
    }
  };
  
  return (
    <div className="chat-container">
      <div className="chat-header">
        <Title level={4} className="chat-title">
          Chat {chatRoom && `- ${chatRoom.deal_type === 'product_offer' ? 'Product Offer' : 'Demand Response'} #${chatRoom?.deal_id}`}
        </Title>
        {onClose && (
          <Button type="text" onClick={onClose} className="close-button">×</Button>
        )}
      </div>
      
      <div className="messages-container">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <Text>Loading messages...</Text>
          </div>
        ) : messages.length === 0 ? (
          <Empty 
            description="No messages yet. Start the conversation!" 
            className="empty-messages" 
          />
        ) : (
          <List
            className="messages-list"
            dataSource={messages}
            renderItem={renderMessageItem}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="message-form">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending || loading || !chatRoom}
          className="message-input"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={sending}
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending || loading || !chatRoom}
          className="send-button"
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default Chat;
