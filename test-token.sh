#!/bin/bash

# Token Testing Script
# Usage: ./test-token.sh "YOUR_TOKEN_HERE"

TOKEN=$1

if [ -z "$TOKEN" ]; then
  echo "Usage: ./test-token.sh TOKEN"
  echo "Get token from Network tab > /api/users/me > Headers > Authorization"
  exit 1
fi

echo "=== Testing Token ==="
echo "Token length: ${#TOKEN}"
echo "Token preview: ${TOKEN:0:50}..."
echo ""

echo "=== Decoding Token (no verification) ==="
node -e "
const jwt = require('jsonwebtoken');
const token = '$TOKEN';
try {
  const decoded = jwt.decode(token, {complete: true});
  console.log('Header:', JSON.stringify(decoded.header, null, 2));
  console.log('Payload:', JSON.stringify(decoded.payload, null, 2));
  
  // Check expiry
  const exp = decoded.payload.exp;
  const now = Math.floor(Date.now() / 1000);
  if (exp < now) {
    console.log('\\n⚠️  TOKEN EXPIRED!');
    console.log('Expired:', new Date(exp * 1000).toISOString());
    console.log('Current:', new Date(now * 1000).toISOString());
  } else {
    console.log('\\n✅ Token valid for:', Math.floor((exp - now) / 60), 'minutes');
  }
} catch (e) {
  console.error('Failed to decode token:', e.message);
}
"

echo ""
echo "=== Testing API Call ==="
echo "Calling: https://do-nation.space/api/donations"
curl -i -H "Authorization: Bearer $TOKEN" https://do-nation.space/api/donations 2>/dev/null | head -20

echo ""
echo "=== Server Time Check ==="
ssh -i "/Users/josephheath/Desktop/Do-Nation/AWS Server/donation-key2.pem" ubuntu@54.156.33.223 "date" 2>/dev/null
echo "Local time: $(date)"