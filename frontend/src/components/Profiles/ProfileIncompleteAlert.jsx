import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Toast content as a React component for better interaction
const ToastContent = ({ missingFields }) => (
  <div className="profile-incomplete-toast">
    <h4>Profile Incomplete</h4>
    <p>Please complete these fields to access all features:</p>
    <div className="missing-fields-list">
      {missingFields.map((field, index) => (
        <div key={index}>• {field}</div>
      ))}
    </div>
  </div>
);

// Function to show profile completion warning as a toast notification
export const showProfileIncompleteWarning = (profileData) => {
  // Define required fields and their display names
  const requiredFieldsMap = {
    'bio': 'Bio/About Me',
    'phoneno': 'Phone Number',
    'dob': 'Date of Birth',
    'address': 'Address',
    'city': 'City',
    'state': 'State',
    'country': 'Country',
    'pincode': 'Postal/ZIP Code'
  };
  
  // Determine which fields are missing
  const missingFields = [];
  
  if (profileData) {
    Object.entries(requiredFieldsMap).forEach(([field, displayName]) => {
      if (!profileData[field] || profileData[field].toString().trim() === '') {
        missingFields.push(displayName);
      }
    });
  } else {
    // If no profile data is available, all fields are missing
    missingFields.push(...Object.values(requiredFieldsMap));
  }

  // Show the toast notification with React component
  toast.warning(
    <ToastContent missingFields={missingFields} />, 
    {
      position: "top-right",
      autoClose: 7000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: "profile-warning-toast",
      toastId: "profile-incomplete-warning" // Prevent duplicate toasts
    }
  );
};

// Keep a simple component version for backward compatibility
const ProfileIncompleteAlert = ({ profileData }) => {
  // Trigger the toast notification when the component mounts
  React.useEffect(() => {
    showProfileIncompleteWarning(profileData);
  }, [profileData]);
  
  // Return null as we're using toast notifications instead
  return null;
};

export default ProfileIncompleteAlert;
