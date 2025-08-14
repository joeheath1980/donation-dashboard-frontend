# Admin Authentication Deployment Steps

## What Was Updated

1. **AuthContext.js** - Updated to handle new token format:
   - Stores both `accessToken` and `refreshToken`
   - Automatic token refresh on 401 errors
   - Admin user detection and proper routing
   - Support for `/api/users/me` endpoint

2. **App.js** - Already updated to check both `role === 'admin'` and `isAdmin === true`

3. **Login.js** - Already properly redirects admins to `/admin`

## Manual Deployment Steps

### Step 1: Build Frontend
```bash
cd /Users/josephheath/donation-dashboard
npm run build
```

### Step 2: Deploy to Server
```bash
# Create archive
tar -czf build.tar.gz -C build .

# Upload to server
scp -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" build.tar.gz ubuntu@54.156.33.223:/tmp/

# SSH and extract
ssh -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" ubuntu@54.156.33.223
cd /tmp
sudo rm -rf /var/www/donation-dashboard/build/*
sudo tar -xzf build.tar.gz -C /var/www/donation-dashboard/build
sudo chown -R www-data:www-data /var/www/donation-dashboard/build
rm build.tar.gz
sudo systemctl reload nginx
exit

# Clean up local archive
rm build.tar.gz
```

### Step 3: Test Admin Login

1. Go to: https://do-nation.space/login
2. Select "Personal Account" from dropdown (backend will detect admin by email)
3. Login with:
   - Email: `admin@example.com`
   - Password: `adminpassword123`
4. You should be redirected to `/admin`

## What to Expect

- The login will now properly handle the JWT tokens
- Admin users will be automatically detected
- Tokens will auto-refresh when expired (15 min lifetime)
- The admin dashboard at `/admin` will be accessible

## Troubleshooting

If login still fails with 400:
1. Ensure the admin user exists in MongoDB
2. Check that the password hash is correct
3. Verify CORS is set up for your domain

If you get 401 after login:
1. Check browser DevTools > Application > Local Storage
2. Verify `authToken` and `refreshToken` are stored
3. Check Network tab to see if Authorization header is sent

## Quick Test

You can test the auth directly:
```bash
curl -X POST https://do-nation.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpassword123"}'
```

This should return:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "isAdmin": true,
    "role": "admin",
    ...
  }
}
```