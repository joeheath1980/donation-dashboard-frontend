// Charity categories supported by the backend
export const CHARITY_CATEGORIES = [
  'Health Services',
  'Mental Health',
  'Education',
  'Environmental Conservation',
  'Social Welfare',
  'Emergency Relief',
  'Food Security',
  'Child Welfare',
  'Indigenous Support',
  'Housing',
  'Community Building',
  'Rural Support',
  'Animal Welfare',        // NEW
  'Arts & Culture',         // NEW
  'Religious',              // NEW
  'Disability Support',     // NEW
  'Refugee Support'         // NEW
];

// Helper function to validate Australian ABN format (11 digits)
export const validateABN = (abn) => {
  // Remove spaces and non-digits
  const cleanABN = abn.replace(/\s/g, '').replace(/\D/g, '');
  return cleanABN.length === 11;
};

// Helper function to format ABN for display
export const formatABN = (abn) => {
  const cleanABN = abn.replace(/\s/g, '').replace(/\D/g, '');
  if (cleanABN.length === 11) {
    return `${cleanABN.slice(0, 2)} ${cleanABN.slice(2, 5)} ${cleanABN.slice(5, 8)} ${cleanABN.slice(8, 11)}`;
  }
  return abn;
};

// Helper text for ABN fields
export const ABN_HELPER_TEXT = "Adding the charity's ABN helps us better match you with relevant opportunities";