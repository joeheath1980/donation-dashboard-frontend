# Admin Access Guide for Do-Nation

## Current Admin Access
- **URL**: https://do-nation.space/admin
- **Access**: Login with admin credentials, then navigate to /admin
- **Protection**: Role-based authentication (user.role must be 'admin')

## Security Recommendations

### 1. Short-term Improvements (Keep current setup)
- Add environment variable to hide/show admin routes
- Implement admin activity logging
- Add session timeout for admin users
- Use different session storage for admin vs regular users

### 2. Medium-term Solution (Subdomain)
Set up admin.do-nation.space:
```nginx
server {
    server_name admin.do-nation.space;
    
    # IP whitelist
    allow 123.456.789.0/24;  # Office IP
    allow 98.765.432.1;      # Home IP
    deny all;
    
    location / {
        proxy_pass http://localhost:3003;  # Separate admin app
    }
}
```

### 3. Best Practice (Separate Platform)

#### A. Create Separate Admin App
```bash
# New repository: do-nation-admin
npx create-react-app do-nation-admin
cd do-nation-admin

# Install admin-specific packages
npm install @mui/x-data-grid recharts
```

#### B. Enhanced Security Features
```javascript
// src/security/AdminAuth.js
const AdminAuth = {
  // 1. Two-Factor Authentication
  async verify2FA(token) {
    // Implement TOTP verification
  },
  
  // 2. IP Whitelist Check
  async checkIPWhitelist(req) {
    const allowedIPs = process.env.ADMIN_ALLOWED_IPS.split(',');
    return allowedIPs.includes(req.ip);
  },
  
  // 3. Admin Session Management
  createSecureSession(user) {
    return {
      ...user,
      sessionExpiry: Date.now() + (30 * 60 * 1000), // 30 min
      requiresReauth: true
    };
  }
};
```

#### C. Deployment Configuration
```yaml
# docker-compose.admin.yml
services:
  admin-frontend:
    build: ./do-nation-admin
    environment:
      - REACT_APP_API_URL=http://admin-api:3002
      - REACT_APP_REQUIRE_2FA=true
    networks:
      - admin-network
    
  admin-api:
    build: ./giving-dashboard
    environment:
      - ADMIN_MODE=true
      - REQUIRE_IP_WHITELIST=true
    networks:
      - admin-network
```

## Implementation Steps

### Phase 1: Enhance Current Setup (1 day)
1. Add environment variable to conditionally load admin routes
2. Create admin activity audit log
3. Implement admin session timeout

### Phase 2: Move to Subdomain (3-5 days)
1. Set up admin.do-nation.space subdomain
2. Configure nginx with IP restrictions
3. Deploy same app but with ADMIN_MODE flag
4. Add 2FA for admin users

### Phase 3: Separate Platform (1-2 weeks)
1. Create new repository for admin dashboard
2. Build dedicated admin UI with advanced features
3. Implement enhanced security (2FA, IP whitelist, audit logs)
4. Deploy on separate infrastructure
5. Consider using admin frameworks like:
   - React Admin
   - Retool (low-code option)
   - Forest Admin

## Quick Admin Features to Add

### 1. Admin Activity Dashboard
```javascript
// Track all admin actions
const logAdminAction = async (action, details) => {
  await db.collection('adminLogs').insert({
    userId: currentUser.id,
    action,
    details,
    ip: req.ip,
    timestamp: new Date(),
    userAgent: req.headers['user-agent']
  });
};
```

### 2. Environment-based Route Loading
```javascript
// In App.js
{process.env.REACT_APP_ENABLE_ADMIN === 'true' && (
  <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
)}
```

### 3. Admin Notifications
```javascript
// Notify all admins of critical actions
const notifyAdmins = async (event) => {
  const admins = await getAdminUsers();
  await sendEmail(admins, {
    subject: `Admin Alert: ${event.type}`,
    body: `${event.user} performed ${event.action} at ${event.time}`
  });
};
```

## Security Checklist

- [ ] No visible admin links in public UI
- [ ] Admin routes require authentication + role check
- [ ] Admin sessions expire after inactivity
- [ ] All admin actions are logged
- [ ] 2FA enabled for admin accounts
- [ ] IP whitelist for admin access
- [ ] Separate admin subdomain/domain
- [ ] Regular security audits
- [ ] Encrypted admin session storage
- [ ] Rate limiting on admin endpoints

## Emergency Access

In case of emergency admin access issues:

1. **SSH Access**: Connect directly to server
   ```bash
   ssh -i donation-key2.pem ubuntu@54.156.33.223
   ```

2. **Database Admin**: Use MongoDB Atlas UI or:
   ```bash
   mongo "mongodb+srv://cluster.mongodb.net/mydb" --username admin
   ```

3. **Create Emergency Admin**:
   ```javascript
   // Run in backend console
   const user = await User.create({
     email: 'emergency@admin.com',
     role: 'admin',
     isVerified: true,
     // Set temporary password
   });
   ```

Remember: Admin access is the most critical security concern. Start with quick wins (Phase 1) while planning for better separation (Phase 3).