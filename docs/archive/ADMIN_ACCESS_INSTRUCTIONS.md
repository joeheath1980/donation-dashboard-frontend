# Admin Access Instructions for Do-Nation

## How to Access the Admin Dashboard

### Step 1: Create an Admin User (Backend Required)

First, you need to create a user with admin role in your database. This must be done from the backend:

```bash
# SSH into your server
ssh -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" ubuntu@54.156.33.223

# Navigate to backend directory
cd /home/ubuntu/giving-dashboard

# Open MongoDB console or use your database GUI
# Create an admin user with role: 'admin'
```

Example MongoDB command:
```javascript
db.users.insertOne({
  email: "admin@do-nation.space",
  password: "$2b$10$hashedpasswordhere", // Use bcrypt to hash
  role: "admin",
  userType: "admin",
  isEmailVerified: true,
  createdAt: new Date()
})
```

### Step 2: Login as Admin

1. Go to: https://do-nation.space/login
2. Enter your admin credentials:
   - Email: [your admin email]
   - Password: [your admin password]
3. Click "Log In"

### Step 3: Navigate to Admin Panel

After successful login, manually type in the URL bar:

```
https://do-nation.space/admin
```

**Note**: There are NO visible links to the admin panel. You must type the URL directly.

### Step 4: Admin Dashboard Features

Once in the admin dashboard, you can:
- View all users
- Manage charity verifications
- Approve/reject charity linking requests
- View donation statistics
- Manage platform settings

## Creating Your First Admin User

### Option 1: Using Backend API (Recommended)

Create a temporary endpoint in your backend to create an admin:

```javascript
// In your backend routes (REMOVE AFTER USE)
router.post('/create-first-admin', async (req, res) => {
  // Only allow if no admins exist
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount > 0) {
    return res.status(403).json({ error: 'Admin already exists' });
  }
  
  const hashedPassword = await bcrypt.hash('YourSecurePassword123!', 10);
  const admin = await User.create({
    email: 'admin@do-nation.space',
    password: hashedPassword,
    role: 'admin',
    userType: 'admin',
    isEmailVerified: true
  });
  
  res.json({ message: 'Admin created', email: admin.email });
});
```

### Option 2: Direct Database Access

1. Access your MongoDB database (MongoDB Atlas or local)
2. Navigate to the `users` collection
3. Insert a new document with admin role

### Option 3: Modify Existing User

If you already have a regular user account:

```javascript
// In MongoDB console
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin", userType: "admin" } }
)
```

## Security Notes

1. **No Public Registration**: Admins cannot sign up through the public interface
2. **Role-Based Access**: The system checks `user.role === 'admin'`
3. **Hidden Route**: `/admin` is not linked anywhere in the UI
4. **Protected API**: Backend should verify admin role for all admin endpoints

## Troubleshooting

### "Not authorized" or Redirected to Login
- Ensure your user has `role: "admin"` in the database
- Check that you're logged in with the admin account
- Clear browser cache and cookies, then login again

### Admin Page Not Loading
- Check browser console for errors
- Ensure you typed exactly: `/admin` (not `/admin/` or other variations)
- Verify the AdminDashboard component exists in your build

### Can't Create Admin User
- You need backend/database access
- Ensure password is properly hashed with bcrypt
- Set `isEmailVerified: true` to skip email verification

## Quick Test

To verify admin access is working:

1. Check if admin route exists:
   - View page source of the app
   - Search for "admin" in the JavaScript bundle

2. Test role check:
   - Login as regular user
   - Try accessing /admin (should redirect)
   - Login as admin user
   - Access /admin (should show dashboard)

## Important Reminders

- **Keep Admin URL Secret**: Don't share the `/admin` URL publicly
- **Strong Passwords**: Use complex passwords for admin accounts
- **Regular Audits**: Periodically review who has admin access
- **Secure Creation**: Only create admin users through secure backend methods
- **No Frontend Creation**: Never add admin creation to the public signup flow

## For Developers

The admin authentication flow:
1. User logs in at `/login`
2. Backend returns JWT with `role: "admin"`
3. Token stored in localStorage
4. When accessing `/admin`, `AdminRoute` component checks:
   ```javascript
   const isAdmin = user && user.role === USER_TYPES.ADMIN;
   ```
5. If not admin, redirects to `/login`
6. If admin, renders `AdminDashboard` component

Remember: The security of your admin panel depends on:
- Secure admin user creation (backend only)
- Strong passwords
- Keeping the `/admin` URL private
- Regular security audits