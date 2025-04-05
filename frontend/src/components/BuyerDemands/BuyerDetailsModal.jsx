import React from 'react';
import { Modal, Button, Avatar, Tag, Typography, Divider, Spin, message, Empty } from 'antd';
import { 
  UserOutlined, 
  MessageOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const BuyerDetailsModal = ({ isVisible, buyer, onClose }) => {
  // Handle contact buyer action
  const handleContactBuyer = () => {
    if (buyer) {
      message.success(`Contact request sent to ${buyer.name}`);
    } else {
      message.info("No buyer selected");
    }
    onClose();
  };

  // If buyer is null or undefined, show a nicer message
  const renderBuyerContent = () => {
    if (!buyer) {
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Empty 
            description="Buyer information not available" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Paragraph type="secondary" style={{ marginTop: '10px' }}>
            <InfoCircleOutlined /> Try refreshing the page or selecting a different buyer.
          </Paragraph>
        </div>
      );
    }

    return (
      <div className="buyer-profile">
        <div className="buyer-header">
          <Avatar 
            size={64} 
            src={buyer.image && !buyer.image.startsWith('http') 
              ? `http://127.0.0.1:8000${buyer.image}`
              : buyer.image} 
            icon={<UserOutlined />}
            className="buyer-avatar"
            style={{ backgroundColor: buyer.name === 'Unknown Buyer' ? '#f0f0f0' : '#1890ff' }}
          />
          <div className="buyer-title">
            <Title level={4}>{buyer.name}</Title>
            {buyer.isVerified && (
              <Tag color="green" icon={<CheckCircleOutlined />}>Verified</Tag>
            )}
            <Tag color="blue">{buyer.type || 'Buyer'}</Tag>
          </div>
        </div>
        
        <Divider />
        
        <p><MailOutlined /> <strong>Email:</strong> {buyer.email || 'Not provided'}</p>
        <p><PhoneOutlined /> <strong>Phone:</strong> {buyer.phone || 'Not provided'}</p>
        <p><EnvironmentOutlined /> <strong>Location:</strong> {
          [buyer.address, buyer.city, buyer.state, buyer.country]
            .filter(Boolean)
            .join(', ') || 'Not provided'
        }</p>
        
        {buyer.bio && (
          <>
            <Divider />
            <Title level={5}>About</Title>
            <Paragraph>{buyer.bio}</Paragraph>
          </>
        )}
      </div>
    );
  };

  return (
    <Modal
      title="Buyer Details"
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button 
          key="contact" 
          type="primary" 
          icon={<MessageOutlined />}
          onClick={handleContactBuyer}
          disabled={!buyer}
        >
          Contact Buyer
        </Button>
      ]}
      destroyOnClose={true}
      className="buyer-details-modal"
    >
      {renderBuyerContent()}
    </Modal>
  );
};

export default BuyerDetailsModal; 