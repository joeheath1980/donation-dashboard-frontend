#\!/bin/bash

echo "=== Deploying Frontend to Production ==="
echo

# Check if build directory exists
if [ \! -d "build" ]; then
    echo "Error: Build directory not found. Run 'npm run build' first."
    exit 1
fi

# Create tar archive of build files
echo "Creating deployment archive..."
tar -czf build.tar.gz build/*

# Upload to server
echo "Uploading to server..."
scp -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" build.tar.gz ubuntu@54.156.33.223:/tmp/

# Deploy on server
echo "Deploying on server..."
ssh -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" ubuntu@54.156.33.223 << 'ENDSSH'
    # Extract files
    cd /tmp
    tar -xzf build.tar.gz
    
    # Remove old files
    sudo rm -rf /var/www/donation-dashboard/*
    
    # Copy new files (from build/* to donation-dashboard/)
    sudo cp -r build/* /var/www/donation-dashboard/
    
    # Set permissions
    sudo chown -R www-data:www-data /var/www/donation-dashboard
    sudo chmod -R 755 /var/www/donation-dashboard
    
    # Clean up
    rm -rf /tmp/build.tar.gz /tmp/build
    
    # Reload nginx
    sudo systemctl reload nginx
    
    echo "Deployment complete\!"
ENDSSH

# Clean up local tar file
rm -f build.tar.gz

echo
echo "Frontend deployed successfully to https://do-nation.space"
echo
echo "Note: Demo users are only available in your local database."
echo "To test demo login, use http://localhost:3000"
EOF < /dev/null