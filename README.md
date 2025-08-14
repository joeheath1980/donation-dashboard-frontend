# Do-Nation Frontend Dashboard

A comprehensive React-based donation platform frontend that connects donors, businesses, and charities to facilitate charitable giving and social impact.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/joeheath1980/donation-dashboard-frontend.git
cd donation-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm start

# Build for production
npm run build
```

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Security](#-security)
- [API Integration](#-api-integration)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [Support](#-support)

## ✨ Features

### For Donors
- **Personal Impact Dashboard** - Track donations and social impact score with visual analytics
- **Achievement System** - Earn badges and progress through tiers (Giver → Visionary)
- **Tax Receipt Management** - Download individual or bulk receipts for tax purposes
- **Social Profiles** - Share your charitable impact with customizable public profiles
- **Smart Matching** - AI-powered charity recommendations based on interests
- **Activity Feed** - Real-time updates on donations and achievements
- **Payment Methods** - Secure card management with Stripe integration

### For Businesses
- **Campaign Management** - Create, manage, and track donation campaigns
- **Tax Center** - Comprehensive tax planning, receipts, and reporting
- **Team Management** - Multi-user accounts with role-based permissions
- **Analytics Dashboard** - Real-time metrics, ROI tracking, and performance insights
- **Automated Matching** - Configure donation matching rules and budgets
- **Onboarding Wizard** - Guided setup with AI-powered charity recommendations
- **Budget Allocation** - Smart budget distribution across campaigns

### For Charities
- **Donor Management** - CRM system for tracking donor relationships
- **Analytics & Reporting** - Comprehensive donation analytics and trends
- **Profile Customization** - Showcase programs, impact stories, and achievements
- **Communication Tools** - Engage donors with updates and thank you messages
- **Stripe Integration** - Secure payment processing with instant payouts
- **Verification System** - Build trust with verified charity status
- **Campaign Partnerships** - Connect with business donation campaigns

### Platform Features
- **Real-time Updates** - WebSocket-powered live notifications
- **CSP Compliant** - 100% Content Security Policy compliance (no inline styles)
- **CSRF Protection** - Automatic token management for all requests
- **Responsive Design** - Mobile-first, accessible interface
- **OAuth Integration** - Google and Microsoft single sign-on
- **Dark Mode** - Eye-friendly dark theme support
- **Multi-language** - i18n ready architecture

## 🛠 Tech Stack

### Core Technologies
- **React 18.3** - Modern React with hooks and concurrent features
- **React Router 6** - Client-side routing with nested routes
- **Axios** - HTTP client with interceptors
- **Chart.js 4** - Interactive data visualizations
- **Swiper** - Touch-friendly carousels

### State Management
- **Context API** - Global state for auth, user, and impact data
- **Custom Hooks** - Reusable business logic
- **WebSocket Context** - Real-time data synchronization

### Styling & UI
- **CSS Modules** - Component-scoped styling
- **Dynamic CSS Variables** - CSP-compliant runtime theming
- **React Icons** - Comprehensive icon library
- **React Toastify** - User notifications
- **Slick Carousel** - Image galleries

### Security & Performance
- **CSRF Service** - Automatic token management
- **CSP Compliance** - Zero inline styles/scripts
- **JWT Authentication** - Secure token management
- **Input Validation** - Client-side form validation
- **Code Splitting** - Lazy loading for performance
- **Error Boundaries** - Graceful error handling

## 📁 Project Structure

```
donation-dashboard/
├── public/                     # Static assets
│   ├── index.html             # HTML template
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/            # React components
│   │   ├── Common/           # Shared components
│   │   │   ├── LoadingSpinner.js
│   │   │   └── ErrorBoundary.js
│   │   ├── Profile/          # Profile features
│   │   ├── Settings/         # User settings
│   │   ├── CharityAnalytics/ # Charity dashboard
│   │   ├── BusinessOnboarding/
│   │   ├── matching/         # Donation matching
│   │   └── ...              # Feature components
│   ├── contexts/             # React contexts
│   │   ├── AuthContext.js   # Authentication
│   │   ├── ImpactContext.js # Impact data
│   │   └── WebSocketContext.js
│   ├── services/             # API services
│   │   ├── api.service.js   # Main API client
│   │   ├── csrf.service.js  # CSRF management
│   │   └── profile.service.js
│   ├── styles/               # Global styles
│   │   ├── csp-utilities.css
│   │   ├── dynamic-styles.css
│   │   └── index.css
│   ├── utils/                # Utilities
│   │   ├── auth.utils.js
│   │   ├── logger.js
│   │   └── validation.js
│   ├── config/               # Configuration
│   │   └── api.config.js
│   ├── App.js               # Root component
│   └── index.js             # Entry point
├── scripts/                  # Maintenance scripts
│   ├── cleanup-frontend.js  # Project cleanup
│   ├── remove-console.js    # Remove logs
│   └── migrations/          # Migration scripts
├── docs/                     # Documentation
│   ├── CSP_MIGRATION.md
│   └── deployment/
└── package.json             # Dependencies
```

## 💻 Development

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Git
- Code editor (VS Code recommended)

### Environment Setup

Create a `.env` file in the root directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3002
REACT_APP_WEBSOCKET_URL=ws://localhost:3002

# OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_MICROSOFT_CLIENT_ID=your_microsoft_client_id

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Environment
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

### Development Workflow

1. **Start Backend First** (if developing locally):
```bash
cd ../giving-dashboard
npm start
```

2. **Start Frontend**:
```bash
npm start
# Opens http://localhost:3000
```

3. **Development Tools**:
- React DevTools - Component inspection
- Redux DevTools - State debugging
- Network tab - API monitoring

### Available Scripts

```bash
# Development
npm start              # Start dev server (port 3000)
npm run build         # Build for production
npm test              # Run test suite
npm run eject         # Eject from CRA (caution!)

