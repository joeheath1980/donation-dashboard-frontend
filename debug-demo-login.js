// Debug script to understand the demo login flow

console.log(`
=== Demo Login Debug Guide ===

The 400 error suggests the backend is rejecting the login request. Here's what's happening:

1. Frontend clicks demo user card
2. Frontend calls POST /api/demo/quick-login with { userType: 'supporter', category: 'user' }
3. Backend returns { email: 'demo-user-1@example.com', password: 'demo123', userType: 'user' }
4. Frontend fills the form with these credentials
5. Frontend submits login with accountType = null (for regular users)
6. Login fails with 400 error

Possible causes:
1. The demo users don't exist in the database yet
2. The passwords aren't properly hashed
3. The login endpoint expects different data

To debug:
1. Check if demo users exist:
   cd /Users/josephheath/giving-dashboard
   node scripts/check-demo-users-full.js

2. If users don't exist, create them:
   node scripts/seed-demo-config-users-enhanced.js

3. Check the browser's Network tab to see exactly what's being sent in the login request

4. Check the backend logs to see why the login is failing

The login endpoint expects:
- For users: { email, password } (no accountType needed)
- For businesses: { email, password, accountType: 'business' }
- For charities: { email, password, accountType: 'charity' }
`);