// Test your BankValidationService directly
import { BankValidationService } from './services/BankValidationService.js';

console.log('🧪 Testing Your BankValidationService Integration');
console.log('=' .repeat(50));

async function testRealTimeValidation() {
  console.log('\n🔍 Testing Real-Time Bank Account Validation...');
  
  try {
    // Test with Access Bank
    console.log('📝 Testing Account: 0690000040 at Access Bank (044)');
    
    const result = await BankValidationService.validateAccountFlutterwave('0690000040', '044');
    
    if (result.status === 'success') {
      console.log('✅ SUCCESS! Real-time validation working');
      console.log(`👤 Account Name: ${result.data?.account_name || 'N/A'}`);
      console.log(`🏦 Bank: ${result.data?.bank_name || 'Access Bank'}`);
      console.log(`🔢 Account: ${result.data?.account_number || 'N/A'}`);
    } else {
      console.log('❌ Validation failed:', result.message);
      console.log('📋 Full result:', JSON.stringify(result, null, 2));
    }
    
    // Test getting banks
    console.log('\n🏦 Testing Bank List Retrieval...');
    const banksResult = await BankValidationService.getBanksFromFlutterwave();
    
    if (banksResult.status === 'success') {
      console.log(`✅ Successfully retrieved ${banksResult.data?.length || 0} banks`);
      console.log('📋 Sample banks:', banksResult.data?.slice(0, 3).map(b => `${b.name} (${b.code})`));
    } else {
      console.log('❌ Failed to get banks:', banksResult.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testRealTimeValidation();
