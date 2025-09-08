const axios = require('axios');

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

class GeePay {
  constructor() {
    this.token = null;
    this.user = null;
  }

  // Set authorization token
  setToken(token) {
    this.token = token;
    return this;
  }

  // Get headers with authorization
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Authentication methods
  async login(email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      if (response.data.status === 'success') {
        this.token = response.data.data.token;
        this.user = response.data.data.user;
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);

      if (response.data.status === 'success') {
        this.token = response.data.data.token;
        this.user = response.data.data.user;
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyPasscode(email, passcode) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-passcode`, {
        email,
        passcode
      });

      if (response.data.status === 'success') {
        this.token = response.data.data.token;
        this.user = response.data.data.user;
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: this.getHeaders()
      });

      this.token = null;
      this.user = null;

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bank methods
  async getBanks() {
    try {
      const response = await axios.get(`${API_BASE_URL}/banks`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateAccount(accountNumber, bankCode) {
    try {
      const response = await axios.post(`${API_BASE_URL}/banks/validate`, {
        account_number: accountNumber,
        bank_code: bankCode
      }, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Transaction methods
  async getTransactions(page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions?page=${page}&limit=${limit}`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async externalTransfer(transferData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/transactions/external`, transferData, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async internalTransfer(transferData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/transactions/internal`, transferData, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User methods
  async getProfile() {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/profile`, profileData, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBalance() {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/balance`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStatistics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/statistics`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePasscode(oldPasscode, newPasscode) {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/passcode`, {
        old_passcode: oldPasscode,
        new_passcode: newPasscode
      }, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notification methods
  async getNotifications(page = 1, limit = 20) {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUnreadCount() {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markNotificationRead(notificationId) {
    try {
      const response = await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response && error.response.data) {
      return new Error(error.response.data.message || 'API request failed');
    }
    return new Error(error.message || 'Network error');
  }
}

module.exports = GeePay;
