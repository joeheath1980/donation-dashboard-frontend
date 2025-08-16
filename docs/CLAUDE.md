# Frontend Claude Instructions

## Related Backend
- Backend location: `/Users/josephheath/giving-dashboard`
- Backend runs on: http://localhost:3002 (dev) / https://do-nation.space (prod)
- API documentation: See `/Users/josephheath/giving-dashboard/SHARED_API_SPECS.md`

## Frontend Overview
This is the React frontend for the Do-Nation giving dashboard.

## Development Setup
```bash
npm start  # Runs on http://localhost:3000
```

## API Integration
- All API calls go to `process.env.REACT_APP_API_URL || 'http://localhost:3002'`
- Authentication uses JWT tokens stored in localStorage
- See `src/services/api.js` for API client configuration

## When Working on Full-Stack Features
1. Start backend first: `cd /Users/josephheath/giving-dashboard && npm start`
2. Start frontend: `cd /Users/josephheath/donation-dashboard && npm start`
3. Update SHARED_API_SPECS.md with new endpoints
4. Test API with Postman before frontend integration

## DEPLOYMENT INSTRUCTIONS - CRITICAL
**IMPORTANT**: Do NOT use `npm run deploy` or GitHub Pages deployment!

### 🚨 CRITICAL NGINX CONFIGURATION 🚨
**⚠️ NGINX SERVES FROM A SYMLINK - MUST UNDERSTAND THIS! ⚠️**
- **Nginx document root**: `/var/www/do-nation.space` (THIS IS A SYMLINK!)
- **Actual deployment directory**: `/var/www/donation-dashboard/`
- **The symlink**: `/var/www/do-nation.space` → `/var/www/donation-dashboard`
- **NEVER** delete the symlink or deploy directly to `/var/www/do-nation.space/`
- **ALWAYS** deploy to `/var/www/donation-dashboard/`
- **See**: `/Users/josephheath/donation-dashboard/docs/DEPLOYMENT_CRITICAL.md` for full details

### Correct Frontend Deployment Process (FOLLOW EXACTLY):
1. **Build locally with production env**: 
   ```bash
   REACT_APP_API_BASE_URL=https://do-nation.space REACT_APP_API_URL=https://do-nation.space/api npm run build
   ```
2. **Copy build to server**:
   ```bash
   rsync -avz build/ do-nation-server:/home/ubuntu/build/
   ```
3. **Deploy on server to CORRECT directory**:
   ```bash
   ssh do-nation-server "sudo rsync -avz --delete /home/ubuntu/build/ /var/www/donation-dashboard/"
   ```
4. **Set permissions**:
   ```bash
   ssh do-nation-server "sudo chown -R www-data:www-data /var/www/donation-dashboard && sudo chmod -R 755 /var/www/donation-dashboard"
   ```
5. **Verify symlink exists** (CRITICAL!):
   ```bash
   ssh do-nation-server "ls -la /var/www/ | grep do-nation.space"
   # Should show: lrwxrwxrwx ... do-nation.space -> /var/www/donation-dashboard
   # If not, run: ssh do-nation-server "sudo ln -sf /var/www/donation-dashboard /var/www/do-nation.space"
   ```
6. **Reload nginx**:
   ```bash
   ssh do-nation-server "sudo systemctl reload nginx"
   ```
7. **Verify deployment**:
   ```bash
   curl -I https://do-nation.space | head -1
   # Should show: HTTP/1.1 200 OK
   ```
8. **Production URL**: https://do-nation.space (NOT GitHub Pages)

### Git Workflow:
- **Push code**: `git push origin <branch-name>` (YES - always push to GitHub)
- **Deploy**: Follow COMPLETE_DEPLOYMENT_GUIDE.md (NO GitHub Pages)
- The `npm run deploy` script in package.json should NOT be used - it deploys to GitHub Pages which we don't use

### Server Details:
- **Server**: ubuntu@54.156.33.223
- **Frontend Deploy To**: /var/www/donation-dashboard (⚠️ ACTUAL DIRECTORY)
- **Nginx Serves From**: /var/www/do-nation.space (⚠️ SYMLINK to donation-dashboard!)
- **NEVER Deploy To**: /var/www/html/ or /var/www/do-nation.space/ directly
- **Backend Directory**: /home/ubuntu/giving-dashboard
- **SSH Key**: /Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem
- **SSH Config Alias**: do-nation-server (configured in ~/.ssh/config)
- **Critical Doc**: See /Users/josephheath/donation-dashboard/docs/DEPLOYMENT_CRITICAL.md

## 🚨 CRITICAL: CASA Security Compliance Standards (Frontend) 🚨

### ⛔ NEVER DO THE FOLLOWING (CASA Violations):

