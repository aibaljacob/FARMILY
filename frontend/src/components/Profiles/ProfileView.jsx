import React from 'react';
import { Card } from '@/components/ui/card';

const ProfileView = ({ profileData, firstName, lastName }) => {
  if (!profileData) return <div>No profile data available</div>;

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <div className="space-y-8">
        <div className="flex items-center gap-6">
          {profileData.profilepic && (
            <img 
              src={profileData.profilepic} 
              alt="Profile" 
              className="h-24 w-24 rounded-full object-cover"
            />
          )}
          <h1 className="text-4xl font-mono">{firstName} {lastName}</h1>
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
              <p>{profileData.city}, {profileData.state}</p>
              <p>{profileData.country} - {profileData.pincode}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};