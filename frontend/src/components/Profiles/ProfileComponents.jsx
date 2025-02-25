import { Card } from "antd";
import { ProfileForm } from "./ProfileForm";
import axios from 'axios';
import { toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";


const ProfileView = ({ profileData, firstName, lastName, ed }) => {
  if (!profileData) return <div>No profile data available</div>;

  return (
    <Card style={{padding:"",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div className="space-y-8">
        <div className="flex items-center gap-8">
          {profileData.profilepic && (
            <img 
              src={`http://127.0.0.1:8000${profileData.profilepic}`} 
              alt="Profile" 
              className="h-24 w-24 rounded-full object-cover"
            />
          )}
          <p className=" font-light text-5xl font-mono text-center" style={{margin:"0px 30px"}}>{firstName} {lastName}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">About</h2>
            <p className="mt-2 text-gray-600">{profileData.bio}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900">Contact Information</h3>
              <p className="mt-1">Phone: {profileData.phoneno}</p>
              <p>Date of Birth: {profileData.dob}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Location</h3>
              <p className="mt-1">{profileData.address}</p>
              <p>{profileData.country}, {profileData.state}</p>
              <p>{profileData.city} - {profileData.pincode}</p>
            </div>
          </div>
        </div>
      </div>
      {ed}
    </Card>
  );
};



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



const ProfileUpdate = ({ firstName, lastName, userid,can,onSuccess,setMode }) => {
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
        console.log(profileData)
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
    Object.keys(formData).forEach((key) => {
      if (profileData[key] === formData[key]) {
          delete formData[key];
      }
    });
    try {
      await axios.put('http://127.0.0.1:8000/api/farmer-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Profile updated successfully!');
      setMode('view')
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error('Failed to update profile.');
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