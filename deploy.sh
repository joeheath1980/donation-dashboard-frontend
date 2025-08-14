#!/bin/bash

# Deployment script for Do-Nation frontend
# This script automates the deployment process to AWS

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Configuration
SERVER_IP="54.156.33.223"
SERVER_USER="ubuntu"
KEY_PATH="/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem"
BUILD_PATH="/Users/josephheath/donation-dashboard/build"
REMOTE_TEMP="/tmp/new-build"
REMOTE_FINAL="/var/www/donation-dashboard"

# Check if build directory exists
if [ ! -d "$BUILD_PATH" ]; then
    echo "❌ Build directory not found. Please run 'npm run build' first."
    exit 1
fi

# Check if SSH key exists
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ SSH key not found at: $KEY_PATH"
    exit 1
fi

echo "📦 Creating temporary directory on server..."
ssh -i "$KEY_PATH" "$SERVER_USER@$SERVER_IP" "mkdir -p $REMOTE_TEMP"

echo "📤 Uploading build files..."
scp -r -i "$KEY_PATH" "$BUILD_PATH"/* "$SERVER_USER@$SERVER_IP:$REMOTE_TEMP/"

echo "🔧 Deploying on server..."
ssh -i "$KEY_PATH" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
# Remove old build files
echo "Removing old build files..."
sudo rm -rf /var/www/donation-dashboard/*

# Copy new files to nginx directory (NOT to /build subdirectory!)
echo "Copying new files..."
sudo cp -r /tmp/new-build/* /var/www/donation-dashboard/

# Set proper ownership
echo "Setting permissions..."
sudo chown -R www-data:www-data /var/www/donation-dashboard
sudo chmod -R 755 /var/www/donation-dashboard

# Clean up temporary files
echo "Cleaning up..."
rm -rf /tmp/new-build

# Reload nginx
echo "Reloading nginx..."
sudo systemctl reload nginx

# Check nginx status
echo "Checking nginx status..."
sudo systemctl status nginx --no-pager
ENDSSH

echo "✅ Deployment complete!"
echo "🌐 Visit https://do-nation.space to verify the deployment"