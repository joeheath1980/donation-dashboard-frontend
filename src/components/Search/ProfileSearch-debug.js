// Debug helper to understand the search response structure

console.log(`
=== Search Response Structure Debug ===

The frontend expects:
{
  users: [...],
  businesses: [...],
  charities: [...]
}

But the backend might be returning:
1. A flat array of all results
2. Or results with different structure

To debug:
1. Open browser DevTools
2. Go to Network tab
3. Search for "carol" or any demo user
4. Look at the response from /api/public/search

The response structure will tell us how to fix the mapping.
`);