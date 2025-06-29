# Authentication System Documentation

## Overview
The Donation Dashboard implements a comprehensive JWT-based authentication system with support for multiple user types and social login integration. This guide covers the complete authentication flow, implementation details, and security considerations.

## Table of Contents
1. [Authentication Architecture](#authentication-architecture)
2. [User Types](#user-types)
3. [Login Methods](#login-methods)
4. [JWT Token Management](#jwt-token-management)
5. [Social Authentication](#social-authentication)
6. [Protected Routes](#protected-routes)
7. [API Integration](#api-integration)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)

## Authentication Architecture

### Core Components

1. **AuthContext.js** - Global authentication state management
   - Location: `/src/contexts/AuthContext.js`
   - Manages login/logout operations
   - Handles token storage and validation
   - Configures axios defaults for authenticated requests

2. **Login.js** - Multi-role login interface
   - Location: `/src/components/Auth/Login.js`
   - Supports user, business, and charity logins
   - Integrates social login options

3. **SignUp.js** - User registration
   - Location: `/src/components/Auth/SignUp.js`
   - New user account creation
   - Social signup integration

4. **OAuth Callbacks** - Social login handlers
   - GoogleAuthCallback.js
   - MicrosoftAuthCallback.js
   - AuthCallback.js (generic handler)

## User Types

The system supports four distinct user types:

### 1. Regular Users
- **Login Endpoint**: `/api/auth/login`
- **Profile Endpoint**: `/api/users/me`
- **Storage Key**: `userType: 'user'`
- **Features**: Personal donations, impact tracking, perks

### 2. Business Users
- **Login Endpoint**: `/api/business/auth/login`
- **Profile Endpoint**: `/api/business/me`
- **Storage Key**: `userType: 'business'`
- **Additional Storage**: `businessId`
- **Features**: Campaign creation, employee engagement, matching donations

### 3. Charity Users
- **Login Endpoint**: `/api/charities/login`
- **Profile Endpoint**: `/api/charities/me`
- **Storage Key**: `userType: 'charity'`
- **Additional Storage**: `charityId`
- **Features**: Donation receipt, impact reporting, verification

### 4. Admin Users
- **Inherits**: Regular user login
- **Identification**: `role: 'admin'` in user object
- **Features**: Full system access, user management, content moderation

## Login Methods

### Standard Login Flow

```javascript
// Login request structure
{
  email: "user@example.com",    // For regular users
  password: "password123",
  // OR for business/charity
  contactEmail: "contact@business.com",
  password: "password123"
}

// Login response
{
  token: "eyJhbGciOiJIUzI1NiIs...",
  businessId: "12345" // Only for business accounts
  // OR
  charity: { ... } // Only for charity accounts
}
```

### Implementation Example

```javascript
const handleLogin = async (credentials, userType) => {
  try {
    let endpoint, data;
    
    switch(userType) {
      case 'user':
        endpoint = '/api/auth/login';
        data = { email: credentials.email, password: credentials.password };
        break;
      case 'business':
        endpoint = '/api/business/auth/login';
        data = { contactEmail: credentials.email, password: credentials.password };
        break;
      case 'charity':
        endpoint = '/api/charities/login';
        data = { contactEmail: credentials.email, password: credentials.password };
        break;
    }
    
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, data);
    
    // Store authentication data
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('userType', userType);
    
    // Configure axios defaults
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    
    // Fetch user profile
    await checkAuth();
    
    // Redirect to appropriate dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

## JWT Token Management

### Token Storage
Tokens are stored in localStorage with the following keys:
- `token` - JWT authentication token
- `userType` - Type of authenticated user
- `currentUserId` - User's unique identifier
- `businessId` - Business ID (business accounts only)
- `charityId` - Charity ID (charity accounts only)

### Token Structure
```javascript
// Decoded JWT payload example
{
  userId: "507f1f77bcf86cd799439011",
  email: "user@example.com",
  userType: "user",
  iat: 1618437961,  // Issued at
  exp: 1618524361   // Expiration time
}
```

### Token Lifecycle

1. **Generation**: Backend generates JWT on successful authentication
2. **Storage**: Frontend stores token in localStorage
3. **Usage**: Token included in Authorization header for all API requests
4. **Validation**: Backend validates token on each protected endpoint
5. **Expiration**: Token expires after set duration (configured backend-side)
6. **Cleanup**: Token removed on logout or 401 response

### Axios Configuration

```javascript
const setupAxiosDefaults = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};
```

## Social Authentication

### Supported Providers
1. **Google OAuth 2.0**
2. **Microsoft OAuth 2.0**

### OAuth Flow

```
1. User clicks social login button
   ↓
2. Frontend redirects to backend OAuth endpoint
   GET /api/auth/google or /api/auth/microsoft
   ↓
3. Backend redirects to provider's OAuth consent page
   ↓
4. User authorizes application
   ↓
5. Provider redirects back to backend callback
   ↓
6. Backend exchanges code for access token
   ↓
7. Backend creates/updates user account
   ↓
8. Backend generates JWT and redirects to frontend
   /auth/google/callback?token=JWT_TOKEN
   ↓
9. Frontend extracts token and completes login
```

### Callback Implementation

```javascript
// GoogleAuthCallback.js
useEffect(() => {
  const urlParams = new URLSearchParams(location.search);
  const token = urlParams.get('token');
  const error = urlParams.get('error');
  
  if (error) {
    console.error('OAuth error:', error);
    navigate('/login');
    return;
  }
  
  if (token) {
    // Store token
    localStorage.setItem('token', token);
    localStorage.setItem('userType', 'user');
    
    // Configure axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Decode token to check if new user
    const decodedToken = jwtDecode(token);
    
    if (decodedToken.isNewUser) {
      navigate('/activity');
    } else {
      navigate('/dashboard');
    }
  }
}, [location, navigate]);
```

## Protected Routes

### Route Protection Implementation

```javascript
const ProtectedRoute = ({ children, allowedUserTypes }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // Check if user has required role
  if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};
```

### Route Configuration

```javascript
// Public routes
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<SignUp />} />

// Protected routes (any authenticated user)
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Role-specific routes
<Route path="/business/*" element={
  <ProtectedRoute allowedUserTypes={['business']}>
    <BusinessDashboard />
  </ProtectedRoute>
} />

<Route path="/admin/*" element={
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
} />
```

## API Integration

### Request Headers
All authenticated requests include:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

### Error Handling
```javascript
// Global axios interceptor for auth errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Profile Validation
```javascript
const checkAuth = async () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token || !userType) return;
  
  try {
    const endpoint = userType === 'business' ? '/api/business/me' :
                    userType === 'charity' ? '/api/charities/me' :
                    '/api/users/me';
    
    const response = await axios.get(`${API_BASE_URL}${endpoint}`);
    setUser(response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      logout();
    }
  }
};
```

## Security Best Practices

### Current Implementation
1. ✅ JWT tokens for stateless authentication
2. ✅ Automatic token injection via axios defaults
3. ✅ Token validation on protected routes
4. ✅ Proper logout with state cleanup
5. ✅ Role-based access control
6. ✅ Password visibility toggle
7. ✅ OAuth integration for reduced password exposure

### Recommendations for Improvement

1. **Token Storage Security**
   ```javascript
   // Consider using sessionStorage for sensitive apps
   sessionStorage.setItem('token', token);
   
   // Or implement secure cookie storage (backend required)
   document.cookie = `token=${token}; Secure; HttpOnly; SameSite=Strict`;
   ```

2. **Token Refresh Mechanism**
   ```javascript
   // Implement refresh token flow
   const refreshToken = async () => {
     const refreshToken = localStorage.getItem('refreshToken');
     const response = await axios.post('/api/auth/refresh', { refreshToken });
     localStorage.setItem('token', response.data.token);
     setupAxiosDefaults(response.data.token);
   };
   ```

3. **Session Timeout**
   ```javascript
   // Auto-logout after inactivity
   let inactivityTimer;
   
   const resetInactivityTimer = () => {
     clearTimeout(inactivityTimer);
     inactivityTimer = setTimeout(() => {
       logout();
       alert('Session expired due to inactivity');
     }, 30 * 60 * 1000); // 30 minutes
   };
   
   // Add event listeners
   ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
     document.addEventListener(event, resetInactivityTimer);
   });
   ```

4. **Enhanced Password Requirements**
   ```javascript
   const validatePassword = (password) => {
     const minLength = 12;
     const hasUpperCase = /[A-Z]/.test(password);
     const hasLowerCase = /[a-z]/.test(password);
     const hasNumbers = /\d/.test(password);
     const hasSpecialChar = /[!@#$%^&*]/.test(password);
     
     return password.length >= minLength && 
            hasUpperCase && hasLowerCase && 
            hasNumbers && hasSpecialChar;
   };
   ```

## Troubleshooting

### Common Issues

1. **401 Unauthorized Errors**
   - Check if token exists in localStorage
   - Verify token hasn't expired
   - Ensure Authorization header is being sent
   - Confirm backend is expecting correct token format

2. **Login Redirect Loop**
   - Clear localStorage completely
   - Check for conflicting route guards
   - Verify userType is being set correctly

3. **Social Login Failures**
   - Verify OAuth callback URLs are configured correctly
   - Check for popup blockers
   - Ensure backend OAuth credentials are valid
   - Look for CORS issues in console

### Debug Utilities

```javascript
// Check current auth state
const debugAuth = () => {
  console.log('Token:', localStorage.getItem('token'));
  console.log('User Type:', localStorage.getItem('userType'));
  console.log('User ID:', localStorage.getItem('currentUserId'));
  console.log('Auth Header:', axios.defaults.headers.common['Authorization']);
};

// Decode and inspect JWT
const inspectToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log('Decoded Token:', decoded);
      console.log('Token Expires:', new Date(decoded.exp * 1000));
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }
};

// Force re-authentication
const forceReauth = () => {
  logout();
  window.location.href = '/login';
};
```

## Migration Guide

### Updating from Basic Auth to JWT

1. Update login endpoints to return JWT tokens
2. Modify axios configuration to use Bearer tokens
3. Update all API calls to remove basic auth
4. Implement token storage and management
5. Add protected route components
6. Update logout to clear tokens

### Adding New User Type

1. Create new login endpoint in backend
2. Add new case in AuthContext login handler
3. Update ProtectedRoute to recognize new type
4. Create type-specific dashboard component
5. Add routing for new user type
6. Update navigation logic