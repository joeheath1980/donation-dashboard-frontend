# Frontend API Fixes Summary

## Issues Fixed

### 1. Double `/api` Path Issue
**Problem:** API calls were resulting in `/api/api/...` because both the base URL and endpoints included `/api`

**Solution:** 
- Updated `businessAPI.js` to use a helper function `apiUrl()` that checks if the base URL already ends with `/api`
- Fixed all endpoints to properly construct URLs without duplicating the `/api` path

### 2. BusinessOnboarding Component
**Problem:** Component was making direct axios calls with incorrect URLs

**Solution:**
- Imported and used the `businessAPI` service for all API calls
- Fixed endpoint paths to use correct environment variables

### 3. Production Environment Configuration
**Problem:** Missing `REACT_APP_API_URL` in production environment

**Solution:**
- Added `REACT_APP_API_URL=https://do-nation.space/api` to `.env.production`

### 4. CharityProfileEditor Component
**Problem:** Using `REACT_APP_API_URL` with `/api/` resulting in double path

**Solution:**
- Updated to use `REACT_APP_API_BASE_URL` instead

## Environment Variables

### Development (.env)
```
REACT_APP_API_URL=http://localhost:3002/api
REACT_APP_API_BASE_URL=http://localhost:3002
```

### Production (.env.production)
```
REACT_APP_API_BASE_URL=https://do-nation.space
REACT_APP_API_URL=https://do-nation.space/api
```

## Key Changes

1. **businessAPI.js**
   - Added `apiUrl()` helper function that prevents double `/api` paths
   - Updated all endpoints to use this helper

2. **BusinessOnboarding.js**
   - Replaced direct axios calls with businessAPI service calls
   - Fixed environment variable usage

3. **CharityProfileEditor.js**
   - Changed from `REACT_APP_API_URL` to `REACT_APP_API_BASE_URL`

## CORS Configuration Note

The backend already includes both `https://do-nation.space` and `https://www.do-nation.space` in the CORS allowed origins, so no backend changes are needed.

## Testing

After deployment, test these endpoints:
- `https://do-nation.space/api/charities` (should work)
- Business onboarding flow (upload CSR, select charities, complete)
- Charity profile editing

## Deployment

Build and deploy using the standard deployment guide:
```bash
npm run build
# Then follow the deployment guide to upload to server
```