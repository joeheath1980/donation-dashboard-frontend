import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ImpactProvider } from './contexts/ImpactContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { MatchSelectionProvider } from './contexts/MatchSelectionContext';
import { USER_TYPES, STORAGE_KEYS } from './config/api.config';
import { createLogger } from './utils/logger';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { csrfServiceAPI } from './services/api.service';

// Eagerly loaded components (used frequently)
import Layout from './components/Layout';
import Login from './components/Login';
import WelcomePage from './components/WelcomePage';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ChunkErrorBoundary from './components/ChunkErrorBoundary';
import DemoBanner from './components/DemoBanner';
import DemoBadge from './components/DemoBadge';

// Components that use Chart.js or Swiper - loaded eagerly to avoid chunk loading issues
import BusinessCampaignAnalytics from './components/BusinessCampaignAnalytics';
import AdminDashboard from './components/AdminDashboard';
import YourImpact from './components/YourImpact';
import Profile from './components/Profile';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './components/SharedStyles.css';

// Register Chart.js components globally BEFORE any components use them
try {
  if (!Chart.defaults) {
    Chart.register(...registerables);
    console.log('Chart.js components registered successfully in App.js, version:', Chart.version);
  } else {
    console.log('Chart.js components already registered, version:', Chart.version);
  }
} catch (error) {
  console.error('Failed to register Chart.js components in App.js:', error);
}

// Lazy loaded components for code splitting
// Profile is loaded eagerly above due to Swiper usage
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
const CharitySignupFlow = lazy(() => import('./components/CharitySignupFlow'));
const CharityProfileEditor = lazy(() => import('./components/CharityProfileEditor/CharityProfileEditor'));
const BusinessDashboard = lazy(() => import('./components/BusinessDashboard'));
const BusinessCreateCampaign = lazy(() => import('./components/BusinessCreateCampaign'));
const BusinessOnboarding = lazy(() => import('./components/BusinessOnboarding'));
const BusinessCampaignList = lazy(() => import('./components/BusinessCampaignList'));
const BusinessAccountSettings = lazy(() => import('./components/BusinessAccountSettings/BusinessAccountSettings'));
const BusinessTaxCenter = lazy(() => import('./components/BusinessTaxCenter/BusinessTaxCenter'));
const TaxSummary = lazy(() => import('./components/BusinessTaxCenter/TaxSummary'));
const TaxReceipts = lazy(() => import('./components/BusinessTaxCenter/TaxReceipts'));
const TaxExport = lazy(() => import('./components/BusinessTaxCenter/TaxExport'));
const TaxPlanning = lazy(() => import('./components/BusinessTaxCenter/TaxPlanning'));
const GoogleAuthCallback = lazy(() => import('./components/GoogleAuthCallback'));
const MicrosoftAuthCallback = lazy(() => import('./components/MicrosoftAuthCallback'));
const AuthCallback = lazy(() => import('./components/AuthCallback'));
const ManagePaymentsComponent = lazy(() => import('./components/ManagePaymentsComponent'));
const CharityDashboard = lazy(() => import('./components/CharityDashboard'));
const CharityAnalytics = lazy(() => import('./components/CharityAnalytics/CharityAnalytics'));
const DonorManagement = lazy(() => import('./components/DonorManagement/DonorManagement'));
const DonationForm = lazy(() => import('./components/DonationForm'));
const CharityOnboarding = lazy(() => import('./components/CharityOnboarding'));
const DonationSuccess = lazy(() => import('./components/DonationSuccess'));

// Public profile components
const PublicUserProfile = lazy(() => import('./components/Profile/PublicUserProfile'));
const PublicBusinessProfile = lazy(() => import('./components/Profile/PublicBusinessProfile'));
const PublicCharityProfile = lazy(() => import('./components/Profile/PublicCharityProfile'));
const ProfileEditor = lazy(() => import('./components/Profile/ProfileEditor'));
const ProfileSearch = lazy(() => import('./components/Search/ProfileSearch'));
const PrivacySettings = lazy(() => import('./components/Settings/PrivacySettings'));
const AccountSettings = lazy(() => import('./components/Settings/AccountSettings'));
const PaymentMethods = lazy(() => import('./components/PaymentMethods/PaymentMethods'));
const EmailForwardingSetup = lazy(() => import('./components/EmailForwarding/EmailForwardingSetup'));

const logger = createLogger('App');

// Suspense wrapper component
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

