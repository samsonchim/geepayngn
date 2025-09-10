import LocalDataService from './LocalDataService';

class ApiService {
  constructor() {
    // No need for base URL anymore - everything is local
    console.log('✅ ApiService initialized with Local Data Service');
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

  async verifyPasscode(passcode) {
    try {
      return await LocalDataService.verifyPasscode(passcode);
    } catch (error) {
      console.error('Passcode verification error:', error);
      return false;
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

  async transferMoney(amount, recipientName, description) {
    try {
      const result = await LocalDataService.transferMoney(amount, recipientName, description);
      return result;
    } catch (error) {
      console.error('Transfer error:', error);
      return { success: false, message: 'Transfer failed' };
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

  async markNotificationRead(notificationId) {
    try {
      const result = await LocalDataService.markNotificationRead(notificationId);
      return { success: result };
    } catch (error) {
      console.error('Mark notification read error:', error);
      return { success: false };
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

export default new ApiService();
