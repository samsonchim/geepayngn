import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your server IP for testing on device

class ApiService {
  static instance = null;

  constructor() {
    if (ApiService.instance) {
      return ApiService.instance;
    }
    ApiService.instance = this;
    this.token = null;
    this.user = null;
  }

  static getInstance() {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async initializeFromStorage() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token) {
        this.token = token;
      }
      
      if (userData) {
        this.user = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  async saveToStorage() {
    try {
      if (this.token) {
        await AsyncStorage.setItem('authToken', this.token);
      }
      
      if (this.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(this.user));
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  async clearStorage() {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      this.token = null;
      this.user = null;
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options,
      };

      if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (data.status === 'success') {
      this.token = data.data.token;
      this.user = data.data.user;
      await this.saveToStorage();
    }

    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });

    if (data.status === 'success') {
      this.token = data.data.token;
      this.user = data.data.user;
      await this.saveToStorage();
    }

    return data;
  }

  async verifyPasscode(email, passcode) {
    const data = await this.request('/auth/verify-passcode', {
      method: 'POST',
      body: { email, passcode },
    });

    if (data.status === 'success') {
      this.token = data.data.token;
      this.user = data.data.user;
      await this.saveToStorage();
    }

    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed:', error);
    }
    
    await this.clearStorage();
  }

  // Bank methods
  async getBanks() {
    return this.request('/banks');
  }

  async validateAccount(accountNumber, bankCode) {
    return this.request('/banks/validate', {
      method: 'POST',
      body: { account_number: accountNumber, bank_code: bankCode },
    });
  }

  // Transaction methods
  async getTransactions(page = 1, limit = 20) {
    return this.request(`/transactions?page=${page}&limit=${limit}`);
  }

  async externalTransfer(transferData) {
    return this.request('/transactions/external', {
      method: 'POST',
      body: transferData,
    });
  }

  async internalTransfer(transferData) {
    return this.request('/transactions/internal', {
      method: 'POST',
      body: transferData,
    });
  }

  // User methods
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: profileData,
    });
  }

  async getBalance() {
    const data = await this.request('/users/balance');
    // Update local user data
    if (data.status === 'success' && this.user) {
      this.user.account_balance = data.data.balance;
      await this.saveToStorage();
    }
    return data;
  }

  async getStatistics() {
    return this.request('/users/statistics');
  }

  async changePasscode(oldPasscode, newPasscode) {
    return this.request('/users/passcode', {
      method: 'PUT',
      body: { old_passcode: oldPasscode, new_passcode: newPasscode },
    });
  }

  // Notification methods
  async getNotifications(page = 1, limit = 20) {
    return this.request(`/notifications?page=${page}&limit=${limit}`);
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getCurrentUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }
}

export default ApiService;
