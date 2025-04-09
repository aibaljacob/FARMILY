import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, Menu, Space, Badge, List, Typography, Empty, Spin } from 'antd';
import { 
  BellOutlined, 
  UserOutlined, 
  DownOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CarOutlined,
  MessageOutlined,
  ShoppingOutlined,
  MailOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './Header.css';

const { Text } = Typography;

const Header = ({ userName, admin, onNavigate, pfp }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  
  const navigate = useNavigate();

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
    fetchUnreadMessages();
    
    // Set up a timer to fetch notifications and unread messages every 30 seconds
    const notificationsInterval = setInterval(fetchNotifications, 30000);
    const messagesInterval = setInterval(fetchUnreadMessages, 30000);
    
    // Clean up the intervals when the component unmounts
    return () => {
      clearInterval(notificationsInterval);
      clearInterval(messagesInterval);
    };
  }, []);
  
  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      const response = await axios.get('http://127.0.0.1:8000/api/notifications/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(response.data);
      
      // Count unread notifications
      const unread = response.data.filter(notification => !notification.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  // Function to fetch unread message count
  const fetchUnreadMessages = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      const response = await axios.get('http://127.0.0.1:8000/api/chat/unread/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUnreadMessages(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };
  
  // Mark a notification as read
  const markAsRead = async (notificationId, redirectUrl) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      await axios.put(`http://127.0.0.1:8000/api/notifications/${notificationId}/read/`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // No longer redirecting to any URL
      
      // Close the dropdown
      setNotificationVisible(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      await axios.put('http://127.0.0.1:8000/api/notifications/mark-all-read/', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
      
      // Update unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Get appropriate icon for the notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'demand_response':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'response_accepted':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'response_rejected':
        return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      case 'product_offer':
        return <ShoppingOutlined style={{ color: '#1890ff' }} />;
      case 'offer_accepted':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'offer_rejected':
        return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      case 'delivery_status':
        return <CarOutlined style={{ color: '#faad14' }} />;
      case 'message':
        return <MessageOutlined style={{ color: '#722ed1' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const userMenu = (
    <Menu className="pmenu" style={{ width:"200px",display:"flex",flexDirection:"column",alignItems:"center",borderRadius:"30px",marginTop:"30px" }}>
      <Menu.Item key="profile" onClick={() => onNavigate('5')}>
        <Link to="#">Profile</Link>
      </Menu.Item>
      <Menu.Item key="logout">
        <Link to="/logout">Logout</Link>
      </Menu.Item>
    </Menu>
  );
  
  const notificationMenu = (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <Text strong>Notifications</Text>
        {unreadCount > 0 && (
          <span className="mark-all-read" onClick={markAllAsRead}>
            Mark all as read
          </span>
        )}
      </div>
      
      {loading ? (
        <div className="notification-loading">
          <Spin size="small" />
          <Text type="secondary">Loading notifications...</Text>
        </div>
      ) : notifications.length === 0 ? (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No notifications yet"
          style={{ margin: '20px 0' }}
        />
      ) : (
        <List
          className="notification-list"
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={notification => (
            <List.Item 
              className={notification.is_read ? "notification-item read" : "notification-item unread"}
              onClick={() => markAsRead(notification.id, notification.redirect_url)}
            >
              <List.Item.Meta
                avatar={getNotificationIcon(notification.notification_type)}
                title={notification.message}
                description={notification.created_at_formatted}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  // Navigate to deals page when clicking on messages icon
  const handleMessagesClick = () => {
    navigate('/deals');
  };

  return (
    <header className="dashboard-header">
      <Link to="/farmer">
        <div className="farmily-logo"></div>
      </Link>
      <div className="header-actions">  
        <Dropdown 
          overlay={notificationMenu} 
          trigger={['click']}
          visible={notificationVisible}
          onVisibleChange={setNotificationVisible}
        >
          <Badge  count={unreadCount} offset={[0, 0] }>
            <BellOutlined 
              className="notification-icon" 
              style={{ fontSize: '20px', color: '#2c3e50', cursor: 'pointer' }} 
            />
          </Badge>
        </Dropdown>
        
        <Dropdown overlay={userMenu} trigger={['click']}>
          <Space className="user-dropdown">
            <Avatar
              size="large"
              icon={<UserOutlined />}
              src={admin?'../../assets/images/admin/5856.jpg':`http://127.0.0.1:8000${pfp}`}
            />
            <span className="user-name">{userName || 'User'}</span>
            <DownOutlined />
          </Space>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
