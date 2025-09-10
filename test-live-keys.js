// Test different Flutterwave key formats for live keys
console.log('🔍 Testing Live Flutterwave Key Formats');
console.log('=' .repeat(50));

const baseKey = 'hUbpPvyMf7me0gXvAcutkqUcGuqGB6cG';
const encryptionKey = 'SRpj2JLfaYXMhb0mTamna3VN3sDT9hEkWqCs4tU0eVo=';

const testFormats = [
  {
    name: 'Original key as provided',
    key: baseKey
  },
  {
    name: 'Live key with FLWSECK- prefix',
    key: `FLWSECK-${baseKey}-X`
  },
  {
    name: 'Live key alternative format 1',
    key: `FLWSECK_LIVE-${baseKey}`
  },
  {
    name: 'Live key alternative format 2', 
    key: `FLWSECK-${baseKey}`
  },
  {
    name: 'Test format (just in case)',
    key: `FLWSECK_TEST-${baseKey}-X`
  }
];

async function testKeyFormat(format) {
  console.log(`\n🧪 Testing: ${format.name}`);
  console.log(`🔑 Key: ${format.key.substring(0, 15)}...${format.key.substring(format.key.length - 8)}`);
  
  try {
    // Test with banks endpoint first (simpler)
    const response = await fetch('https://api.flutterwave.com/v3/banks/NG', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${format.key}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      console.log('✅ SUCCESS! Key format works!');
      console.log(`📊 Retrieved ${data.data?.length || 0} banks`);
      
      // Test account resolution if banks work
      await testAccountResolution(format.key);
      return format.key;
    } else {
      console.log(`❌ Failed: ${data.message || 'Unknown error'} (Status: ${response.status})`);
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
  return null;
}

async function testAccountResolution(workingKey) {
  console.log('\n🔍 Testing Account Resolution with working key...');
  
  try {
    const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${workingKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_number: '0690000040',
        account_bank: '044', // Access Bank
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      console.log('✅ Account resolution successful!');
      console.log(`👤 Account Name: ${data.data?.account_name || 'N/A'}`);
      console.log(`🏦 Bank: ${data.data?.bank_name || 'N/A'}`);
      console.log(`🔢 Account: ${data.data?.account_number || 'N/A'}`);
    } else {
      console.log(`❌ Account resolution failed: ${data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ Account resolution error: ${error.message}`);
  }
}

async function main() {
  console.log('🎯 Goal: Find working live key format for real-time bank resolution\n');
  
  let workingKey = null;
  
  for (const format of testFormats) {
    const result = await testKeyFormat(format);
    if (result) {
      workingKey = result;
      break;
    }
  }
  
  if (!workingKey) {
    console.log('\n❌ None of the key formats worked.');
    console.log('\n💡 Next Steps:');
    console.log('1. 🔍 Double-check your Flutterwave dashboard');
    console.log('2. 📋 Verify you\'re copying the complete SECRET KEY');
    console.log('3. ✅ Ensure your account has API access enabled');
    console.log('4. 🔄 Try regenerating your API keys if needed');
    console.log('5. 📞 Contact Flutterwave support if issues persist');
  } else {
    console.log(`\n🎉 Working key format found: ${workingKey.substring(0, 15)}...`);
    console.log('✅ Your app should now work with real-time bank resolution!');
  }
}

main();
