import React from 'react';
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



const App = () => {
  return (
    <Routes>
      <Route path={routes.landing} element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/farmer-dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}/>
      <Route path="/register" element={<RegisterPage />} />
      <Route path={routes.register} element={<RegisterPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
      <Route path="/farmer" element={<Farmer />} />
      <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
