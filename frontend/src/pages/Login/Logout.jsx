import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user session
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');// Clear token or other session data

    // Notify the user
    toast.success('You have been logged out successfully.');

    // Redirect to login page after a delay
    setTimeout(() => {
      navigate('/login'); // Change this path if your login route is different
    }, 500);
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        color: '#206523',
        fontSize: '1.5rem',
        textAlign: 'center',
      }}
    >
      Logging you out...
    </div>
  );
};

export default Logout;
