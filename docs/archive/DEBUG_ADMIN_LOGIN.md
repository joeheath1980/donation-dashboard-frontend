# Debug Admin Login Issue

## The Problem
Getting 400 Bad Request when trying to login with admin@example.com

## Quick Fix via MongoDB

### Option 1: Update Existing User
```bash
# SSH into server
ssh -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" ubuntu@54.156.33.223

# Access MongoDB
mongo

# Check which database to use
show dbs

# Use your database (likely one of these)
use donation
# or
use giving-dashboard
# or
use donationDB

# Check if admin user exists
db.users.findOne({ email: "admin@example.com" })

# If exists, update it
db.users.updateOne(
  { email: "admin@example.com" },
  { 
    $set: { 
      role: "admin",
      userType: "admin",
      isAdmin: true,
      isEmailVerified: true,
      password: "$2a$10$YhW4bvUXFdPpN0wpqDHqBuLKhNDe8Q7bFLvBCWCIJEIz1I7BtPtDa"
    } 
  }
)
```

### Option 2: Create New Admin User
```javascript
// If user doesn't exist, create it
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$YhW4bvUXFdPpN0wpqDHqBuLKhNDe8Q7bFLvBCWCIJEIz1I7BtPtDa",
  role: "admin",
  userType: "admin",
  isAdmin: true,
  isEmailVerified: true,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Option 3: Create Your Own Admin
```javascript
// Create admin with your email
db.users.insertOne({
  name: "Joseph Heath",
  email: "your-email@example.com",  // Use your actual email
  password: "$2a$10$YhW4bvUXFdPpN0wpqDHqBuLKhNDe8Q7bFLvBCWCIJEIz1I7BtPtDa", // This is hash for "adminpassword123"
  role: "admin",
  userType: "admin",
  isAdmin: true,
  isEmailVerified: true,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Check Backend Logs

```bash
# On server
cd /home/ubuntu/giving-dashboard
pm2 logs

# Or check specific log
tail -f logs/error.log
```

## Common Issues

1. **User doesn't exist** - Create it using commands above
2. **Wrong password hash** - Use the hash provided above
3. **Missing required fields** - Make sure all fields are set
4. **Wrong database** - Check you're using the correct database name

## Test the API Directly

```bash
# From your local machine
curl -X POST https://do-nation.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpassword123"}'
```

This will show the exact error from the backend.

## Alternative: Create Admin via Backend Route

If the test admin route exists:
```bash
curl -X POST https://do-nation.space/api/users/create-test-admin
```

## Password Hash Reference
The bcrypt hash for "adminpassword123" is:
`$2a$10$YhW4bvUXFdPpN0wpqDHqBuLKhNDe8Q7bFLvBCWCIJEIz1I7BtPtDa`

You can verify this works by testing with any bcrypt library.