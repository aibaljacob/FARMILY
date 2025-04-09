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
import { showProfileIncompleteWarning } from '../../components/Profiles/ProfileIncompleteAlert';
import '../../components/Profiles/ProfileToastStyles.css';
import CustomToastContainer from '../../components/Toast/CustomToastContainer';
import '../../components/Toast/CustomToastContainer.css';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {profile} = useUser();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [activePage, setActivePage] = useState('1');
  const [userDetails, setUserDetails] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const pfp=profile?profile.profilepic:null;
  console.log(pfp);
  const username = user ? `${user.first_name} ${user.last_name}` : "Guest";
  const handleNavigation = (page) => {
    setActivePage(page);
  };

  // Add a function to check profile completion
  const checkProfileCompletion = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const profileResponse = await axios.get('http://127.0.0.1:8000/api/farmer-profile/', {
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

  // Add a function to handle profile update success
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
        
        // Check if farmer profile exists and is complete
        try {
          const profileResponse = await axios.get('http://127.0.0.1:8000/api/farmer-profile/', {
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
        } catch (error) {
          console.log("No farmer profile found");
          setProfileComplete(false);
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

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Header userName={username} onNavigate={handleNavigation} pfp={pfp}/>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} onNavigate={handleNavigation} role={user?.role} profileComplete={profileComplete} />
      <div className="dashboard-content">
        <div className="filler"></div>
        {/* Warning notification component */}
        <WarningNotification />
        
        {activePage === '1' && <Overview />}
        {activePage === '2' && <FarmerProductsPage />}
        {activePage === '4' && <DealsHistoryPage />}
        {activePage === '5' && <ProfileManager 
          firstName={user?.first_name} 
          lastName={user?.last_name} 
          userid={user?.id} 
          role={user?.role}
          onProfileUpdateSuccess={handleProfileUpdateSuccess}
        />}
        {activePage === '6' && <BuyersView />}
        {activePage === '7' && <BuyerDemands />}
      </div>
      {/* Custom toast container with adjusted positioning */}
      <CustomToastContainer />
    </div>
  );
};

export default Dashboard;
