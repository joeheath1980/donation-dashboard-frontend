// CSV Export Utility
export const exportToCSV = (data, filename = 'export.csv') => {
  // Convert data to CSV format
  const csvContent = convertToCSV(data);
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  // Convert each row
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
};

// Export campaign analytics data
export const exportCampaignAnalytics = (analytics, campaign, dateRange) => {
  const exportData = [];
  
  // Overview metrics
  exportData.push({
    Section: 'Overview',
    Metric: 'Total Matches',
    Value: analytics.overview.totalMatches,
    'Date Range': dateRange,
    Campaign: campaign.name
  });
  
  exportData.push({
    Section: 'Overview',
    Metric: 'Total Match Amount',
    Value: analytics.overview.totalMatchAmount,
    'Date Range': dateRange,
    Campaign: campaign.name
  });
  
  exportData.push({
    Section: 'Overview',
    Metric: 'Average Match Amount',
    Value: analytics.overview.averageMatchAmount,
    'Date Range': dateRange,
    Campaign: campaign.name
  });
  
  exportData.push({
    Section: 'Overview',
    Metric: 'Unique Users',
    Value: analytics.overview.uniqueUsers,
    'Date Range': dateRange,
    Campaign: campaign.name
  });
  
  exportData.push({
    Section: 'Overview',
    Metric: 'Conversion Rate',
    Value: `${(analytics.overview.conversionRate * 100).toFixed(1)}%`,
    'Date Range': dateRange,
    Campaign: campaign.name
  });
  
  exportData.push({
    Section: 'Overview',
    Metric: 'Budget Utilization',
    Value: `${(analytics.overview.budgetUtilization * 100).toFixed(1)}%`,
    'Date Range': dateRange,
    Campaign: campaign.name
  });
  
  exportData.push({
    Section: 'Overview',
    Metric: 'Campaign ROI',
    Value: `${analytics.overview.roi.toFixed(1)}x`,
    'Date Range': dateRange,
    Campaign: campaign.name
  });
  
  // Daily matches data
  analytics.matchesByDay.forEach(day => {
    exportData.push({
      Section: 'Daily Matches',
      Date: day.date,
      Matches: day.matches,
      Amount: day.amount,
      Campaign: campaign.name
    });
  });
  
  // Charity performance
  analytics.charityPerformance.forEach(charity => {
    exportData.push({
      Section: 'Charity Performance',
      Charity: charity.charity,
      Matches: charity.matches,
      Amount: charity.amount,
      'Average Match': charity.averageMatch,
      'Unique Users': charity.users,
      Campaign: campaign.name
    });
  });
  
  // Demographics
  analytics.userDemographics.ageGroups.forEach(group => {
    exportData.push({
      Section: 'Demographics - Age',
      'Age Group': group.range,
      Count: group.count,
      Percentage: `${(group.percentage * 100).toFixed(1)}%`,
      Campaign: campaign.name
    });
  });
  
  analytics.userDemographics.locations.forEach(location => {
    exportData.push({
      Section: 'Demographics - Location',
      Location: location.city,
      Count: location.count,
      Percentage: `${(location.percentage * 100).toFixed(1)}%`,
      Campaign: campaign.name
    });
  });
  
  // Top donors
  analytics.topDonors.forEach((donor, index) => {
    exportData.push({
      Section: 'Top Donors',
      Rank: index + 1,
      User: donor.name,
      'Total Donated': donor.totalDonated,
      'Matches Received': donor.matchesReceived,
      'Total Impact': donor.totalDonated + donor.matchesReceived,
      Campaign: campaign.name
    });
  });
  
  return exportData;
};

// Export user donation history
export const exportDonationHistory = (donations, oneOffContributions) => {
  const exportData = [];
  
  // Regular donations
  donations.forEach(donation => {
    const totalMatched = donation.matches ? 
      donation.matches.reduce((sum, match) => sum + match.matchAmount, 0) : 0;
    
    exportData.push({
      Type: 'Regular Donation',
      Date: donation.date,
      Charity: donation.charity,
      'Charity Type': donation.charityType || 'Not specified',
      'Your Donation': donation.amount,
      'Matched Amount': totalMatched,
      'Total Impact': donation.amount + totalMatched,
      'Is Monthly': donation.isMonthly ? 'Yes' : 'No',
      'Has Receipt': donation.receiptUrl ? 'Yes' : 'No',
      'Matching Businesses': donation.matches ? 
        donation.matches.map(m => `${m.businessName} (${m.multiplier}x)`).join(', ') : 'None'
    });
  });
  
  // One-off contributions
  oneOffContributions.forEach(contribution => {
    const totalMatched = contribution.matches ? 
      contribution.matches.reduce((sum, match) => sum + match.matchAmount, 0) : 0;
    
    exportData.push({
      Type: 'One-off Contribution',
      Date: contribution.date,
      Charity: contribution.charity,
      'Charity Type': contribution.charityType || 'Not specified',
      'Your Donation': contribution.amount,
      'Matched Amount': totalMatched,
      'Total Impact': contribution.amount + totalMatched,
      'Is Monthly': 'No',
      'Has Receipt': contribution.receiptUrl ? 'Yes' : 'No',
      'Matching Businesses': contribution.matches ? 
        contribution.matches.map(m => `${m.businessName} (${m.multiplier}x)`).join(', ') : 'None'
    });
  });
  
  return exportData;
};