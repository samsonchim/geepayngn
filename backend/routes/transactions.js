const express = require('express');
const bcrypt = require('bcryptjs');
const { jsonDb } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    // Get transactions using JSON database
    let transactions = await jsonDb.getUserTransactions(req.user.id, limit * 5);

    // Apply filters if provided
    if (type) {
      transactions = transactions.filter(tx => tx.transaction_type === type);
    }

    if (status) {
      transactions = transactions.filter(tx => tx.status === status);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + parseInt(limit));

    // Format transactions for frontend
    const formattedTransactions = paginatedTransactions.map(tx => ({
      id: tx.transaction_id,
      name: tx.sender_id === req.user.id ? `Transfer to ${tx.recipient_name}` : `Transfer from ${tx.description}`,
      amount: tx.sender_id === req.user.id ? `-₦${tx.total_amount.toLocaleString()}` : `+₦${tx.amount.toLocaleString()}`,
      date: new Date(tx.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', ','),
      status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
      type: tx.sender_id === req.user.id ? 'outgoing' : 'incoming'
    }));

    res.json({
      status: 'success',
      data: formattedTransactions
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transactions'
    });
  }
});

// Get user balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const user = await jsonDb.findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        balance: user.account_balance,
        account_number: user.account_number,
        account_name: `${user.first_name} ${user.last_name}`
      }
    });

  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch balance'
    });
  }
});

// Transfer money
router.post('/transfer', authenticateToken, async (req, res) => {
  try {
    const { recipient_account, amount, recipient_bank, description, passcode } = req.body;

    // Validate required fields
    if (!recipient_account || !amount || !recipient_bank || !passcode) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Get user details
    const user = await jsonDb.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify passcode
    const validPasscode = await bcrypt.compare(passcode, user.passcode_hash);
    if (!validPasscode) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid passcode'
      });
    }

    // Check balance
    const transferAmount = parseFloat(amount);
    if (user.account_balance < transferAmount) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance'
      });
    }

    // Process transfer using JSON database
    const transaction = await jsonDb.transferMoney(
      req.user.id,
      null, // External transfer
      transferAmount,
      description || `Transfer to ${recipient_account}`,
      recipient_account // Using account number as recipient name for simplicity
    );

    // Create notification
    await jsonDb.createNotification({
      user_id: req.user.id,
      title: 'Transfer Completed',
      message: `You successfully sent ₦${transferAmount.toLocaleString()} to ${recipient_account}`,
      type: 'transaction',
      is_read: false
    });

    res.json({
      status: 'success',
      message: 'Transfer completed successfully',
      data: {
        transaction_id: transaction.transaction_id,
        amount: transferAmount,
        recipient_account,
        recipient_bank,
        status: transaction.status
      }
    });

  } catch (error) {
    console.error('Error processing transfer:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Transfer failed'
    });
  }
});

// Validate account number
router.post('/validate-account', authenticateToken, async (req, res) => {
  try {
    const { account_number, bank_code } = req.body;

    if (!account_number || !bank_code) {
      return res.status(400).json({
        status: 'error',
        message: 'Account number and bank code are required'
      });
    }

    // Find bank
    const bank = await jsonDb.findBankByCode(bank_code);
    if (!bank) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid bank code'
      });
    }

    // For demo purposes, return a mock account name
    // In real implementation, this would call the bank's API
    const mockAccountNames = [
      'JOHN DOE SMITH',
      'JANE MARY JOHNSON',
      'DAVID WILLIAMS BROWN',
      'SARAH ELIZABETH DAVIS',
      'MICHAEL JOSEPH MILLER'
    ];

    const randomName = mockAccountNames[Math.floor(Math.random() * mockAccountNames.length)];

    res.json({
      status: 'success',
      data: {
        account_name: randomName,
        account_number,
        bank_name: bank.bank_name
      }
    });

  } catch (error) {
    console.error('Error validating account:', error);
    res.status(500).json({
      status: 'error',
      message: 'Account validation failed'
    });
  }
});

// Get transaction by ID
router.get('/:transactionId', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await jsonDb.findTransactionById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    // Check if user owns this transaction
    if (transaction.sender_id !== req.user.id && transaction.receiver_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    res.json({
      status: 'success',
      data: transaction
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transaction'
    });
  }
});

module.exports = router;
