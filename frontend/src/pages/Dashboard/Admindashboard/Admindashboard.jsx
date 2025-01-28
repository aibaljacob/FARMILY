import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

// Import icons from lucide-react
import { 
  Users, Sprout, ShoppingCart, 
  MessageSquare, Settings, LogOut, 
  Menu, BarChart2, Search
} from 'lucide-react';

const AdminDashboard = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Sample data - replace with actual data from your backend
  const dashboardData = {
    totalUsers: 1524,
    activeFarmers: 856,
    activeBuyers: 668,
    pendingApprovals: 23,
    recentTransactions: [
      { id: 1, farmer: 'John Smith', buyer: 'Green Grocers', product: 'Organic Tomatoes', amount: 1250, status: 'completed' },
      { id: 2, farmer: 'Maria Garcia', buyer: 'Fresh Markets', product: 'Sweet Corn', amount: 880, status: 'pending' },
      // Add more transactions
    ],
    recentUsers: [
      { id: 1, name: 'Alice Johnson', type: 'Farmer', status: 'active', joinDate: '2025-01-10' },
      { id: 2, name: 'Bob Wilson', type: 'Buyer', status: 'pending', joinDate: '2025-01-12' },
      // Add more users
    ]
  };

  return (
    <div className="farmily-admin-container">
      {/* Sidebar */}
      <aside className={`farmily-admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="farmily-admin-sidebar-header">
          <Link to="/" className="farmily-admin-logo">
            {isSidebarCollapsed ? 'F' : 'Farmily'}
          </Link>
          <button 
            className="farmily-admin-sidebar-toggle"
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="farmily-admin-nav">
          <button 
            className={`farmily-admin-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <BarChart2 size={20} />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>
          <button 
            className={`farmily-admin-nav-item ${activeSection === 'farmers' ? 'active' : ''}`}
            onClick={() => setActiveSection('farmers')}
          >
            <Sprout size={20} />
            {!isSidebarCollapsed && <span>Farmers</span>}
          </button>
          <button 
            className={`farmily-admin-nav-item ${activeSection === 'buyers' ? 'active' : ''}`}
            onClick={() => setActiveSection('buyers')}
          >
            <ShoppingCart size={20} />
            {!isSidebarCollapsed && <span>Buyers</span>}
          </button>
          <button 
            className={`farmily-admin-nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <Users size={20} />
            {!isSidebarCollapsed && <span>Users</span>}
          </button>
          <button 
            className={`farmily-admin-nav-item ${activeSection === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveSection('messages')}
          >
            <MessageSquare size={20} />
            {!isSidebarCollapsed && <span>Messages</span>}
          </button>
          <button 
            className={`farmily-admin-nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            <Settings size={20} />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
        </nav>

        <button className="farmily-admin-logout">
          <LogOut size={20} />
          {!isSidebarCollapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main className="farmily-admin-main">
        {/* Header */}
        <header className="farmily-admin-header">
          <div className="farmily-admin-search">
            <Search size={20} />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="farmily-admin-profile">
            <img 
              src="/api/placeholder/32/32" 
              alt="Admin" 
              className="farmily-admin-avatar" 
            />
            <span className="farmily-admin-name">Admin Name</span>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="farmily-admin-content">
          {/* Stats Cards */}
          <div className="farmily-admin-stats">
            <div className="farmily-admin-stat-card">
              <div className="farmily-admin-stat-icon users">
                <Users size={24} />
              </div>
              <div className="farmily-admin-stat-info">
                <h3>Total Users</h3>
                <p>{dashboardData.totalUsers}</p>
              </div>
            </div>
            <div className="farmily-admin-stat-card">
              <div className="farmily-admin-stat-icon farmers">
                <Sprout size={24} />
              </div>
              <div className="farmily-admin-stat-info">
                <h3>Active Farmers</h3>
                <p>{dashboardData.activeFarmers}</p>
              </div>
            </div>
            <div className="farmily-admin-stat-card">
              <div className="farmily-admin-stat-icon buyers">
                <ShoppingCart size={24} />
              </div>
              <div className="farmily-admin-stat-info">
                <h3>Active Buyers</h3>
                <p>{dashboardData.activeBuyers}</p>
              </div>
            </div>
            <div className="farmily-admin-stat-card">
              <div className="farmily-admin-stat-icon pending">
                <MessageSquare size={24} />
              </div>
              <div className="farmily-admin-stat-info">
                <h3>Pending Approvals</h3>
                <p>{dashboardData.pendingApprovals}</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="farmily-admin-card">
            <h2>Recent Transactions</h2>
            <div className="farmily-admin-table-container">
              <table className="farmily-admin-table">
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Buyer</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.farmer}</td>
                      <td>{transaction.buyer}</td>
                      <td>{transaction.product}</td>
                      <td>${transaction.amount}</td>
                      <td>
                        <span className={`farmily-admin-status ${transaction.status}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users */}
          <div className="farmily-admin-card">
            <h2>Recent Users</h2>
            <div className="farmily-admin-table-container">
              <table className="farmily-admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.type}</td>
                      <td>
                        <span className={`farmily-admin-status ${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{user.joinDate}</td>
                      <td>
                        <div className="farmily-admin-actions">
                          <button className="farmily-admin-action-btn edit">Edit</button>
                          <button className="farmily-admin-action-btn delete">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;