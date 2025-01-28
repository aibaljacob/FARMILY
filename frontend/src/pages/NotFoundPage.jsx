import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../routes';

const NotFoundPage = () => {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to={routes.login} className="primary">
        Go to Login Page
      </Link>
    </div>
  );
};

export default NotFoundPage;