// CSRF Token Initializer
const CSRFInitializer = () => {
  useEffect(() => {
    // Initialize CSRF token on app load
    csrfServiceAPI.initializeToken()
      .then(token => {
        if (token) {
          logger.info('CSRF token initialized successfully');
        } else {
          logger.warn('CSRF token initialization returned null - backend may not require CSRF');
        }
      })
      .catch(error => {
        logger.error('Failed to initialize CSRF token', { error: error.message });
        // Don't block app initialization on CSRF failure
      });
  }, []);

  return null; // This component doesn't render anything
};

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
  // Check both role and isAdmin for compatibility
  const isAdmin = user && (user.role === USER_TYPES.ADMIN || user.isAdmin === true);
  logger.debug('AdminRoute - Admin access check', { hasAccess: isAdmin, user });
  return isAdmin ? children : <Navigate to="/login" />;
};

// Global chart registry
window.__chartInstances = window.__chartInstances || new Map();

// Route change handler component
const RouteChangeHandler = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Small delay to ensure we catch all charts
    const timeoutId = setTimeout(() => {
      console.log('Route changed to:', location.pathname);
      
      // Get all chart instances from our global registry
      const chartCount = window.__chartInstances.size;
      console.log(`Found ${chartCount} active Chart.js instances in registry`);
      
      // Destroy all charts
      window.__chartInstances.forEach((chart, id) => {
        try {
          console.log(`Destroying chart instance ${id}`);
          if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
          }
        } catch (error) {
          console.error(`Error destroying chart ${id}:`, error);
        }
      });
      
      // Clear the registry
      window.__chartInstances.clear();
      
      // Also destroy any Chart.js instances not in our registry
      if (Chart && Chart.instances) {
        const instances = Chart.instances;
        if (instances && typeof instances === 'object') {
          Object.values(instances).forEach((chart, index) => {
            try {
              if (chart && typeof chart.destroy === 'function') {
                console.log(`Destroying unregistered chart instance ${index + 1}`);
                chart.destroy();
              }
            } catch (error) {
              console.error(`Error destroying unregistered chart ${index + 1}:`, error);
            }
          });
          Chart.instances = {};
        }
      }
      
      // Clean up any lingering tooltips
      const tooltips = document.querySelectorAll('#chartjs-tooltip');
      tooltips.forEach(tooltip => {
        tooltip.remove();
      });
      
      // Force garbage collection hint
      if (window.gc) {
        window.gc();
      }
      
      console.log('Chart cleanup completed');
    }, 50); // 50ms delay to catch charts created during render
    
    return () => clearTimeout(timeoutId);
  }, [location]);
  
  return null;
};

