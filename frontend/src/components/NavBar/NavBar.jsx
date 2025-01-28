import React from 'react';
import './NavBar.css';
import Button from '../Button/Button2/Button2';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">FARMILY</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Button><Link to="/">Home</Link></Button>
        </li>
        <li>
          <Button><Link to="/features">Features</Link></Button>
        </li>
        <li>
          <Button><Link to="/about">About</Link></Button>
        </li>
        <li>
          <Button><Link to="/contact">Contact</Link></Button>
        </li>
        <li>
          <Button><Link to="/login" className="login-btn">Login</Link></Button>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
