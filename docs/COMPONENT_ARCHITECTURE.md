# Component Architecture Documentation

## Overview
This document provides a detailed breakdown of the React component architecture used in the Donation Dashboard. It covers component organization, data flow patterns, state management strategies, and best practices.

## Component Hierarchy

```
App.js (Root Component)
├── AuthContext (Provider)
├── UserContext (Provider)
├── ImpactContext (Provider)
└── Routes
    ├── Public Routes
    │   ├── WelcomePage
    │   ├── About
    │   ├── Login
    │   └── SignUp
    ├── Protected Routes
    │   ├── Layout (Wrapper)
    │   │   ├── Navigation
    │   │   └── Content
    │   ├── User Components
    │   │   ├── Profile
    │   │   ├── Dashboard
    │   │   ├── YourImpact
    │   │   └── Donations
    │   ├── Business Components
    │   │   ├── BusinessDashboard
    │   │   └── BusinessCampaigns
    │   ├── Charity Components
    │   │   ├── CharityDashboard
    │   │   └── CharityVerification
    │   └── Admin Components
    │       ├── AdminDashboard
    │       └── AdminPanels
    └── Auth Callbacks
        ├── GoogleAuthCallback
        └── MicrosoftAuthCallback
```

## Core Components

### 1. App.js - Application Root
The main application component that sets up routing and context providers.

```javascript
// Key responsibilities:
- Route configuration
- Context provider setup
- Protected route implementation
- Global error boundary
```

**Key Features:**
- Implements `ProtectedRoute` component for auth
- Manages route-based code splitting
- Handles 404 routes
- Sets up global providers

### 2. Layout.js - Application Shell
Provides consistent layout structure across all authenticated pages.

```javascript
// Structure:
<div className="app-container">
  <Navigation />
  <main className="content">
    {children}
  </main>
  <Footer />
</div>
```

**Features:**
- Responsive navigation
- User menu dropdown
- Notification system
- Breadcrumb navigation

## Feature Components

### Authentication Components

#### Login.js
Multi-role login interface supporting users, businesses, and charities.

**State Management:**
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [userType, setUserType] = useState('user');
const [error, setError] = useState('');
const [showPassword, setShowPassword] = useState(false);
```

**Key Features:**
- Role-based login endpoints
- Social login integration
- Password visibility toggle
- Remember me functionality
- Error handling with user feedback

#### SignUp.js
User registration component with validation.

**Validation Rules:**
- Name: Required, min 2 characters
- Email: Valid email format
- Password: Minimum 6 characters
- Terms acceptance required

### User Dashboard Components

#### Profile.js
User profile management interface.

**Component Structure:**
```javascript
<Profile>
  <ProfileHeader>
    <Avatar />
    <UserInfo />
    <ImpactBadge />
  </ProfileHeader>
  <ProfileTabs>
    <PersonalInfo />
    <SecuritySettings />
    <NotificationPreferences />
    <ConnectedAccounts />
  </ProfileTabs>
</Profile>
```

#### YourImpact.js
Impact visualization and tracking component.

**Data Visualization:**
- Donut chart for impact distribution
- Progress bars for tier advancement
- Activity timeline
- Comparative analytics

**State Structure:**
```javascript
{
  totalImpact: 1250,
  breakdown: {
    donations: 800,
    volunteering: 300,
    fundraising: 150
  },
  tier: 'Philanthropist',
  nextTier: 'Champion',
  pointsToNext: 250
}
```

### Donation Components

#### DonationsComponent.js
Main donation management interface.

**Features:**
- Donation list with filtering
- Add/Edit/Delete functionality
- Receipt management
- Export capabilities

**Component Composition:**
```javascript
<DonationsComponent>
  <DonationFilters />
  <DonationList>
    <DonationItem>
      <DonationDetails />
      <DonationActions />
    </DonationItem>
  </DonationList>
  <DonationModal />
</DonationsComponent>
```

#### DonationModal.js
Modal for creating/editing donations.

**Form Fields:**
- Charity name (autocomplete)
- Amount (currency input)
- Date (date picker)
- Category (dropdown)
- Monthly recurring (checkbox)
- Receipt upload (file input)

**Validation:**
```javascript
const validateDonation = (donation) => {
  const errors = {};
  
  if (!donation.charity) errors.charity = 'Charity is required';
  if (!donation.amount || donation.amount <= 0) {
    errors.amount = 'Valid amount required';
  }
  if (!donation.date) errors.date = 'Date is required';
  if (!donation.charityType) errors.charityType = 'Category is required';
  
  return errors;
};
```

### Payment Components

#### ManagePaymentsComponent.js
Unified payment interface for donations.

**Integration Points:**
- Braintree Drop-in UI
- PayPal Buttons
- Amount validation
- Charity selection

**Payment Flow:**
```javascript
// 1. Initialize payment providers
useEffect(() => {
  fetchBraintreeToken();
  initializePayPal();
}, []);

