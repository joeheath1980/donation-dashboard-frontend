import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ImpactProvider } from './contexts/ImpactContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext'; // Add this import
import Layout from './components/Layout';
import Profile from './components/Profile';
import Login from './components/Login';
import SignUp from './components/SignUp';
import YourAccount from './components/YourAccount';
import About from './components/About';
import YourPerks from './components/YourPerks';
import CharityPartner from './components/CharityPartner';
import Partners from './components/Partners';
import SearchCharities from './components/SearchCharities';
import Activity from './components/Activity';
import OrganizationSignup from './components/OrganizationSignup';
import BusinessSignup from './components/BusinessSignup';
import CharitySignup from './components/CharitySignup';
import BusinessDashboard from './components/BusinessDashboard';
import BusinessCreateCampaign from './components/BusinessCreateCampaign';
import WelcomePage from './components/WelcomePage';
import AdminDashboard from './components/AdminDashboard';
import GoogleAuthCallback from './components/GoogleAuthCallback';
import MicrosoftAuthCallback from './components/MicrosoftAuthCallback';
import AuthCallback from './components/AuthCallback';
import ManagePaymentsComponent from './components/ManagePaymentsComponent';
import CharityDashboard from './components/CharityDashboard';
import YourImpact from './components/YourImpact';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './components/SharedStyles.css';

const ProtectedRoute = ({ children, allowedUserTypes }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
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
      <UserProvider> {/* Add UserProvider here */}
        <ImpactProvider>
          <Router>
            <div className={styles.app}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/organization-signup" element={<OrganizationSignup />} />
                <Route path="/business-signup" element={<BusinessSignup />} />
                <Route path="/charity-signup" element={<CharitySignup />} />
                
                {/* Auth Callback routes */}
                <Route path="/auth-callback" element={<AuthCallback />} />
                <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                <Route path="/microsoft-callback" element={<MicrosoftAuthCallback />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
                <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
                <Route path="/YourAccount" element={<ProtectedRoute><Layout><YourAccount /></Layout></ProtectedRoute>} />
                <Route path="/about" element={<ProtectedRoute><Layout><About /></Layout></ProtectedRoute>} />
                <Route path="/your-perks" element={<ProtectedRoute><Layout><YourPerks /></Layout></ProtectedRoute>} />
                <Route path="/partners" element={<ProtectedRoute><Layout><Partners /></Layout></ProtectedRoute>} />
                <Route path="/charity/:id" element={<ProtectedRoute><Layout><CharityPartner /></Layout></ProtectedRoute>} />
                <Route path="/activity" element={<ProtectedRoute><Layout><Activity /></Layout></ProtectedRoute>} />
                <Route path="/search-charities" element={<ProtectedRoute><Layout><SearchCharities /></Layout></ProtectedRoute>} />
                <Route path="/manage-payments" element={<ProtectedRoute><Layout><ManagePaymentsComponent /></Layout></ProtectedRoute>} />
                <Route path="/your-impact" element={<ProtectedRoute><Layout><YourImpact /></Layout></ProtectedRoute>} />
                
                {/* Business routes */}
                <Route path="/business-dashboard" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><BusinessDashboard /></Layout></ProtectedRoute>} />
                <Route path="/create-business-campaign" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><BusinessCreateCampaign /></Layout></ProtectedRoute>} />

                {/* Charity routes */}
                <Route path="/charity-dashboard" element={<ProtectedRoute allowedUserTypes={['charity']}><CharityDashboard /></ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              </Routes>
            </div>
          </Router>
        </ImpactProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;