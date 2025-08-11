// Backend fix for CSR insights endpoint
// File: /Users/josephheath/giving-dashboard/src/controllers/businessPublicProfileController.js
// Replace the getCsrInsights method with this improved version:

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