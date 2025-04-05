import React, { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import Header from '../../../components/Header/Header';
import '../DashboardPage.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProfilesPage from '../../../components/Profiles/Profiles'
import ProfileManager from '../../../components/Profiles/ProfileManager';
import Overview from '../../../components/Overview/Overview';
import FarmerProductsPage from '../../../components/Products/Products';
import BuyerDemandsPage from '../../../components/Demands/Demands';
import DealsHistoryPage from '../../../components/Deals/Deals';
import FarmerProducts from '../../../components/FarmerProducts/FarmerProducts';
import { useUser } from '../UserContext';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import DemandManagement from '../../../components/Demands/PostDemand';
import Farmers from '../../../components/Farmers/Farmers';
import WarningNotification from '../../../components/Warnings/WarningNotification';

// Import icons
import { 
  DashboardOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const BuyerDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const {profile} = useUser();
  const pfp=profile?profile.profilepic:null;
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [userDetails, setUserDetails] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const username = user ? `${user.first_name} ${user.last_name}` : "Guest";

  const handleNavigation = (page) => {
    switch(page) {
      case '1':
        setActiveSection('dashboard');
        break;
      case '2':
        setActiveSection('products');
        break;
      case '3':
        setActiveSection('post-demand');
        break;
      case '4':
        setActiveSection('deals');
        break;
      case '5':
        setActiveSection('farmers');
        break;
      case '6':
        setActiveSection('profile');
        break;
      default:
        setActiveSection('dashboard');
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:8000/dashboard/' , {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserDetails(response.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load user details. Please log in again.');
      }
    };

    fetchUserDetails();
  }, []);

  if (!userDetails) {
    return <p>Loading user details...</p>;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Overview />;
      case 'products':
        return <FarmerProducts />;
      case 'post-demand':
        return <DemandManagement />;
      case 'deals':
        return <DealsHistoryPage />;
      case 'farmers':
        return <Farmers />;
      case 'profile':
        return <ProfileManager firstName={user?.first_name} lastName={user?.last_name} userid={user?.id}/>;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Header userName={username} onNavigate={handleNavigation} pfp={pfp} />
      
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          className="sidebar"
          width={280}
          theme="light"
          collapsed={!isSidebarOpen}
          trigger={null}
          style={{
            background: 'linear-gradient(to bottom, #d4edda, #b5dfb8)',
            position: 'fixed',
            top: 0,
            height: '100vh',
            width: 280,
            zIndex: 1000,
            boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Button
            className="sidebar-toggle"
            type="primary"
            onClick={toggleSidebar}
            style={{ position: 'absolute', bottom: 20, left: 20, backgroundColor: '#2d6a4f', border: 'none', borderRadius: '15px' }}
          >
            {isSidebarOpen ? 'Close' : 'Open'} Menu
          </Button>

          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{
              background: 'transparent',
              color: '#2d6a4f',
              fontWeight: '500',
              border: 'none',
              marginTop: '100px'
            }}
          >
            <Menu.Item key="1" icon={<DashboardOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('1')}>
              <Link to="#">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<ShoppingOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('2')}>
              <Link to="#">Products</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<PlusOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('3')}>
              <Link to="#">Post Demand</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<HistoryOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('4')}>
              <Link to="#">Deals History</Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<TeamOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('5')}>
              <Link to="#">Farmers</Link>
            </Menu.Item>
            <Menu.Item key="6" icon={<UserOutlined style={{ color: '#2d6a4f' }} />} onClick={() => handleNavigation('6')}>
              <Link to="#">Profile</Link>
            </Menu.Item>
            <Menu.Item key="7" icon={<LogoutOutlined style={{ color: '#e74c3c' }} />} style={{ color: '#e74c3c', marginTop: 'auto' }}>
              <Link to="/logout" className='logx'>Logout</Link>
            </Menu.Item>
          </Menu>
        </Sider>

        <Layout style={{ marginLeft: isSidebarOpen ? 280 : 0, transition: 'margin-left 0.3s' }}>
          <div className="dashboard-content">
            <div className="filler"></div>
            {/* Warning notification component */}
            <WarningNotification />
            {renderContent()}
          </div>
        </Layout>
      </Layout>
    </div>
  );
};

export default BuyerDashboard;
