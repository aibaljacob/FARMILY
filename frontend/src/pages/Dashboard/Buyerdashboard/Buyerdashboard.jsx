import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, MessageSquare, User, Heart,
  Search, Bell, Filter, ChevronDown, Map,
  Clock, Package, CheckCircle
} from 'lucide-react';
import './BuyerDashboard.css';
import axios from 'axios';

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    // Fetch user data when the component loads
    axios
      .get('/api/user-details', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
      });
  }, []);


  // Sample data - replace with actual data from your backend
  const sampleData = {
    activePosts: 12,
    pendingDeals: 3,
    savedFarmers: 8,
    notifications: 4,
    availableProducts: [
      {
        id: 1,
        name: 'Organic Tomatoes',
        farmer: 'Green Valley Farms',
        price: 2.99,
        unit: 'kg',
        location: 'Sacramento, CA',
        rating: 4.8,
        image: '/api/placeholder/200/200'
      },
      {
        id: 2,
        name: 'Fresh Corn',
        farmer: 'Sunshine Fields',
        price: 1.50,
        unit: 'dozen',
        location: 'Fresno, CA',
        rating: 4.5,
        image: '/api/placeholder/200/200'
      }
      // Add more products
    ],
    activeOrders: [
      {
        id: 1,
        product: 'Organic Carrots',
        farmer: 'Happy Harvest',
        status: 'In Progress',
        quantity: '50kg',
        total: 125.00,
        date: '2025-01-10'
      }
      // Add more orders
    ]
  };

  return (
    <div className="farmily-buyer-container">
      {/* Sidebar */}
      <aside className="farmily-buyer-sidebar">
        <Link to="/" className="farmily-buyer-logo">Farmily</Link>
        
        <nav className="farmily-buyer-nav">
          <button 
            className={`farmily-buyer-nav-item ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            <Search size={20} />
            <span>Browse Products</span>
          </button>
          <button 
            className={`farmily-buyer-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart size={20} />
            <span>My Orders</span>
          </button>
          <button 
            className={`farmily-buyer-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={20} />
            <span>Messages</span>
            <span className="farmily-buyer-badge">3</span>
          </button>
          <button 
            className={`farmily-buyer-nav-item ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <Heart size={20} />
            <span>Saved Items</span>
          </button>
          <button 
            className={`farmily-buyer-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="farmily-buyer-main">
        {/* Header */}
        <header className="farmily-buyer-header">
  <div className="farmily-buyer-search">
    <Search size={20} />
    <input type="text" placeholder="Search for products, farmers..." />
  </div>

  <div className="farmily-buyer-header-actions">
    <button className="farmily-buyer-notification">
      <Bell size={20} />
      <span className="farmily-buyer-badge">{sampleData.notifications}</span>
    </button>
    <div className="farmily-buyer-profile">
      {userData ? (
        <>
          <img
            src="/api/placeholder/32/32"
            alt={userData.name}
            className="farmily-buyer-avatar"
          />
          <div>
            <h3>Welcome, {userData.name} 👋</h3>
            <p>{userData.email}</p>
          </div>
        </>
      ) : (
        <span>Loading...</span>
      )}
    </div>
  </div>
</header>


        {/* Dashboard Content */}
        <div className="farmily-buyer-content">
          {/* Quick Stats */}
          <div className="farmily-buyer-stats">
            <div className="farmily-buyer-stat-card">
              <ShoppingCart size={24} />
              <div>
                <h3>Active Posts</h3>
                <p>{sampleData.activePosts}</p>
              </div>
            </div>
            <div className="farmily-buyer-stat-card">
              <Clock size={24} />
              <div>
                <h3>Pending Deals</h3>
                <p>{sampleData.pendingDeals}</p>
              </div>
            </div>
            <div className="farmily-buyer-stat-card">
              <Heart size={24} />
              <div>
                <h3>Saved Farmers</h3>
                <p>{sampleData.savedFarmers}</p>
              </div>
            </div>
          </div>

          {/* Product Browse Section */}
          <section className="farmily-buyer-section">
            <div className="farmily-buyer-section-header">
              <h2>Available Products</h2>
              <div className="farmily-buyer-filters">
                <button className="farmily-buyer-filter-btn">
                  <Filter size={16} />
                  Filters
                </button>
                <button className="farmily-buyer-filter-btn">
                  <Map size={16} />
                  Location
                </button>
                <select className="farmily-buyer-sort">
                  <option>Sort by: Price</option>
                  <option>Sort by: Distance</option>
                  <option>Sort by: Rating</option>
                </select>
              </div>
            </div>

            <div className="farmily-buyer-products">
              {sampleData.availableProducts.map(product => (
                <div key={product.id} className="farmily-buyer-product-card">
                  <img src={product.image} alt={product.name} />
                  <div className="farmily-buyer-product-info">
                    <h3>{product.name}</h3>
                    <p className="farmily-buyer-farmer">{product.farmer}</p>
                    <p className="farmily-buyer-location">
                      <Map size={14} />
                      {product.location}
                    </p>
                    <div className="farmily-buyer-product-footer">
                      <span className="farmily-buyer-price">
                        ${product.price}/{product.unit}
                      </span><br />
                      <button className="farmily-buyer-contact-btn">
                        Contact Farmer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Active Orders Section */}
          <section className="farmily-buyer-section">
            <h2>Active Orders</h2>
            <div className="farmily-buyer-orders">
              {sampleData.activeOrders.map(order => (
                <div key={order.id} className="farmily-buyer-order-card">
                  <div className="farmily-buyer-order-header">
                    <span className={`farmily-buyer-order-status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                    <span className="farmily-buyer-order-date">{order.date}</span>
                  </div>
                  <div className="farmily-buyer-order-details">
                    <h3>{order.product}</h3>
                    <p>Farmer: {order.farmer}</p>
                    <p>Quantity: {order.quantity}</p>
                    <p className="farmily-buyer-order-total">
                      Total: ${order.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="farmily-buyer-order-actions">
                    <button className="farmily-buyer-contact-btn">
                      Track Order
                    </button>
                    <button className="farmily-buyer-contact-btn">
                      Contact Farmer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BuyerDashboard;