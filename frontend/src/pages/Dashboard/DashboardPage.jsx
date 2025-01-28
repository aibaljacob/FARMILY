import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import StatsCard from '../../components/Statscard/Statscard';
import ProductTable from '../../components/ProductTable/ProductTable';
import Chat from '../../components/Chat/Chat';
import IncomeChart from '../../components/IncomeChart/IncomeChart';
import './DashboardPage.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [userDetails, setUserDetails] = useState(null); // For user details

  const [chatMessages, setChatMessages] = useState([
    { isFarmer: true, text: 'Hello, are you interested in tomatoes?' },
    { isFarmer: false, text: 'Yes, I would like to order 20kg.' },
  ]);

  const handleSendMessage = (message) => {
    setChatMessages([...chatMessages, { isFarmer: true, text: message }]);
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('access_token'); // Get token from localStorage
        const response = await axios.get('http://127.0.0.1:8000/dashboard/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserDetails(response.data.user); // Set user data to state
      } catch (error) {
        console.error(error);
        toast.error('Failed to load user details. Please log in again.');
      }
    };

    fetchUserDetails();
  }, []);

  // Show loader while data is loading
  if (!userDetails) {
    return <p>Loading user details...</p>;
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <Header title={`Welcome, ${userDetails.username}`} />

        {/* Stats Section */}
        <section className="dashboard-stats">
          <StatsCard title="Total Earnings" value="$12,500" icon="💰" />
          <StatsCard title="Products Listed" value="25" icon="📦" />
          <StatsCard title="Pending Deals" value="8" icon="⏳" />
        </section>

        {/* Profile Section */}
        <section className="profile-section">
          <h2>Profile Information</h2>
          <p><strong>Name:</strong> {userDetails.username} {userDetails.last_name}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
        </section>

        {/* Income Tracker Section */}
        <section className="income-chart-section">
          <h2>Income Tracker</h2>
          <IncomeChart data={{
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            earnings: [200, 500, 300, 800, 600],
          }} />
        </section>

        {/* Product Management Section */}
        <section className="product-management-section">
          <h2>Product Management</h2>
          <ProductTable products={[
            { id: 1, name: 'Tomatoes', price: 25, stock: 50 },
            { id: 2, name: 'Cucumbers', price: 15, stock: 30 },
            { id: 3, name: 'Carrots', price: 20, stock: 100 },
          ]} />
        </section>

        {/* Chat Section */}
        <section className="chat-section">
          <h2>Buyer Chat</h2>
          <Chat messages={chatMessages} onSend={handleSendMessage} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
