const { jsonDb } = require('./backend/config/database');

async function testJsonDatabase() {
    try {
        console.log('🧪 Testing JSON Database...\n');

        // Load data
        await jsonDb.loadData();

        // Test user operations
        console.log('👤 Testing Users:');
        const user = await jsonDb.findUserByEmail('samson@geepayngn.com');
        if (user) {
            console.log(`✅ Found user: ${user.first_name} ${user.last_name}`);
            console.log(`💰 Balance: ₦${user.account_balance.toLocaleString()}`);
            console.log(`📱 Account: ${user.account_number}`);
        }

        // Test transactions
        console.log('\n💸 Testing Transactions:');
        const transactions = await jsonDb.getUserTransactions(1, 5);
        console.log(`✅ Found ${transactions.length} transactions`);
        transactions.forEach((tx, index) => {
            console.log(`  ${index + 1}. ${tx.description} - ₦${tx.amount.toLocaleString()}`);
        });

        // Test banks
        console.log('\n🏦 Testing Banks:');
        const banks = await jsonDb.getAllBanks();
        console.log(`✅ Found ${banks.length} banks`);
        console.log(`  Examples: ${banks.slice(0, 3).map(b => b.bank_name).join(', ')}`);

        // Test notifications
        console.log('\n🔔 Testing Notifications:');
        const notifications = await jsonDb.getUserNotifications(1);
        console.log(`✅ Found ${notifications.length} notifications`);
        notifications.forEach((notif, index) => {
            console.log(`  ${index + 1}. ${notif.title} ${notif.is_read ? '(read)' : '(unread)'}`);
        });

        console.log('\n🎉 JSON Database test completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   • Users: ${jsonDb.data.users.length}`);
        console.log(`   • Transactions: ${jsonDb.data.transactions.length}`);
        console.log(`   • Banks: ${jsonDb.data.banks.length}`);
        console.log(`   • Notifications: ${jsonDb.data.notifications.length}`);

        console.log('\n🚀 Ready to use! You can now:');
        console.log('   1. Start backend: cd backend && npm start');
        console.log('   2. Start frontend: npx expo start');
        console.log('   3. Login with: samson@geepayngn.com / password123 / passcode:1234');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testJsonDatabase();
