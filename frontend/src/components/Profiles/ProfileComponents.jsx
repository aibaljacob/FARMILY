import { Card, Avatar, Typography, Divider, Row, Col, Tag, Space } from "antd";
import { ProfileForm } from "./ProfileForm";
import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import { UserOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined, InfoCircleOutlined, MailOutlined } from '@ant-design/icons';
import './ProfileComponents.css';

const { Title, Text, Paragraph } = Typography;

const ProfileView = ({ profileData, firstName, lastName, ed }) => {
  if (!profileData) return (
    <Card className="profile-loading">
      <div className="profile-loading-content">
        <UserOutlined style={{ fontSize: 48 }} />
        <Text>No profile data available</Text>
      </div>
    </Card>
  );

  return (
    <Card className="profile-view-card">
      <div className="profile-header">
        <div className="profile-avatar-container">
          {profileData.profilepic ? (
            <Avatar 
              src={`http://127.0.0.1:8000${profileData.profilepic}`}
              alt={`${firstName} ${lastName}`}
              size={120}
              className="profile-avatar"
            />
          ) : (
            <Avatar
              icon={<UserOutlined />}
              size={120}
              className="profile-avatar"
            />
          )}
          <div className="profile-verification-badge">
            <Tag color="green">Verified</Tag>
          </div>
        </div>
        
        <div className="profile-info">
          <Title level={2} className="profile-name">{firstName} {lastName}</Title>
          {profileData.isVerified && (
            <Tag color="blue" className="verification-tag">Verified User</Tag>
          )}
          {profileData.role === 1 && (
            <Tag color="green" className="role-tag">Farmer</Tag>
          )}
          {profileData.role === 2 && (
            <Tag color="orange" className="role-tag">Buyer</Tag>
          )}
        </div>
      </div>

      <Divider />
      
      <Row gutter={[24, 24]} className="profile-content">
        <Col xs={24} md={14} className="profile-section">
          <div className="section-header">
            <InfoCircleOutlined className="section-icon" />
            <Title level={4}>About</Title>
          </div>
          <div className="section-content">
            <Paragraph className="profile-bio">
              {profileData.bio || "No bio information provided."}
            </Paragraph>
          </div>
        </Col>

        <Col xs={24} md={10} className="profile-section contact-section">
          <div className="section-header">
            <UserOutlined className="section-icon" />
            <Title level={4}>Contact Information</Title>
          </div>
          <div className="section-content">
            <div className="contact-item">
              <PhoneOutlined className="contact-icon" />
              <Text>{profileData.phoneno || "Not provided"}</Text>
            </div>
            <div className="contact-item">
              <MailOutlined className="contact-icon" />
              <Text>{profileData.user_email || "Not provided"}</Text>
            </div>
            <div className="contact-item">
              <CalendarOutlined className="contact-icon" />
              <Text>Born: {profileData.dob || "Not provided"}</Text>
            </div>
          </div>
        </Col>

        <Col xs={24} className="profile-section location-section">
          <div className="section-header">
            <EnvironmentOutlined className="section-icon" />
            <Title level={4}>Location</Title>
          </div>
          <div className="section-content">
            <div className="location-info">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card className="address-card">
                    <div className="address-title">Address</div>
                    <div className="address-content">
                      {profileData.address || "Not provided"}
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card className="location-detail-card">
                        <div className="detail-title">Nearest City</div>
                        <div className="detail-content">{profileData.city || "Not provided"}</div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card className="location-detail-card">
                        <div className="detail-title">State</div>
                        <div className="detail-content">{profileData.state || "Not provided"}</div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card className="location-detail-card">
                        <div className="detail-title">Country</div>
                        <div className="detail-content">{profileData.country || "Not provided"}</div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card className="location-detail-card">
                        <div className="detail-title">Postal Code</div>
                        <div className="detail-content">{profileData.pincode || "Not provided"}</div>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>

      {ed && (
        <div className="profile-actions">
          {ed}
        </div>
      )}
    </Card>
  );
};

const ProfileCreate = ({ firstName, lastName, userid,setMode, isFarmer }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    console.log(formData)
    const token = localStorage.getItem('access_token');
    const profileUrl = isFarmer==1
      ? 'http://127.0.0.1:8000/api/farmer-profile/' 
      : 'http://127.0.0.1:8000/api/buyer-profile/';
    try {
      await axios.post(profileUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Profile created successfully!');
      setMode('view')
    } catch (error) {
      toast.error('Failed to create profile.');
      console.error(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Create Profile</h1>
      <ProfileForm 
        initialData={{ user: userid }}
        onSubmit={handleSubmit}
        loading={loading}
        firstName={firstName}
        lastName={lastName}
        submitLabel="Create Profile"
      />
    </>
  );
};

const ProfileUpdate = ({ firstName, lastName, userid,can,onSuccess,setMode, isFarmer }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      const profileUrl = isFarmer==1
      ? 'http://127.0.0.1:8000/api/farmer-profile/' 
      : 'http://127.0.0.1:8000/api/buyer-profile/';
      try {
        const response = await axios.get(profileUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfileData(response.data);
        console.log(profileData)
      } catch (error) {
        toast.error('Failed to load profile data.');
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    Object.keys(formData).forEach((key) => {
      if (profileData[key] === formData[key]) {
          delete formData[key];
      }
    });
    const profileUrl = isFarmer==1
      ? 'http://127.0.0.1:8000/api/farmer-profile/' 
      : 'http://127.0.0.1:8000/api/buyer-profile/';
    try {
      await axios.put(profileUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Profile updated successfully!');
      setMode('view')
    } catch (error) {
      toast.error('Failed to update profile.');
      console.error(error.response?.data || error.message);
      formData=""
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Update Profile</h1>
      <ProfileForm 
        initialData={profileData}
        onSubmit={handleSubmit}
        loading={loading}
        firstName={firstName}
        lastName={lastName}
        submitLabel="Update Profile"
        can={can}
      />
    </>
  );
};

export {ProfileCreate,ProfileUpdate,ProfileView};