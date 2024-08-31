import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ImpactProvider } from './contexts/ImpactContext';
import Layout from './components/Layout';
import ImpactSpace from './components/ImpactSpace'; // Updated from Dashboard
import Impact from './components/Impact';
import Profile from './components/Profile';
import Matching from './components/Matching';
import Login from './components/Login';
import YourAccount from './components/YourAccount'; // Import the component
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function App() {
  return (
    <ImpactProvider>
      <Router>
        <Routes>
          {/* Login route */}
          <Route path="/" element={<Login />} />
          
          {/* Routes that require authentication */}
          <Route
            path="/ImpactSpace"
            element={
              <Layout>
                <ImpactSpace />
              </Layout>
            }
          />
          <Route
            path="/impact"
            element={
              <Layout>
                <Impact />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
          <Route
            path="/matching"
            element={
              <Layout>
                <Matching />
              </Layout>
            }
          />
          <Route
            path="/YourAccount"
            element={
              <Layout>
                <YourAccount />
              </Layout>
            }
          />
          {/* Add other authenticated routes here */}
        </Routes>
      </Router>
    </ImpactProvider>
  );
}

export default App;











