import AsyncStorage from '@react-native-async-storage/async-storage';

// Local JSON database for the banking app
class LocalDataService {
  constructor() {
    this.STORAGE_KEYS = {
      USER_DATA: 'geepay_user_data',
      TRANSACTIONS: 'geepay_transactions', 
      BANKS: 'geepay_banks',
      NOTIFICATIONS: 'geepay_notifications'
    };

    // Initialize with sample data
    this.initializeData();
  }

  async initializeData() {
    try {
      // Check if data exists, if not create sample data
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (!userData) {
        await this.createSampleData();
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }

  async createSampleData() {
    // Sample user data
    const sampleUser = {
      id: '1',
      email: 'samson@geepayngn.com',
      password: 'password123', // In real app, this would be hashed
      firstName: 'Samson',
      lastName: 'Chimaraoke',
      balance: 800656.60,
      accountNumber: '1234567890',
      passcode: '1234',
      createdAt: new Date().toISOString()
    };

    // Sample transactions
    const sampleTransactions = [
      {
        id: '1',
        userId: '1',
        type: 'credit',
        amount: 50000,
        description: 'Salary Payment',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'completed'
      },
      {
        id: '2', 
        userId: '1',
        type: 'debit',
        amount: 15000,
        description: 'ATM Withdrawal',
        date: new Date(Date.now() - 86400000 * 1).toISOString(),
        status: 'completed'
      },
      {
        id: '3',
        userId: '1', 
        type: 'transfer',
        amount: 25000,
        description: 'Transfer to John Doe',
        date: new Date().toISOString(),
        status: 'completed'
      }
    ];

    // Nigerian Banks
    const nigerianBanks = [
      { name: "Access Bank", code: "044", color: "#E31E24" },
      { name: "Zenith Bank", code: "057", color: "#ED1C24" },
      { name: "Guaranty Trust Bank", code: "058", color: "#FF6600" },
      { name: "First Bank of Nigeria", code: "011", color: "#1C4B9C" },
      { name: "United Bank for Africa", code: "033", color: "#D42D2A" },
      { name: "Fidelity Bank", code: "070", color: "#5C2D91" },
      { name: "Sterling Bank", code: "232", color: "#ED7D31" },
      { name: "Stanbic IBTC Bank", code: "221", color: "#005BA4" },
      { name: "FCMB", code: "214", color: "#8CC63F" },
      { name: "Heritage Bank", code: "030", color: "#F57C00" }
    ];

    // Sample notifications
    const sampleNotifications = [
      {
        id: '1',
        userId: '1',
        title: 'Welcome to GeePay NGN!',
        message: 'Your account has been created successfully.',
        date: new Date().toISOString(),
        read: false,
        type: 'info'
      },
      {
        id: '2',
        userId: '1', 
        title: 'Transaction Alert',
        message: 'You received ₦50,000 salary payment.',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        read: false,
        type: 'transaction'
      }
    ];

    // Store sample data
    await AsyncStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(sampleUser));
    await AsyncStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(sampleTransactions));
    await AsyncStorage.setItem(this.STORAGE_KEYS.BANKS, JSON.stringify(nigerianBanks));
    await AsyncStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(sampleNotifications));

