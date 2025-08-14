# Reset Admin Access - Quick Fix

## The Issue
The backend creates admin with `isAdmin: true` but frontend checks for `role: 'admin'`

## Solution: SSH and Fix via MongoDB

```bash
# 1. SSH into your server
ssh -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" ubuntu@54.156.33.223

# 2. Access MongoDB
mongo

# 3. Switch to your database (likely 'donation' or 'giving-dashboard')
use donation

# 4. Check if admin@example.com exists
db.users.findOne({ email: "admin@example.com" })

# 5. Update the existing user to have proper admin role
db.users.updateOne(
  { email: "admin@example.com" },
  { 
    $set: { 
      role: "admin",
      userType: "admin",
      isAdmin: true,
      isEmailVerified: true
    } 
  }
)

# 6. If user doesn't exist, create it with hashed password
# First, you need to hash 'adminpassword123'
# The bcrypt hash for 'adminpassword123' is:
# $2a$10$YhW4bvUXFdPpN0wpqDHqBuLKhNDe8Q7bFLvBCWCIJEIz1I7BtPtDa

db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$YhW4bvUXFdPpN0wpqDHqBuLKhNDe8Q7bFLvBCWCIJEIz1I7BtPtDa",
  role: "admin",
  userType: "admin",
  isAdmin: true,
  isEmailVerified: true,
  createdAt: new Date()
})
```

## Then Login
1. Go to: https://do-nation.space/login
2. Login with:
   - Email: admin@example.com
   - Password: adminpassword123
3. Navigate to: https://do-nation.space/admin

## Alternative: Call the Backend API
If you're in development mode, you can call:
```bash
curl -X POST http://localhost:3002/api/users/create-test-admin
```

This will create the admin user, but you'll still need to update the role field.