import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import ProfileForm from './ProfileForm';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfileUpdate = ({ firstName, lastName, userid ,can}) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/farmer-profile/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfileData(response.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      await axios.put('http://127.0.0.1:8000/api/farmer-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <Card className="max-w-4xl mx-auto p-8">
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
    </Card>
  );
};