    console.log('✅ Sample data created successfully');
  }

  // Authentication
  async login(email, password) {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (!userData) return { success: false, message: 'User not found' };

      const user = JSON.parse(userData);
      if (user.email === email && user.password === password) {
        return { success: true, user: { ...user, password: undefined } };
      }

      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  }

  async verifyPasscode(email, passcode) {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (!userData) {
        return { status: 'error', message: 'User not found' };
      }

      const user = JSON.parse(userData);
      
      // Check if email matches (for future multi-user support)
      if (user.email !== email) {
        return { status: 'error', message: 'Invalid email' };
      }

      if (user.passcode === passcode) {
        return { 
          status: 'success', 
          message: 'Passcode verified',
          data: { user: user }
        };
      } else {
        return { status: 'error', message: 'Invalid passcode' };
      }
    } catch (error) {
      console.error('Passcode verification error:', error);
      return { status: 'error', message: 'Verification failed' };
    }
  }

  // User data
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (!userData) return null;

      const user = JSON.parse(userData);
      return { ...user, password: undefined }; // Don't return password
    } catch (error) {
      return null;
    }
  }

  async updateUserBalance(newBalance) {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      if (!userData) return false;

      const user = JSON.parse(userData);
      user.balance = newBalance;
      
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Transactions
  async getTransactions() {
    try {
      const transactionsData = await AsyncStorage.getItem(this.STORAGE_KEYS.TRANSACTIONS);
      return transactionsData ? JSON.parse(transactionsData) : [];
    } catch (error) {
      return [];
    }
  }

  async addTransaction(transaction) {
    try {
      const transactions = await this.getTransactions();
  const newTransaction = {
        id: Date.now().toString(),
        ...transaction,
        date: new Date().toISOString(),
        status: 'completed'
      };
      
      transactions.unshift(newTransaction); // Add to beginning
      await AsyncStorage.setItem(this.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      
      return newTransaction;
    } catch (error) {
      return null;
    }
  }

  // Transfer money
  async transferMoney(amount, recipientName, description, accountNumber = null, bankName = null) {
    try {
      const user = await this.getUserData();
      if (!user || user.balance < amount) {
        return { success: false, message: 'Insufficient balance' };
      }

      // Update balance
      const newBalance = user.balance - amount;
      await this.updateUserBalance(newBalance);

      // Add transaction
      const transaction = await this.addTransaction({
        userId: user.id,
        type: 'transfer',
        amount: amount,
        description: `Transfer to ${recipientName} - ${description}`,
        recipientName,
        accountNumber: accountNumber,
        bankName: bankName
      });

      // Add notification
      await this.addNotification({
        title: 'Transfer Successful',
        message: `₦${amount.toLocaleString()} sent to ${recipientName}`,
        type: 'transaction'
      });

      return { success: true, transaction, newBalance };
    } catch (error) {
      return { success: false, message: 'Transfer failed' };
    }
  }

  // Banks
  async getBanks() {
    try {
      const banksData = await AsyncStorage.getItem(this.STORAGE_KEYS.BANKS);
      return banksData ? JSON.parse(banksData) : [];
    } catch (error) {
      return [];
    }
  }

  // Notifications
  async getNotifications() {
    try {
      const notificationsData = await AsyncStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS);
      return notificationsData ? JSON.parse(notificationsData) : [];
    } catch (error) {
      return [];
    }
  }

  async addNotification(notification) {
    try {
      const notifications = await this.getNotifications();
      const newNotification = {
        id: Date.now().toString(),
        userId: '1',
        ...notification,
        date: new Date().toISOString(),
        read: false
      };
      
      notifications.unshift(newNotification);
      await AsyncStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      
      return newNotification;
    } catch (error) {
      return null;
    }
  }

  async markNotificationRead(notificationId) {
    try {
      const notifications = await this.getNotifications();
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification) {
        notification.read = true;
        await AsyncStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  // Utility methods
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove(Object.values(this.STORAGE_KEYS));
      console.log('✅ All data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  async resetToSampleData() {
    await this.clearAllData();
    await this.createSampleData();
    return true;
  }

  // Check if user is authenticated (has logged in)
  isAuthenticated() {
    try {
      const currentUser = this.getCurrentUser();
      return currentUser !== null;
    } catch (error) {
      return false;
    }
  }

  // Get current authenticated user
  getCurrentUser() {
    try {
      // For now, return the sample user if exists
      // In a real app, this would check authentication state
      return {
        id: 1,
        email: 'samson@geepayngn.com',
        name: 'Samson Chimaraoke Chizor',
        balance: 800656.60,
        passcode: '1234'
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

export default new LocalDataService();
