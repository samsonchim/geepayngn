// Debug database loading
console.log('=== Database Debug ===');

try {
    console.log('1. Loading jsonDb...');
    const jsonDb = require('./database/jsonDb');
    console.log('2. jsonDb loaded:', typeof jsonDb);
    console.log('3. jsonDb methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(jsonDb)));

    console.log('4. Loading database config...');
    const dbConfig = require('./config/database');
    console.log('5. Database config loaded:', typeof dbConfig);
    console.log('6. Exported keys:', Object.keys(dbConfig));
    console.log('7. connectDB type:', typeof dbConfig.connectDB);

    if (dbConfig.connectDB) {
        console.log('8. Testing connectDB...');
        dbConfig.connectDB().then(() => {
            console.log('9. ✅ connectDB works!');
        }).catch(err => {
            console.log('9. ❌ connectDB failed:', err.message);
        });
    }
} catch (error) {
    console.error('❌ Debug failed:', error);
}
