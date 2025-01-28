// src/utils/auth.jsx
export const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    return !!token; // Returns true if token exists, otherwise false
  };
  