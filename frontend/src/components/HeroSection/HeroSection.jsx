import React from 'react';
import './HeroSection.css';
import Button from '../Button/Button'; // Reusing the Button component

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>Welcome to FARMILY</h1>
        <p>Your one-stop solution to buy and sell fresh, local products directly from farmers.</p>
        <div className="hero-buttons">
          <Button text="Get Started" type="primary" to="/register" />
          <Button text="Learn More" type="secondary" to="#features" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
