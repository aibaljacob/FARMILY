// ProfileManager.js
import React, { useState, useEffect } from 'react';
import { ProfileView, ProfileCreate, ProfileUpdate } from './ProfileComponents';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Card } from "antd";

const ProfileManager = ({ firstName, lastName, userid, role, onProfileUpdateSuccess }) => {
  const [mode, setMode] = useState('loading');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    
    // If changing from edit/create mode to view mode, it might indicate a successful update
    if ((mode === 'update' || mode === 'create') && newMode === 'view' && onProfileUpdateSuccess) {
      onProfileUpdateSuccess();
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [],);
  useEffect(() => {
    if (mode === "view") {
      fetchProfile();
    }
  }, [mode]);

  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');
    const profileUrl = role==1
      ? 'http://127.0.0.1:8000/api/farmer-profile/' 
      : 'http://127.0.0.1:8000/api/buyer-profile/';
    try {
      const response = await axios.get(profileUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProfileData(response.data);
      setMode('view');
    } catch (error) {
      console.log("No existing profile found");
      setMode('create');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileCreated = (newProfileData) => {
    setProfileData(newProfileData);
    handleModeChange('view');
    toast.success('Profile created successfully!');
  };

  const handleProfileUpdated = (updatedProfileData) => {
    setProfileData(updatedProfileData);
    handleModeChange('view');
    toast.success('Profile updated successfully!');
  };

  

  if (loading) {
    return <div className="flex justify-center items-center min-h-[200px]">Loading...</div>;
  }

  return (
    <>
      {mode === 'view' && (
          <ProfileView 
            profileData={profileData} 
            firstName={firstName} 
            lastName={lastName} 
            ed={<button
                onClick={() => handleModeChange('update')}
                className="cursor-pointer px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 w-30 h-8" style={{color:"white"}}
              >
                Edit Profile
              </button>}
          />
      )}

      {mode === 'create' && (
        <ProfileCreate
          firstName={firstName}
          lastName={lastName}
          userid={userid}
          isFarmer={role}
          onSuccess={handleProfileCreated}
          setMode={handleModeChange}
        />
      )}

      {mode === 'update' && (
        <>
          <div className="flex justify-end mb-4">
            
          </div>
          <ProfileUpdate
            firstName={firstName}
            lastName={lastName}
            userid={userid}
            setMode={handleModeChange}
            initialData={profileData}
            onSuccess={handleProfileUpdated}
            isFarmer={role}
            can={<button
                onClick={() => handleModeChange('view')}
                variant="outline"
                className="cursor-pointer px-4 py-2 rounded-md w-20 h-8"
              >
                Cancel
              </button>}
          />
        </>
      )}
    </>
  );
};

// Update the ProfileCreate component to handle success
const Profilecreate = ({ firstName, lastName, userid, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/farmer-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      onSuccess(response.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error('Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Create Your Profile</h1>
      <ProfileForm 
        initialData={{ user: userid }}
        onSubmit={handleSubmit}
        loading={loading}
        firstName={firstName}
        lastName={lastName}
        submitLabel="Create Profile"
      />
    </div>
  );
};

// Update the ProfileUpdate component to handle success
const Profileupdate = ({ firstName, lastName, userid, initialData, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await axios.put('http://127.0.0.1:8000/api/farmer-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      onSuccess(response.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Update Your Profile</h1>
      <ProfileForm 
        initialData={initialData}
        onSubmit={handleSubmit}
        loading={loading}
        firstName={firstName}
        lastName={lastName}
        submitLabel="Update Profile"
      />
    </div>
  );
};

export default ProfileManager;