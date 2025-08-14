console.log(`
=== Debugging 400 Login Error ===

To debug this issue, please:

1. Open Chrome DevTools (F12)
2. Go to the Network tab
3. Try to login with a demo user
4. Click on the failed "login" request
5. Check the following:

REQUEST DETAILS:
- URL: What's the exact URL being called?
- Method: Should be POST
- Request Headers: Check Content-Type (should be application/json)
- Request Payload: What data is being sent?

Expected payload for regular users:
{
  "email": "demo-user-1@example.com",
  "password": "demo123"
}

For businesses/charities, it should include accountType:
{
  "email": "business@example.com",
  "password": "password",
  "accountType": "business"
}

RESPONSE DETAILS:
- Status: 400 Bad Request
- Response body: What's the error message?

Common causes of 400 errors:
1. Missing required fields (email/password)
2. Invalid JSON format
3. Wrong Content-Type header
4. Extra fields that backend doesn't expect
5. Backend expecting different field names

Also check:
- Are you testing on https://do-nation.space or http://localhost:3000?
- Is the backend running and accessible?
`);