const axios = require('axios');

async function testAPI() {
  try {
    // First try without auth
    console.log('Testing API without auth...');
    try {
      const response = await axios.get('http://localhost:3002/api/matching/opportunities');
      console.log('Response without auth:', response.data);
    } catch (error) {
      console.log('Expected auth error:', error.response?.data || error.message);
    }
    
    // Try with a test token if one exists
    const testToken = process.env.TEST_TOKEN || 'test-token';
    console.log('\nTesting API with token...');
    try {
      const response = await axios.get('http://localhost:3002/api/matching/opportunities', {
        headers: {
          'Authorization': `Bearer ${testToken}`
        }
      });
      console.log('Response with auth:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('Error with token:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI();