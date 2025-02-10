import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Keep StrictMode enabled for better development experience
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);