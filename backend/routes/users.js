const express = require('express');
const bcrypt = require('bcryptjs');
const { jsonDb } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await jsonDb.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateRequest(schemas.updateProfile), async (req, res) => {
  try {
    const { first_name, last_name, phone, address } = req.body;
    const updateFields = [];
    const values = [];

    if (first_name) {
      updateFields.push('first_name = ?');
      values.push(first_name);
    }

    if (last_name) {
      updateFields.push('last_name = ?');
      values.push(last_name);
    }

    if (phone) {
      updateFields.push('phone = ?');
      values.push(phone);
    }

    if (address) {
      updateFields.push('address = ?');
      values.push(address);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }

    values.push(req.user.id);

    await executeQuery(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated user data
    const updatedUser = await executeQuery(
      'SELECT id, first_name, last_name, email, phone, account_number, account_balance, address FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: updatedUser[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'Phone number already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
});

// Change passcode
router.put('/passcode', authenticateToken, validateRequest(schemas.changePasscode), async (req, res) => {
  try {
    const { old_passcode, new_passcode } = req.body;

    // Get current passcode hash
    const users = await executeQuery('SELECT passcode_hash FROM users WHERE id = ?', [req.user.id]);
    
    // Verify old passcode
    const validPasscode = await bcrypt.compare(old_passcode, users[0].passcode_hash);
    if (!validPasscode) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid current passcode'
      });
    }

    // Hash new passcode
    const newPasscodeHash = await bcrypt.hash(new_passcode, 12);

    // Update passcode
    await executeQuery(
      'UPDATE users SET passcode_hash = ? WHERE id = ?',
      [newPasscodeHash, req.user.id]
    );

    // Create notification
    await executeQuery(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "security")',
      [req.user.id, 'Passcode Changed', 'Your transaction passcode has been changed successfully']
    );

    res.json({
      status: 'success',
      message: 'Passcode changed successfully'
    });
  } catch (error) {
    console.error('Change passcode error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to change passcode'
    });
  }
});

// Get account balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const users = await executeQuery(
      'SELECT account_balance FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      status: 'success',
      data: {
        balance: users[0].account_balance
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve balance'
    });
  }
});

// Get account limits
router.get('/limits', authenticateToken, async (req, res) => {
  try {
    const limits = await executeQuery(
      'SELECT * FROM account_limits WHERE user_id = ?',
      [req.user.id]
    );

    if (limits.length === 0) {
      // Create default limits if none exist
      await executeQuery('INSERT INTO account_limits (user_id) VALUES (?)', [req.user.id]);
      
      const defaultLimits = await executeQuery(
        'SELECT * FROM account_limits WHERE user_id = ?',
        [req.user.id]
      );
      
      return res.json({
        status: 'success',
        data: defaultLimits[0]
      });
    }

    res.json({
      status: 'success',
      data: limits[0]
    });
  } catch (error) {
    console.error('Get limits error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve account limits'
    });
  }
});

// Get transaction statistics
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const stats = await executeQuery(
      `SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(CASE WHEN sender_id = ? THEN total_amount ELSE 0 END), 0) as total_sent,
        COALESCE(SUM(CASE WHEN receiver_id = ? THEN amount ELSE 0 END), 0) as total_received,
        COALESCE(SUM(CASE WHEN sender_id = ? AND DATE(created_at) = CURDATE() THEN total_amount ELSE 0 END), 0) as today_sent,
        COALESCE(COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END), 0) as today_transactions
      FROM transactions 
      WHERE (sender_id = ? OR receiver_id = ?) AND status = 'completed'`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );

    res.json({
      status: 'success',
      data: stats[0]
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve statistics'
    });
  }
});

module.exports = router;
