# User Roles and Permissions Guide

## Overview
The Donation Dashboard implements a comprehensive role-based access control (RBAC) system supporting four distinct user types: Regular Users, Business Users, Charity Users, and Administrators. Each role has specific permissions and access to different features within the platform.

## User Role Matrix

| Feature | Regular User | Business User | Charity User | Admin |
|---------|--------------|---------------|--------------|--------|
| Personal Dashboard | ✅ | ❌ | ❌ | ✅ |
| Business Dashboard | ❌ | ✅ | ❌ | ❌ |
| Charity Dashboard | ❌ | ❌ | ✅ | ❌ |
| Admin Dashboard | ❌ | ❌ | ❌ | ✅ |
| Make Donations | ✅ | ✅* | ❌ | ✅ |
| Track Impact | ✅ | ✅ | ❌ | ✅ |
| Create Campaigns | ❌ | ✅ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Verify Charities | ❌ | ❌ | ❌ | ✅ |
| View All Data | ❌ | ❌ | ❌ | ✅ |

*Business users can make donations on behalf of their organization

## Role Descriptions

### 1. Regular User (Default Role)

Regular users are individual donors who use the platform for personal charitable giving.

#### Capabilities:
- Create personal account via email or social login (Google/Microsoft)
- Make one-time or recurring donations
- Upload donation receipts for record-keeping
- Track personal impact score and tier progression
- View donation history and generate reports
- Follow charities and receive updates
- Participate in matching opportunities
- Create and manage fundraising campaigns
- Log volunteer activities
- Access perks based on impact tier

#### Access Points:
- `/login` - Standard login
- `/signup` - Account registration
- `/dashboard` - Personal dashboard
- `/donations` - Donation management
- `/profile` - Profile settings
- `/your-impact` - Impact visualization
- `/your-perks` - Tier-based benefits
- `/activity` - Activity tracking

#### Key Components:
```javascript
// Components accessible to regular users
- Profile.js
- YourAccount.js
- YourImpact.js
- YourPerks.js
- Activity.js
- PersonalImpactScore.js
- DonationsComponent.js
- OneOffContributionsComponent.js
- ManagePaymentsComponent.js
```

### 2. Business User

Business users represent companies and organizations that want to engage in corporate social responsibility.

#### Capabilities:
- Create business account with company details
- Launch employee giving campaigns
- Set up donation matching programs
- Track company-wide charitable impact
- Generate CSR reports
- Manage multiple campaigns simultaneously
- Set campaign goals and target audiences
- View campaign analytics and participation rates

#### Access Points:
- `/business/login` - Business portal login
- `/business/signup` - Business registration
- `/business/dashboard` - Business dashboard
- `/business/campaigns` - Campaign management
- `/business/create-campaign` - New campaign creation

#### Key Components:
```javascript
// Business-specific components
- BusinessDashboard.js
- BusinessSignup.js
- BusinessCreateCampaign.js
```

#### Business Model:
```javascript
{
  businessId: "unique_identifier",
  companyName: "Tech Corp",
  contactEmail: "csr@techcorp.com",
  description: "Leading tech company",
  preferredCauses: ["education", "environment"],
  campaigns: [...],
  totalDonations: 50000,
  employeeParticipation: 0.75
}
```

### 3. Charity User

Charity users are verified charitable organizations registered on the platform.

#### Capabilities:
- Create charity account with verification
- Submit ABN (Australian Business Number) for linking
- Upload verification documents
- View incoming donations
- Generate donation reports
- Update charity profile and mission
- Communicate impact to donors
- Access donor analytics (anonymized)

#### Access Points:
- `/charity/login` - Charity portal login
- `/charity/signup` - Charity registration
- `/charity/dashboard` - Charity dashboard
- `/charity/verification` - Verification status

#### Key Components:
```javascript
// Charity-specific components
- CharityDashboard.js
- CharitySignup.js
- CharityPartner.js
```

#### Verification Process:
1. Submit charity registration details
2. Provide ABN and tax-exempt status
3. Upload supporting documents
4. Admin review and approval
5. Access to full charity features upon approval

### 4. Administrator

Administrators have full system access for platform management and oversight.

#### Capabilities:
- Access all platform features and data
- Manage user accounts (activate/suspend)
- Change user roles and permissions
- Verify charity organizations
- Moderate content and campaigns
- View platform-wide analytics
- Handle dispute resolution
- Configure system settings
- Generate administrative reports

#### Access Points:
- `/admin/*` - All admin routes
- Uses standard user login with admin role check

#### Admin Components:
```javascript
// Admin panel components
- AdminDashboard.js
- AdminUserManagement.js
- AdminCharityManagement.js
- AdminBusinessPartnerManagement.js
- AdminCampaignManagement.js
- AdminDonationManagement.js
- AdminContentManagement.js
- AdminAnalyticsReporting.js
```

#### Admin Functions:
```javascript
// User management
updateUserRole(userId, newRole)
updateUserStatus(userId, status)

// Charity verification
approveCharityLinking(requestId)
rejectCharityLinking(requestId)

// Content moderation
reviewCampaign(campaignId)
flagContent(contentId, reason)
```

## Authentication Flow by Role

### Regular User Authentication
```javascript
// Login endpoint
POST /api/auth/login
{
  email: "user@example.com",
  password: "password123"
}

// Storage
localStorage.setItem('token', token);
localStorage.setItem('userType', 'user');
```

