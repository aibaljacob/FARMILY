import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, List, Badge, Spin, Empty, Tag } from 'antd';
import { WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import './WarningNotification.css';

const { Title, Text, Paragraph } = Typography;

const WarningNotification = () => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [unreadWarnings, setUnreadWarnings] = useState(0);

  useEffect(() => {
    fetchWarnings();
  }, []);

  const fetchWarnings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/my-warnings/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setWarnings(response.data);
      
      // Count unread warnings
      const unreadCount = response.data.filter(warning => !warning.warning_read).length;
      setUnreadWarnings(unreadCount);
      
      // If there are unread warnings, show the modal with the first one
      if (unreadCount > 0) {
        const firstUnread = response.data.find(warning => !warning.warning_read);
        if (firstUnread) {
          setSelectedWarning(firstUnread);
          setWarningModalVisible(true);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching warnings:", error);
      setError("Failed to load warnings. Please try again later.");
      setLoading(false);
    }
  };

  const handleWarningRead = async (warningId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.error("Authentication token not found");
        return;
      }

      await axios.put(`http://127.0.0.1:8000/api/reports/${warningId}/mark-warning-read/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      setWarnings(prevWarnings => 
        prevWarnings.map(warning => 
          warning.id === warningId ? { ...warning, warning_read: true } : warning
        )
      );
      
      // Update unread count
      setUnreadWarnings(prevCount => Math.max(0, prevCount - 1));
      
    } catch (error) {
      console.error("Error marking warning as read:", error);
    }
  };

  const handleCloseWarningModal = () => {
    if (selectedWarning && !selectedWarning.warning_read) {
      handleWarningRead(selectedWarning.id);
    }
    setWarningModalVisible(false);
  };

  const showWarningDetails = (warning) => {
    setSelectedWarning(warning);
    setWarningModalVisible(true);
    
    // If warning is not read, mark it as read
    if (!warning.warning_read) {
      handleWarningRead(warning.id);
    }
  };

  if (loading) {
    return <Spin size="small" />;
  }

  if (error) {
    return null; // Don't show errors to users, just fail silently
  }

  return (
    <>
      {unreadWarnings > 0 && (
        <Badge count={unreadWarnings} offset={[0, 0]}>
          <Button 
            type="text" 
            icon={<WarningOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />} 
            onClick={() => {
              const firstUnread = warnings.find(warning => !warning.warning_read);
              if (firstUnread) {
                showWarningDetails(firstUnread);
              } else if (warnings.length > 0) {
                showWarningDetails(warnings[0]);
              }
            }}
          />
        </Badge>
      )}

      <Modal
        title={
          <div className="warning-modal-title">
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            <span>Warning from Admin</span>
          </div>
        }
        visible={warningModalVisible}
        onCancel={handleCloseWarningModal}
        footer={[
          <Button key="ok" type="primary" onClick={handleCloseWarningModal}>
            I Understand
          </Button>
        ]}
        className="warning-modal"
      >
        {selectedWarning ? (
          <div className="warning-content">
            <div className="warning-header">
              <Title level={5}>Warning Issued: {new Date(selectedWarning.created_at).toLocaleDateString()}</Title>
              <Tag color="red">
                {selectedWarning.status.charAt(0).toUpperCase() + selectedWarning.status.slice(1)}
              </Tag>
            </div>
            
            <div className="warning-body">
              <Paragraph className="warning-message">
                {selectedWarning.warning_message}
              </Paragraph>
              
              <div className="warning-details">
                <Text strong>Reason for warning:</Text>
                <Paragraph>{selectedWarning.reason}</Paragraph>
              </div>
              
              <div className="warning-footer">
                <Text type="secondary">
                  This warning has been issued by the Farmily admin team. If you believe this warning was issued in error, 
                  please contact support.
                </Text>
              </div>
            </div>
          </div>
        ) : (
          <Empty description="No warning details available" />
        )}
      </Modal>
    </>
  );
};

export default WarningNotification;
