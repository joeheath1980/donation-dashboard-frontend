# Frontend Deployment Guide for Do-Nation

This guide provides complete instructions for deploying the Do-Nation frontend to production.

## Prerequisites

- SSH access to the server (54.156.33.223)
- SSH key file: `/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem`
- Node.js and npm installed locally

## Important: Nginx Configuration

**⚠️ CRITICAL: Nginx is configured to serve files from `/var/www/donation-dashboard/` NOT `/var/www/donation-dashboard/build/`**

Files must be deployed directly to `/var/www/donation-dashboard/` for the website to work correctly.

## Step 1: Build the Frontend Locally

Navigate to your frontend project directory:

```bash
cd /Users/josephheath/donation-dashboard
```

Install dependencies (if needed):

```bash
npm install
```

Run the production build:

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Step 2: Deploy to Server

### Option A: Deploy from Current Directory

If you're in the donation-dashboard directory, you can run these commands directly:

```bash
# Create temporary directory on server
ssh -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" ubuntu@54.156.33.223 "mkdir -p /tmp/new-build"

# Upload build files to temporary directory
scp -r -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" build/* ubuntu@54.156.33.223:/tmp/new-build/

# SSH into server and complete deployment
ssh -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" ubuntu@54.156.33.223
```

### Option B: Deploy from AWS Server Directory

Navigate to the AWS Server directory:

```bash
cd "/Users/josephheath/Desktop/Do-Nation/AWS Server"
```

Then run:

```bash
# Create temporary directory on server
ssh -i donation-key2.pem ubuntu@54.156.33.223 "mkdir -p /tmp/new-build"

# Upload build files to temporary directory
scp -r -i donation-key2.pem /Users/josephheath/donation-dashboard/build/* ubuntu@54.156.33.223:/tmp/new-build/

# SSH into server
ssh -i donation-key2.pem ubuntu@54.156.33.223
```

## Step 3: Complete Deployment on Server

Once connected to the server via SSH, run these commands:

```bash
# Remove old files (preserves directory structure)
sudo rm -rf /var/www/donation-dashboard/*

# Copy new files to the CORRECT nginx root directory
# ⚠️ NOTE: Copy to /var/www/donation-dashboard/ NOT /var/www/donation-dashboard/build/
sudo cp -r /tmp/new-build/* /var/www/donation-dashboard/

# Set proper ownership and permissions
sudo chown -R www-data:www-data /var/www/donation-dashboard
sudo chmod -R 755 /var/www/donation-dashboard

# Clean up temporary files
rm -rf /tmp/new-build

# Reload nginx
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx

# Exit the server
exit
```

## Step 4: Verify Deployment

1. Check that files are in the correct location:
   ```bash
   ssh -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" ubuntu@54.156.33.223 "ls -la /var/www/donation-dashboard/index.html"
   ```
   
   This should show the index.html file directly in `/var/www/donation-dashboard/`

2. Visit https://do-nation.space in your browser

3. Open browser developer console (F12 or Cmd+Option+I) to check for any errors

## Quick One-Line Deployment

For experienced users, here's a complete deployment in one command (run from donation-dashboard directory):

```bash
npm run build && \
ssh -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" ubuntu@54.156.33.223 "mkdir -p /tmp/new-build" && \
scp -r -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" build/* ubuntu@54.156.33.223:/tmp/new-build/ && \
ssh -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" ubuntu@54.156.33.223 "sudo rm -rf /var/www/donation-dashboard/* && sudo cp -r /tmp/new-build/* /var/www/donation-dashboard/ && sudo chown -R www-data:www-data /var/www/donation-dashboard && sudo chmod -R 755 /var/www/donation-dashboard && rm -rf /tmp/new-build && sudo systemctl reload nginx"
```

## Troubleshooting

### Files Not Loading (404 errors)

If you see 404 errors after deployment, verify files are in the correct location:

```bash
# Files should be here:
/var/www/donation-dashboard/index.html
/var/www/donation-dashboard/static/
/var/www/donation-dashboard/favicon.ico

# NOT here:
/var/www/donation-dashboard/build/index.html
```

### Common Mistakes

1. **Wrong deployment path**: Deploying to `/var/www/donation-dashboard/build/` instead of `/var/www/donation-dashboard/`
2. **Incorrect permissions**: Files must be owned by `www-data:www-data`
3. **Not reloading nginx**: Always run `sudo systemctl reload nginx` after deployment

## Current Features in Production

- Complete donation flow with Stripe integration
- Payment method management
- Enhanced donation history with filters
- Email forwarding setup with test functionality
- Receipt processing dashboard
- Real-time score updates with WebSocket
- Public profile pages for all user types
- Privacy settings for profile control
- Profile search functionality
- SEO optimization with meta tags
- Impact visualization with Chart.js

## Server Information

- **Server IP**: 54.156.33.223
- **Domain**: https://do-nation.space
- **Web Server**: Nginx
- **Document Root**: `/var/www/donation-dashboard/`
- **SSH User**: ubuntu
- **File Owner**: www-data:www-data