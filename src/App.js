import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ImpactProvider } from './contexts/ImpactContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { USER_TYPES, STORAGE_KEYS } from './config/api.config';
import { createLogger } from './utils/logger';

// Eagerly loaded components (used frequently)
import Layout from './components/Layout';
import Login from './components/Login';
import WelcomePage from './components/WelcomePage';

// Lazy loaded components for code splitting
const Profile = lazy(() => import('./components/Profile'));
const SignUp = lazy(() => import('./components/SignUp'));
const YourAccount = lazy(() => import('./components/YourAccount'));
const About = lazy(() => import('./components/About'));
const YourPerks = lazy(() => import('./components/YourPerks'));
const CharityPartner = lazy(() => import('./components/CharityPartner'));
const Partners = lazy(() => import('./components/Partners'));
const SearchCharities = lazy(() => import('./components/SearchCharities'));
const Activity = lazy(() => import('./components/Activity'));
const OrganizationSignup = lazy(() => import('./components/OrganizationSignup'));
const BusinessSignup = lazy(() => import('./components/BusinessSignup'));
const CharitySignup = lazy(() => import('./components/CharitySignup'));
const BusinessDashboard = lazy(() => import('./components/BusinessDashboard'));
const BusinessCreateCampaign = lazy(() => import('./components/BusinessCreateCampaign'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const GoogleAuthCallback = lazy(() => import('./components/GoogleAuthCallback'));
const MicrosoftAuthCallback = lazy(() => import('./components/MicrosoftAuthCallback'));
const AuthCallback = lazy(() => import('./components/AuthCallback'));
const ManagePaymentsComponent = lazy(() => import('./components/ManagePaymentsComponent'));
const CharityDashboard = lazy(() => import('./components/CharityDashboard'));
const YourImpact = lazy(() => import('./components/YourImpact'));

// Loading and Error components
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './components/SharedStyles.css';

const logger = createLogger('App');

// Suspense wrapper component
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

const ProtectedRoute = ({ children, allowedUserTypes }) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const userType = localStorage.getItem(STORAGE_KEYS.USER_TYPE);
  
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
  logger.debug('AdminRoute - Checking admin access');
  // Check for admin role from backend, not email
  const isAdmin = user && user.role === USER_TYPES.ADMIN;
  logger.debug('AdminRoute - Admin access check', { hasAccess: isAdmin });
  return isAdmin ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary name="App">
      <AuthProvider>
        <UserProvider> {/* Add UserProvider here */}
          <ImpactProvider>
            <Router>
              <ErrorBoundary name="Router">
                <div className={styles.app}>
                  <Routes>
                {/* Public routes */}
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SuspenseWrapper><SignUp /></SuspenseWrapper>} />
                <Route path="/organization-signup" element={<SuspenseWrapper><OrganizationSignup /></SuspenseWrapper>} />
                <Route path="/business-signup" element={<SuspenseWrapper><BusinessSignup /></SuspenseWrapper>} />
                <Route path="/charity-signup" element={<SuspenseWrapper><CharitySignup /></SuspenseWrapper>} />
                
                {/* Auth Callback routes */}
                <Route path="/auth-callback" element={<SuspenseWrapper><AuthCallback /></SuspenseWrapper>} />
                <Route path="/auth/google/callback" element={<SuspenseWrapper><GoogleAuthCallback /></SuspenseWrapper>} />
                <Route path="/microsoft-callback" element={<SuspenseWrapper><MicrosoftAuthCallback /></SuspenseWrapper>} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Layout><SuspenseWrapper><Profile /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
                <Route path="/YourAccount" element={<ProtectedRoute><Layout><SuspenseWrapper><YourAccount /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/about" element={<ProtectedRoute><Layout><SuspenseWrapper><About /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/your-perks" element={<ProtectedRoute><Layout><SuspenseWrapper><YourPerks /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/partners" element={<ProtectedRoute><Layout><SuspenseWrapper><Partners /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/charity/:id" element={<ProtectedRoute><Layout><SuspenseWrapper><CharityPartner /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/activity" element={<ProtectedRoute><Layout><SuspenseWrapper><Activity /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/search-charities" element={<ProtectedRoute><Layout><SuspenseWrapper><SearchCharities /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/manage-payments" element={<ProtectedRoute><Layout><SuspenseWrapper><ManagePaymentsComponent /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/your-impact" element={<ProtectedRoute><Layout><SuspenseWrapper><YourImpact /></SuspenseWrapper></Layout></ProtectedRoute>} />
                
                {/* Business routes */}
                <Route path="/business-dashboard" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><BusinessDashboard /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/create-business-campaign" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><BusinessCreateCampaign /></SuspenseWrapper></Layout></ProtectedRoute>} />

                {/* Charity routes */}
                <Route path="/charity-dashboard" element={<ProtectedRoute allowedUserTypes={['charity']}><SuspenseWrapper><CharityDashboard /></SuspenseWrapper></ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin/*" element={<AdminRoute><SuspenseWrapper><AdminDashboard /></SuspenseWrapper></AdminRoute>} />
              </Routes>
            </div>
          </ErrorBoundary>
        </Router>
      </ImpactProvider>
    </UserProvider>
  </AuthProvider>
</ErrorBoundary>
);
}

export default App;