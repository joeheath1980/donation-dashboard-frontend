# URL Patterns Documentation

## Profile URLs

As of August 1, 2025, all user profile URLs use usernames instead of database IDs for better user experience and SEO.

### Pattern Changes

#### User Profiles
- **Old Pattern**: `/profile/:userId` (e.g., `/profile/507f1f77bcf86cd799439011`)
- **New Pattern**: `/profile/:username` (e.g., `/profile/joeheath1980`)

#### Business Profiles
- **Pattern**: `/business/:slug` (e.g., `/business/acme-corp`)
- No change - already using human-readable slugs

#### Charity Profiles
- **Pattern**: `/charity/:abn` (e.g., `/charity/12345678901`)
- No change - using ABN (Australian Business Number) as identifier

### Benefits of Username-based URLs

1. **Human-Readable**: Users can remember and share URLs easily
2. **Better SEO**: Search engines prefer meaningful URLs
3. **Professional Appearance**: `do-nation.space/profile/joeheath1980` looks better than long IDs
4. **Social Media Friendly**: Easy to share in bios and posts
5. **Consistent with Industry Standards**: Matches patterns used by GitHub, LinkedIn, Twitter

### Implementation Details

#### Frontend Routes
```javascript
// App.js
<Route path="/profile/:username" element={<PublicUserProfile />} />
```

#### Component Updates
```javascript
// PublicUserProfile.js
const { username } = useParams();
const data = await profileService.getUserPublicProfile(username);
```

#### Navigation
All navigation to user profiles should use:
```javascript
navigate(`/profile/${user.username}`);
// or
<Link to={`/profile/${user.username}`}>View Profile</Link>
```

#### Profile Service
The `getUserPublicProfile` method accepts both username and ID, with the backend handling the resolution:
```javascript
async getUserPublicProfile(identifier) {
  // Backend accepts either username or ID
  const response = await api.get(`/api/public/profile/${identifier}`);
  return response.data.profile;
}
```

### URL Generation

Use the profile service helper:
```javascript
const url = profileService.generateProfileUrl('user', username);
// Returns: https://do-nation.space/profile/username
```

### Backward Compatibility

The backend API still accepts both formats:
- `/api/public/profile/:username` - Preferred
- `/api/public/profile/:userId` - Still works for legacy links

However, all new links generated should use usernames.

### Requirements

- Users must have a unique username
- Username validation: alphanumeric and underscores only
- Minimum 3 characters
- Case-insensitive (stored lowercase, displayed as entered)

### Migration Notes

- Existing links with IDs will continue to work via backend support
- All new features should generate username-based URLs
- Social sharing features updated to use username URLs
- SEO meta tags use username-based canonical URLs