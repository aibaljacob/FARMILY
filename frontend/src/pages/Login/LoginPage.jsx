import React, { useState } from 'react';
import './LoginPage.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import classNames from 'classnames';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [serverError, setServerError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const resendVerificationEmail = async () => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/resend-verification-email/', { email: formData.email });
        alert(response.data.message);  // Notify the user
    } catch (error) {
        console.error("Resend email error:", error.response?.data);
        alert("Failed to resend verification email. Try again.");
    }
};

// Handle Google login success
const handleGoogleSuccess = async (credentialResponse) => {
  try {
    setGoogleLoading(true);
    
    // Decode the credential to get user info
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Google user info:", decoded);
    
    // Send the token to your backend
    const response = await axios.post('http://127.0.0.1:8000/api/auth/google/', {
      token: credentialResponse.credential
    });
    
    // Check if this is a new user
    if (response.data.is_new_user) {
      // Navigate to role selection page with user data
      navigate('/google/role-selection', {
        state: {
          userData: response.data
        }
      });
    } else {
      // Existing user - store tokens and redirect
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success("Login successful!");
      
      // Redirect based on user role
      if (response.data.user.role === 1) {
        window.location.href = '/farmer';
      } else if (response.data.user.role === 2) {
        window.location.href = '/buyer-dashboard'; 
      } else {
        window.location.href = '/admin-dashboard'; 
      }
    }
  } catch (error) {
    console.error("Google login error:", error.response?.data || error.message);
    toast.error(error.response?.data?.error || "Failed to authenticate with Google. Please try again.");
  } finally {
    setGoogleLoading(false);
  }
};

