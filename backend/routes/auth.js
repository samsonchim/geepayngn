const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { jsonDb } = require('../config/database');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// Generate account number
const generateAccountNumber = async () => {
  let accountNumber;
  let exists = true;
  
  while (exists) {
    accountNumber = '80' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    const result = await executeQuery('SELECT id FROM users WHERE account_number = ?', [accountNumber]);
    exists = result.length > 0;
  }
  
  return accountNumber;
};

// Register new user
router.post('/register', validateRequest(schemas.register), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, passcode, date_of_birth } = req.body;

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email, phone]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email or phone already exists'
      });
    }

    // Hash password and passcode
    const passwordHash = await bcrypt.hash(password, 12);
    const passcodeHash = await bcrypt.hash(passcode, 12);
    const accountNumber = await generateAccountNumber();

    // Insert new user
    const result = await executeQuery(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, passcode_hash, account_number, date_of_birth) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, passwordHash, passcodeHash, accountNumber, date_of_birth]
    );

    // Create default account limits
    await executeQuery('INSERT INTO account_limits (user_id) VALUES (?)', [result.insertId]);

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Store session
    await executeQuery(
      'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [result.insertId, token.substring(0, 50)]
    );

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      data: {
        user: {
          id: result.insertId,
          first_name,
          last_name,
          email,
          phone,
          account_number: accountNumber,
          account_balance: '0.00'
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create account'
    });
  }
});

// Login user
router.post('/login', validateRequest(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user using JSON database
    const user = await jsonDb.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    if (!user.is_active && user.is_active !== undefined) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is inactive'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Store session
    await executeQuery(
      'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [user.id, token.substring(0, 50)]
    );

    // Remove sensitive data
    delete user.password_hash;

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed'
    });
  }
});

// Verify passcode
router.post('/verify-passcode', async (req, res) => {
  try {
    const { email, passcode } = req.body;

    if (!email || !passcode) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and passcode are required'
      });
    }

    // Find user
    const users = await executeQuery(
      'SELECT id, first_name, last_name, email, phone, passcode_hash, account_number, account_balance FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = users[0];

    // Verify passcode
    const validPasscode = await bcrypt.compare(passcode, user.passcode_hash);
    if (!validPasscode) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid passcode'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Store session
    await executeQuery(
      'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [user.id, token.substring(0, 50)]
    );

    // Remove sensitive data
    delete user.passcode_hash;

    res.json({
      status: 'success',
      message: 'Passcode verified successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Passcode verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Passcode verification failed'
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Remove session from database
      await executeQuery('DELETE FROM user_sessions WHERE token_hash = ?', [token.substring(0, 50)]);
    }

    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed'
    });
  }
});

module.exports = router;
