import React, { useState, useEffect } from 'react';
import StatsCard from '../Statscard/Statscard';
import IncomeChart from '../IncomeChart/IncomeChart';
import RecentDeals from '../RecentDeals/RecentDeals';
import RecentPosts from '../RecentPosts/RecentPosts';
import NearbyBuyers from '../NearbyBuyers/NearbyBuyers';
import './Overview.css'

const Overview = () => {
  const [userRole, setUserRole] = useState(null);
  const [nearbyTitle, setNearbyTitle] = useState('Nearby');
  const [postsTitle, setPostsTitle] = useState('Posts');

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) {
      setUserRole(user.role);
      
      // Set appropriate titles based on user role
      if (user.role === 1) { // Farmer
        setNearbyTitle('Nearby Buyers');
        setPostsTitle('My Products');
      } else if (user.role === 2) { // Buyer
        setNearbyTitle('Nearby Farmers');
        setPostsTitle('My Demands');
      }
    }
  }, []);

  return (
    <div className="overview-section">
      <div className="stats-section">
        <StatsCard title="Total Earnings" value="₹0" icon="💰" />
        <StatsCard title="My Deals" value="View" icon="🤝" />
        <StatsCard title={postsTitle} value="View" icon="📦" />
        <StatsCard title={nearbyTitle} value="View" icon="🏪" />
      </div>

      <section className="income-chart-section">
        <h2>Income Tracker</h2>
        <IncomeChart data={{
          months: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          earnings: [0, 0, 0, 0, 0], // Start with empty data
        }} />
      </section>

      <div style={{display: 'flex', flexDirection: 'column', gap: "2rem"}}>
        <RecentDeals />
        <RecentPosts />
        <NearbyBuyers />
      </div>
    </div>
  );
};

export default Overview;
