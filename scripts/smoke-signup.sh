#!/usr/bin/env bash

set -euo pipefail

BASE_URL=${REACT_APP_API_BASE_URL:-${1:-http://localhost:3002}}
NAME=${2:-"Smoke Test User"}
EMAIL=${3:-}
PASSWORD=${4:-}

if [ -z "${EMAIL}" ]; then
  TS=$(date +%s)
  EMAIL="smoke+${TS}@example.com"
fi

if [ -z "${PASSWORD}" ]; then
  # Meets policy: 12+ chars, upper, lower, number, special
  PASSWORD="P@ssw0rd123456!"
fi

echo "=== Smoke Test: Signup + Me ==="
echo "Base URL: ${BASE_URL}"
echo "Email: ${EMAIL}"

WORKDIR=$(mktemp -d)
cd "$WORKDIR"

echo "1) Fetch CSRF token"
curl -sS -c cookies.txt -D headers.txt -o body.json "${BASE_URL}/api/csrf-token" || true

TOKEN_FROM_BODY=$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync('body.json','utf8'));console.log(j.csrfToken||j.token||'');}catch(e){console.log('');}")
if [ -z "$TOKEN_FROM_BODY" ]; then
  TOKEN_FROM_COOKIE=$(awk '$6=="XSRF-TOKEN"{print $7}' cookies.txt 2>/dev/null || true)
else
  TOKEN_FROM_COOKIE=""
fi
CSRF_TOKEN=${TOKEN_FROM_BODY:-$TOKEN_FROM_COOKIE}

if [ -z "$CSRF_TOKEN" ]; then
  echo "ERROR: Could not obtain CSRF token from body or cookies."
  echo "Response body:"; cat body.json || true
  exit 1
fi
echo "CSRF token acquired (hidden)"

echo "2) Register user"
PAYLOAD=$(node -e "console.log(JSON.stringify({name: process.argv[1], email: process.argv[2], password: process.argv[3]}))" "$NAME" "$EMAIL" "$PASSWORD")
HTTP_CODE=$(curl -sS -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: ${CSRF_TOKEN}" \
  -d "$PAYLOAD" \
  -D reg_headers.txt -o reg_body.json \
  -w "%{http_code}" \
  "${BASE_URL}/api/users/register") || true

echo "Register HTTP: $HTTP_CODE"
cat reg_body.json | head -400 >/dev/null 2>&1 || true

ACCESS_TOKEN=$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync('reg_body.json','utf8'));console.log(j.accessToken||j.token||'');}catch(e){console.log('');}")
REFRESH_TOKEN=$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync('reg_body.json','utf8'));console.log(j.refreshToken||'');}catch(e){console.log('');}")

if [ -z "$ACCESS_TOKEN" ]; then
  echo "ERROR: No access token in registration response. Body:"
  cat reg_body.json
  exit 1
fi

echo "3) Verify /api/users/me"
ME_CODE=$(curl -sS -H "Authorization: Bearer ${ACCESS_TOKEN}" -D me_headers.txt -o me_body.json -w "%{http_code}" "${BASE_URL}/api/users/me") || true
echo "Me HTTP: $ME_CODE"

if [ "$ME_CODE" != "200" ]; then
  echo "ERROR: /api/users/me returned status $ME_CODE"
  echo "Body:"; cat me_body.json
  exit 1
fi

USER_ID=$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync('me_body.json','utf8'));console.log(j._id||j.id||'');}catch(e){console.log('');}")

echo "=== Success ==="
echo "Email: ${EMAIL}"
echo "User ID: ${USER_ID}"
echo "Access Token: (hidden)"
if [ -n "$REFRESH_TOKEN" ]; then echo "Refresh Token: (hidden)"; fi

echo "Cleanup: temp files at $WORKDIR"