# Code Quality
npm run lint          # Check ESLint rules
npm run lint:fix      # Auto-fix issues
npm run format        # Format with Prettier

# Maintenance
node scripts/cleanup-frontend.js           # Clean project
node scripts/remove-console-statements.js  # Remove logs
node scripts/update-imports.js            # Fix imports

# Analysis
npm run analyze       # Bundle size analysis
npm run coverage      # Test coverage report
```

## 🔒 Security

### Content Security Policy (CSP)
- **100% Compliant** - No inline styles or scripts
- All styles migrated to CSS modules
- Dynamic styles use CSS custom properties
- Automated migration tools available

### CSRF Protection
- Automatic token fetching on app load
- Token refresh before expiry (50-minute lifetime)
- Smart exemptions for safe methods
- Retry logic for failed requests
- Multiple submission methods (header, body, cookie)

### Authentication & Authorization
- JWT-based authentication
- Secure token storage (httpOnly cookies in production)
- Automatic token refresh
- Role-based access control (User, Business, Charity, Admin)
- OAuth 2.0 integration (Google, Microsoft)

### Input Validation
- Client-side validation for all forms
- Password strength requirements (8+ chars, mixed case, numbers, symbols)
- Email format validation
- XSS prevention through React's default escaping
- SQL injection prevention (parameterized queries in backend)

## 🔌 API Integration

### Backend Requirements
Requires backend API at `REACT_APP_API_URL` (default: http://localhost:3002)

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `GET /api/csrf-token` - CSRF token

#### User Operations
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/donations` - Donation history
- `GET /api/users/impact` - Impact score

#### Business Operations
- `GET /api/business/campaigns` - List campaigns
- `POST /api/business/campaigns` - Create campaign
- `GET /api/business/analytics` - Analytics data
- `GET /api/business/tax-summary` - Tax information

#### Charity Operations
- `GET /api/charities` - List charities
- `GET /api/charity/donors` - Donor management
- `GET /api/charity/analytics` - Charity analytics
- `PUT /api/charity/profile` - Update profile

### WebSocket Events
```javascript
// Connection
socket.on('connect', () => {})
socket.on('disconnect', () => {})

// Notifications
socket.on('donation', (data) => {})
socket.on('achievement', (data) => {})
socket.on('campaign-update', (data) => {})
socket.on('match-opportunity', (data) => {})
```

## 🚀 Deployment

### Production Build

```bash
# Clean install
rm -rf node_modules package-lock.json
npm ci

# Build with optimizations
npm run build

# Output in ./build directory
# Size: ~18MB (gzipped: ~5MB)
```

