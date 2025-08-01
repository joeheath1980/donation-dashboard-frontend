# Changelog - August 2025

## August 1, 2025

### Profile System & Search Fixes

#### Issues Fixed:
1. **Profile Data Not Loading**
   - Fixed ProfileEditor to handle wrapped API responses correctly
   - Added proper null checks and data extraction logic
   - Now correctly displays user profile data in edit page

2. **Search Functionality**
   - Fixed ProfileSearch component to handle backend's wrapped response format
   - Backend returns: `{ success: true, results: { users: [...], businesses: [...], charities: [...] } }`
   - Updated component to check for `data.results` property
   - Fixed navigation to use username instead of user ID for profile URLs
   - Added proper field mapping for displayName, publicScore, and tier

3. **Demo User Authentication**
   - Fixed demo login flow to properly set accountType
   - Resolved issue where demo users weren't seeing data due to authentication check
   - Fixed ImpactContext to properly check `isAuthenticated` based on user type

4. **View Public Profile Button**
   - Fixed visibility condition in YourAccount component
   - Button now appears when user has a username
   - Links correctly to public profile page

#### Technical Details:
- Updated `ProfileSearch.js` to handle response.results wrapper
- Fixed profile navigation to use username: `/profile/${user.username}`
- Cleaned up debugging logs after confirming fixes work
- All changes deployed to production successfully

### Files Modified:
- `/src/components/Search/ProfileSearch.js`
- `/src/components/Profile/ProfileEditor.js` 
- `/src/components/YourAccount.js`
- `/src/contexts/ImpactContext.js`
- `/docs/pipeline/USER_FEATURES_TRACKER.md`

### Testing Performed:
- Verified demo user login works correctly
- Confirmed profile data loads in ProfileEditor
- Tested search functionality with "carol" and "sarah" queries
- Verified View Public Profile button appears and works
- Confirmed all impact data loads for demo users