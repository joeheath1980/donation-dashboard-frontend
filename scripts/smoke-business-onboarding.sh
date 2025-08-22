#!/usr/bin/env bash

set -euo pipefail

BASE_URL=${1:-https://do-nation.space}
EMAIL=${2:-}
PASSWORD=${3:-}
COMPANY=${4:-"DoNation Smoke Test Biz"}

if [ -z "$EMAIL" ]; then
  TS=$(date +%s)
  EMAIL="biz.smoke+${TS}@example.com"
fi

if [ -z "$PASSWORD" ]; then
  PASSWORD="P@ssw0rd123456!" # meets policy
fi

echo "=== Smoke: Business Onboarding (AI Research Flow) ==="
echo "Base: $BASE_URL"
echo "Email: $EMAIL"

WORKDIR=$(mktemp -d)
cd "$WORKDIR"

echo "1) Fetch CSRF token"
curl -sS -c cookies.txt -D headers.txt -o body.json "$BASE_URL/api/csrf-token" || true
CSRF=$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync('body.json','utf8'));console.log(j.csrfToken||j.token||'');}catch(e){console.log('');}")
if [ -z "$CSRF" ]; then
  echo "ERROR: No CSRF token from body"; exit 1;
fi

echo "2) Business signup"
SIGNUP_PAYLOAD=$(node -e "console.log(JSON.stringify({companyName: process.argv[1], contactEmail: process.argv[2], password: process.argv[3], description:'Smoke test business', preferredCauses:['education','health']}))" "$COMPANY" "$EMAIL" "$PASSWORD")
HTTP=$(curl -sS -b cookies.txt -H "Content-Type: application/json" -H "X-CSRF-Token: $CSRF" -d "$SIGNUP_PAYLOAD" -D signup_headers.txt -o signup.json -w "%{http_code}" "$BASE_URL/api/business/auth/signup") || true
echo "Signup HTTP: $HTTP"
TOKEN=$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync('signup.json','utf8'));console.log(j.token||j.accessToken||'');}catch(e){console.log('');}")
BIZID=$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync('signup.json','utf8'));console.log(j.businessId||j.business?._id||'');}catch(e){console.log('');}")
if [ -z "$TOKEN" ] || [ -z "$BIZID" ]; then
  echo "ERROR: Missing token or businessId in signup response"; cat signup.json; exit 1;
fi

AUTH_HEADER="Authorization: Bearer $TOKEN"

echo "3) Set data preference: ai-research"
PREF_PAYLOAD=$(node -e "console.log(JSON.stringify({ businessId: process.argv[1], preference: 'ai-research' }))" "$BIZID")
curl -sS -b cookies.txt -H "Content-Type: application/json" -H "X-CSRF-Token: $CSRF" -H "$AUTH_HEADER" -d "$PREF_PAYLOAD" "$BASE_URL/api/business/enhanced-onboarding/data-preference" -o pref.json || true

echo "4) Run AI research"
AI_PAYLOAD=$(node -e "console.log(JSON.stringify({companyName: process.argv[1], website:'', industry:'', country:'Australia', additionalContext:'', abn:'', businessId: process.argv[2]}))" "$COMPANY" "$BIZID")
AI_HTTP=$(curl -sS -b cookies.txt -H "Content-Type: application/json" -H "X-CSRF-Token: $CSRF" -H "$AUTH_HEADER" -d "$AI_PAYLOAD" -D ai_headers.txt -o ai.json -w "%{http_code}" "$BASE_URL/api/business/enhanced-onboarding/ai-research") || true
echo "AI Research HTTP: $AI_HTTP"
HAS_DATA=$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync('ai.json','utf8'));console.log(j.success && j.researchData ? 'yes' : 'no');}catch(e){console.log('no');}")
if [ "$HAS_DATA" != "yes" ]; then echo "WARN: AI research returned no data"; fi

echo "5) Confirm research"
CONFIRM_PAYLOAD=$(node -e "const fs=require('fs');let r={};try{r=JSON.parse(fs.readFileSync('ai.json','utf8')).researchData||{};}catch(e){};console.log(JSON.stringify({businessId: process.argv[1], confirmedData: r, corrections:{}, additionalData:{}}));" "$BIZID")
CONFIRM_HTTP=$(curl -sS -b cookies.txt -H "Content-Type: application/json" -H "X-CSRF-Token: $CSRF" -H "$AUTH_HEADER" -d "$CONFIRM_PAYLOAD" -D confirm_headers.txt -o confirm.json -w "%{http_code}" "$BASE_URL/api/business/enhanced-onboarding/confirm-research") || true
echo "Confirm HTTP: $CONFIRM_HTTP"

MSG=$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync('confirm.json','utf8'));console.log(j.message||'');}catch(e){console.log('');}")
BUDGET=$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync('confirm.json','utf8'));console.log(j.annualBudget ?? '');}catch(e){console.log('');}")
echo "Message: ${MSG:-"(none)"}"
echo "AnnualBudget: ${BUDGET:-"(none)"}"

echo "=== Done ==="

