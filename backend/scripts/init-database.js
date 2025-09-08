const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const initDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...');

    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Connected to MySQL server');

    // Read and execute SQL file
    const sqlFile = path.join(__dirname, '..', 'database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL statements and execute them
    const statements = sql.split(';').filter(statement => statement.trim().length > 0);

    for (const statement of statements) {
      try {
        await connection.execute(statement);
      } catch (error) {
        // Ignore "database exists" errors
        if (!error.message.includes('database exists')) {
          console.warn('Warning executing statement:', error.message);
        }
      }
    }

    console.log('✅ Database schema created successfully');
    console.log('✅ Sample data inserted');

    await connection.end();
    console.log('🎉 Database initialization completed!');
    
    console.log('\n📋 Sample User Credentials:');
    console.log('Email: samson@geepayngn.com');
    console.log('Password: password123');
    console.log('Passcode: 1234');
    console.log('Account Number: 8006566000');
    console.log('Balance: ₦800,656.60');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

initDatabase();
