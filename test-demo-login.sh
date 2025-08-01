#!/bin/bash

echo "=== Testing Demo Login Locally ==="
echo
echo "The demo users have been created in your LOCAL database."
echo "To test the demo login functionality:"
echo
echo "1. Make sure your backend is running locally:"
echo "   cd /Users/josephheath/giving-dashboard"
echo "   npm start"
echo
echo "2. Make sure your frontend is running locally:"
echo "   cd /Users/josephheath/donation-dashboard"
echo "   npm start"
echo
echo "3. Access the login page at:"
echo "   http://localhost:3000/login"
echo
echo "4. Click on any demo user card to auto-fill credentials"
echo
echo "The production server (do-nation.space) doesn't have these demo users yet."
echo "To deploy demo users to production, you would need to:"
echo "- SSH into your production server"
echo "- Run the seed script there"
echo
echo "For now, test locally to ensure everything works correctly."