// Handle Google login error
const handleGoogleError = () => {
  toast.error("Google sign-in was unsuccessful. Please try again.");
  setGoogleLoading(false);
};


  const handleBlur = (e) => {
    const { name, value } = e.target;
  
    // Required field check
    if (!value.trim()) {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`,
      }));
      document.getElementById(name).classList.add('invalid');
      document.getElementById(name).classList.remove('valid');
    } else {
      // Handle specific field validations
      if (name === 'email') {
        const emailRegex = /^(?!.*\.\.)[a-zA-Z][a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9]@(?!(?:[.-])|.*[.-]{2})[a-zA-Z][a-zA-Z0-9-]{0,62}(\.[a-zA-Z0-9-]{1,63})*\.(com|net|org|edu|gov|io|co|info|biz|me|us|uk|ca|au|in)$/;
        if (!emailRegex.test(value)) {
          setErrors((prev) => ({
            ...prev,
            [name]: 'Please enter a valid email address.',
          }));
          document.getElementById(name).classList.add('invalid');
          document.getElementById(name).classList.remove('valid');
        } else {
          setErrors((prev) => ({ ...prev, [name]: '' }));
          document.getElementById(name).classList.remove('invalid');
          document.getElementById(name).classList.add('valid');
        }
      }
  
      if (name === 'password') {
        if (value.length < 6) {
          setErrors((prev) => ({
            ...prev,
            [name]: 'Password must be at least 6 characters long.',
          }));
          document.getElementById(name).classList.add('invalid');
          document.getElementById(name).classList.remove('valid');
        } else {
          setErrors((prev) => ({ ...prev, [name]: '' }));
          document.getElementById(name).classList.remove('invalid');
          document.getElementById(name).classList.add('valid');
        }
      }
  
      // If it's any other valid field (non-email, non-password)
      if (name !== 'email' && name !== 'password') {
        setErrors((prev) => ({ ...prev, [name]: '' }));
        document.getElementById(name).classList.remove('invalid');
        document.getElementById(name).classList.add('valid');
      }
    }
  };
  
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  
    setErrors((prev) => {
      const newErrors = { ...prev };
  
      if (name === 'email') {
        const emailRegex = /^(?!.*\.\.)[a-zA-Z][a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9]@(?!(?:[.-])|.*[.-]{2})[a-zA-Z][a-zA-Z0-9-]{0,62}(\.[a-zA-Z0-9-]{1,63})*\.(com|net|org|edu|gov|io|co|info|biz|me|us|uk|ca|au|in)$/;
        if (!emailRegex.test(value)) {
          newErrors.email = 'Use a valid email format';
        } else {
          newErrors.email = '';
        }
      }
  
      if (name === 'password') {
        const password = value;
        const errors = [];
      
        // Check for minimum length (8 characters)
        if (password.length < 8) {
          errors.push('Password must be at least 8 characters long.');
        }
      
        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
          errors.push('Password must contain at least one uppercase letter.');
        }
      
        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
          errors.push('Password must contain at least one lowercase letter.');
        }
      
        // Check for at least one digit
        if (!/\d/.test(password)) {
          errors.push('Password must contain at least one digit.');
        }
      
        // Check for at least one special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          errors.push('Password must contain at least one special character.');
        }
      
        // Join errors with line breaks to display each on a new line
        newErrors.password = errors.length > 0 ? errors.join('') : ''; 
      }

      return newErrors;
    });
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Final validation
    const emailRegex = /^(?!.*\.\.)[a-zA-Z][a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9]@(?!(?:[.-])|.*[.-]{2})[a-zA-Z][a-zA-Z0-9-]{0,62}(\.[a-zA-Z0-9-]{1,63})*\.(com|net|org|edu|gov|io|co|info|biz|me|us|uk|ca|au|in)$/;
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
  
      const { access, refresh, user } = response.data;
  
      // Store tokens in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
  
      // Show success toast and redirect user
      toast.success("Login successful!");
      console.log("Logged in:", response.data);
      localStorage.setItem('user', JSON.stringify(user));

      
  
      // Redirect based on user type
    if (user.role === 1) {
      window.location.href = '/farmer';
    } else if (user.role === 2) {
      window.location.href = '/buyer-dashboard'; 
    } else {
      window.location.href = '/admin-dashboard'; 
    }
    } catch (error) {
      console.error(error.response?.data || error.message);
  
      // Show appropriate error message
      if (error.response?.data?.detail) {
        setServerError(error.response.data.detail);
        toast.error(error.response.data.detail);
        setShowResend(true);  // Enable the resend button
      } else if (error.response?.data?.non_field_errors) {
        setServerError(error.response.data.non_field_errors.join(", "));
        toast.error(error.response.data.non_field_errors.join(", "));
      } else {
        setServerError('Something went wrong!');
        toast.error('Something went wrong!');
      }
    }

    try {
      const response = await axios.post('/api/login', { email, password });
      console.log("Login successful:", response.data);
      // Redirect or do something after successful login
  } catch (error) {
      console.error("Login error:", error.response?.data);

      if (error.response?.data?.message === "Email not verified") {
          setShowResend(true);  // Enable the resend button
      }
  }
  };

  return (
    <div className="farmily-auth-container">
      <div className="farmily-auth-image"><div className="farmily-auth-image-in"></div></div>
      <div className="farmily-auth-content">
        <div className="farmily-auth-card">
          <div className="farmily-auth-form-container">
            <div className="farmily-auth-header">
              <Link to="/" className='farmily-auth-logo'><div className="farmily-logo"></div></Link>
              <h1>Welcome Back</h1>
              <p>Sign in to continue to Farmily</p>
            </div>

            <form onSubmit={handleSubmit} className="farmily-auth-form" method='POST'>
              <div className="farmily-form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={classNames({
                    invalid: errors.email,
                    valid: !errors.email && formData.email,
                  })}
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
                  className={classNames({
                    invalid: errors.password,
                    valid: !errors.password && formData.password,
                  })}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              {serverError && <div className="server-error">{serverError}</div>}

              <button type="submit" className="farmily-auth-button">Sign In</button>
            </form>
            
            <div className="farmily-auth-divider">
              <span>OR</span>
            </div>
            
            <div className="google-signin-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                text="continue_with"
                shape="pill"
                locale="en"
                logo_alignment="center"
                width="100%"
              />
            </div>
            
            <div className="farmily-auth-footer">
              {showResend && (
                <button onClick={resendVerificationEmail} className="farmily-auth-button">
                  Resend Verification Email
                </button>
              )}
              <Link to="/forgot-password" className="farmily-auth-link">Forgot Password?</Link>
              <div className="farmily-auth-divider">
                <span>Don't have an account?</span>
              </div>
              <Link to="/register" className="farmily-auth-link">Create an Account</Link>
            </div>
          </div>
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
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      
      // Decode the credential to get user info
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google user info:", decoded);
      
      // Send the token to your backend
      const response = await axios.post('http://127.0.0.1:8000/api/auth/google/', {
        token: credentialResponse.credential
      });
      
      // Check if this is a new user
      if (response.data.is_new_user) {
        // Navigate to role selection page with user data
        navigate('/google/role-selection', {
          state: {
            userData: response.data
          }
        });
      } else {
        // Existing user - store tokens and redirect
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast.success("Login successful!");
        
        // Redirect based on user role
        if (response.data.user.role === 1) {
          window.location.href = '/farmer';
        } else if (response.data.user.role === 2) {
          window.location.href = '/buyer-dashboard'; 
        } else {
          window.location.href = '/admin-dashboard'; 
        }
      }
    } catch (error) {
      console.error("Google login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to authenticate with Google. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Google login error
  const handleGoogleError = () => {
    toast.error("Google sign-in was unsuccessful. Please try again.");
    setGoogleLoading(false);
  };

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
          const emailRegex = /^(?!.*\.\.)[a-zA-Z][a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9]@(?!(?:[.-])|.*[.-]{2})[a-zA-Z][a-zA-Z0-9-]{0,62}(\.[a-zA-Z0-9-]{1,63})*\.(com|net|org|edu|gov|io|co|info|biz|me|us|uk|ca|au|in)$/;
          if (!emailRegex.test(value)) {
            setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
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
          const password = value;
          const errors = [];
        
          // Check for minimum length (8 characters)
          if (password.length < 8) {
            errors.push('Password must be at least 8 characters long.');
          }
        
          // Check for at least one uppercase letter
          if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter.');
          }
        
          // Check for at least one lowercase letter
          if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter.');
          }
        
          // Check for at least one digit
          if (!/\d/.test(password)) {
            errors.push('Password must contain at least one digit.');
          }
        
          // Check for at least one special character
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character.');
          }
        
          // Join errors with line breaks to display each on a new line
          newErrors.password = errors.length > 0 ? errors.join('') : ''; 
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
    const emailRegex = /^(?!.*\.\.)[a-zA-Z][a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9]@(?!(?:[.-])|.*[.-]{2})[a-zA-Z][a-zA-Z0-9-]{0,62}(\.[a-zA-Z0-9-]{1,63})*\.(com|net|org|edu|gov|io|co|info|biz|me|us|uk|ca|au|in)$/;
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
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.userType === 'farmer' ? 1 : 2,  // Set role based on userType
        is_active: true,  // Set default active status
        is_superuser: false,  // Regular users are not superusers
      });
      toast.success("Verification email has been sent! Redirecting to login...");
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
      <div className="farmily-auth-image"><div className="farmily-auth-image-in"></div></div>
      <div className="farmily-auth-content">
        <div className="farmily-auth-card">
          <div className="farmily-auth-form-container">
            <div className="farmily-auth-header">
              <Link to="/" className='farmily-auth-logo'><div className="farmily-logo"></div></Link>
              <h1>Join Farmily</h1>
              <p>Create your account and start connecting</p>
            </div>

            <form onSubmit={handleSubmit} className="farmily-auth-form">
              <div className="farmily-form-row">
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
                    className={classNames({
                      invalid: errors.firstName,
                      valid: !errors.firstName && formData.firstName,
                    })}
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
                    className={classNames({
                      invalid: errors.lastName,
                      valid: !errors.lastName && formData.lastName,
                    })}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              <div className="farmily-form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={classNames({
                    invalid: errors.email,
                    valid: !errors.email && formData.email,
                  })}
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
                  className={classNames({
                    invalid: errors.password,
                    valid: !errors.password && formData.password,
                  })}
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
                  className={classNames({
                    invalid: errors.confirmPassword,
                    valid: !errors.confirmPassword && formData.confirmPassword,
                  })}
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
                      checked={formData.userType === 'farmer'} 
                      onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                    />
                    Farmer
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="userType"
                      value="buyer"
                      checked={formData.userType === 'buyer'} 
                      onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                    />
                    Buyer
                  </label>
                </div>
              </div>

              <button type="submit" className="farmily-auth-button">Create Account</button>
            </form>
            
            <div className="farmily-auth-divider">
              <span>OR</span>
            </div>
            
            <div className="google-signin-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                text="continue_with"
                shape="pill"
                locale="en"
                logo_alignment="center"
                width="100%"
              />
            </div>

            <div className="farmily-auth-footer">
              <div className="farmily-auth-divider">
                <span>Already have an account?</span>
              </div>
              <Link to="/login" className="farmily-auth-link">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
