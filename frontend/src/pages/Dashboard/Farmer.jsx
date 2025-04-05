import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './DashboardPage.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProfilesPage from '../../components/Profiles/Profiles'
import ProfileManager from '../../components/Profiles/ProfileManager';
import Overview from '../../components/Overview/Overview';
import FarmerProductsPage from '../../components/Products/Products';
import BuyerDemandsPage from '../../components/Demands/Demands';
import DealsHistoryPage from '../../components/Deals/Deals';
import BuyersView from '../../components/BuyersView/BuyersView';
import BuyerDemands from '../../components/BuyerDemands/BuyerDemands';
import { ProductOffers } from '../../components/Offers';
import { useUser } from './UserContext';
import WarningNotification from '../../components/Warnings/WarningNotification';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {profile} = useUser();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [activePage, setActivePage] = useState('1');
  const [userDetails, setUserDetails] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const pfp=profile?profile.profilepic:null;
  console.log(pfp);
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
      <Header userName={username} onNavigate={handleNavigation} pfp={pfp}/>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} onNavigate={handleNavigation} role={user?.role} />
      <div className="dashboard-content">
        <div className="filler"></div>
        {/* Warning notification component */}
        <WarningNotification />
        {activePage === '1' && <Overview />}
        {activePage === '2' && <FarmerProductsPage />}
        {activePage === '4' && <DealsHistoryPage />}
        {activePage === '5' && <ProfileManager firstName={user?.first_name} lastName={user?.last_name} userid={user?.id} role={user?.role}/>}
        {activePage === '6' && <BuyersView />}
        {activePage === '7' && <BuyerDemands />}
      </div>
    </div>
  );
};

export default Dashboard;
