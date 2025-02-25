import { useState } from "react";
import { Link, Navigate ,useParams } from "react-router-dom";
import { Input, Button, Card, Typography, message } from "antd";
import axios from "axios";
import "./ResetPassword.css";

const { Title } = Typography;

const ResetPassword = () => {
  const { userId, token } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [errors, setErrors] = useState({});

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPassword(value);
      setErrors((errors) => {
        const newErrors = { ...errors };
  
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
    setLoading(true);
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/reset/${userId}/${token}/`, {
        new_password: password,
      });
      message.success(res.data.message);
      setPassword("");
      setRedirect(true);
    } catch (error) {
      message.error("Error: " + (error.response?.data?.message || "Something went wrong"));
    }
    setLoading(false);
  };

  if (redirect) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="background-container">
      <Card className="reset-card">
      <Link to="/" className='farmily-auth-logo'><div  className="farmily-logo"></div></Link>
        <Title level={3} className="reset-title">Reset Password</Title>
        <form onSubmit={handleSubmit} className="reset-form">
          <Input.Password 
            placeholder="Enter new password" 
            value={password} 
            onChange={handleChange} 
            required 
            size="large" 
            name="password"
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
          <Button type="primary" htmlType="submit" loading={loading} block style={{backgroundColor:"green", border:"none"}}>
            Change Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;