import React from 'react';
import './RecentPosts.css';

const RecentPosts = ({ posts }) => {
  return (
    <div className="recent-posts">
      <h3>Recent Posts</h3>
      <div className="recent-posts-cards">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <p><strong>Produce:</strong> {post.produce}</p>
            <p><strong>Quantity:</strong> {post.quantity}</p>
            <p><strong>Price:</strong> {post.price}</p>
            <p><strong>Date:</strong> {post.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentPosts;
