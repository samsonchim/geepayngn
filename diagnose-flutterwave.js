// Comprehensive Flutterwave API Key Validation
// This script helps diagnose API key issues and provides guidance

console.log('🔍 Flutterwave API Key Diagnostic Tool');
console.log('=' .repeat(50));

const providedKey = 'hUbpPvyMf7me0gXvAcutkqUcGuqGB6cG';
const encryptionKey = 'SRpj2JLfaYXMhb0mTamna3VN3sDT9hEkWqCs4tU0eVo=';

console.log('📋 API Key Analysis:');
console.log(`🔑 Secret Key Length: ${providedKey.length} characters`);
console.log(`🔑 Secret Key Format: ${providedKey.startsWith('FLWSECK_TEST') ? 'Test Key' : providedKey.startsWith('FLWSECK-') ? 'Live Key' : 'Unknown Format'}`);
console.log(`🔒 Encryption Key Length: ${encryptionKey.length} characters`);

// Check key format patterns
const testKeyPattern = /^FLWSECK_TEST-[a-f0-9]{32}-X$/;
const liveKeyPattern = /^FLWSECK-[a-f0-9]{32}-X$/;

if (testKeyPattern.test(providedKey)) {
  console.log('✅ Key format: Valid Test Secret Key');
} else if (liveKeyPattern.test(providedKey)) {
  console.log('✅ Key format: Valid Live Secret Key');
} else {
  console.log('❌ Key format: Does not match expected Flutterwave format');
  console.log('📝 Expected formats:');
  console.log('   Test: FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X');
  console.log('   Live: FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X');
  console.log('');
  console.log('🔍 Your key appears to be in a different format.');
  console.log('📞 Please check your Flutterwave dashboard for the correct secret key format.');
}

// Test different key scenarios
async function testKeyScenarios() {
  console.log('\n🧪 Testing Different Key Scenarios...\n');

  const testScenarios = [
    {
      name: 'Current Key (as provided)',
      key: providedKey
    },
    {
      name: 'Key with FLWSECK_TEST prefix (if test key)',
      key: `FLWSECK_TEST-${providedKey}-X`
    },
    {
      name: 'Key with FLWSECK prefix (if live key)', 
      key: `FLWSECK-${providedKey}-X`
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`🔬 Testing: ${scenario.name}`);
    console.log(`🔑 Key: ${scenario.key.substring(0, 20)}...${scenario.key.substring(scenario.key.length - 10)}`);
    
    try {
      const response = await fetch('https://api.flutterwave.com/v3/banks/NG', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${scenario.key}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        console.log('✅ SUCCESS! This key format works.');
        console.log(`📊 Retrieved ${data.data?.length || 0} banks`);
        console.log('🎉 Use this key format in your app configuration.\n');
        return scenario.key;
      } else {
        console.log(`❌ Failed: ${data.message || 'Unknown error'}`);
        console.log(`📊 Status: ${response.status}\n`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}\n`);
    }
  }

  return null;
}

async function provideSolutions() {
  console.log('💡 Troubleshooting Steps:');
  console.log('1. 🔍 Log into your Flutterwave dashboard at https://dashboard.flutterwave.com');
  console.log('2. 📝 Navigate to Settings > API Keys');
  console.log('3. 🔑 Copy the SECRET KEY (not public key)');
  console.log('4. ✅ Ensure you\'re using the correct environment (test vs live)');
  console.log('5. 🔄 Update your app.json with the correct key format');
  console.log('');
  console.log('📋 Key Format Examples:');
  console.log('   Test: FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X');
  console.log('   Live: FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X');
  console.log('');
  console.log('🔗 Useful Links:');
  console.log('   - Flutterwave Docs: https://developer.flutterwave.com/docs');
  console.log('   - API Reference: https://developer.flutterwave.com/reference');
}

async function main() {
  const workingKey = await testKeyScenarios();
  
  if (!workingKey) {
    await provideSolutions();
  }
}

main();
