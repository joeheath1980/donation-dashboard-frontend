# 🚨 CRITICAL DEPLOYMENT INFORMATION - DO-NATION FRONTEND 🚨

## ⚠️ NGINX CONFIGURATION - MUST READ! ⚠️

### THE CRITICAL DETAIL YOU MUST KNOW

**Nginx serves from**: `/var/www/do-nation.space`  
**We deploy to**: `/var/www/donation-dashboard`  
**Solution**: A SYMLINK connects them: `/var/www/do-nation.space` → `/var/www/donation-dashboard`

### ❌ NEVER DO THIS:
```bash
# WRONG - This will break the site!
sudo rm -rf /var/www/do-nation.space  # DO NOT DELETE THE SYMLINK!
sudo mkdir /var/www/do-nation.space    # DO NOT CREATE A DIRECTORY!
```

### ✅ ALWAYS DO THIS:
```bash
# Deploy to the actual directory
sudo rsync -avz --delete /home/ubuntu/build/ /var/www/donation-dashboard/

# Verify the symlink exists
ls -la /var/www/ | grep do-nation.space
# Should show: lrwxrwxrwx ... do-nation.space -> /var/www/donation-dashboard

# If symlink is missing, recreate it:
sudo ln -sf /var/www/donation-dashboard /var/www/do-nation.space
```

## Server Configuration Details

### Nginx Configuration
- **Config file**: `/etc/nginx/sites-available/default`
- **Document root**: `/var/www/do-nation.space` (symlink)
- **Actual files**: `/var/www/donation-dashboard/`
- **Server name**: `do-nation.space`

### Directory Structure
```
/var/www/
├── donation-dashboard/          # ← ACTUAL FILES HERE
│   ├── index.html
│   ├── static/
│   │   ├── js/
│   │   ├── css/
│   │   └── media/
│   └── [other files]
├── do-nation.space              # ← SYMLINK (points to donation-dashboard)
└── html/                        # ← IGNORE THIS (not used)
```

## Deployment Verification Checklist

After EVERY deployment, verify these:

### 1. Check Symlink Exists
```bash
ssh do-nation-server "ls -la /var/www/ | grep do-nation.space"
```
**Expected output**: `lrwxrwxrwx ... do-nation.space -> /var/www/donation-dashboard`

### 2. Check Files Are Deployed
```bash
ssh do-nation-server "ls -la /var/www/donation-dashboard/"
```
**Expected**: See index.html, static/, and recent timestamps

### 3. Check Nginx Is Serving Correct Files
```bash
ssh do-nation-server "grep root /etc/nginx/sites-available/default | grep -v '#'"
```
**Expected**: `root /var/www/do-nation.space;`

### 4. Check Website Is Accessible
```bash
curl -I https://do-nation.space
```
**Expected**: `HTTP/1.1 200 OK`

### 5. Check Correct JS File Is Served
```bash
curl -s https://do-nation.space | grep -o 'main\.[^.]*\.js'
```
**Expected**: Should match the file in `/var/www/donation-dashboard/static/js/`

## Common Issues and Fixes

### Issue 1: "404 Not Found" After Deployment
**Cause**: Symlink is broken or missing  
**Fix**:
```bash
ssh do-nation-server
sudo ln -sf /var/www/donation-dashboard /var/www/do-nation.space
sudo systemctl reload nginx
```

### Issue 2: Old Version Still Showing
**Cause**: Deployed to wrong directory  
**Check**:
```bash
ssh do-nation-server "ls -la /var/www/do-nation.space/"
# If it's a directory (not symlink), you deployed to wrong place
```
**Fix**:
```bash
ssh do-nation-server
sudo rm -rf /var/www/do-nation.space  # Remove directory
sudo ln -sf /var/www/donation-dashboard /var/www/do-nation.space  # Create symlink
sudo rsync -avz --delete /home/ubuntu/build/ /var/www/donation-dashboard/
```

### Issue 3: Permission Denied
**Cause**: Wrong ownership  
**Fix**:
```bash
ssh do-nation-server
sudo chown -R www-data:www-data /var/www/donation-dashboard
sudo chmod -R 755 /var/www/donation-dashboard
```

## Correct Deployment Script

Save this as `deploy-frontend-correct.sh`:

```bash
#!/bin/bash

echo "=== Do-Nation Frontend Deployment (WITH SYMLINK CHECK) ==="

# Build locally
echo "Building frontend..."
REACT_APP_API_BASE_URL=https://do-nation.space \
REACT_APP_API_URL=https://do-nation.space/api \
npm run build

# Upload to server
echo "Uploading to server..."
rsync -avz build/ do-nation-server:/home/ubuntu/build/

# Deploy with symlink verification
echo "Deploying with symlink check..."
ssh do-nation-server << 'EOF'
    echo "Checking symlink..."
    if [ ! -L "/var/www/do-nation.space" ]; then
        echo "WARNING: Symlink missing! Creating it now..."
        sudo ln -sf /var/www/donation-dashboard /var/www/do-nation.space
    else
        echo "✓ Symlink exists"
    fi
    
    echo "Deploying files to /var/www/donation-dashboard/..."
    sudo rsync -avz --delete /home/ubuntu/build/ /var/www/donation-dashboard/
    
    echo "Setting permissions..."
    sudo chown -R www-data:www-data /var/www/donation-dashboard
    sudo chmod -R 755 /var/www/donation-dashboard
    
    echo "Cleaning up..."
    rm -rf /home/ubuntu/build
    
    echo "Reloading nginx..."
    sudo systemctl reload nginx
    
    echo "Verifying deployment..."
    if curl -s -o /dev/null -w "%{http_code}" https://do-nation.space | grep -q "200"; then
        echo "✓ Site is accessible"
    else
        echo "✗ Site may be down - check nginx logs"
    fi
EOF

echo "=== Deployment Complete ==="
```

## Critical Commands Reference

### Check Everything Is Correct
```bash
ssh do-nation-server "ls -la /var/www/ | grep -E '(donation|do-nation)' && echo '---' && grep root /etc/nginx/sites-available/default | grep -v '#' && echo '---' && curl -I https://do-nation.space | head -1"
```

### Fix Everything If Broken
```bash
ssh do-nation-server "sudo ln -sf /var/www/donation-dashboard /var/www/do-nation.space && sudo systemctl reload nginx"
```

### Emergency Rollback
```bash
ssh do-nation-server "sudo rsync -av /var/www/donation-dashboard.backup.$(date +%Y%m%d)* /var/www/donation-dashboard/"
```

## DO NOT FORGET

1. **Nginx serves from**: `/var/www/do-nation.space` (SYMLINK)
2. **Deploy files to**: `/var/www/donation-dashboard/` (ACTUAL DIRECTORY)
3. **The symlink MUST exist** or the site will break
4. **Never deploy to** `/var/www/html/` or `/var/www/do-nation.space/` directly
5. **Always verify** the symlink exists after deployment

## Contact for Emergencies

If the site is completely broken:
1. Check the symlink: `ssh do-nation-server "ls -la /var/www/do-nation.space"`
2. Check nginx error logs: `ssh do-nation-server "sudo tail -100 /var/log/nginx/error.log"`
3. Recreate symlink if needed: `ssh do-nation-server "sudo ln -sf /var/www/donation-dashboard /var/www/do-nation.space"`
4. Reload nginx: `ssh do-nation-server "sudo systemctl reload nginx"`

---
**Last Updated**: August 16, 2025  
**Reason**: Discovered nginx serves from symlink, not the actual deployment directory