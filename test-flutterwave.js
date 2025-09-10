// Test Flutterwave API v4 Integration
// This script tests bank resolution and other Flutterwave API functionality

const API_CONFIG = {
  FLUTTERWAVE: {
    SECRET_KEY: 'FLWSECK-824d81e339ed682aa2977850753d922b-199340e2df9vt-X',
    PUBLIC_KEY: 'FLWPUBK-07769f5dda5a1dd82064bc83d105b0fb-X',
    ENCRYPTION_KEY: '824d81e339ed30baee36134f',
    BASE_URL: 'https://api.flutterwave.com/v3',
  }
};

// Test 1: Get list of Nigerian banks
async function testGetBanks() {
  console.log('\n🏦 Testing: Get Banks from Flutterwave');
  try {
    const response = await fetch(`${API_CONFIG.FLUTTERWAVE.BASE_URL}/banks/NG`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      console.log('✅ Successfully fetched banks');
      console.log(`📊 Found ${data.data?.length || 0} banks`);
      
      // Show first 5 banks as example
      if (data.data && data.data.length > 0) {
        console.log('\n📋 Sample banks:');
        data.data.slice(0, 5).forEach((bank, index) => {
          console.log(`${index + 1}. ${bank.name} (${bank.code})`);
        });
      }
      return data;
    } else {
      console.error('❌ Failed to fetch banks:', data.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return null;
  }
}

// Test 2: Resolve account number (bank account validation)
async function testAccountResolution(accountNumber = '0690000040', bankCode = '044') {
  console.log('\n🔍 Testing: Account Resolution (Bank Validation)');
  console.log(`📝 Testing Account: ${accountNumber} at Bank Code: ${bankCode}`);
  
  try {
    const response = await fetch(`${API_CONFIG.FLUTTERWAVE.BASE_URL}/accounts/resolve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_number: accountNumber,
        account_bank: bankCode,
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      console.log('✅ Account resolution successful');
      console.log(`👤 Account Name: ${data.data?.account_name || 'N/A'}`);
      console.log(`🏦 Bank Name: ${data.data?.bank_name || 'N/A'}`);
      console.log(`🔢 Account Number: ${data.data?.account_number || 'N/A'}`);
      return data;
    } else {
      console.error('❌ Account resolution failed:', data.message || 'Unknown error');
      console.log('📋 Full response:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return null;
  }
}

// Test 3: Verify API credentials
async function testAPICredentials() {
  console.log('\n🔐 Testing: API Credentials Verification');
  
  try {
    // Test with a simple endpoint that requires authentication
    const response = await fetch(`${API_CONFIG.FLUTTERWAVE.BASE_URL}/banks/NG`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📋 Response Data:`, JSON.stringify(data, null, 2));

    if (response.status === 401 || response.status === 403) {
      console.error('❌ Invalid API credentials');
      console.log('🔑 Please verify your secret key in app.json');
      return false;
    } else if (response.ok) {
      console.log('✅ API credentials are valid');
      return true;
    } else {
      console.log(`⚠️  API responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error while testing credentials:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Flutterwave API v4 Tests...');
  console.log('=' .repeat(50));

  // Test API credentials first
  const credentialsValid = await testAPICredentials();
  
  if (credentialsValid) {
    // Test getting banks
    await testGetBanks();
    
    // Test account resolution with a test account
    await testAccountResolution();
    
    // Test with Access Bank (044)
    console.log('\n' + '='.repeat(30));
    await testAccountResolution('0690000040', '044'); // Access Bank test account
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ Tests completed!');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testGetBanks,
    testAccountResolution,
    testAPICredentials,
    runTests,
    API_CONFIG
  };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  runTests();
}
