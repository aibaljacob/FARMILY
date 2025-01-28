import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import Notifications from '../Notification/Notifications';

const Header = ({ userName }) => {
  return (
    <header className="dashboard-header">
      <Link to='/farmer'><div className="farmily-logo"></div></Link>
      <div className="header-actions">
      <div className="user-info">
          <img
            src="https://via.placeholder.com/40" // Replace with actual profile picture URL
            alt="Profile"
            className="profile-pic"
          />
          <span className="user-name">{userName || 'User'}</span>
        </div>
        <Notifications></Notifications>
      </div>
    </header>
  );
};

export default Header;
