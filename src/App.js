import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ImpactProvider } from './contexts/ImpactContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Impact from './components/Impact';
import Profile from './components/Profile';
import Matching from './components/Matching';
import Login from './components/Login';
import SignUp from './components/SignUp';
import YourAccount from './components/YourAccount';
import About from './components/About';
import YourPerks from './components/YourPerks';
import CharityPartner from './components/CharityPartner';
import BrandPartner from './components/BrandPartner';
import Partners from './components/Partners';
import Activity from './components/Activity'; // Import the new Activity component
import { nbcf, starbucks } from './data/partnerData';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ImpactProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
              <Route path="/impact" element={<ProtectedRoute><Layout><Impact /></Layout></ProtectedRoute>} />
              <Route path="/matching" element={<ProtectedRoute><Layout><Matching /></Layout></ProtectedRoute>} />
              <Route path="/YourAccount" element={<ProtectedRoute><Layout><YourAccount /></Layout></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute><Layout><About /></Layout></ProtectedRoute>} />
              <Route path="/your-perks" element={<ProtectedRoute><Layout><YourPerks /></Layout></ProtectedRoute>} />
              <Route path="/partners" element={<ProtectedRoute><Layout><Partners /></Layout></ProtectedRoute>} />
              <Route path="/charity/nbcf" element={<ProtectedRoute><Layout><CharityPartner charity={nbcf} /></Layout></ProtectedRoute>} />
              <Route path="/brand/starbucks" element={<ProtectedRoute><Layout><BrandPartner brand={starbucks} /></Layout></ProtectedRoute>} />
              <Route path="/activity" element={<ProtectedRoute><Layout><Activity /></Layout></ProtectedRoute>} /> {/* New route for Activity */}
            </Routes>
          </div>
        </Router>
      </ImpactProvider>
    </AuthProvider>
  );
}

export default App;
