// Category mapping utilities

// Map common category/cause names to our standardized categories
const categoryMappings = {
  // Health related
  'health': 'health',
  'healthcare': 'health',
  'medical': 'health',
  'health care': 'health',
  'medicine': 'health',
  'hospital': 'health',
  'disease': 'health',
  'wellness': 'health',
  
  // Education related
  'education': 'education',
  'school': 'education',
  'learning': 'education',
  'literacy': 'education',
  'training': 'education',
  'academic': 'education',
  'university': 'education',
  'college': 'education',
  
  // Environment related
  'environment': 'environment',
  'environmental': 'environment',
  'climate': 'environment',
  'conservation': 'environment',
  'wildlife': 'environment',
  'nature': 'environment',
  'sustainability': 'environment',
  'green': 'environment',
  
  // Poverty related
  'poverty': 'poverty',
  'hunger': 'poverty',
  'food': 'poverty',
  'homeless': 'poverty',
  'housing': 'poverty',
  'economic': 'poverty',
  'microfinance': 'poverty',
  'development': 'poverty',
  
  // Animals related
  'animal': 'animals',
  'animals': 'animals',
  'wildlife': 'animals',
  'pet': 'animals',
  'shelter': 'animals',
  'veterinary': 'animals',
  
  // Community related
  'community': 'community',
  'social': 'community',
  'civic': 'community',
  'local': 'community',
  'neighborhood': 'community',
  'volunteer': 'community',
  'humanitarian': 'community',
  
  // Arts related
  'arts': 'arts',
  'art': 'arts',
  'culture': 'arts',
  'cultural': 'arts',
  'music': 'arts',
  'theater': 'arts',
  'museum': 'arts',
  'creative': 'arts'
};

// Get normalized category from various inputs
export const normalizeCategory = (input) => {
  if (!input) return 'community'; // default
  
  const lowercaseInput = input.toLowerCase().trim();
  
  // Check direct mapping
  if (categoryMappings[lowercaseInput]) {
    return categoryMappings[lowercaseInput];
  }
  
  // Check if input contains any of our keywords
  for (const [keyword, category] of Object.entries(categoryMappings)) {
    if (lowercaseInput.includes(keyword)) {
      return category;
    }
  }
  
  return 'community'; // default fallback
};

// Get CSS class for category
export const getCategoryClass = (category) => {
  const normalized = normalizeCategory(category);
  return `category-${normalized}`;
};

// Get category color variable
export const getCategoryColor = (category) => {
  const normalized = normalizeCategory(category);
  return `var(--category-${normalized})`;
};

// Get category background color variable
export const getCategoryBgColor = (category) => {
  const normalized = normalizeCategory(category);
  return `var(--category-${normalized}-bg)`;
};

// Category display names
export const categoryDisplayNames = {
  health: 'Health',
  education: 'Education',
  environment: 'Environment',
  poverty: 'Poverty & Hunger',
  animals: 'Animals',
  community: 'Community',
  arts: 'Arts & Culture'
};

// Get display name for category
export const getCategoryDisplayName = (category) => {
  const normalized = normalizeCategory(category);
  return categoryDisplayNames[normalized] || 'Community';
};

// Extract category from charity data
export const extractCharityCategory = (charity) => {
  // Check various fields that might contain category info
  if (charity.category) return charity.category;
  if (charity.Category) return charity.Category;
  if (charity.cause) return charity.cause;
  if (charity.Cause) return charity.Cause;
  if (charity.sector) return charity.sector;
  if (charity.Sector) return charity.Sector;
  
  // Check charity type
  if (charity.Charity_Type) {
    return normalizeCategory(charity.Charity_Type);
  }
  
  // Try to infer from name or mission
  const searchText = `${charity.Charity_Legal_Name || ''} ${charity.missionStatement || ''}`.toLowerCase();
  
  for (const [keyword, category] of Object.entries(categoryMappings)) {
    if (searchText.includes(keyword)) {
      return category;
    }
  }
  
  return 'community'; // default
};

// Extract category from GlobalGiving project
export const extractProjectCategory = (project) => {
  // Check for theme/themes field
  if (project.theme) return normalizeCategory(project.theme);
  if (project.themes && Array.isArray(project.themes) && project.themes.length > 0) {
    return normalizeCategory(project.themes[0]);
  }
  
  // Check title and summary
  const searchText = `${project.title || ''} ${project.summary || ''}`.toLowerCase();
  
  for (const [keyword, category] of Object.entries(categoryMappings)) {
    if (searchText.includes(keyword)) {
      return category;
    }
  }
  
  return 'community'; // default
};