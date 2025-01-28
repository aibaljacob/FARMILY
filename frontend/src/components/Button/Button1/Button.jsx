import React from 'react';
import './Button.css';

const Button = ({ text, type, to }) => {
  return (
    <button className='Button1'><a href={to} className={`button ${type}`}>
    {text}
  </a></button>
    
  );
};

export default Button;
