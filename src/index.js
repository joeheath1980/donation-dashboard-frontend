import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import './styles/csp-utilities.css';
import './styles/dynamic-colors.css';
import './styles/dynamic-css-variables.css';
import './styles/final-cleanup.css';
import './styles/dynamic-styles.css';
import App from './App';
// Import the global theme LAST so it can gently override base/module styles
import './styles/do-nation-theme.css';

// Keep StrictMode enabled for better development experience
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
