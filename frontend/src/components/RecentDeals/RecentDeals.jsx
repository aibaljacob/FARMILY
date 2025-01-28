import React from 'react';
import './RecentDeals.css';

const RecentDeals = ({ deals }) => {
  return (
    <div className="recent-deals">
      <h3>Recent Deals</h3>
      <div className="recent-deals-cards">
        {deals.map((deal) => (
          <div key={deal.id} className="deal-card">
            <p><strong>Buyer:</strong> {deal.buyer}</p>
            <p><strong>Produce:</strong> {deal.produce}</p>
            <p><strong>Quantity:</strong> {deal.quantity}</p>
            <p><strong>Price:</strong> {deal.price}</p>
            <p><strong>Status:</strong> {deal.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentDeals;