### Server Requirements
- Ubuntu 20.04+ or similar Linux
- Node.js 18+ (for build process)
- Nginx 1.18+ (web server)
- SSL certificate (Let's Encrypt)
- 2GB+ RAM recommended
- 10GB+ disk space

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name do-nation.space;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/do-nation.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/do-nation.space/privkey.pem;
    
    # Root directory
    root /var/www/donation-dashboard;
    index index.html;
    
    # Security Headers
    add_header Content-Security-Policy "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data: https:; font-src 'self';";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket proxy
    location /socket.io {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Deployment Steps

1. **Build locally**:
```bash
npm run build
```

2. **Transfer to server**:
```bash
rsync -avz --delete build/ user@server:/var/www/donation-dashboard/
```

3. **Set permissions**:
```bash
sudo chown -R www-data:www-data /var/www/donation-dashboard
sudo chmod -R 755 /var/www/donation-dashboard
```

4. **Reload nginx**:
```bash
sudo systemctl reload nginx
```

## 🧪 Testing

### Unit Tests
```bash
npm test                    # Run all tests
npm test -- --coverage      # Coverage report
npm test Component.test     # Specific test
npm test -- --watch        # Watch mode
```

### Integration Tests
Currently using React Testing Library for component testing.

### E2E Tests (Planned)
Consider adding Cypress or Playwright for end-to-end testing.

### Test Coverage Goals
- Components: 80%+
- Utils: 95%+
- Services: 90%+
- Overall: 85%+

## 🤝 Contributing

### Development Process

1. **Fork & Clone**:
```bash
git clone https://github.com/your-username/donation-dashboard-frontend.git
cd donation-dashboard
npm install
```

2. **Create Feature Branch**:
```bash
git checkout -b feature/amazing-feature
```

3. **Make Changes**:
- Follow code style guidelines
- Add tests for new features
- Update documentation

4. **Commit Changes**:
```bash
git add .
git commit -m "feat: add amazing feature"
```

5. **Push & PR**:
```bash
git push origin feature/amazing-feature
# Create Pull Request on GitHub
```

### Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance
- `perf:` Performance

### Code Style
- ESLint configuration enforced
- Prettier for formatting
- CSS Modules for styling
- No inline styles (CSP compliance)
- Meaningful variable names
- Comments for complex logic

## 📊 Performance

### Optimization Strategies
- Code splitting with React.lazy()
- Image lazy loading
- Bundle optimization (tree shaking)
- CSS modules for smaller bundles
- Service worker for caching (planned)

### Monitoring
- Lighthouse scores: 90+ target
- Bundle size: <5MB gzipped
- First Contentful Paint: <1.5s
- Time to Interactive: <3s

## 🐛 Troubleshooting

### Common Issues

**Build Failures**:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
```

**CSRF Token Errors**:
- Verify backend `/api/csrf-token` endpoint
- Check cookies are enabled
- Verify CORS configuration
- Check browser console for errors

**WebSocket Issues**:
- Verify WebSocket URL in .env
- Check firewall/proxy settings
- Ensure nginx WebSocket proxy configured
- Check browser WebSocket support

**Authentication Problems**:
- Clear localStorage: `localStorage.clear()`
- Check token expiry
- Verify API URL configuration
- Check CORS headers

## 📚 Documentation

### Project Documentation
- [API Specifications](../giving-dashboard/SHARED_API_SPECS.md)
- [CSP Migration Guide](./docs/CSP_MIGRATION_COMPLETE.md)
- [CSRF Implementation](./CSRF_IMPLEMENTATION.md)
- [Deployment Guide](./docs/deployment/FRONTEND_DEPLOYMENT_GUIDE.md)
- [Google Auth Setup](./GOOGLE_AUTH_SETUP.md)
- [Microsoft Auth Setup](./MICROSOFT_LOGIN_INTEGRATION.md)

### External Resources
- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)
- [Chart.js Documentation](https://www.chartjs.org)
- [CSS Modules](https://github.com/css-modules/css-modules)

## 📞 Support

### Getting Help
- **GitHub Issues**: [Report bugs](https://github.com/joeheath1980/donation-dashboard-frontend/issues)
- **Email**: support@do-nation.space
- **Documentation**: Check `/docs` directory
- **Backend Issues**: See giving-dashboard repository

### Maintainers
- Frontend: Do-Nation Development Team
- Backend: API Team
- DevOps: Infrastructure Team
- Security: Security Team

## 📄 License

This project is proprietary software. All rights reserved.

---

Built with ❤️ by the Do-Nation team to make charitable giving easier and more impactful.