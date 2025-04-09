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
import { showProfileIncompleteWarning } from '../../../components/Profiles/ProfileIncompleteAlert';
import '../../../components/Profiles/ProfileToastStyles.css';
import CustomToastContainer from '../../../components/Toast/CustomToastContainer';
import '../../../components/Toast/CustomToastContainer.css';

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
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const username = user ? `${user.first_name} ${user.last_name}` : "Guest";

  const handleNavigation = (page) => {
    // Map page numbers to section names
    const pageToSection = {
      '1': 'dashboard',
      '2': 'products',
      '3': 'post-demand',
      '4': 'deals',
      '5': 'farmers',
      '6': 'profile'
    };
    
    const section = pageToSection[page] || 'dashboard';
    
    // If profile is not complete, only allow navigation to the profile page
    if (!profileComplete && page !== '6') {
      // Show the profile incomplete warning
      showProfileIncompleteWarning(profileData);
      setActiveSection('profile');
      return;
    }
    
    setActiveSection(section);
  };

  const checkProfileCompletion = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const profileResponse = await axios.get('http://127.0.0.1:8000/api/buyer-profile/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Get profile data
      const profileData = profileResponse.data;
      setProfileData(profileData);
      
      // Check if all required fields are filled
      const requiredFields = ['bio', 'phoneno', 'dob', 'address', 'city', 'state', 'country', 'pincode'];
      const isProfileComplete = requiredFields.every(field => 
        profileData[field] && profileData[field].toString().trim() !== ''
      );
      
      setProfileComplete(isProfileComplete);
      
      return isProfileComplete;
    } catch (error) {
      console.error("Error checking profile completion:", error);
      return false;
    }
  };

  const handleProfileUpdateSuccess = async () => {
    const isComplete = await checkProfileCompletion();
    if (isComplete) {
      toast.success('Profile complete! You now have access to all features.');
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
        
        // Check if buyer profile exists and is complete
        try {
          const profileResponse = await axios.get('http://127.0.0.1:8000/api/buyer-profile/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          // Get profile data
          const profileData = profileResponse.data;
          setProfileData(profileData);
          
          // Check if all required fields are filled
          const requiredFields = ['bio', 'phoneno', 'dob', 'address', 'city', 'state', 'country', 'pincode'];
          const isProfileComplete = requiredFields.every(field => 
            profileData[field] && profileData[field].toString().trim() !== ''
          );
          
          setProfileComplete(isProfileComplete);
          
          // If profile is incomplete, redirect to profile page and show warning
          if (!isProfileComplete) {
            console.log("Buyer profile incomplete, redirecting to profile page");
            setActiveSection('profile');
            // Show the profile incomplete warning
            showProfileIncompleteWarning(profileData);
          }
        } catch (error) {
          console.log("No buyer profile found, redirecting to profile page");
          setProfileComplete(false);
          setActiveSection('profile');
          // Show the profile incomplete warning
          showProfileIncompleteWarning(profileData);
        }
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
        return (
          <ProfileManager 
            firstName={user?.first_name} 
            lastName={user?.last_name} 
            userid={user?.id} 
            role={user?.role}
            onProfileUpdateSuccess={handleProfileUpdateSuccess}
          />
        );
      default:
        return <Overview />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Layout className="site-layout">
        <Header userName={username} onNavigate={handleNavigation} pfp={pfp} />
        
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
            <Menu.Item 
              key="1" 
              icon={<DashboardOutlined style={{ color: '#2d6a4f' }} />} 
              onClick={() => handleNavigation('1')}
              disabled={!profileComplete}
            >
              <Link to="#">Dashboard</Link>
            </Menu.Item>
            <Menu.Item 
              key="2" 
              icon={<ShoppingOutlined style={{ color: '#2d6a4f' }} />} 
              onClick={() => handleNavigation('2')}
              disabled={!profileComplete}
            >
              <Link to="#">Products</Link>
            </Menu.Item>
            <Menu.Item 
              key="3" 
              icon={<PlusOutlined style={{ color: '#2d6a4f' }} />} 
              onClick={() => handleNavigation('3')}
              disabled={!profileComplete}
            >
              <Link to="#">Post Demand</Link>
            </Menu.Item>
            <Menu.Item 
              key="4" 
              icon={<HistoryOutlined style={{ color: '#2d6a4f' }} />} 
              onClick={() => handleNavigation('4')}
              disabled={!profileComplete}
            >
              <Link to="#">Deals</Link>
            </Menu.Item>
            <Menu.Item 
              key="5" 
              icon={<TeamOutlined style={{ color: '#2d6a4f' }} />} 
              onClick={() => handleNavigation('5')}
              disabled={!profileComplete}
            >
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
        {/* Custom toast container with adjusted positioning */}
        <CustomToastContainer />
      </Layout>
    </div>
  );
};

export default BuyerDashboard;
