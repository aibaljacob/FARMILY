import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './routes';
import LandingPage from './pages/Landing/LandingPage';
import { LoginPage, RegisterPage } from './pages/Login/LoginPage';
import Logout from './pages/Login/Logout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import Farmer from './pages/Dashboard/Farmer';
import AdminDashboardPage from './pages/Dashboard/Admindashboard/Admindashboard';
import NotFoundPage from './pages/NotFoundPage';
import BuyerDashboard from './pages/Dashboard/Buyerdashboard/Buyerdashboard';
import ProtectedRoute from './components/ProtectedRoute';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'antd/dist/antd.css'; // Ant Design default style
import ForgotPassword from './pages/Login/ForgotPassword';
import ResetPassword from './pages/Login/ResetPassword';
import RoleSelection from './pages/GoogleAuth/RoleSelection';
import { configureNotifications } from './utils/notificationConfig';

const App = () => {
  // Configure notifications when the app initializes
  useEffect(() => {
    configureNotifications();
  }, []);

  return (
    <Routes>
      <Route path={routes.landing} element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path={routes.register} element={<RegisterPage />} />
      <Route path="/google/role-selection" element={<RoleSelection />} />
      <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/farmer" element={<ProtectedRoute><Farmer /></ProtectedRoute>} />
      <Route path="/buyer-dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />
    </Routes>
  );
};

export default App;
