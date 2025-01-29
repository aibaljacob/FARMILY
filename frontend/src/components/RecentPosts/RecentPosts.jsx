import React from 'react';
import { Card, List, Typography } from 'antd';
import './RecentPosts.css';

const { Text } = Typography;

const RecentPosts = ({ posts }) => {
  return (
    <div className="recent-posts">
      <h3>Recent Posts</h3>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={posts}
        renderItem={(post) => (
          <List.Item>
            <Card hoverable bordered className="post-card">
              <Text strong>Produce:</Text> <Text>{post.produce}</Text>
              <br />
              <Text strong>Quantity:</Text> <Text>{post.quantity}</Text>
              <br />
              <Text strong>Price:</Text> <Text>${post.price}</Text>
              <br />
              <Text strong>Date:</Text> <Text>{post.date}</Text>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default RecentPosts;
