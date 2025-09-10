import Constants from 'expo-constants';

// API Configuration for external services (sourced from app.json extras)
export const API_CONFIG = {
  PAYSTACK: {
    SECRET_KEY:
      (Constants?.expoConfig?.extra?.PAYSTACK_SECRET || Constants?.manifest2?.extra?.PAYSTACK_SECRET || '').trim(),
    BASE_URL: 'https://api.paystack.co',
  },
  FLUTTERWAVE: {
    SECRET_KEY:
      (Constants?.expoConfig?.extra?.FLUTTERWAVE_SECRET || Constants?.manifest2?.extra?.FLUTTERWAVE_SECRET || '').trim(),
    BASE_URL: 'https://api.flutterwave.com/v3',
  },
};

// Bank Validation Service
export class BankValidationService {
  // Validate account number with Paystack
  static async validateAccountPaystack(accountNumber, bankCode) {
    try {
      if (!API_CONFIG.PAYSTACK.SECRET_KEY) {
        throw new Error('Missing PAYSTACK_SECRET in app config');
      }
      const response = await fetch(`${API_CONFIG.PAYSTACK.BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.PAYSTACK.SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paystack validation error:', error);
      return { status: false, message: 'Validation failed' };
    }
  }

  // Validate account number with Flutterwave
  static async validateAccountFlutterwave(accountNumber, bankCode) {
    try {
      if (!API_CONFIG.FLUTTERWAVE.SECRET_KEY) {
        throw new Error('Missing FLUTTERWAVE_SECRET in app config');
      }
      const response = await fetch(`${API_CONFIG.FLUTTERWAVE.BASE_URL}/accounts/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: accountNumber,
          account_bank: bankCode,
        }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Flutterwave validation error:', error);
      return { status: 'error', message: 'Validation failed' };
    }
  }

  // Get list of banks from Paystack
  static async getBanksFromPaystack() {
    try {
      if (!API_CONFIG.PAYSTACK.SECRET_KEY) {
        throw new Error('Missing PAYSTACK_SECRET in app config');
      }
      const response = await fetch(`${API_CONFIG.PAYSTACK.BASE_URL}/bank?country=nigeria`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.PAYSTACK.SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching banks from Paystack:', error);
      return { status: false, data: [] };
    }
  }
}
