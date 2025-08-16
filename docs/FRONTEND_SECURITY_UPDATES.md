# Frontend Security Updates Required for CASA Compliance

## Current Status vs Required Changes

### 1. ✅ CSRF Token Support (READY)
**Status**: Already implemented in `csrf.service.js`
**Action Required**: None - will work once backend CSRF is fixed
```javascript
// Already implemented and ready to use
import csrfService from './services/csrf.service';
```

### 2. ⚠️ JWT Token Storage (NEEDS UPDATE)
**Current**: Stored in localStorage (vulnerable to XSS)
**Required**: Move to httpOnly cookies or memory-only storage

**Option A: Memory-Only Storage (Immediate Fix)**
```javascript
// Update SecureTokenStorage in auth.utils.js
class SecureTokenStorage {
  static token = null; // Store in memory only
  
  static setToken(token) {
    this.token = token;
    // Don't store in localStorage
  }
  
  static getToken() {
    return this.token;
  }
}
```

**Option B: httpOnly Cookies (Best Security)**
- Backend sends token as httpOnly cookie
- Frontend doesn't handle token at all
- Requires backend changes to auth endpoints

### 3. ✅ Session Cookies (CONFIGURED)
**Status**: Backend now uses secure session cookies
**Frontend Impact**: 
- `withCredentials: true` already set in `api.service.js`
- Sessions will persist properly with Redis

### 4. ⚠️ Rate Limiting Feedback (SHOULD ADD)
**New Backend Limits**:
- Password change: 3 attempts/hour
- Forgot password: 2 attempts/hour
- Login: 5 attempts/15 min

**Recommended Frontend Changes**:
```javascript
// Show rate limit errors to users
if (error.response?.status === 429) {
  const message = error.response.data.message || 
    'Too many attempts. Please try again later.';
  showError(message);
  
  // Optional: Parse retry-after header
  const retryAfter = error.response.headers['retry-after'];
  if (retryAfter) {
    showError(`Please wait ${retryAfter} seconds before trying again.`);
  }
}
```

### 5. ⚠️ Security Headers (CHECK)
**CSP Nonce Support**: 
- Check for inline styles/scripts
- May need to refactor to external files

### 6. ✅ Input Validation (GOOD)
**Status**: Frontend validation exists
**Recommendation**: Keep as defense-in-depth

## Required Changes Summary

### High Priority (CASA Critical)
1. **Remove JWT from localStorage**
   - Update `SecureTokenStorage` to use memory only
   - OR wait for httpOnly cookie implementation

### Medium Priority (Recommended)
2. **Add Rate Limit UI Feedback**
   - Handle 429 status codes
   - Show user-friendly messages
   - Display retry timers

3. **Review CSP Compliance**
   - Remove inline styles
   - Remove inline scripts
   - Use external files or CSS-in-JS

### Low Priority (Nice to Have)
4. **Add Security Monitoring**
   - Log failed auth attempts
   - Track suspicious activity
   - Alert on security errors

## Implementation Steps

### Step 1: Update Token Storage (CRITICAL)
```javascript
// In src/utils/auth.utils.js
export class SecureTokenStorage {
  static token = null;
  static refreshToken = null;
  
  static setToken(token, refreshToken = null) {
    this.token = token;
    this.refreshToken = refreshToken;
    // Remove localStorage usage
  }
  
  static getToken() {
    return this.token;
  }
  
  static clearTokens() {
    this.token = null;
    this.refreshToken = null;
  }
}
```

### Step 2: Update Auth Context
```javascript
// In src/contexts/AuthContext.js
const logout = () => {
  // Clear memory tokens
  SecureTokenStorage.clearTokens();
  
  // Clear CSRF token
  csrfServiceAPI.clearToken();
  
  // Clear other data
  clearUserData();
  setUser(null);
};
```

### Step 3: Handle Rate Limiting
```javascript
// In src/services/api.service.js response interceptor
if (error.response?.status === 429) {
  const retryAfter = error.response.headers['retry-after'];
  const waitTime = retryAfter ? `${retryAfter} seconds` : 'some time';
  
  // Show user-friendly message
  toast.error(`Too many attempts. Please wait ${waitTime} and try again.`);
  
  // Optional: Disable form for retry period
  if (retryAfter) {
    setTimeout(() => {
      // Re-enable form
    }, retryAfter * 1000);
  }
}
```

## Testing Checklist

- [ ] Login works without localStorage
- [ ] Sessions persist across page refreshes (with Redis)
- [ ] Rate limit messages display correctly
- [ ] CSRF tokens included in POST/PUT/DELETE
- [ ] Logout clears all sensitive data
- [ ] No console errors about security
- [ ] CSP violations resolved

## Security Benefits

1. **XSS Protection**: Tokens in memory can't be stolen by XSS
2. **CSRF Protection**: Double-submit cookies pattern
3. **Session Security**: Redis-backed sessions with httpOnly cookies
4. **Rate Limit Protection**: Prevents brute force attacks
5. **Defense in Depth**: Multiple layers of security

## Timeline

1. **Immediate** (Before CASA): Update token storage to memory
2. **Next Sprint**: Implement httpOnly cookies properly
3. **Future**: Add security monitoring dashboard

## Notes

- The backend is ready for all these changes
- CSRF will work once backend fix is deployed
- Redis sessions will greatly improve user experience
- These changes align with OWASP best practices