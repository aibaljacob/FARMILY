import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Typography, Space, Badge, Tooltip, Avatar, Spin, Empty, message } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  DollarOutlined, 
  ShoppingOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './RecentDeals.css';

const { Text } = Typography;

const RecentDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) {
      setUserRole(user.role);
    }

    // Fetch deals
    fetchUserDeals();
  }, []);

  const fetchUserDeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Use the all-deals endpoint to get user-specific deals
      const response = await axios.get('http://127.0.0.1:8000/api/all-deals/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Process the response to combine both types of deals
      const productDeals = response.data.product_deals.map(deal => {
        const status = deal.status.charAt(0).toUpperCase() + deal.status.slice(1); // Capitalize status
        return {
          id: deal.id,
          type: 'product_offer',
          buyer: deal.product_details.farmer_id === JSON.parse(localStorage.getItem('user')).id 
            ? deal.buyer_name 
            : 'You',
          produce: deal.product_details.name,
          quantity: `${deal.quantity} ${deal.product_details.unit}`,
          price: deal.offered_price,
          status: status,
          buyerImage: null,
          otherPartyId: deal.product_details.farmer_id === JSON.parse(localStorage.getItem('user')).id 
            ? deal.buyer 
            : deal.product_details.farmer_id
        };
      });

      const demandDeals = response.data.demand_deals.map(deal => {
        const status = deal.status.charAt(0).toUpperCase() + deal.status.slice(1); // Capitalize status
        return {
          id: deal.id,
          type: 'demand_response',
          buyer: deal.demand_details.buyer_id === JSON.parse(localStorage.getItem('user')).id 
            ? 'You' 
            : deal.farmer_name,
          produce: deal.demand_details.category,
          quantity: `${deal.offered_quantity} ${deal.demand_details.unit}`,
          price: deal.offered_price,
          status: status,
          buyerImage: null,
          otherPartyId: deal.demand_details.buyer_id === JSON.parse(localStorage.getItem('user')).id 
            ? deal.farmer 
            : deal.demand_details.buyer_id
        };
      });

      // Combine and sort by most recent first (using ID as a proxy for recency)
      const allDeals = [...productDeals, ...demandDeals]
        .sort((a, b) => b.id - a.id)
        .slice(0, 6); // Get the 6 most recent deals
      
      setDeals(allDeals);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recent deals:", error);
      setError("Failed to load recent deals");
      setLoading(false);
      message.error("Failed to load recent deals");
    }
  };

  const getStatusTag = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Tag color="green">Completed</Tag>;
      case 'accepted':
        return <Tag color="green">Accepted</Tag>;
      case 'pending':
        return <Tag color="orange">Pending</Tag>;
      case 'rejected':
        return <Tag color="red">Rejected</Tag>;
      case 'cancelled':
        return <Tag color="red">Cancelled</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  if (loading) {
    return (
      <div className="recent-deals">
        <h3>
          <ShoppingCartOutlined style={{ marginRight: '8px' }} />
          Recent Deals
        </h3>
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recent-deals">
        <h3>
          <ShoppingCartOutlined style={{ marginRight: '8px' }} />
          Recent Deals
        </h3>
        <div className="error-container">
          <WarningOutlined style={{ fontSize: '24px', color: '#f5222d' }} />
          <Text type="danger">{error}</Text>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="recent-deals">
        <h3>
          <ShoppingCartOutlined style={{ marginRight: '8px' }} />
          Recent Deals
        </h3>
        <Empty description="No deals made yet. Start trading to see your recent deals here!" />
      </div>
    );
  }

  return (
    <div className="recent-deals">
      <h3>
        <ShoppingCartOutlined style={{ marginRight: '8px' }} />
        Recent Deals
      </h3>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={deals}
        renderItem={(deal) => (
          <List.Item>
            <Badge.Ribbon text={deal.status} color={
              deal.status.toLowerCase() === 'completed' || deal.status.toLowerCase() === 'accepted' ? 'green' : 
              deal.status.toLowerCase() === 'pending' ? 'orange' : 
              'red'
            }>
              <Card 
                hoverable 
                bordered 
                className="deal-card"
                actions={[
                  <Tooltip title="View Details">
                    <FileTextOutlined key="details" />
                  </Tooltip>,
                  <Tooltip title="Contact Party">
                    <UserOutlined key="contact" />
                  </Tooltip>
                ]}
              >
                <Card.Meta
                  avatar={
                    <Avatar 
                      icon={<UserOutlined />} 
                      src={deal.buyerImage}
                      size="large"
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{deal.produce}</Text>
                      {(deal.status.toLowerCase() === 'completed' || deal.status.toLowerCase() === 'accepted') && (
                        <Tooltip title="Deal Completed">
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        </Tooltip>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">
                        <UserOutlined /> {deal.buyer}
                      </Text>
                      <Text type="secondary">
                        <ShoppingOutlined /> {deal.quantity}
                      </Text>
                      <Text type="secondary">
                        <DollarOutlined /> ₹{deal.price}
                      </Text>
                    </Space>
                  }
                />
              </Card>
            </Badge.Ribbon>
          </List.Item>
        )}
      />
    </div>
  );
};

export default RecentDeals;