### Business Authentication
```javascript
// Login endpoint
POST /api/business/auth/login
{
  contactEmail: "business@example.com",
  password: "password123"
}

// Storage
localStorage.setItem('token', token);
localStorage.setItem('userType', 'business');
localStorage.setItem('businessId', businessId);
```

### Charity Authentication
```javascript
// Login endpoint
POST /api/charities/login
{
  contactEmail: "charity@example.com",
  password: "password123"
}

// Storage
localStorage.setItem('token', token);
localStorage.setItem('userType', 'charity');
localStorage.setItem('charityId', charityId);
```

## Route Protection Implementation

### Protected Route Component
```javascript
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
```

### Route Configuration
```javascript
// Public routes - accessible to all
<Route path="/" element={<WelcomePage />} />
<Route path="/about" element={<About />} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<SignUp />} />

// User routes - requires authentication
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Business-only routes
<Route path="/business/*" element={
  <ProtectedRoute allowedUserTypes={['business']}>
    <BusinessRoutes />
  </ProtectedRoute>
} />

// Charity-only routes
<Route path="/charity/*" element={
  <ProtectedRoute allowedUserTypes={['charity']}>
    <CharityRoutes />
  </ProtectedRoute>
} />

// Admin-only routes
<Route path="/admin/*" element={
  <AdminRoute>
    <AdminPanel />
  </AdminRoute>
} />
```

## Permission Checks

### Frontend Permission Helpers
```javascript
// Check if user has specific permission
const hasPermission = (user, permission) => {
  const permissions = {
    user: ['view_own_data', 'make_donations', 'track_impact'],
    business: ['view_business_data', 'create_campaigns', 'manage_matching'],
    charity: ['view_charity_data', 'manage_charity_profile'],
    admin: ['*'] // All permissions
  };
  
  if (user.role === 'admin') return true;
  return permissions[user.userType]?.includes(permission);
};

// Check if user can access resource
const canAccess = (user, resource, action) => {
  // Admins can access everything
  if (user.role === 'admin') return true;
  
  // Users can only access their own resources
  if (resource.userId === user._id) return true;
  
  // Business users can access their company's resources
  if (user.userType === 'business' && resource.businessId === user.businessId) {
    return true;
  }
  
  // Charity users can access their charity's resources
  if (user.userType === 'charity' && resource.charityId === user.charityId) {
    return true;
  }
  
  return false;
};
```

### Component-Level Access Control
```javascript
// Conditional rendering based on role
const DashboardComponent = () => {
  const { user } = useAuth();
  
  return (
    <div>
      {user.userType === 'user' && <UserDashboard />}
      {user.userType === 'business' && <BusinessDashboard />}
      {user.userType === 'charity' && <CharityDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </div>
  );
};

// Feature flag based on permissions
const DonationButton = () => {
  const { user } = useAuth();
  const canDonate = ['user', 'business'].includes(user.userType);
  
  if (!canDonate) return null;
  
  return <button>Make a Donation</button>;
};
```

## Role Transition Scenarios

### 1. User to Admin
- Admin manually updates user role in admin panel
- User must log out and log back in for changes to take effect
- Gains access to admin panel while retaining user features

### 2. Individual to Business
- User creates separate business account
- Cannot convert existing personal account
- Can link personal account for employee giving programs

### 3. Charity Registration
- New account type, not a conversion
- Requires verification process
- Cannot have both charity and user account with same email

## Security Considerations

### Role-Based Security Measures
1. **Token Claims**: Include user role and type in JWT
2. **Backend Validation**: Verify permissions on every API call
3. **Principle of Least Privilege**: Users only get necessary permissions
4. **Audit Logging**: Track all role changes and admin actions
5. **Session Management**: Different session timeouts by role

### Best Practices
```javascript
// Always validate on backend
app.use('/api/admin/*', requireAdmin);
app.use('/api/business/*', requireBusiness);
app.use('/api/charity/*', requireCharity);

// Middleware example
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Double-check sensitive operations
const deleteUser = async (req, res) => {
  // Verify admin role again
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  // Log admin action
  await logAdminAction({
    admin: req.user._id,
    action: 'DELETE_USER',
    target: req.params.userId,
    timestamp: new Date()
  });
  
  // Perform deletion
  await User.findByIdAndDelete(req.params.userId);
};
```

## Role-Specific Features Deep Dive

### Impact Tracking (User Role)
- Personal impact score calculation
- Tier progression (Giver → Visionary)
- Points breakdown by activity type
- Visual progress indicators
- Comparative analytics

### Campaign Management (Business Role)
- Campaign creation wizard
- Target audience selection
- Goal setting and tracking
- Real-time participation metrics
- ROI calculation for CSR initiatives

### Donation Management (Charity Role)
- Incoming donation tracking
- Donor demographics (anonymized)
- Fund allocation reporting
- Impact story creation
- Thank you message automation

### Platform Administration (Admin Role)
- User lifecycle management
- Content moderation queue
- System health monitoring
- Financial reconciliation
- Compliance reporting

## Future Enhancements

1. **Granular Permissions**: More specific permission sets
2. **Role Inheritance**: Hierarchical role structures
3. **Temporary Permissions**: Time-based access grants
4. **Multi-Role Support**: Users with multiple roles
5. **Custom Roles**: Organization-specific role creation