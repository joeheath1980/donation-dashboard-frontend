# OAuth Backend Configuration Guide

## Issue
The Google OAuth callback is not redirecting to the frontend application after authentication.

## Current Flow
1. Frontend (port 3001) → Backend OAuth endpoint (port 3002)
2. Backend → Google OAuth
3. Google → Backend callback
4. Backend should redirect → Frontend callback (but currently stays on backend)

## Required Backend Configuration

### Environment Variables
Add these to your backend `.env` file:
```env
# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:3001

# For production
# FRONTEND_URL=https://your-app-domain.com
```

### OAuth Callback Handler
The backend OAuth callback handler should redirect to the frontend after processing:

```javascript
// Example backend code (Node.js/Express)
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    // Process OAuth callback
    const { code } = req.query;
    
    // Exchange code for tokens with Google
    const tokens = await exchangeCodeForTokens(code);
    
    // Create or update user
    const user = await findOrCreateUser(tokens);
    
    // Generate JWT token
    const jwtToken = generateJWT(user);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/auth/google/callback?token=${jwtToken}`);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
});
```

### Google OAuth Configuration
Ensure your Google OAuth app has the correct redirect URI:
- Development: `http://localhost:3002/api/auth/google/callback`
- Production: `https://your-api-domain.com/api/auth/google/callback`

## Frontend Routes
The frontend is already configured to handle the callback at:
- `/auth/google/callback` - Processes the token from URL params

## Testing the Fix
1. Click "Login with Google" on the frontend
2. Complete Google authentication
3. You should be redirected to: `http://localhost:3001/auth/google/callback?token=<JWT>`
4. The frontend will process the token and redirect to dashboard or activity page

## Alternative: Using Cookies
If URL parameters are not preferred, consider using httpOnly cookies:

```javascript
// Backend: Set cookie instead of URL param
res.cookie('auth_token', jwtToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});
res.redirect(`${frontendUrl}/auth/google/callback`);

// Frontend: Read cookie (requires backend API endpoint)
const response = await fetch('/api/auth/verify', {
  credentials: 'include'
});
```