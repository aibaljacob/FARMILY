import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import ProfileForm from './ProfileForm';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfileCreate = ({ firstName, lastName, userid }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      await axios.post('http://127.0.0.1:8000/api/farmer-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Profile created successfully!');
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error('Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Create Profile</h1>
      <ProfileForm 
        initialData={{ user: userid }}
        onSubmit={handleSubmit}
        loading={loading}
        firstName={firstName}
        lastName={lastName}
        submitLabel="Create Profile"
      />
    </Card>
  );
};