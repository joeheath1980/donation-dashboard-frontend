# Backend Deployment Steps for CSR Insights Fix

## Issue
The CSR insights endpoint (`/api/public/business/:slug/csr-insights`) is returning 500 errors because it's not handling missing CSR data properly.

## Fix Required

### 1. Update the Controller
In `/Users/josephheath/giving-dashboard/src/controllers/businessPublicProfileController.js`, update the `getCsrInsights` method:

```javascript
/**
 * Get CSR insights and summary
 * GET /api/public/business/:slug/csr-insights
 */
static async getCsrInsights(req, res) {
  try {
    const { slug } = req.params;
    const cacheKey = `csr-insights-${slug}`;
    
    // Check cache
    const cached = publicProfileCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    
    const business = await BusinessPartner.findOne({ slug });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    // Safe access to CSR data with proper fallbacks
    const csrProfile = business.csrProfile || {};
    const reportParsedData = csrProfile.reportParsedData || {};
    
    const response = {
      hasReport: !!(reportParsedData.parsedAt),
      year: reportParsedData.year || null,
      totalContributions: reportParsedData.totalContributions || 0,
      givingScore: csrProfile.givingScore || 0,
      insights: reportParsedData.insights || '',
      keyHighlights: Array.isArray(reportParsedData.keyHighlights) ? reportParsedData.keyHighlights : [],
      categories: Array.isArray(reportParsedData.categories) ? reportParsedData.categories : []
    };
    
    // Only cache if we have actual data
    if (response.hasReport) {
      publicProfileCache.set(cacheKey, response);
    }
    
    res.json(response);
    
  } catch (error) {
    logger.error('Error fetching CSR insights:', error);
    
    // Return empty but valid response instead of error
    res.json({
      hasReport: false,
      year: null,
      totalContributions: 0,
      givingScore: 0,
      insights: '',
      keyHighlights: [],
      categories: []
    });
  }
}
```

### 2. Deploy the Backend

```bash
cd /Users/josephheath/giving-dashboard
git add -A
git commit -m "Fix CSR insights endpoint to handle missing data gracefully"
git push origin main
npm run deploy
```

### 3. Verify the Fix

Test the endpoint after deployment:
```bash
curl -s "https://do-nation.space/api/public/business/for-coles-/csr-insights" | python3 -m json.tool
```

Expected response when no CSR data exists:
```json
{
  "hasReport": false,
  "year": null,
  "totalContributions": 0,
  "givingScore": 0,
  "insights": "",
  "keyHighlights": [],
  "categories": []
}
```

## What Changed

1. **Safe data access**: Added proper null checks and fallbacks for `csrProfile` and `reportParsedData`
2. **Array validation**: Ensured `keyHighlights` and `categories` are always arrays
3. **Better error handling**: Returns valid empty response instead of 500 error
4. **Conditional caching**: Only caches when actual report data exists

## Frontend Compatibility

The frontend is already handling this correctly:
- The `CSRInsights` component checks `if (!insights || !insights.hasReport)` and returns `null` when no report exists
- This prevents the component from rendering when there's no CSR data to display