// 2. Handle payment submission
const processPayment = async (method) => {
  validateAmount();
  validateCharity();
  
  if (method === 'braintree') {
    const nonce = await getBraintreeNonce();
    submitBraintreePayment(nonce);
  } else {
    createPayPalOrder();
  }
};
```

### Admin Components

#### AdminDashboard.js
Central admin control panel.

**Dashboard Sections:**
```javascript
<AdminDashboard>
  <StatsOverview>
    <TotalUsers />
    <TotalDonations />
    <ActiveCampaigns />
    <PendingVerifications />
  </StatsOverview>
  <QuickActions>
    <UserManagement />
    <CharityVerification />
    <ContentModeration />
  </QuickActions>
  <RecentActivity />
</AdminDashboard>
```

#### AdminUserManagement.js
User administration interface.

**Features:**
- User search and filtering
- Role modification
- Account status management
- Activity logs
- Bulk operations

## State Management Patterns

### Context API Usage

#### AuthContext
Manages authentication state globally.

```javascript
const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: () => {},
  checkAuth: async () => {},
  loading: false,
  error: null
});
```

**State Flow:**
1. Login credentials submitted
2. API call to authentication endpoint
3. Token stored in localStorage
4. User data fetched and stored in context
5. Components re-render with auth state

#### UserContext
Stores user preferences and profile data.

```javascript
const UserContext = createContext({
  profile: null,
  preferences: {},
  updateProfile: async () => {},
  updatePreferences: async () => {}
});
```

#### ImpactContext
Calculates and manages impact metrics.

```javascript
const ImpactContext = createContext({
  impactScore: 0,
  tier: 'Giver',
  breakdown: {},
  calculateImpact: () => {},
  refreshImpact: async () => {}
});
```

### Local State Management

**When to use local state:**
- Form inputs
- UI toggles (modals, dropdowns)
- Temporary data
- Component-specific loading states

**Example:**
```javascript
const [formData, setFormData] = useState({
  charity: '',
  amount: '',
  date: new Date()
});

const [isSubmitting, setIsSubmitting] = useState(false);
const [errors, setErrors] = useState({});
```

## Component Communication Patterns

### Parent-Child Communication

**Props Drilling Prevention:**
```javascript
// Bad: Props drilling
<Parent>
  <Child1 user={user}>
    <Child2 user={user}>
      <Child3 user={user} />
    </Child2>
  </Child1>
</Parent>

// Good: Context or composition
<UserProvider>
  <Parent>
    <Child1>
      <Child2>
        <Child3 /> {/* Access user via useContext */}
      </Child2>
    </Child1>
  </Parent>
</UserProvider>
```

### Event Handling Patterns

**Callback Props:**
```javascript
// Parent component
const handleDonationCreate = async (donationData) => {
  const newDonation = await createDonation(donationData);
  setDonations([...donations, newDonation]);
};

// Child component
<DonationModal onSubmit={handleDonationCreate} />
```

**Event Bubbling:**
```javascript
// List item events
<DonationList onClick={handleListClick}>
  <DonationItem data-id={donation.id}>
    {/* Click bubbles up with donation ID */}
  </DonationItem>
</DonationList>
```

## Component Optimization

### Performance Optimization

**Memoization:**
```javascript
// Memoize expensive calculations
const totalDonations = useMemo(() => {
  return donations.reduce((sum, d) => sum + d.amount, 0);
}, [donations]);

// Memoize components
const DonationItem = React.memo(({ donation, onEdit, onDelete }) => {
  return <div>{/* Render donation */}</div>;
}, (prevProps, nextProps) => {
  return prevProps.donation.id === nextProps.donation.id;
});
```

**Lazy Loading:**
```javascript
// Route-based code splitting
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));

// Component-based splitting
const HeavyChart = lazy(() => import('./components/Charts/HeavyChart'));

// Usage with Suspense
<Suspense fallback={<Loading />}>
  <AdminDashboard />
