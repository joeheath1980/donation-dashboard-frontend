#!/usr/bin/env node

// Test script to verify charity login functionality
const axios = require('axios');

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';

async function testCharityLogin(email, password) {
  console.log(`\nTesting charity login for: ${email}`);
  console.log('=====================================');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/charities/login`, {
      email: email,
      contactEmail: email,  // Send both for compatibility
      password: password
    });
    
    console.log('✅ Login successful!');
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    console.log('Charity details:', {
      id: response.data.charity?.id,
      name: response.data.charity?.charityName,
      email: response.data.charity?.email,
      category: response.data.charity?.category,
      verified: response.data.charity?.verified
    });
    
    return true;
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Error:', error.response?.data?.error || error.message);
    if (error.response?.data) {
      console.log('Response data:', error.response.data);
    }
    return false;
  }
}

async function main() {
  console.log('Charity Login Test Script');
  console.log('=========================\n');
  
  // Test demo charity accounts
  const testAccounts = [
    { email: 'demo-greenearth-charity@example.com', password: 'demo123' },
    { email: 'demo-healthforall-charity@example.com', password: 'demo123' },
    { email: 'demo-learningtree-charity@example.com', password: 'demo123' },
    { email: 'demo-communitycare-charity@example.com', password: 'demo123' }
  ];
  
  let successCount = 0;
  
  for (const account of testAccounts) {
    const success = await testCharityLogin(account.email, account.password);
    if (success) successCount++;
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=====================================');
  console.log(`Test Results: ${successCount}/${testAccounts.length} successful`);
  
  if (successCount === 0) {
    console.log('\n⚠️  No demo charity accounts could login.');
    console.log('Make sure the backend is running and demo data is loaded.');
  } else if (successCount < testAccounts.length) {
    console.log('\n⚠️  Some demo charity accounts failed to login.');
  } else {
    console.log('\n✅ All demo charity accounts can login successfully!');
  }
}

main().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});