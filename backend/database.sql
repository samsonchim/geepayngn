-- GeePay NGN Banking App Database Schema for PostgreSQL (Supabase)
-- Created for Node.js Backend

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    passcode_hash VARCHAR(255) NOT NULL,
    account_number VARCHAR(10) UNIQUE NOT NULL,
    account_balance DECIMAL(15,2) DEFAULT 0.00,
    bvn VARCHAR(11),
    date_of_birth DATE,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_account_number ON users (account_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);

-- Banks table (for external bank transfers)
CREATE TABLE IF NOT EXISTS banks (
    id SERIAL PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(10) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for banks table
CREATE INDEX IF NOT EXISTS idx_banks_bank_code ON banks (bank_code);

-- Transaction status and type enums
DO $$ BEGIN
    CREATE TYPE transaction_type_enum AS ENUM ('transfer', 'deposit', 'withdrawal', 'payment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    transaction_id UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    receiver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    transaction_type transaction_type_enum NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    status transaction_status_enum DEFAULT 'pending',
    description TEXT,
    reference VARCHAR(100),
    external_reference VARCHAR(100),
    recipient_account VARCHAR(10),
    recipient_name VARCHAR(100),
    recipient_bank_code VARCHAR(10),
    recipient_bank_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
);

-- Create indexes for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id ON transactions (transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sender_id ON transactions (sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver_id ON transactions (receiver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions (created_at);

-- Account validation cache (to avoid repeated API calls)
CREATE TABLE IF NOT EXISTS account_validations (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(10) NOT NULL,
    bank_code VARCHAR(10) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(account_number, bank_code)
);

-- Create index for account validations
CREATE INDEX IF NOT EXISTS idx_account_validations_expires_at ON account_validations (expires_at);

-- User sessions table (for JWT token management)
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(255),
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for user sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions (token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions (expires_at);

-- Notification type enum
DO $$ BEGIN
    CREATE TYPE notification_type_enum AS ENUM ('transaction', 'security', 'general', 'promotional');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at);

-- Account limits table
CREATE TABLE IF NOT EXISTS account_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_transfer_limit DECIMAL(15,2) DEFAULT 50000.00,
    monthly_transfer_limit DECIMAL(15,2) DEFAULT 500000.00,
    daily_withdrawal_limit DECIMAL(15,2) DEFAULT 20000.00,
    single_transaction_limit DECIMAL(15,2) DEFAULT 100000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for account limits
CREATE INDEX IF NOT EXISTS idx_account_limits_user_id ON account_limits (user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist and create new ones
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_account_limits_updated_at ON account_limits;
CREATE TRIGGER update_account_limits_updated_at BEFORE UPDATE ON account_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample Nigerian banks
INSERT INTO banks (bank_name, bank_code) VALUES
('Access Bank', '044'),
('Guaranty Trust Bank', '058'),
('Zenith Bank', '057'),
('First Bank of Nigeria', '011'),
('United Bank for Africa', '033'),
('Fidelity Bank', '070'),
('Union Bank of Nigeria', '032'),
('Stanbic IBTC Bank', '221'),
('Sterling Bank', '232'),
('Polaris Bank', '076'),
('Wema Bank', '035'),
('Unity Bank', '215'),
('Keystone Bank', '082'),
('FCMB', '214'),
('Jaiz Bank', '301'),
('SunTrust Bank', '100'),
('Providus Bank', '101'),
('Titan Trust Bank', '102'),
('Opay', '999992'),
('Kuda Bank', '090267'),
('PalmPay', '999991');

-- Insert a sample user for testing
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    phone, 
    password_hash, 
    passcode_hash, 
    account_number, 
    account_balance,
    bvn,
    address,
    is_verified,
    created_at
) VALUES (
    'Samson',
    'Chimaraoke',
    'samson@geepayngn.com',
    '+2348123456789',
    '$2a$10$rQ8K6Bb.a5Y6RzY5MvW/ZOpvXn.X1p2jK9m6X.BzU7cI4MzRuW1nS', -- password: password123
    '$2a$10$rQ8K6Bb.a5Y6RzY5MvW/ZOpvXn.X1p2jK9m6X.BzU7cI4MzRuW1nS', -- passcode: 1234
    '8006566000',
    800656.60,
    '12345678901',
    'No. 123 Victoria Island, Lagos, Nigeria',
    TRUE,
    '2023-01-15 10:00:00'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample transactions for the user (only if user exists)
INSERT INTO transactions (
    transaction_id,
    sender_id,
    receiver_id,
    transaction_type,
    amount,
    total_amount,
    status,
    description,
    recipient_name,
    completed_at,
    created_at
) 
SELECT 
    uuid_generate_v4(), 1, NULL, 'transfer', 1200.00, 1200.00, 'completed', 'Transfer to IBE JENIFER', 'IBE JENIFER', '2023-01-20 06:00:00'::timestamp, '2023-01-20 06:00:00'::timestamp
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
UNION ALL
SELECT 
    uuid_generate_v4(), NULL, 1, 'deposit', 800.00, 800.00, 'completed', 'Transfer From SAMSON CHIMARAOKE CHIZOR (OPAY)', 'SAMSON CHIMARAOKE CHIZOR', '2023-01-20 06:00:00'::timestamp, '2023-01-20 06:00:00'::timestamp
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
UNION ALL
SELECT 
    uuid_generate_v4(), NULL, 1, 'deposit', 1500.00, 1500.00, 'completed', 'Netflix Subscription Refund', 'Netflix', '2023-01-20 06:00:00'::timestamp, '2023-01-20 06:00:00'::timestamp
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
UNION ALL
SELECT 
    uuid_generate_v4(), 1, NULL, 'transfer', 2500.00, 2525.00, 'completed', 'Transfer to JOHN DOE', 'JOHN DOE', '2023-01-19 14:30:00'::timestamp, '2023-01-19 14:30:00'::timestamp
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
UNION ALL
SELECT 
    uuid_generate_v4(), NULL, 1, 'deposit', 5000.00, 5000.00, 'completed', 'Salary Payment', 'COMPANY LIMITED', '2023-01-18 09:00:00'::timestamp, '2023-01-18 09:00:00'::timestamp
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
UNION ALL
SELECT 
    uuid_generate_v4(), 1, NULL, 'transfer', 500.00, 500.00, 'completed', 'Transfer to JANE SMITH', 'JANE SMITH', '2023-01-17 16:45:00'::timestamp, '2023-01-17 16:45:00'::timestamp
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1);

-- Insert sample notifications (only if user exists)
INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
SELECT 1, 'Welcome to GeePay!', 'Your account has been successfully created. Start enjoying seamless banking.', 'general', FALSE, '2023-01-15 10:00:00'::timestamp
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
UNION ALL
SELECT 1, 'Transfer Completed', 'You successfully sent ₦1,200 to IBE JENIFER', 'transaction', FALSE, '2023-01-20 06:00:00'::timestamp
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
UNION ALL
SELECT 1, 'Money Received', 'You received ₦800 from SAMSON CHIMARAOKE CHIZOR (OPAY)', 'transaction', TRUE, '2023-01-20 06:00:00'::timestamp
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
UNION ALL
SELECT 1, 'Security Alert', 'Your transaction passcode was used for a transfer', 'security', TRUE, '2023-01-19 14:30:00'::timestamp
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
UNION ALL
SELECT 1, 'Monthly Statement', 'Your monthly statement is now available for download', 'general', FALSE, '2023-01-01 00:00:00'::timestamp
WHERE EXISTS (SELECT 1 FROM users WHERE id = 1);

-- Create default account limits for the sample user (only if user exists)
INSERT INTO account_limits (user_id)
SELECT 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
ON CONFLICT DO NOTHING;

-- Insert more sample banks for comprehensive testing
INSERT INTO banks (bank_name, bank_code) VALUES
('Heritage Bank', '030'),
('Standard Chartered Bank', '068'),
('Citibank Nigeria', '023'),
('Ecobank Nigeria', '050'),
('GTCO', '058'),
('Coronation Bank', '559'),
('Parallex Bank', '526'),
('Globus Bank', '00103'),
('VFD Microfinance Bank', '566'),
('Moniepoint MFB', '50515'),
('Rubies MFB', '125'),
('Sparkle Microfinance Bank', '51310')
ON CONFLICT (bank_code) DO NOTHING;