</Suspense>
```

### State Update Optimization

**Batch Updates:**
```javascript
// Avoid multiple re-renders
const updateMultipleStates = () => {
  // React 18 automatically batches these
  setLoading(true);
  setError(null);
  setData(null);
};
```

**Functional Updates:**
```javascript
// When new state depends on previous
setDonations(prevDonations => [...prevDonations, newDonation]);

// Avoid stale closures
setCount(prevCount => prevCount + 1);
```

## Error Handling

### Error Boundaries

```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### Component-Level Error Handling

```javascript
const DonationForm = () => {
  const [error, setError] = useState(null);
  
  const handleSubmit = async (data) => {
    try {
      setError(null);
      await submitDonation(data);
    } catch (err) {
      setError(err.message);
      // Don't throw - handle gracefully
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorAlert message={error} />}
      {/* Form fields */}
    </form>
  );
};
```

## Testing Strategies

### Component Testing

```javascript
// Unit test example
describe('DonationModal', () => {
  it('validates required fields', () => {
    const { getByLabelText, getByText } = render(<DonationModal />);
    
    fireEvent.click(getByText('Submit'));
    
    expect(getByText('Charity is required')).toBeInTheDocument();
    expect(getByText('Amount is required')).toBeInTheDocument();
  });
  
  it('submits valid donation', async () => {
    const onSubmit = jest.fn();
    const { getByLabelText, getByText } = render(
      <DonationModal onSubmit={onSubmit} />
    );
    
    fireEvent.change(getByLabelText('Charity'), {
      target: { value: 'Red Cross' }
    });
    fireEvent.change(getByLabelText('Amount'), {
      target: { value: '50' }
    });
    
    fireEvent.click(getByText('Submit'));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        charity: 'Red Cross',
        amount: 50,
        // ... other fields
      });
    });
  });
});
```

### Integration Testing

```javascript
// Test component with context
describe('Dashboard with Auth', () => {
  it('shows user dashboard when authenticated', () => {
    const mockUser = { name: 'John Doe', role: 'user' };
    
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Dashboard />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Welcome, John!')).toBeInTheDocument();
    expect(screen.getByText('Your Impact')).toBeInTheDocument();
  });
});
```

## Accessibility Patterns

### ARIA Implementation

```javascript
// Accessible modal
const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-hidden={!isOpen}
    >
      <h2 id="modal-title">{title}</h2>
      <button
        aria-label="Close modal"
        onClick={onClose}
      >
        ×
      </button>
      {children}
    </div>
  );
};

// Accessible form
<form aria-label="Donation form">
  <label htmlFor="amount">
    Donation Amount
    <span aria-label="required">*</span>
  </label>
  <input
    id="amount"
    type="number"
    aria-required="true"
    aria-invalid={!!errors.amount}
    aria-describedby="amount-error"
  />
  {errors.amount && (
    <span id="amount-error" role="alert">
      {errors.amount}
    </span>
  )}
</form>
```

### Keyboard Navigation

```javascript
// Keyboard-friendly dropdown
const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          Math.min(prev + 1, options.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        selectOption(options[selectedIndex]);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };
  
  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Dropdown implementation */}
    </div>
  );
};
```

## Best Practices

### Component Design Principles

1. **Single Responsibility**: Each component should do one thing well
2. **Composition over Inheritance**: Use component composition
3. **Props Interface**: Clear, typed props with defaults
4. **Separation of Concerns**: UI logic separate from business logic
5. **Reusability**: Build generic, reusable components

### Code Organization

```javascript
// Component file structure
ComponentName/
├── index.js           // Component export
├── ComponentName.js   // Main component
├── ComponentName.module.css  // Styles
├── ComponentName.test.js     // Tests
└── utils.js          // Helper functions
```

### Naming Conventions

- Components: PascalCase (`DonationModal`)
- Props: camelCase (`onSubmit`, `isLoading`)
- Event handlers: `handle` prefix (`handleClick`)
- Boolean props: `is/has` prefix (`isOpen`, `hasError`)
- CSS classes: kebab-case (`donation-modal`)

### Performance Checklist

- [ ] Use React.memo for expensive components
- [ ] Implement useMemo for expensive calculations
- [ ] Use useCallback for stable function references
- [ ] Lazy load heavy components
- [ ] Optimize re-renders with proper key props
- [ ] Debounce user input handlers
- [ ] Virtualize long lists