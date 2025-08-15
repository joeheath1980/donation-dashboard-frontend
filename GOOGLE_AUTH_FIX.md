# Google OAuth Redirect Fix

## Problem
Google OAuth is failing because the redirect URIs are misconfigured between development and production environments.

## Root Cause
1. Backend `.env` file has `GOOGLE_REDIRECT_URI=http://localhost:3002/api/auth/google/callback`
2. PM2 ecosystem config was missing the production redirect URI
3. Google Cloud Console needs both development and production redirect URIs

## Fixes Applied

### 1. Backend - ecosystem.config.js
Added production Google OAuth configuration:
```javascript
GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'https://do-nation.space/api/auth/google/callback',
GOOGLE_APPLICATION_NAME: process.env.GOOGLE_APPLICATION_NAME || 'Do-Nation',
```

### 2. Backend - .env.example
Updated to show correct production values:
```
GOOGLE_REDIRECT_URI=https://do-nation.space/api/auth/google/callback
GOOGLE_APPLICATION_NAME=Do-Nation
```

## Required Google Cloud Console Configuration

### Step 1: Access Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Select your project (Do-Nation or similar)
3. Navigate to APIs & Services > Credentials
4. Click on your OAuth 2.0 Client ID

### Step 2: Update Authorized Redirect URIs
Add BOTH of these URIs to the "Authorized redirect URIs" section:
- `http://localhost:3002/api/auth/google/callback` (for development)
- `https://do-nation.space/api/auth/google/callback` (for production)

### Step 3: Update Authorized JavaScript Origins (if needed)
Ensure these are in "Authorized JavaScript origins":
- `http://localhost:3000` (for development frontend)
- `http://localhost:3002` (for development backend)
- `https://do-nation.space` (for production)

### Step 4: Save Changes
Click "Save" at the bottom of the OAuth client configuration page.

## Deployment Steps

### 1. Deploy Backend with Updated Config
```bash
cd /Users/josephheath/giving-dashboard
git add ecosystem.config.js .env.example
git commit -m "fix: update Google OAuth redirect URIs for production"
git push origin main

# Deploy to server
ssh -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" ubuntu@54.156.33.223
cd /home/ubuntu/giving-dashboard
git pull
pm2 restart giving-dashboard
```

### 2. Verify Production Environment Variables
On the server, check that PM2 is using the correct values:
```bash
pm2 env giving-dashboard | grep GOOGLE
```

## Testing

### Local Testing
1. Ensure `.env` has: `GOOGLE_REDIRECT_URI=http://localhost:3002/api/auth/google/callback`
2. Start backend: `npm start`
3. Start frontend: `cd ../donation-dashboard && npm start`
4. Try Google login at http://localhost:3000/login

### Production Testing
1. Visit https://do-nation.space/login
2. Click "Continue with Google"
3. Should redirect to Google OAuth
4. After authorization, should redirect back to https://do-nation.space/auth/google/callback
5. Frontend should handle the callback and complete login

## Troubleshooting

### Error: "redirect_uri_mismatch"
This means the redirect URI in the request doesn't match what's configured in Google Cloud Console.
- Check the exact URI in the error message
- Add that exact URI to Google Cloud Console

### Error: "Invalid state parameter"
The state parameter is used for CSRF protection.
- Ensure `GOOGLE_APPLICATION_NAME` is set consistently
- Default value is "Do-Nation"

### Frontend Not Handling Callback
Check that the frontend route exists:
- Route: `/auth/google/callback`
- Component: `GoogleAuthCallback`
- Should extract token from URL params and call `socialLogin`

## Security Notes

1. **Never commit real OAuth credentials** to version control
2. **Use different OAuth clients** for development and production if possible
3. **Always validate the state parameter** to prevent CSRF attacks
4. **Use HTTPS in production** for all OAuth flows

## Related Files
- Backend: `/Users/josephheath/giving-dashboard/src/routes/googleAuth.js`
- Backend Config: `/Users/josephheath/giving-dashboard/ecosystem.config.js`
- Frontend Callback: `/Users/josephheath/donation-dashboard/src/components/GoogleAuthCallback.js`
- Frontend Login: `/Users/josephheath/donation-dashboard/src/components/Login.js`