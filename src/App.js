import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ImpactProvider } from './contexts/ImpactContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import BusinessLayout from './components/BusinessLayout';
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
import SearchCharities from './components/SearchCharities';
import Activity from './components/Activity';
import OrganizationSignup from './components/OrganizationSignup';
import BusinessSignup from './components/BusinessSignup';
import CharitySignup from './components/CharitySignup';
import BusinessDashboard from './components/BusinessDashboard';
import BusinessDonations from './components/BusinessDonations';
import BusinessReports from './components/BusinessReports';
import BusinessSettings from './components/BusinessSettings';
import CreateBusinessCampaign from './components/CreateBusinessCampaign';
import WelcomePage from './components/WelcomePage';
import AdminDashboard from './components/AdminDashboard';
import GoogleAuthCallback from './components/GoogleAuthCallback';
import MicrosoftAuthCallback from './components/MicrosoftAuthCallback';
import ManagePaymentsComponent from './components/ManagePaymentsComponent';
import CharityDashboard from './components/CharityDashboard';
import { starbucks } from './data/partnerData';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const justRegistered = localStorage.getItem('justRegistered');
  
  if (window.location.pathname === '/onboarding/mail-scraper' && (token || justRegistered === 'true')) {
    if (justRegistered) {
      localStorage.removeItem('justRegistered');
    }
    return children;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  console.log('AdminRoute - Current user:', user);
  const isAdmin = user && user.email === 'admin@example.com';
  console.log('AdminRoute - Is admin:', isAdmin);
  return isAdmin ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ImpactProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<WelcomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/organization-signup" element={<OrganizationSignup />} />
              <Route path="/business-signup" element={<BusinessSignup />} />
              <Route path="/charity-signup" element={<CharitySignup />} />
              
              {/* Google Auth Callback route */}
              <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
              
              {/* Microsoft Auth Callback route */}
              <Route path="/microsoft-callback" element={<MicrosoftAuthCallback />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
              <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
              <Route path="/matching" element={<ProtectedRoute><Layout><Matching /></Layout></ProtectedRoute>} />
              <Route path="/YourAccount" element={<ProtectedRoute><Layout><YourAccount /></Layout></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute><Layout><About /></Layout></ProtectedRoute>} />
              <Route path="/your-perks" element={<ProtectedRoute><Layout><YourPerks /></Layout></ProtectedRoute>} />
              <Route path="/partners" element={<ProtectedRoute><Layout><Partners /></Layout></ProtectedRoute>} />
              <Route path="/charity/:id" element={<ProtectedRoute><Layout><CharityPartner /></Layout></ProtectedRoute>} />
              <Route path="/brand/starbucks" element={<ProtectedRoute><Layout><BrandPartner brand={starbucks} /></Layout></ProtectedRoute>} />
              <Route path="/activity" element={<ProtectedRoute><Layout><Activity /></Layout></ProtectedRoute>} />
              <Route path="/search-charities" element={<ProtectedRoute><Layout><SearchCharities /></Layout></ProtectedRoute>} />
              <Route path="/manage-payments" element={<ProtectedRoute><Layout><ManagePaymentsComponent /></Layout></ProtectedRoute>} />
              
              {/* Business routes */}
              <Route path="/business-dashboard" element={<ProtectedRoute><BusinessLayout><BusinessDashboard /></BusinessLayout></ProtectedRoute>} />
              <Route path="/business-donations" element={<ProtectedRoute><BusinessLayout><BusinessDonations /></BusinessLayout></ProtectedRoute>} />
              <Route path="/business-reports" element={<ProtectedRoute><BusinessLayout><BusinessReports /></BusinessLayout></ProtectedRoute>} />
              <Route path="/business-settings" element={<ProtectedRoute><BusinessLayout><BusinessSettings /></BusinessLayout></ProtectedRoute>} />
              <Route path="/create-business-campaign" element={<ProtectedRoute><BusinessLayout><CreateBusinessCampaign /></BusinessLayout></ProtectedRoute>} />

              {/* Charity routes */}
              <Route path="/charity-dashboard" element={<ProtectedRoute><CharityDashboard /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            </Routes>
          </div>
        </Router>
      </ImpactProvider>
    </AuthProvider>
  );
}

export default App;
