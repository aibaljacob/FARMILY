import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Space, Badge, Tooltip, Tag, Empty, Spin, message } from 'antd';
import { FileTextOutlined, CalendarOutlined, DollarOutlined, ShoppingOutlined, AppstoreOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import './RecentPosts.css';

const { Text } = Typography;

// Category options mapping
const categoryOptions = [
  { value: 'rubber', label: 'Rubber' },
  { value: 'coconut', label: 'Coconut' },
  { value: 'jackfruit', label: 'Jackfruit' },
  { value: 'banana', label: 'Banana' },
  { value: 'pepper', label: 'Black Pepper' },
  { value: 'cardamom', label: 'Cardamom' },
  { value: 'tea', label: 'Tea' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'arecanut', label: 'Arecanut' },
  { value: 'cashew', label: 'Cashew' },
  { value: 'ginger', label: 'Ginger' },
  { value: 'turmeric', label: 'Turmeric' },
  { value: 'nutmeg', label: 'Nutmeg' },
  { value: 'clove', label: 'Clove' },
  { value: 'tapioca', label: 'Tapioca' },
  { value: 'mango', label: 'Mango' },
  { value: 'pineapple', label: 'Pineapple' },
  { value: 'others', label: 'Others' }
];

// Helper function to get category label
const getCategoryLabel = (categoryValue) => {
  const category = categoryOptions.find(cat => cat.value === categoryValue);
  return category ? category.label : categoryValue;
};

const RecentPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [componentTitle, setComponentTitle] = useState('Recent Posts');

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) {
      setUserRole(user.role);
      
      // Set appropriate title based on user role
      if (user.role === 1) { // Farmer
        setComponentTitle('My Recent Products');
      } else if (user.role === 2) { // Buyer
        setComponentTitle('My Recent Demands');
      }
    }

    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      // Get the token from localStorage
      const token = localStorage.getItem('access_token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (!user || !user.role) {
        throw new Error('User information not found');
      }

      let formattedPosts = [];

      if (user.role === 1) { // Farmer
        // Fetch farmer's products
        const response = await axios.get('http://127.0.0.1:8000/api/products/my-products/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Sort by creation date to get the most recent posts
        const sortedProducts = response.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );

        // Take only the 6 most recent posts
        const recentProducts = sortedProducts.slice(0, 6);

        // Format the data for products
        formattedPosts = recentProducts.map(product => ({
          id: product.id,
          type: 'product',
          title: product.name,
          category: product.category,
          quantity: product.quantity,
          unit: product.unit || 'kg',
          price: product.price,
          date: new Date(product.created_at).toLocaleDateString(),
          featured: product.is_active || false
        }));
      } else if (user.role === 2) { // Buyer
        // Fetch buyer's demands
        const response = await axios.get('http://127.0.0.1:8000/api/demands/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Filter demands created by this buyer
        const myDemands = response.data.filter(demand => 
          demand.buyer === user.id
        );

        // Sort by creation date to get the most recent posts
        const sortedDemands = myDemands.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );

        // Take only the 6 most recent posts
        const recentDemands = sortedDemands.slice(0, 6);

        // Format the data for demands
        formattedPosts = recentDemands.map(demand => ({
          id: demand.id,
          type: 'demand',
          title: getCategoryLabel(demand.category),
          category: demand.category,
          quantity: demand.quantity,
          unit: demand.unit || 'kg',
          price: demand.price_per_unit,
          date: new Date(demand.created_at).toLocaleDateString(),
          featured: demand.is_active || false,
          valid_until: new Date(demand.valid_until).toLocaleDateString()
        }));
      }

      setPosts(formattedPosts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recent posts:", error);
      setError("Failed to load recent posts");
      setLoading(false);
      message.error("Failed to load recent posts");
    }
  };

  if (loading) {
    return (
      <div className="recent-posts">
        <h3>
          <FileTextOutlined style={{ marginRight: '8px' }} />
          {componentTitle}
        </h3>
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recent-posts">
        <h3>
          <FileTextOutlined style={{ marginRight: '8px' }} />
          {componentTitle}
        </h3>
        <div className="error-container">
          <WarningOutlined style={{ fontSize: '24px', color: '#f5222d' }} />
          <Text type="danger">{error}</Text>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    let emptyMessage = "Nothing posted yet";
    if (userRole === 1) {
      emptyMessage = "You haven't listed any products yet";
    } else if (userRole === 2) {
      emptyMessage = "You haven't created any demands yet";
    }

    return (
      <div className="recent-posts">
        <h3>
          <FileTextOutlined style={{ marginRight: '8px' }} />
          {componentTitle}
        </h3>
        <Empty description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="recent-posts">
      <h3>
        <FileTextOutlined style={{ marginRight: '8px' }} />
        {componentTitle}
      </h3>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={posts}
        renderItem={(post) => (
          <List.Item>
            <Badge.Ribbon text={`${post.quantity} ${post.unit} ${userRole === 1 ? 'Available' : 'Needed'}`} color="#52c41a">
              <Card 
                hoverable 
                bordered 
                className="post-card"
                // actions={[
                //   <Tooltip title="View Details">
                //     <EyeOutlined key="view" />
                //   </Tooltip>,
                //   <Tooltip title="Browse Similar">
                //     <AppstoreOutlined key="browse" />
                //   </Tooltip>
                // ]}
              >
                <Card.Meta
                  avatar={
                    <ShoppingOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                  }
                  title={
                    <Space>
                      <Text strong>{post.title || getCategoryLabel(post.category)}</Text>
                      {post.featured && (
                        <Tooltip title="Active Listing">
                          <Tag color="green">Active</Tag>
                        </Tooltip>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">
                        <DollarOutlined /> Price: ₹{post.price} / {post.unit}
                      </Text>
                      <Text type="secondary">
                        <CalendarOutlined /> Posted: {post.date}
                      </Text>
                      {post.type === 'demand' && post.valid_until && (
                        <Text type="secondary">
                          Valid until: {post.valid_until}
                        </Text>
                      )}
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

export default RecentPosts;

