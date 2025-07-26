// Utility to map between ACNC raw fields and normalized backend fields

/**
 * Maps normalized backend charity data to ACNC field names for components
 * that expect ACNC format
 */
export const mapNormalizedToACNC = (charity) => {
  if (!charity) return null;

  return {
    // Keep original fields
    ...charity,
    
    // Map normalized fields to ACNC names
    ABN: charity.abn || charity.ABN,
    Charity_Legal_Name: charity.name || charity.Charity_Legal_Name,
    Main_Activity: charity.category || charity.Main_Activity,
    Charity_Size: charity.size || charity.Charity_Size,
    State: charity.state || charity.State,
    Town_City: charity.city || charity.Town_City || charity.state,
    Registration_Status: charity.registrationStatus || 'Registered',
    
    // Map operating states array to individual Y/N fields
    Operates_in_ACT: charity.operatingStates?.includes('ACT') ? 'Y' : 'N',
    Operates_in_NSW: charity.operatingStates?.includes('NSW') ? 'Y' : 'N',
    Operates_in_NT: charity.operatingStates?.includes('NT') ? 'Y' : 'N',
    Operates_in_QLD: charity.operatingStates?.includes('QLD') ? 'Y' : 'N',
    Operates_in_SA: charity.operatingStates?.includes('SA') ? 'Y' : 'N',
    Operates_in_TAS: charity.operatingStates?.includes('TAS') ? 'Y' : 'N',
    Operates_in_VIC: charity.operatingStates?.includes('VIC') ? 'Y' : 'N',
    Operates_in_WA: charity.operatingStates?.includes('WA') ? 'Y' : 'N',
    
    // Map boolean fields
    PBI: charity.isPBI ? 'Y' : (charity.PBI || 'N'),
    HPC: charity.isHPC ? 'Y' : (charity.HPC || 'N'),
    
    // Map beneficiaries
    Aboriginal_or_TSI: charity.beneficiaries?.includes('Indigenous') ? 'Y' : 'N',
    Adults: charity.beneficiaries?.includes('Adults') ? 'Y' : 'N',
    Aged_Persons: charity.beneficiaries?.includes('Elderly') ? 'Y' : 'N',
    Children: charity.beneficiaries?.includes('Children') ? 'Y' : 'N',
    
    // Keep normalized fields for newer components
    _id: charity._id || charity.abn || charity.ABN,
    logo: charity.logo,
    description: charity.description || charity.mission,
    website: charity.website,
    email: charity.email,
    phone: charity.phone,
    dgrStatus: charity.dgrStatus
  };
};

/**
 * Maps ACNC field names to normalized backend fields
 */
export const mapACNCToNormalized = (acncCharity) => {
  if (!acncCharity) return null;

  // Collect operating states
  const operatingStates = [];
  if (acncCharity.Operates_in_ACT === 'Y') operatingStates.push('ACT');
  if (acncCharity.Operates_in_NSW === 'Y') operatingStates.push('NSW');
  if (acncCharity.Operates_in_NT === 'Y') operatingStates.push('NT');
  if (acncCharity.Operates_in_QLD === 'Y') operatingStates.push('QLD');
  if (acncCharity.Operates_in_SA === 'Y') operatingStates.push('SA');
  if (acncCharity.Operates_in_TAS === 'Y') operatingStates.push('TAS');
  if (acncCharity.Operates_in_VIC === 'Y') operatingStates.push('VIC');
  if (acncCharity.Operates_in_WA === 'Y') operatingStates.push('WA');

  // Collect beneficiaries
  const beneficiaries = [];
  if (acncCharity.Aboriginal_or_TSI === 'Y') beneficiaries.push('Indigenous');
  if (acncCharity.Adults === 'Y') beneficiaries.push('Adults');
  if (acncCharity.Aged_Persons === 'Y') beneficiaries.push('Elderly');
  if (acncCharity.Children === 'Y') beneficiaries.push('Children');

  return {
    // Keep original data
    ...acncCharity,
    
    // Normalized fields
    _id: acncCharity._id || acncCharity.ABN,
    abn: acncCharity.ABN,
    name: acncCharity.Charity_Legal_Name || acncCharity.name,
    category: acncCharity.Main_Activity || 'Other Philanthropic',
    size: acncCharity.Charity_Size,
    state: acncCharity.State,
    city: acncCharity.Town_City,
    operatingStates,
    beneficiaries,
    isPBI: acncCharity.PBI === 'Y',
    isHPC: acncCharity.HPC === 'Y',
    registrationStatus: acncCharity.Registration_Status || 'Registered',
    logo: acncCharity.logo,
    description: acncCharity.description || acncCharity.mission,
    website: acncCharity.website,
    email: acncCharity.email,
    phone: acncCharity.phone,
    dgrStatus: acncCharity.dgrStatus
  };
};