import React from 'react';
import { Card, Avatar, List, Typography } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import './NearbyBuyers.css';

const { Text } = Typography;

const NearbyBuyers = ({ buyers }) => {
  return (
    <div className="nearby-buyers">
      <h3>Nearby Buyers</h3>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={buyers}
        renderItem={(buyer) => (
          <List.Item>
            <Card hoverable bordered className="buyer-card">
              <Card.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={<Text strong>{buyer.name}</Text>}
                description={
                  <div>
                    <Text type="secondary">
                      <EnvironmentOutlined /> {buyer.location}
                    </Text>
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default NearbyBuyers;