function App() {
  return (
    <ErrorBoundary name="App">
      <AuthProvider>
        <UserProvider>
          <WebSocketProvider>
            <ImpactProvider>
              <MatchSelectionProvider>
                <Router>
                  <CSRFInitializer />
                  <RouteChangeHandler />
                  <ErrorBoundary name="Router">
                    <DemoBanner />
                    <DemoBadge />
                    <div className={styles.app}>
                      <Routes>
                {/* Public routes */}
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SuspenseWrapper><SignUp /></SuspenseWrapper>} />
                <Route path="/organization-signup" element={<SuspenseWrapper><OrganizationSignup /></SuspenseWrapper>} />
                <Route path="/business-signup" element={<SuspenseWrapper><BusinessSignup /></SuspenseWrapper>} />
                <Route path="/charity-signup" element={<SuspenseWrapper><CharitySignupFlow /></SuspenseWrapper>} />
                
                {/* Auth Callback routes */}
                <Route path="/auth-callback" element={<SuspenseWrapper><AuthCallback /></SuspenseWrapper>} />
                <Route path="/auth/google/callback" element={<SuspenseWrapper><GoogleAuthCallback /></SuspenseWrapper>} />
                <Route path="/microsoft-callback" element={<SuspenseWrapper><MicrosoftAuthCallback /></SuspenseWrapper>} />
                
                {/* Public profile routes (no auth required) */}
                <Route path="/profile/:username" element={<Layout><SuspenseWrapper><PublicUserProfile /></SuspenseWrapper></Layout>} />
                <Route path="/business/:slug" element={<Layout><SuspenseWrapper><PublicBusinessProfile /></SuspenseWrapper></Layout>} />
                <Route path="/charity/profile/:abn" element={<Layout><SuspenseWrapper><PublicCharityProfile /></SuspenseWrapper></Layout>} />
                <Route path="/search" element={<Layout><SuspenseWrapper><ProfileSearch /></SuspenseWrapper></Layout>} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Layout><SuspenseWrapper><Profile /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
                <Route path="/profile/edit" element={<ProtectedRoute><Layout><SuspenseWrapper><ProfileEditor /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/YourAccount" element={<ProtectedRoute><Layout><SuspenseWrapper><YourAccount /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/about" element={<ProtectedRoute><Layout><SuspenseWrapper><About /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/your-perks" element={<ProtectedRoute><Layout><SuspenseWrapper><YourPerks /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/partners" element={<ProtectedRoute><Layout><SuspenseWrapper><Partners /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/charity/:abn" element={<ProtectedRoute><Layout><SuspenseWrapper><CharityPartner /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/activity" element={<ProtectedRoute><Layout><SuspenseWrapper><Activity /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/search-charities" element={<ProtectedRoute><Layout><SuspenseWrapper><SearchCharities /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/manage-payments" element={<ProtectedRoute><Layout><ChunkErrorBoundary><SuspenseWrapper><PaymentMethods /></SuspenseWrapper></ChunkErrorBoundary></Layout></ProtectedRoute>} />
                <Route path="/privacy-settings" element={<ProtectedRoute><Layout><SuspenseWrapper><PrivacySettings /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/account-settings" element={<ProtectedRoute><Layout><SuspenseWrapper><AccountSettings /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/email-forwarding" element={<ProtectedRoute><Layout><SuspenseWrapper><EmailForwardingSetup /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/your-impact" element={<ProtectedRoute><Layout><SuspenseWrapper><YourImpact /></SuspenseWrapper></Layout></ProtectedRoute>} />
                
                {/* Business routes */}
                <Route path="/business-dashboard" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><BusinessDashboard /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/business-dashboard/account-settings" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><BusinessAccountSettings /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/business-onboarding" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><BusinessOnboarding /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/business/campaigns" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><BusinessCampaignList /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/business/campaigns/:campaignId/analytics" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><BusinessCampaignAnalytics /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/create-business-campaign" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><BusinessCreateCampaign /></SuspenseWrapper></Layout></ProtectedRoute>} />
                
                {/* Business Tax Center routes */}
                <Route path="/business/tax-center" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><BusinessTaxCenter /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/business/tax-center/summary" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><TaxSummary /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/business/tax-center/receipts" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><TaxReceipts /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/business/tax-center/export" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><TaxExport /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/business/tax-center/planning" element={<ProtectedRoute allowedUserTypes={['business']}><Layout><SuspenseWrapper><TaxPlanning /></SuspenseWrapper></Layout></ProtectedRoute>} />

                {/* Charity routes */}
                <Route path="/charity-dashboard" element={<ProtectedRoute allowedUserTypes={['charity']}><SuspenseWrapper><CharityDashboard /></SuspenseWrapper></ProtectedRoute>} />
                <Route path="/charity-analytics" element={<ProtectedRoute allowedUserTypes={['charity']}><SuspenseWrapper><CharityAnalytics /></SuspenseWrapper></ProtectedRoute>} />
                <Route path="/charity-donors" element={<ProtectedRoute allowedUserTypes={['charity']}><SuspenseWrapper><DonorManagement /></SuspenseWrapper></ProtectedRoute>} />
                <Route path="/charity-profile-editor" element={<ProtectedRoute allowedUserTypes={['charity']}><SuspenseWrapper><CharityProfileEditor /></SuspenseWrapper></ProtectedRoute>} />
                <Route path="/charity-onboarding" element={<ProtectedRoute allowedUserTypes={['charity']}><SuspenseWrapper><CharityOnboarding /></SuspenseWrapper></ProtectedRoute>} />
                <Route path="/charity/:charityId/edit" element={<ProtectedRoute allowedUserTypes={['charity']}><SuspenseWrapper><CharityProfileEditor /></SuspenseWrapper></ProtectedRoute>} />

                {/* Donation routes */}
                <Route path="/donate/:charityId" element={<ProtectedRoute><Layout><SuspenseWrapper><DonationForm /></SuspenseWrapper></Layout></ProtectedRoute>} />
                <Route path="/donation-success" element={<ProtectedRoute><Layout><SuspenseWrapper><DonationSuccess /></SuspenseWrapper></Layout></ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin/*" element={<AdminRoute><SuspenseWrapper><AdminDashboard /></SuspenseWrapper></AdminRoute>} />
              </Routes>
            </div>
          </ErrorBoundary>
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Router>
      </MatchSelectionProvider>
    </ImpactProvider>
  </WebSocketProvider>
</UserProvider>
</AuthProvider>
</ErrorBoundary>
);
}

export default App;