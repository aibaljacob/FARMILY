import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Radio, Typography, Form, message, Spin } from 'antd';
import axios from 'axios';
import './GoogleAuth.css';

// Function to create a SHA-256 hash of the email
async function createEmailHash(email) {
  // Use the SubtleCrypto API to create a SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert the hash to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

const { Title, Text } = Typography;

const RoleSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  
  // Get the Google user data from location state
  const userData = location.state?.userData;
  console.log('User data received:', userData);
  
  if (!userData) {
    // Redirect to login if no user data is available
    navigate('/login');
    return null;
  }

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Create a hash of the email for verification (matching what backend does)
      const emailHash = await createEmailHash(userData.email);
      
      console.log('Submitting role selection with data:', {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: values.role,
        temp_token: userData.temp_token,
        email_hash: emailHash
      });
      
      // Send all necessary data to the backend
      const response = await axios.post('http://127.0.0.1:8000/api/auth/google/complete/', {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: values.role,
        temp_token: userData.temp_token,
        email_hash: emailHash
      });
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      message.success('Account created successfully!');
      
      // Check if profile is complete
      const profileComplete = response.data.profile_complete;
      
      // Determine where to redirect based on role and profile completion
      if (response.data.user.role === 1) { // Farmer
        navigate('/farmer');
      } else if (response.data.user.role === 2) { // Buyer
        navigate('/buyer-dashboard');
      }
    } catch (error) {
      console.error('Error completing Google signup:', error);
      console.error('Error response data:', error.response?.data);
      message.error(error.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="google-auth-container">
      <Card className="role-selection-card">
        <div className="role-selection-header">
          <Title level={2}>Welcome to FARMILY!</Title>
          <Text>Please select your role to continue</Text>
        </div>
        
        <div className="user-info">
          <img 
            src={userData?.picture || 'https://via.placeholder.com/100'} 
            alt="Profile" 
            className="google-profile-pic"
            onError={(e) => {
              console.log('Image failed to load');
              e.target.src = 'https://via.placeholder.com/100';
            }}
          />
          <div className="user-details">
            <Text strong>{userData?.first_name} {userData?.last_name}</Text>
            <Text type="secondary">{userData?.email}</Text>
          </div>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            role: '2', // Default to Buyer
          }}
        >
          <Form.Item
            name="role"
            label="I am a:"
            rules={[{ required: true, message: 'Please select your role' }]}
          >
            <Radio.Group className="role-radio-group">
              <Radio.Button value="1" className="role-radio-button">
                Farmer
                <div className="role-description">I want to sell agricultural products</div>
              </Radio.Button>
              <Radio.Button value="2" className="role-radio-button">
                Buyer
                <div className="role-description">I want to buy agricultural products</div>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" className="submit-button" loading={loading}>
              Continue
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RoleSelection;
