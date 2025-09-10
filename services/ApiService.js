import LocalDataService from './LocalDataService';

class ApiService {
  static instance = null;

  constructor() {
    // No need for base URL anymore - everything is local
    console.log('✅ ApiService initialized with Local Data Service');
  }

  static getInstance() {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Initialize from stored data
  async initializeFromStorage() {
    try {
      // Initialize LocalDataService
      await LocalDataService.initializeData();
      console.log('✅ ApiService initialized from storage');
    } catch (error) {
      console.error('❌ Error initializing from storage:', error);
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return LocalDataService.isAuthenticated();
  }

  // Get current user
  async getCurrentUser() {
    try {
      const user = await LocalDataService.getUserData();
      if (user) {
        // Map LocalDataService field names to what MainApp expects
        return {
          ...user,
          first_name: user.firstName,
          last_name: user.lastName,
          account_balance: user.balance
        };
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Authentication
  async login(email, password) {
    try {
      const result = await LocalDataService.login(email, password);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  async verifyPasscode(email, passcode) {
    try {
      return await LocalDataService.verifyPasscode(email, passcode);
    } catch (error) {
      console.error('Passcode verification error:', error);
      return { status: 'error', message: 'Verification failed' };
    }
  }

  // User data
  async getUserProfile() {
    try {
      const user = await LocalDataService.getUserData();
      return user ? { success: true, user } : { success: false, message: 'User not found' };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { success: false, message: 'Failed to get user profile' };
    }
  }

  async getBalance() {
    try {
      const user = await LocalDataService.getUserData();
      return { 
        status: 'success', 
        data: { 
          balance: user ? user.balance : 0 
        } 
      };
    } catch (error) {
      console.error('Get balance error:', error);
      return { 
        status: 'error', 
        data: { balance: 0 } 
      };
    }
  }

  // Transactions
  async getUserTransactions() {
    try {
      const transactions = await LocalDataService.getTransactions();
      return { success: true, transactions };
    } catch (error) {
      console.error('Get transactions error:', error);
      return { success: false, message: 'Failed to get transactions' };
    }
  }

  async getTransactions() {
    try {
      const transactions = await LocalDataService.getTransactions();
      // Format transactions to match expected format
      const formattedTransactions = transactions.map(tx => ({
        id: tx.id,
        name: tx.type === 'transfer' ? tx.description : 
              tx.type === 'credit' ? tx.description :
              tx.type === 'debit' ? tx.description : 'Transaction',
        amount: tx.type === 'credit' ? `+₦${tx.amount.toLocaleString()}` : `-₦${tx.amount.toLocaleString()}`,
        date: new Date(tx.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        type: tx.type === 'credit' ? 'incoming' : 'outgoing',
        // metadata for receipt
        meta: {
          recipientName: tx.recipientName,
          accountNumber: tx.accountNumber,
          bankName: tx.bankName,
          rawDate: tx.date,
          rawAmount: tx.amount,
          description: tx.description,
        }
      }));
      
      return { 
        status: 'success', 
        data: formattedTransactions 
      };
    } catch (error) {
      console.error('Get transactions error:', error);
      return { 
        status: 'error', 
        data: [] 
      };
    }
  }

  async transferMoney(amount, recipientName, description) {
    try {
      const result = await LocalDataService.transferMoney(amount, recipientName, description);
      return result;
    } catch (error) {
      console.error('Transfer error:', error);
      return { success: false, message: 'Transfer failed' };
    }
  }

  async receiveMoney(amount, senderName, description) {
    try {
      return await LocalDataService.receiveMoney(amount, senderName, description);
    } catch (error) {
      console.error('Receive money error:', error);
      return { success: false, message: 'Failed to credit account' };
    }
  }

  // Account validation using Flutterwave API (real-time)
  async validateAccount(accountNumber, bankCode) {
    try {
      // Import BankValidationService dynamically to avoid circular imports
      const { BankValidationService } = await import('./BankValidationService');
      
      // Use real Flutterwave validation
      console.log('🔍 ApiService: Validating account via Flutterwave...');
      const result = await BankValidationService.validateAccountFlutterwave(accountNumber, bankCode);

      if (result.status === 'success' && result.data) {
        console.log('✅ ApiService: Real validation successful');
        return {
          status: 'success',
          data: {
            account_number: result.data.account_number || accountNumber,
            account_name: result.data.account_name || 'UNKNOWN',
            bank_code: bankCode,
            bank_name: result.data.bank_name || 'Unknown Bank'
          }
        };
      } else {
        console.log('❌ ApiService: Validation failed, falling back to local data');
        // Fallback to get bank name from local banks list
        const banks = await LocalDataService.getBanks();
        const bank = banks.find(b => b.code === bankCode);
        
        return {
          status: 'error',
          message: result.message || 'Account validation failed',
          data: {
            account_number: accountNumber,
            bank_code: bankCode,
            bank_name: bank ? bank.name : 'Unknown Bank'
          }
        };
      }
    } catch (error) {
      console.error('❌ ApiService validate account error:', error);
      return { status: 'error', message: 'Validation failed' };
    }
  }

  // Banks
  async getBanks() {
    try {
  const banks = await LocalDataService.getBanks();
  return { success: true, banks };
    } catch (error) {
      console.error('Get banks error:', error);
      return { success: false, banks: [] };
    }
  }

  // Notifications  
  async getNotifications() {
    try {
      const notifications = await LocalDataService.getNotifications();
      return { success: true, notifications };
    } catch (error) {
      console.error('Get notifications error:', error);
      return { success: false, notifications: [] };
    }
  }

  async getUnreadCount() {
    try {
      const notifications = await LocalDataService.getNotifications();
      const unreadCount = notifications.filter(n => !n.read).length;
      return { 
        status: 'success', 
        data: { 
          unread_count: unreadCount 
        } 
      };
    } catch (error) {
      console.error('Get unread count error:', error);
      return { 
        status: 'success', 
        data: { unread_count: 0 } 
      };
    }
  }

  async markNotificationRead(notificationId) {
    try {
      const result = await LocalDataService.markNotificationRead(notificationId);
      return { success: result };
    } catch (error) {
      console.error('Mark notification read error:', error);
      return { success: false };
    }
  }

  // External transfer API shim (prototype): uses local data, returns shape expected by Amount.js
  async externalTransfer(transferData) {
    try {
      const { amount, account_name, account_number, bankName } = transferData;
      const result = await LocalDataService.transferMoney(
        amount,
        account_name,
        'External Transfer',
        account_number,
        bankName
      );
      if (result.success) {
        return {
          status: 'success',
          data: {
            transaction_id: result.transaction?.id || Date.now().toString(),
          },
        };
      }
      return { status: 'error', message: result.message || 'Transfer failed' };
    } catch (error) {
      console.error('External transfer error:', error);
      return { status: 'error', message: 'Transfer failed' };
    }
  }

  // Utility
  async resetApp() {
    try {
      await LocalDataService.resetToSampleData();
      return { success: true, message: 'App reset to sample data' };
    } catch (error) {
      console.error('Reset app error:', error);
      return { success: false, message: 'Failed to reset app' };
    }
  }
}

export default ApiService;
