import React, { useState } from 'react';
import './LoginPage.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleBlur = (e) => {
    const { name, value } = e.target;
  
    if (!value.trim()) {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: '' })); // Clear the error if valid
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  
    setErrors((prev) => {
      const newErrors = { ...prev };
  
      if (name === 'email') {
        const emailRegex = /^(?=[^@]*[a-zA-Z]{3,})[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
          setErrors((prev) => ({ ...prev, email: 'Email must have at least 3 alphabets before "@" and be valid.' }));
        } else {
          setErrors((prev) => ({ ...prev, email: '' }));
        }
      }
      
      
  
      if (name === 'password') {
        newErrors.password = value.length >= 6 ? '' : 'Password must be at least 6 characters long.';
      }
  
      return newErrors;
    });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Final validation
    const emailRegex = /^[a-zA-Z0-9._%+-]*(?=(.*[a-zA-Z]){3,})[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      return;
    }
    if (formData.password.length < 6) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters long.' }));
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/login/', {
        email: formData.email,
        password: formData.password,
      });
  
      const { access, refresh, user_type } = response.data;
  
      // Store tokens in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
  
      // Show success toast and redirect user
      toast.success("Login successful!");
      console.log("Logged in:", response.data);
      localStorage.setItem('user_type', user_type);
  
      // Redirect based on user type
    if (user_type === 'farmer') {
      window.location.href = '/farmer'; // Redirect to farmer dashboard
    } else if (user_type === 'buyer') {
      window.location.href = '/buyer-dashboard'; // Redirect to buyer dashboard
    } else {
      window.location.href = '/admin-dashboard'; // Redirect to admin dashboard
    }
    } catch (error) {
      console.error(error.response?.data || error.message);
  
      // Show appropriate error message
      if (error.response?.data?.detail) {
        setServerError(error.response.data.detail);
        toast.error(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors) {
        setServerError(error.response.data.non_field_errors.join(", "));
        toast.error(error.response.data.non_field_errors.join(", "));
      } else {
        setServerError('Something went wrong!');
        toast.error('Something went wrong!');
      }
    }
  };

  return (
    <div className="farmily-auth-container">
      <div className="farmily-auth-card">
        <div className="farmily-auth-header">
          <Link to="/" className='farmily-auth-logo'><div  className="farmily-logo"></div></Link>
          <h1>Welcome Back</h1>
          <p>Sign in to access your Farmily account</p>
        </div>

        <form onSubmit={handleSubmit} className="farmily-auth-form" method='POST'>
          <div className="farmily-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="farmily-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {serverError && <div className="server-error">{serverError}</div>}

          <button type="submit" className="farmily-auth-button">Sign In</button>
        </form>

        <div className="farmily-auth-footer">
          <p>Don't have an account?</p>
          <Link to="/register" className="farmily-auth-link">Create an Account</Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export const RegisterPage = () => {
  const location = useLocation(); // Access location object
  const params = new URLSearchParams(location.search); // Parse query parameters
  const initialUserType = params.get('userType') || 'buyer'; 

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: initialUserType,
  });
  
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleBlur = (e) => {
    const { name, value } = e.target;
  
    if (!value.trim()) {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`,
      }));
    } 
    // else {
    //   setErrors((prev) => ({ ...prev, [name]: '' })); // Clear the error if valid
    // }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
  
      setErrors((errors) => {
        const newErrors = { ...errors };
  
        if (name === 'email') {
          const emailRegex = /^(?=[^@]*[a-zA-Z]{3,})[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(value)) {
            setErrors((prev) => ({ ...prev, email: 'Email must have at least 3 alphabets before "@" and be valid.' }));
          } else {
            setErrors((prev) => ({ ...prev, email: '' }));
          }
        }
        
        if (name === 'firstName' || name === 'lastName') {
          const nameRegex = /^[a-zA-Z]+(?:[' -]?[a-zA-Z]+)*$/;
          setErrors((prev) => ({
            ...prev,
            [name]: nameRegex.test(value)
              ? ''
              : `${name.charAt(0).toUpperCase() + name.slice(1)} must only contain letters, spaces, hyphens, or apostrophes.`,
          }));
        }
  
        if (name === 'password') {
          newErrors.password = value.length >= 6 ? '' : 'Password must be at least 6 characters long.';
        }
  
        if (name === 'confirmPassword' || name === 'password') {
          newErrors.confirmPassword = updatedData.confirmPassword === updatedData.password ? '' : 'Passwords do not match.';
        }
  
        return newErrors;
      });
  
      return updatedData;
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation
    if (formData.firstName.trim() === '') {
      setErrors((prev) => ({ ...prev, firstName: 'First name is required.' }));
      return;
    }
    if (formData.lastName.trim() === '') {
      setErrors((prev) => ({ ...prev, lastName: 'Last name is required.' }));
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]*(?=(.*[a-zA-Z]){3,})[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      return;
    }
    if (formData.password.length < 6) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters long.' }));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/register/', {
        username: `${formData.firstName} ${formData.lastName}`,  // Full name as username
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        is_farmer: formData.userType === 'farmer',
        is_buyer: formData.userType === 'buyer',
        is_active: true,  // Set default active status
        is_staff: false,  // Assume regular users are not staff
        is_superuser: false,  // Regular users are not superusers
      });
      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
  
      if (error.response?.data?.email?.[0] === 'user with this email already exists.') {
        toast.error('This email is already in use. Please try another one.');
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail); // Show backend validation error
      } else if (error.response?.data?.non_field_errors) {
        toast.error(error.response.data.non_field_errors.join(', ')); // Show multiple errors
      } else {
        toast.error('Something went wrong!'); // Fallback error message
      }
    }
  };

  return (
    <div className="farmily-auth-container">
      <div className="farmily-auth-card">
        <div className="farmily-auth-header">
        <Link to="/" className='farmily-auth-logo'><div  className="farmily-logo"></div></Link>
          <h1>Create Account</h1>
          <p>Join the Farmily community today</p>
        </div>

        <form onSubmit={handleSubmit} className="farmily-auth-form">
        <div className="farmily-form-group">
        <label htmlFor="firstName">First Name</label>
        <input
        type="text"
        id="firstName"
        name="firstName"
        placeholder="Enter your first name"
        value={formData.firstName}
        onChange={handleChange}
        onBlur={handleBlur}
        />
        {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>

<div className="farmily-form-group">
  <label htmlFor="lastName">Last Name</label>
  <input
    type="text"
    id="lastName"
    name="lastName"
    placeholder="Enter your last name"
    value={formData.lastName}
    onChange={handleChange}
    onBlur={handleBlur}
  />
  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
</div>


          <div className="farmily-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="farmily-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="farmily-form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="farmily-form-group">
            <label>I am a:</label>
            <div className="farmily-radio-group">
              <label>
                <input
                  type="radio"
                  name="userType"
                  value="farmer"
                  checked={formData.userType === 'farmer'} // Dynamically set
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                />
                Farmer
              </label>
              <label>
                <input
                  type="radio"
                  name="userType"
                  value="buyer"
                  checked={formData.userType === 'buyer'}// Dynamically set
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                />
                Buyer
              </label>
            </div>
          </div>

          <button type="submit" className="farmily-auth-button">Create Account</button>
        </form>

        <div className="farmily-auth-footer">
          <p>Already have an account?</p>
          <Link to="/login" className="farmily-auth-link">Sign In</Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
