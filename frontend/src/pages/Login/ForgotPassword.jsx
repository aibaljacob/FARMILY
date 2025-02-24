import { useState } from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import axios from "axios";
import "./ForgotPassword.css"
import { Link , useNavigate} from 'react-router-dom';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

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
  
      // If it's any other valid field (non-email, non-password)
      if (name !== 'email') {
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
      return newErrors;
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/password-reset/", values);
      message.success(res.data.message);
    } catch (error) {
      message.error("Error: " + (error.response?.data?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <Card className="forgot-password-card">
      <Link to="/" className='farmily-auth-logo'><div  className="farmily-logo"></div></Link>
        <Title level={2} className="title">Forgot Password?</Title>
        <Text>Please enter your email to reset your password.</Text>
        <Form layout="vertical" onFinish={handleSubmit} className="forgot-password-form">
          <Form.Item
            label="Email Address"
            name="email"
            onChange={handleChange}
            onBlur={handleBlur}
            rules={[{ required: true, message: "Please enter your email!" }, { type: "email", message: "Enter a valid email!" }]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Button type="primary" style={{backgroundColor:"green",border:"none",marginBottom:"10px"}} htmlType="submit" loading={loading} block>
            Reset Password
          </Button>
          <Link to="/login" style={{color:"green",marginTop:"30px"}}>Back to Login</Link>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
