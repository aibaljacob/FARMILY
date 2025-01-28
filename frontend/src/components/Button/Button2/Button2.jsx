import React from 'react';
import './Button2.css';

const Button = ({ text, type, to }) => {
  return (
<button className="animated-button">
  <span>Hover me</span>
  <span></span>
</button>

  );
};

export default Button;
