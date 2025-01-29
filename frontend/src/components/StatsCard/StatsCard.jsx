import React from 'react';
import { Card, Typography } from 'antd';
import './StatsCard.css';

const { Title, Text } = Typography;

const StatsCard = ({ title, value, icon }) => {
  return (
    <Card hoverable className="stats-card" bordered={false}>
      <div className="stats-card-content">
        <div className="stats-icon">{icon}</div>
        <div className="stats-info">
          <Title level={3}>{value}</Title>
          <Text>{title}</Text>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
