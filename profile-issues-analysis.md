# Profile Issues Analysis

## Issues Found

### 1. Missing "View Public Profile" Button
**Status**: Frontend fix needed
**Issue**: The YourAccount and ProfileEditor components don't have a "View Public Profile" button
**Solution**: Add button to ProfileEditor that links to `/profile/{username}`

### 2. Empty Profile Data in Edit Section
**Status**: Backend issue
**Issue**: The API endpoint `/api/users/profile` is returning data wrapped in `{ user: {...}, profileCompleteness: X }`
**Frontend expectation**: The ProfileEditor expects the profile data directly, not wrapped in a `user` object
**Solution**: 
- **Backend fix**: Return profile data at root level, not wrapped in `user` object
- **OR Frontend fix**: Update ProfileEditor to extract data from `response.data.user` instead of `response.data`

### 3. Search Not Returning Results
**Status**: Backend issue
**Issue**: The search is calling `/api/public/profiles/search` but likely no data is being returned
**Possible causes**:
1. The demo users might not have `privacy.profileVisibility` set to 'public'
2. The search endpoint might not be returning data correctly
3. The users might not be indexed for search

## Frontend Fixes Needed

### 1. Add View Public Profile Button
```javascript
// In ProfileEditor.js, add after the Save button:
{profile.username && (
  <Link 
    to={`/profile/${profile.username}`} 
    className={styles.viewProfileButton}
    target="_blank"
  >
    View Public Profile
  </Link>
)}
```

### 2. Fix Profile Data Extraction
```javascript
// In ProfileEditor.js fetchProfile function:
const data = response.data.user || response.data; // Handle both formats
```

### 3. Add Profile Link to YourAccount
```javascript
// In YourAccount.js, in the Profile card:
<Link to="/profile/edit" className="button">Edit Profile</Link>
{/* Add this: */}
<Link to={`/profile/${username}`} className="button secondary">View Public Profile</Link>
```

## Backend Fixes Needed

### 1. Profile API Response Format
The `/api/users/profile` endpoint should return:
```javascript
{
  displayName: "...",
  username: "...",
  email: "...",
  // ... other fields
  profileCompleteness: 85
}
```

Instead of:
```javascript
{
  user: {
    displayName: "...",
    // ...
  },
  profileCompleteness: 85
}
```

### 2. Search API Issues
- Ensure demo users have `privacy.profileVisibility: 'public'`
- Check if the search endpoint `/api/public/profiles/search` is properly implemented
- Verify that users are being indexed/returned in search results

### 3. Demo User Data
The demo users might be missing:
- `privacy.profileVisibility: 'public'` setting
- Proper username field
- Other profile fields needed for display

## Quick Frontend Workaround

While waiting for backend fixes, we can update the frontend to handle the current API format:

1. Update ProfileEditor to extract data from `response.data.user`
2. Add View Public Profile button that constructs URL from user ID if username is missing
3. Add error handling for missing profile data