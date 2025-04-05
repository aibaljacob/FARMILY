import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './assets/styles/global.css';
import { UserProvider } from './pages/Dashboard/UserContext';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="34872999039-80tl2fv16pckcobiibco3n7tjjhgnp8p.apps.googleusercontent.com">
      <BrowserRouter>
        <UserProvider>
          <App />
        </UserProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
