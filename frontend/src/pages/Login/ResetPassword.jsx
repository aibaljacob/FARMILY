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
            onChange={(e) => setPassword(e.target.value)} 
            required 
            size="large" 
          />
          <Button type="primary" htmlType="submit" loading={loading} block style={{backgroundColor:"green", border:"none"}}>
            Change Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;