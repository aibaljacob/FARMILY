import React from 'react';
import './Lander.css';
import Button from '../Button/Button1/Button';

const Header = () => {
  return (
    <div className="landing-header">
      <div className='blur'>
        <div className='landing-content'>
        <h1>Welcome to FARMILY</h1>
      <p>Connect farmers with buyers for a seamless and fair marketplace experience.</p>
      <div className="cta-buttons">
        <Button text="Login" type="primary" to="/login" />
        <Button text="Register" type="secondary" to="/register" />
        </div>
      </div>
      </div>
    </div>
  );
};

export default Header;
