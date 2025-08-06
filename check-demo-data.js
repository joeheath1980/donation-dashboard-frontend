const axios = require('axios');

async function checkDemoData() {
  console.log('Checking demo data in database...\n');
  
  // First, let's login with a demo user to get a token
  try {
    console.log('1. Attempting to login with demo-user-1@example.com...');
    const loginResponse = await axios.post('http://localhost:3002/api/auth/login', {
      email: 'demo-user-1@example.com',
      password: 'demo123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✓ Login successful, got token\n');
    
    // Now check for matching opportunities
    console.log('2. Fetching matching opportunities for this user...');
    try {
      const oppsResponse = await axios.get('http://localhost:3002/api/matching/opportunities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`   Found ${oppsResponse.data.length} matching opportunities`);
      
      if (oppsResponse.data.length > 0) {
        console.log('\n   Sample opportunities:');
        oppsResponse.data.slice(0, 3).forEach((opp, idx) => {
          console.log(`   ${idx + 1}. ${opp.businessName} - ${opp.matchType} - ${opp.description || 'No description'}`);
        });
      } else {
        console.log('   No opportunities found - this means:');
        console.log('   - No active campaigns from businesses');
        console.log('   - Or user has no donation history/followed charities');
        console.log('   - Or no alignment between user preferences and campaigns');
      }
    } catch (error) {
      console.log('   Error fetching opportunities:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.log('   Login failed:', error.response?.data || error.message);
    console.log('\n   This might mean the demo users are not set up properly.');
  }
  
  console.log('\n3. Checking what needs to exist for opportunities:');
  console.log('   [ ] Active BusinessPartner accounts');
  console.log('   [ ] Active Campaign(s) from businesses with:');
  console.log('       - Valid start/end dates');
  console.log('       - Remaining budget > 0');
  console.log('       - Charity targeting configuration');
  console.log('   [ ] User with:');
  console.log('       - Donation history OR');
  console.log('       - Followed charities OR');
  console.log('       - Preferred causes');
  console.log('   [ ] Charities in the system');
}

checkDemoData();