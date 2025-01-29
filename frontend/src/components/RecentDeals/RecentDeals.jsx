import React from 'react';
import { Card, List, Tag, Typography } from 'antd';
import './RecentDeals.css';

const { Text } = Typography;

const RecentDeals = ({ deals }) => {
  const getStatusTag = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Tag color="green">Completed</Tag>;
      case 'pending':
        return <Tag color="orange">Pending</Tag>;
      case 'cancelled':
        return <Tag color="red">Cancelled</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  return (
    <div className="recent-deals">
      <h3>Recent Deals</h3>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={deals}
        renderItem={(deal) => (
          <List.Item>
            <Card hoverable bordered className="deal-card">
              <Text strong>Buyer:</Text> <Text>{deal.buyer}</Text>
              <br />
              <Text strong>Produce:</Text> <Text>{deal.produce}</Text>
              <br />
              <Text strong>Quantity:</Text> <Text>{deal.quantity}</Text>
              <br />
              <Text strong>Price:</Text> <Text>${deal.price}</Text>
              <br />
              <Text strong>Status:</Text> {getStatusTag(deal.status)}
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default RecentDeals;