#### 1. **Sensitive Data & Storage**
- **NEVER** store sensitive data in localStorage (use httpOnly cookies or sessionStorage)
- **NEVER** log API keys, tokens, or user passwords to console
- **NEVER** expose API keys in React environment variables (they're visible in build)
- **NEVER** store credit card details or payment info in state/storage
- **NEVER** commit .env files with production values
- **NEVER** include sensitive data in React DevTools visible state

#### 2. **API Security**
- **NEVER** make API calls without proper authentication headers
- **NEVER** trust data from API responses without validation
- **NEVER** expose internal API endpoints in error messages
- **NEVER** disable HTTPS in production builds
- **NEVER** skip CSRF token validation for state-changing operations
- **ALWAYS** use the csrfServiceAPI from src/services/api.service.js

#### 3. **Input Validation & XSS Prevention**
- **NEVER** use dangerouslySetInnerHTML without sanitization
- **NEVER** render user input directly without escaping
- **NEVER** eval() user input or use Function constructor with user data
- **NEVER** trust URL parameters without validation
- **NEVER** allow HTML/script tags in user input fields
- **ALWAYS** sanitize rich text content before rendering

#### 4. **Authentication & Authorization**
- **NEVER** store passwords in plain text (even temporarily)
- **NEVER** expose JWT tokens in URLs or query parameters
- **NEVER** implement "remember me" with sensitive data in cookies
- **NEVER** auto-fill password fields with stored values
- **NEVER** log authentication tokens or session data
- **ALWAYS** clear sensitive data on logout

#### 5. **Content Security**
- **NEVER** load scripts from untrusted CDNs
- **NEVER** use inline scripts without CSP nonce
- **NEVER** disable React's built-in XSS protection
- **NEVER** load external resources over HTTP in production
- **NEVER** embed third-party content without validation

### ✅ ALWAYS DO THE FOLLOWING (CASA Requirements):

#### 1. **Before Making Changes**
- Verify no sensitive data is exposed in browser DevTools
- Check Network tab doesn't show sensitive data in requests
- Ensure console has no security-related warnings
- Test authentication flows remain secure

#### 2. **When Handling User Input**
- Validate all form inputs before submission
- Sanitize data before rendering
- Use controlled components for forms
- Implement proper error boundaries
- Escape special characters in display

#### 3. **When Managing State**
- Clear sensitive data from Redux/Context on logout
- Don't store passwords in component state
- Use sessionStorage for temporary sensitive data
- Implement proper cleanup in useEffect
- Avoid storing tokens in Redux DevTools-visible state

#### 4. **API Integration**
- Always include CSRF tokens for POST/PUT/DELETE
- Implement request/response interceptors for auth
- Handle 401/403 responses properly
- Never expose full error details to users
- Use environment-specific API endpoints

#### 5. **Production Builds**
- Ensure source maps are disabled in production
- Verify no console.log statements remain
- Check bundle size for accidentally included dev dependencies
- Validate all environment variables are production-ready
- Test Content Security Policy compliance

### 🔒 Frontend Security Checklist

Before committing ANY code:
- [ ] No sensitive data in localStorage
- [ ] No API keys or secrets in code
- [ ] No console.log with sensitive data
- [ ] All user inputs are validated
- [ ] No dangerouslySetInnerHTML without sanitization
- [ ] CSRF tokens included for state-changing operations
- [ ] Authentication tokens in httpOnly cookies or Authorization headers
- [ ] No inline scripts or styles
- [ ] All external resources use HTTPS
- [ ] Proper error handling without exposing system details

### 📊 Current Frontend CASA Compliance

| Security Requirement | Status | Notes |
|---------------------|---------|-------|
| XSS Prevention | ✅ Active | React escaping + input validation |
| CSRF Protection | ⚠️ Partial | csrfServiceAPI ready, backend needs fix |
| Secure Storage | ⚠️ Needs Review | Some tokens still in localStorage |
| Input Validation | ✅ Implemented | All forms have validation |
| HTTPS Only | ✅ Enforced | Production uses HTTPS |
| CSP Compliance | ⚠️ Partial | Some inline styles need fixing |
| Secure Auth | ✅ Active | JWT with httpOnly cookies planned |
| API Security | ✅ Active | Interceptors and error handling |

### 🔐 Handling CSRF Tokens (When Backend Fixed)

```javascript
// Always use this pattern for state-changing operations:
import { csrfServiceAPI } from '../services/api.service';

// Before making POST/PUT/DELETE requests:
const token = await csrfServiceAPI.getToken();
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### 🛑 Security Violations Will Result In:
1. **Failed CASA security audit**
2. **Vulnerability to XSS/CSRF attacks**
3. **Potential data breaches**
4. **Loss of user trust**
5. **Legal liability**

### 📝 Security Resources
- OWASP React Security Cheatsheet
- Backend security requirements: `/Users/josephheath/giving-dashboard/CLAUDE.md`
- Security testing guide: Run security audit with `npm audit`

**Remember: Frontend security is the first line of defense. Every component must be secure by default.**