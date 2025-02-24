import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './DashboardPage.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProfilesPage from '../../components/Profiles/Profiles'
import ProfileManager from '../../components/Profiles/ProfileManager';
import Overview from '../../components/Overview/Overview';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [activePage, setActivePage] = useState('1');
  
  const [userDetails, setUserDetails] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const username = user ? `${user.first_name} ${user.last_name}` : "Guest";

  const handleNavigation = (page) => {
    setActivePage(page);
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

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Header userName={username} onNavigate={handleNavigation} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} onNavigate={handleNavigation} />
      <div className="dashboard-content">
        <div className="filler"></div>
        {activePage === '1' && <Overview />}
        {activePage === '5' && <ProfileManager firstName={user?.first_name} lastName={user?.last_name} userid={user?.id}/>}
      </div>
    </div>
  );
};

export default Dashboard;
