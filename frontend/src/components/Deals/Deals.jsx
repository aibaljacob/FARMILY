import React, { useState, useEffect } from 'react';
import { BuyerDeals, FarmerDeals } from './index';

const DealsHistoryPage = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) {
      setUserRole(user.role);
    }
  }, []);

  // Role 1 is Farmer, Role 2 is Buyer
  return userRole === 1 ? <FarmerDeals /> : <BuyerDeals />;
};

export default DealsHistoryPage;