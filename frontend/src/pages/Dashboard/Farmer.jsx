import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import StatsCard from '../../components/Statscard/Statscard';
import IncomeChart from '../../components/IncomeChart/IncomeChart';
import RecentDeals from '../../components/RecentDeals/RecentDeals';
import RecentPosts from '../../components/RecentPosts/RecentPosts';
import NearbyBuyers from '../../components/NearbyBuyers/NearbyBuyers';
import './DashboardPage.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [userDetails, setUserDetails] = useState(null);
  const [recentDeals, setRecentDeals] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [nearbyBuyers, setNearbyBuyers] = useState([]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://127.0.0.1:8000/dashboard/' , {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserDetails(response.data.user);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load user details. Please log in again.');
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchDeals = async () => {
      const dealsData = [
        { id: 1, buyer: 'John Doe', produce: 'Tomatoes', quantity: '20kg', price: '₹500', status: 'Completed' },
        { id: 2, buyer: 'Jane Smith', produce: 'Potatoes', quantity: '10kg', price: '₹300', status: 'Pending' },
        { id: 3, buyer: 'Jane Smith', produce: 'Potatoes', quantity: '10kg', price: '₹300', status: 'Pending' },
        { id: 4, buyer: 'Jane Smith', produce: 'Potatoes', quantity: '10kg', price: '₹300', status: 'Pending' },
        { id: 5, buyer: 'Jane Smith', produce: 'Potatoes', quantity: '10kg', price: '₹300', status: 'Pending' },
        { id: 6, buyer: 'Jane Smith', produce: 'Potatoes', quantity: '10kg', price: '₹300', status: 'Pending' },
      ];
      setRecentDeals(dealsData);
    };

    const fetchPosts = async () => {
      const postsData = [
        { id: 1, produce: 'Carrots', quantity: '15kg', price: '₹250', date: '2025-01-15' },
        { id: 2, produce: 'Onions', quantity: '10kg', price: '₹200', date: '2025-01-20' },
        { id: 3, produce: 'Onions', quantity: '10kg', price: '₹200', date: '2025-01-20' },
        { id: 4, produce: 'Onions', quantity: '10kg', price: '₹200', date: '2025-01-20' },
        { id: 5, produce: 'Onions', quantity: '10kg', price: '₹200', date: '2025-01-20' },
        { id: 6, produce: 'Onions', quantity: '10kg', price: '₹200', date: '2025-01-20' },
      ];
      setRecentPosts(postsData);
    };

    const fetchBuyers = async () => {
      const buyersData = [
        { id: 1, name: 'Mike Johnson', location: '5km away' },
        { id: 2, name: 'Sarah Lee', location: '10km away' },
        { id: 3, name: 'Sarah Lee', location: '10km away' },
        { id: 4, name: 'Sarah Lee', location: '10km away' },
        { id: 5, name: 'Sarah Lee', location: '10km away' },
        { id: 6, name: 'Sarah Lee', location: '10km away' },
      ];
      setNearbyBuyers(buyersData);
    };

    fetchDeals();
    fetchPosts();
    fetchBuyers();
  }, []);

  if (!userDetails) {
    return <p>Loading user details...</p>;
  }

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Header userName={userDetails.username} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="dashboard-content">
        <div className="filler"></div>
        <div className="stats-section">
          <StatsCard title="Total Earnings" value="$12,500" icon="💰" />
          <StatsCard title="Recent Deals" value={recentDeals.length} />
          <StatsCard title="Products Posted" value={recentPosts.length} />
          <StatsCard title="Nearby Buyers" value={nearbyBuyers.length} />
        </div>
        <section className="income-chart-section">
          <h2>Income Tracker</h2>
          <IncomeChart data={{
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            earnings: [200, 500, 300, 800, 600],
          }} />
        </section>
        <div className="overview-section">
          <RecentDeals deals={recentDeals} />
          <RecentPosts posts={recentPosts} />
          <NearbyBuyers buyers={nearbyBuyers} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
