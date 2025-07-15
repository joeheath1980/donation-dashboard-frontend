# Troubleshooting Forwarded Emails Display

## Changes Made

1. **Updated ForwardingStatus component** to use the centralized API service (`apiClient`) instead of axios directly
2. **Added proper authentication handling** with token validation before API calls
3. **Improved error messages** to be more specific about what went wrong
4. **Added refresh mechanism** when the component becomes visible
5. **Added login link** in error messages when authentication is required

## How to Test

1. **Open Browser Developer Console** (F12)
2. **Navigate to the Activity page**
3. **Click "Show Forwarded Emails"**
4. **Check the console for debug messages**:
   - Look for messages starting with `[ForwardingStatus]`
   - Check if token exists: `hasToken: true/false`
   - Check API response status
   - Look for any error messages

## Common Issues and Solutions

### Issue 1: "You need to log in again to view forwarded emails"
**Cause**: Authentication token is invalid or expired
**Solution**: 
- Log out completely
- Clear browser cache/cookies
- Log in again
- Navigate back to Activity page

### Issue 2: No emails showing despite successful API call
**Cause**: The API might be returning an empty array
**Solution**: 
- Check if you have actually forwarded any emails
- Verify the forwarding email address is correct
- Check the backend logs to see if emails are being processed

### Issue 3: "Network error" or connection issues
**Cause**: Frontend can't reach the backend API
**Solution**: 
- Verify the API URL in your .env file: `REACT_APP_API_BASE_URL`
- Check if the backend server is running
- Look for CORS errors in the console

### Issue 4: Component not refreshing after login
**Cause**: The component might be caching old state
**Solution**: 
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- The component now refreshes when you toggle visibility

## Debug Information to Collect

When reporting issues, please provide:

1. **Console logs** - Copy all messages from the developer console
2. **Network tab** - Screenshot of the `/api/email/forward-status` request
3. **Response data** - The response from the API call
4. **Browser info** - Browser and version
5. **Steps to reproduce** - Exact steps that lead to the issue

## Backend Verification

To verify the backend is working correctly:

```bash
# Test the API endpoint directly
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  "http://localhost:3002/api/email/forward-status?limit=10&skip=0"
```

Replace `YOUR_TOKEN_HERE` with your actual JWT token from localStorage.

## Additional Notes

- The forwarding status is hidden by default. Users need to click "Show Forwarded Emails" to see them.
- The component now uses the same authentication system as the rest of the app.
- If you're still having issues after following these steps, check the backend logs for any errors in processing forwarded emails.