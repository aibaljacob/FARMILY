import React, { useState } from 'react';
import './Notifications.css';

const Notifications = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const notifications = [
    "You have a new message!",
    "Order #123 confirmed!",
    "Price update alert 🚜",
  ];

  return (
    <div className="notifications-container">
      {/* Notification Icon */}
      <button
        className="notifications-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        onBlur={() => setShowDropdown(!showDropdown)}
      >
        🔔
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="notifications-dropdown">
          <ul>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <li key={index}>{notification}</li>
              ))
            ) : (
              <li>No new notifications</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notifications;
