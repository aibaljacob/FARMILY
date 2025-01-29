import React from 'react';
import './LandingPage.css';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="farmily-landing">
      {/* Hero Section */}
      <header className="farmily-hero">
        <nav className="farmily-nav">
          <Link to='/'><div className="farmily-logo"></div></Link>
          <div className="farmily-nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <Link to="/login"><button className="farmily-btn-secondary">Sign In</button></Link>
            <Link to="/register"><button className="farmily-btn-primary">Get Started</button></Link>
          </div>
        </nav>
        
        <div className="farmily-hero-content">
          <h1>Connect Directly with Local Farmers</h1>
          <p>A transparent marketplace bringing farmers and buyers together, eliminating intermediaries and ensuring fair prices for all.</p>
          <div className="farmily-hero-buttons">
            <Link to={"/register?userType=farmer"}><button className="farmily-btn-primary">Join as Farmer</button></Link>
            <Link to="/register?userType=buyer"><button className="farmily-btn-secondary">Join as Buyer</button></Link>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section id="how-it-works" className="farmily-section">
        <h2>How Farmily Works</h2>
        <div className="farmily-steps">
          <div className="farmily-step">
            <div className="farmily-step-number">1</div>
            <h3>List or Browse</h3>
            <p>Farmers list their produce or buyers post their demands with suggested prices</p>
          </div>
          <div className="farmily-step">
            <div className="farmily-step-number">2</div>
            <h3>Connect</h3>
            <p>Interested parties respond to listings and negotiate terms directly</p>
          </div>
          <div className="farmily-step">
            <div className="farmily-step-number">3</div>
            <h3>Deal</h3>
            <p>Finalize deals after mutual agreement and enjoy transparent trading</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="farmily-section farmily-features">
        <h2>Key Features</h2>
        <div className="farmily-features-grid">
          <div className="farmily-feature-card">
            <h3>Direct Communication</h3>
            <p>Built-in chat feature for seamless negotiations and clarity</p>
          </div>
          <div className="farmily-feature-card">
            <h3>Real-time Notifications</h3>
            <p>Stay updated with instant alerts about new responses and deals</p>
          </div>
          <div className="farmily-feature-card">
            <h3>Focused Dealing</h3>
            <p>One active deal at a time ensures clear and efficient transactions</p>
          </div>
          <div className="farmily-feature-card">
            <h3>Fair Pricing</h3>
            <p>Transparent marketplace supporting fair prices for all parties</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="farmily-cta">
        <h2>Join the Agricultural Revolution</h2>
        <p>Start trading directly with farmers and buyers today</p>
        <Link to="/register"><button className="farmily-btn-primary">Get Started Now</button></Link>
      </section>

      {/* Footer */}
      <footer className="farmily-footer">
        <div className="farmily-footer-content">
          <div className="farmily-footer-section">
            <h4>Farmily</h4>
            <p>Creating a sustainable future for agriculture</p>
          </div>
          <div className="farmily-footer-section">
            <h4>Quick Links</h4>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#terms">Terms of Service</a>
          </div>
          <div className="farmily-footer-section">
            <h4>Contact</h4>
            <p>support@farmily.com</p>
          </div>
        </div>
        <div className="farmily-footer-bottom">
          <p>&copy; 2025 Farmily. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;