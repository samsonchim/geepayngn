const express = require('express');
const { jsonDb } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all banks
router.get('/', optionalAuth, async (req, res) => {
  try {
    const banks = await jsonDb.getAllBanks();

    res.json({
      status: 'success',
      data: banks
    });
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve banks'
    });
  }
});

// Validate account number with bank
router.post('/validate', async (req, res) => {
  try {
    const { account_number, bank_code } = req.body;

    if (!account_number || !bank_code) {
      return res.status(400).json({
        status: 'error',
        message: 'Account number and bank code are required'
      });
    }

    // Check if validation is cached
    const cached = await executeQuery(
      'SELECT account_name FROM account_validations WHERE account_number = ? AND bank_code = ? AND expires_at > NOW()',
      [account_number, bank_code]
    );

    if (cached.length > 0) {
      return res.json({
        status: 'success',
        data: {
          account_name: cached[0].account_name,
          account_number,
          bank_code
        }
      });
    }

    // Get bank details
    const banks = await executeQuery(
      'SELECT bank_name FROM banks WHERE bank_code = ? AND is_active = TRUE',
      [bank_code]
    );

    if (banks.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid bank code'
      });
    }

    // For demo purposes, simulate account validation
    // In production, you would integrate with actual bank APIs like Paystack or Flutterwave
    let account_name = 'UNKNOWN ACCOUNT';
    
    // Simulate some known accounts
    const mockAccounts = {
      '0123456789': 'IBE JENIFER',
      '9876543210': 'JOHN DOE',
      '1111111111': 'JANE SMITH',
      '2222222222': 'SAMSON CHIMARAOKE CHIZOR'
    };

    if (mockAccounts[account_number]) {
      account_name = mockAccounts[account_number];
    } else {
      // Generate a random name for demo
      const firstNames = ['ADAORA', 'EMEKA', 'FATIMA', 'IBRAHIM', 'KEMI', 'TUNDE', 'BLESSING', 'CHIDI'];
      const lastNames = ['OKONKWO', 'ADEBAYO', 'MOHAMMED', 'WILLIAMS', 'ONUOHA', 'BALOGUN', 'OKORO', 'HASSAN'];
      const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
      account_name = `${randomFirst} ${randomLast}`;
    }

    // Cache the validation result for 1 hour
    await executeQuery(
      'INSERT INTO account_validations (account_number, bank_code, account_name, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR)) ON DUPLICATE KEY UPDATE account_name = VALUES(account_name), expires_at = VALUES(expires_at)',
      [account_number, bank_code, account_name]
    );

    res.json({
      status: 'success',
      data: {
        account_name,
        account_number,
        bank_code,
        bank_name: banks[0].bank_name
      }
    });
  } catch (error) {
    console.error('Account validation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Account validation failed'
    });
  }
});

// Get bank by code
router.get('/:bank_code', optionalAuth, async (req, res) => {
  try {
    const { bank_code } = req.params;

    const banks = await executeQuery(
      'SELECT id, bank_name, bank_code FROM banks WHERE bank_code = ? AND is_active = TRUE',
      [bank_code]
    );

    if (banks.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Bank not found'
      });
    }

    res.json({
      status: 'success',
      data: banks[0]
    });
  } catch (error) {
    console.error('Get bank error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve bank'
    });
  }
});

module.exports = router;
