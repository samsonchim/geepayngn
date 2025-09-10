import Constants from 'expo-constants';

// API Configuration for external services (sourced from app.json extras)
export const API_CONFIG = {
  FLUTTERWAVE: {
    SECRET_KEY:
      (
        // Prefer v4 key if provided
        Constants?.expoConfig?.extra?.FLW_V4_SECRET_KEY ||
        Constants?.manifest2?.extra?.FLW_V4_SECRET_KEY ||
        // Fallbacks
        Constants?.expoConfig?.extra?.FLUTTERWAVE_SECRET ||
        Constants?.expoConfig?.extra?.FLW_CLIENT_SECRET ||
        Constants?.manifest2?.extra?.FLUTTERWAVE_SECRET ||
        Constants?.manifest2?.extra?.FLW_CLIENT_SECRET ||
        ''
      ).trim(),
    PUBLIC_KEY:
      (
        Constants?.expoConfig?.extra?.FLW_V4_PUBLIC_KEY ||
        Constants?.manifest2?.extra?.FLW_V4_PUBLIC_KEY ||
        Constants?.expoConfig?.extra?.FLW_PUBLIC_KEY ||
        Constants?.manifest2?.extra?.FLW_PUBLIC_KEY ||
        ''
      ).trim(),
    ENCRYPTION_KEY:
      (
        Constants?.expoConfig?.extra?.FLW_V4_ENCRYPTION_KEY ||
        Constants?.manifest2?.extra?.FLW_V4_ENCRYPTION_KEY ||
        Constants?.expoConfig?.extra?.FLW_ENCRYPTION_KEY ||
        Constants?.manifest2?.extra?.FLW_ENCRYPTION_KEY ||
        ''
      ).trim(),
    BASE_URL: 'https://api.flutterwave.com/v3', // v4 endpoints use same v3 base URL
  },
  NUBAPI: {
    TOKEN:
      (Constants?.expoConfig?.extra?.NUBAPI_TOKEN || Constants?.manifest2?.extra?.NUBAPI_TOKEN || '').trim(),
    BASE_URL: 'https://nubapi.com',
  },
};

// Bank Validation Service
export class BankValidationService {
  // Validate account number with Nubapi
  static async validateAccountNubapi(accountNumber, bankCode) {
    try {
      if (!API_CONFIG.NUBAPI.TOKEN) {
        throw new Error('Missing NUBAPI_TOKEN in app config');
      }
      const url = `${API_CONFIG.NUBAPI.BASE_URL}/api/verify?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${API_CONFIG.NUBAPI.TOKEN}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Nubapi validation error:', error);
      return { status: false, message: 'Validation failed' };
    }
  }

  // Validate account number with Flutterwave
  static async validateAccountFlutterwave(accountNumber, bankCode) {
    try {
      if (!API_CONFIG.FLUTTERWAVE.SECRET_KEY) {
        throw new Error('Missing FLUTTERWAVE_SECRET in app config');
      }

      console.log('🔍 Flutterwave: Validating account', accountNumber, 'at bank', bankCode);
      
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
      console.log('📊 Flutterwave response:', data);

      if (!response.ok) {
        // Surface clearer errors for auth issues (support v3/v4 keys)
        if (response.status === 401 || response.status === 403) {
          console.warn('⚠️ Flutterwave API authentication failed. Please verify your secret key format.');
          console.warn('📝 Expected format: FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X (test) or FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X (live)');
          return { 
            status: 'error', 
            message: 'Invalid Flutterwave Secret Key. Please check your dashboard for the correct key format.',
            code: 'AUTH_ERROR'
          };
        }
        return { 
          status: 'error', 
          message: data?.message || 'Flutterwave validation failed',
          code: 'API_ERROR'
        };
      }
      
      // Success case
      if (data.status === 'success' && data.data) {
        return {
          status: 'success',
          data: {
            account_name: data.data.account_name,
            account_number: data.data.account_number,
            bank_code: bankCode,
            bank_name: data.data.bank_name || 'Unknown Bank'
          }
        };
      }
      
      return data;
    } catch (error) {
      console.error('❌ Flutterwave validation error:', error);
      return { 
        status: 'error', 
        message: 'Network error during validation',
        code: 'NETWORK_ERROR'
      };
    }
  }

  // Get list of banks from Flutterwave
  static async getBanksFromFlutterwave() {
    try {
      if (!API_CONFIG.FLUTTERWAVE.SECRET_KEY) {
        throw new Error('Missing FLUTTERWAVE_SECRET in app config');
      }
      const response = await fetch(`${API_CONFIG.FLUTTERWAVE.BASE_URL}/banks/NG`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.FLUTTERWAVE.SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (!response.ok) {
        console.error('Flutterwave banks API error:', data);
        return { status: 'error', message: data?.message || 'Failed to fetch banks from Flutterwave' };
      }
      return data;
    } catch (error) {
      console.error('Error fetching banks from Flutterwave:', error);
      return { status: 'error', message: 'Failed to fetch banks from Flutterwave' };
    }
  }
}
