import React from 'react';
import './NearbyBuyers.css';

const NearbyBuyers = ({ buyers }) => {
  return (
    <div className="nearby-buyers">
      <h3>Nearby Buyers</h3>
      <div className="nearby-buyers-cards">
        {buyers.map((buyer) => (
          <div key={buyer.id} className="buyer-card">
            <p><strong>Name:</strong> {buyer.name}</p>
            <p><strong>Location:</strong> {buyer.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyBuyers;
