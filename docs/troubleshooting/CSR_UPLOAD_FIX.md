# CSR Upload Field Name Fix

## Issue
The backend expects the file field to be named `report`, but the frontend was sending it as `csrReport`, causing a 500 error with "Unexpected field" message.

## Fixed Files

### 1. `/src/services/businessAPI.js`
```javascript
// Before:
formData.append('csrReport', file);

// After:
formData.append('report', file);  // Fixed: Changed from 'csrReport' to 'report'
```

### 2. `/src/components/BusinessOnboarding.js`
```javascript
// Before:
formData.append('csrReport', file);

// After:
formData.append('report', file);  // Fixed: Changed from 'csrReport' to 'report'
```

## Also Fixed
- Removed explicit `Content-Type: 'multipart/form-data'` header to let the browser set it with the correct boundary

## Testing
After deployment, the CSR upload should work correctly:
```bash
# Test with curl
curl -X POST https://do-nation.space/api/business/onboarding/upload-csr-report \
  -H "Authorization: Bearer YOUR_BUSINESS_TOKEN" \
  -F "report=@/path/to/test.pdf"
```

## Status
✅ Field name fixed in both files
✅ Ready to build and deploy