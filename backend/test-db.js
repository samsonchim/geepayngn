const db = require('./config/database');

async function testDatabaseConnection() {
    try {
        console.log('🔄 Testing database connection...');
        
        // Test basic connection
        const result = await db.executeQuery('SELECT NOW() as current_time, version() as pg_version');
        
        if (result.rows && result.rows.length > 0) {
            console.log('✅ Database connection successful!');
            console.log('📅 Current time:', result.rows[0].current_time);
            console.log('🐘 PostgreSQL version:', result.rows[0].pg_version);
        }
        
        // Test if our tables exist
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'transactions', 'banks', 'notifications', 'account_limits')
            ORDER BY table_name;
        `;
        
        const tables = await db.executeQuery(tablesQuery);
        
        if (tables.rows && tables.rows.length > 0) {
            console.log('📊 Found tables:', tables.rows.map(row => row.table_name).join(', '));
        } else {
            console.log('⚠️  No application tables found. Run the database.sql script first.');
        }
        
        // Test sample data
        const userCount = await db.executeQuery('SELECT COUNT(*) as count FROM users');
        const bankCount = await db.executeQuery('SELECT COUNT(*) as count FROM banks');
        
        console.log('👥 Users in database:', userCount.rows[0].count);
        console.log('🏦 Banks in database:', bankCount.rows[0].count);
        
        console.log('🎉 Database test completed successfully!');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('💡 Make sure:');
        console.error('   - Your .env file is configured correctly');
        console.error('   - Your Supabase project is accessible');
        console.error('   - The database.sql script has been executed');
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

testDatabaseConnection();
