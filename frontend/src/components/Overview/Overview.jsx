import React, { useEffect, useState } from 'react';
import StatsCard from '../Statscard/Statscard';
import IncomeChart from '../IncomeChart/IncomeChart';
import RecentDeals from '../RecentDeals/RecentDeals';
import RecentPosts from '../RecentPosts/RecentPosts';
import NearbyBuyers from '../NearbyBuyers/NearbyBuyers';
import './Overview.css'

const Overview = () => {
  const [recentDeals, setRecentDeals] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [nearbyBuyers, setNearbyBuyers] = useState([]);

  useEffect(() => {
    const fetchDeals = async () => {
      const dealsData = [
        { id: 1, buyer: 'John Doe', produce: 'Tomatoes', quantity: '20kg', price: '₹500', status: 'Completed' },
        { id: 2, buyer: 'Jane Smith', produce: 'Potatoes', quantity: '10kg', price: '₹300', status: 'Pending' },
      ];
      setRecentDeals(dealsData);
    };

    const fetchPosts = async () => {
      const postsData = [
        { id: 1, produce: 'Carrots', quantity: '15kg', price: '₹250', date: '2025-01-15' },
        { id: 2, produce: 'Onions', quantity: '10kg', price: '₹200', date: '2025-01-20' },
      ];
      setRecentPosts(postsData);
    };

    const fetchBuyers = async () => {
      const buyersData = [
        { id: 1, name: 'Mike Johnson', location: '5km away' },
        { id: 2, name: 'Sarah Lee', location: '10km away' },
      ];
      setNearbyBuyers(buyersData);
    };

    fetchDeals();
    fetchPosts();
    fetchBuyers();
  }, []);

  return (
    <div>
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
  );
};

export default Overview;
