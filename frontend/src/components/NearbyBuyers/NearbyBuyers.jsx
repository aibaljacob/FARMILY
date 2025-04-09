import React, { useState, useEffect } from 'react';
import { Card, Avatar, List, Typography, Tooltip, Badge, Space, Spin, Empty, message } from 'antd';
import { EnvironmentOutlined, UserOutlined, ShopOutlined, AreaChartOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import './NearbyBuyers.css';

const { Text } = Typography;

const NearbyBuyers = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCity, setUserCity] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [componentTitle, setComponentTitle] = useState('Nearby Buyers');

  useEffect(() => {
    // Get user role and determine which profiles to fetch
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) {
      setUserRole(user.role);
      
      // Set component title based on role
      if (user.role === 1) { // Farmer
        setComponentTitle('Nearby Buyers');
      } else if (user.role === 2) { // Buyer
        setComponentTitle('Nearby Farmers');
      }
    }

    // Get user's location
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('access_token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        throw new Error('Authentication token or user information not found');
      }

      let profileEndpoint = '';
      if (user.role === 1) { // Farmer
        profileEndpoint = 'http://127.0.0.1:8000/api/farmer-profile/';
      } else if (user.role === 2) { // Buyer
        profileEndpoint = 'http://127.0.0.1:8000/api/buyer-profile/';
      } else {
        throw new Error('Invalid user role');
      }

      // Fetch the user profile which should contain city information
      const response = await axios.get(profileEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Get city directly from the profile
      if (response.data && response.data.city) {
        setUserCity(response.data.city);
        // Now that we have the location, fetch nearby profiles
        fetchNearbyProfiles(response.data.city, user.role);
      } else {
        setUserCity('Unknown'); // Default if city is not available
        fetchNearbyProfiles('Unknown', user.role);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserCity('Unknown');
      // Try to fetch nearby profiles anyway
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.role) {
        fetchNearbyProfiles('Unknown', user.role);
      }
    }
  };

  const fetchNearbyProfiles = async (city, role) => {
    try {
      setLoading(true);
      // Get the token from localStorage
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      let profileEndpoint = '';
      if (role === 1) { // Farmer looking for buyers
        profileEndpoint = 'http://127.0.0.1:8000/api/all-buyer-profiles/';
      } else if (role === 2) { // Buyer looking for farmers
        profileEndpoint = 'http://127.0.0.1:8000/api/all-farmer-profiles/';
      } else {
        throw new Error('Invalid user role');
      }

      // Use the appropriate endpoint to get profiles
      const response = await axios.get(profileEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Process profiles based on city similarity
      const processedProfiles = response.data.map(profile => {
        // Get city directly from profile
        const profileCity = profile.city || 'Unknown';
        
        // Calculate a simple similarity score (exact match or partial match)
        let similarity = 0;
        if (profileCity === city) {
          similarity = 100; // Exact match
        } else if (city !== 'Unknown' && profileCity !== 'Unknown') {
          // Check for partial matches (if city name is contained in the other)
          if (profileCity.toLowerCase().includes(city.toLowerCase()) || 
              city.toLowerCase().includes(profileCity.toLowerCase())) {
            similarity = 80;
          }
        }

        // Create full name from user first and last name fields
        const userName = profile.user_first_name && profile.user_last_name 
          ? `${profile.user_first_name} ${profile.user_last_name}`
          : null;

        if (role === 1) { // Format buyer profile
          return {
            id: profile.id,
            name: profile.business_name || userName || 'Anonymous Buyer',
            email: profile.user_email || 'No email provided',
            type: profile.business_type || 'Buyer',
            location: profile.address || 'Unknown location',
            city: profileCity,
            similarity: similarity,
            verified: profile.user_is_verified || false,
            image: profile.profilepic || null
          };
        } else { // Format farmer profile
          return {
            id: profile.id,
            name: userName || 'Anonymous Farmer',
            email: profile.user_email || 'No email provided',
            type: 'Farmer',
            location: profile.address || 'Unknown location',
            city: profileCity,
            similarity: similarity,
            verified: profile.user_is_verified || false,
            image: profile.profilepic || null
          };
        }
      });

      // Sort by similarity score (highest first)
      const sortedProfiles = processedProfiles
        .sort((a, b) => b.similarity - a.similarity);
      
      // Take the most similar 6 profiles
      const nearbyProfiles = sortedProfiles.slice(0, 6);

      setProfiles(nearbyProfiles);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching nearby profiles:", error);
      setError("Failed to load nearby profiles");
      setLoading(false);
      message.error(`Failed to load ${componentTitle.toLowerCase()}`);
    }
  };

  if (loading) {
    return (
      <div className="nearby-buyers">
        <h3>
          <ShopOutlined style={{ marginRight: '8px' }} />
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
      <div className="nearby-buyers">
        <h3>
          <ShopOutlined style={{ marginRight: '8px' }} />
          {componentTitle}
        </h3>
        <div className="error-container">
          <WarningOutlined style={{ fontSize: '24px', color: '#f5222d' }} />
          <Text type="danger">{error}</Text>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    let emptyMessage = `No ${componentTitle.toLowerCase()} found in your area`;
    
    return (
      <div className="nearby-buyers">
        <h3>
          <ShopOutlined style={{ marginRight: '8px' }} />
          {componentTitle}
        </h3>
        <Empty description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="nearby-buyers">
      <h3>
        <ShopOutlined style={{ marginRight: '8px' }} />
        {componentTitle}
      </h3>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={profiles}
        renderItem={(profile) => (
          <List.Item>
            <Badge.Ribbon text={profile.type || (userRole === 1 ? 'Buyer' : 'Farmer')} color="#52c41a">
              <Card 
                hoverable 
                bordered 
                className="buyer-card"
                // actions={[
                //   <Tooltip title="View Profile">
                //     <UserOutlined key="profile" />
                //   </Tooltip>,
                //   <Tooltip title="View Location">
                //     <EnvironmentOutlined key="location" />
                //   </Tooltip>,
                //   <Tooltip title="View Stats">
                //     <AreaChartOutlined key="stats" />
                //   </Tooltip>
                // ]}
              >
                <Card.Meta
                  avatar={
                    <Avatar 
                      size="large" 
                      icon={<UserOutlined />}
                      src={profile.image ? `http://127.0.0.1:8000${profile.image}` : null}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{profile.name}</Text>
                      {profile.verified && (
                        <Tooltip title={`Verified ${userRole === 1 ? 'Buyer' : 'Farmer'}`}>
                          <Badge status="success" />
                        </Tooltip>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">
                        <EnvironmentOutlined /> {profile.location}
                      </Text>
                      {profile.city && profile.city !== 'Unknown' && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          City: {profile.city}
                        </Text>
                      )}
                      {profile.email && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Email: {profile.email}
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

export default NearbyBuyers;
