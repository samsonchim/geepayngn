const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token exists in database and is not expired
    const sessions = await executeQuery(
      'SELECT * FROM user_sessions WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()',
      [decoded.userId, token.substring(0, 50)] // Store only part of token for security
    );

    if (sessions.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    // Get user details
    const users = await executeQuery(
      'SELECT id, first_name, last_name, email, phone, account_number, account_balance, is_active FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }
    
    return res.status(403).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await executeQuery(
      'SELECT id, first_name, last_name, email, phone, account_number, account_balance FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (users.length > 0) {
      req.user = users[0];
    }
  } catch (error) {
    // Continue without authentication if token is invalid
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};
