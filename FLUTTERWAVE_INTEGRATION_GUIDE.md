# Flutterwave API v4 Integration Guide

## Current Status
Your app is configured for Flutterwave API integration, but the API key format needs to be corrected.

## Required API Key Format

Flutterwave API keys should follow this format:

### Test Environment
```
FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
```

### Live Environment  
```
FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
```

## How to Get the Correct API Key

1. **Log into Flutterwave Dashboard**
   - Visit: https://dashboard.flutterwave.com
   - Sign in to your account

2. **Navigate to API Keys**
   - Go to Settings > API Keys
   - Select the appropriate environment (Test/Live)

3. **Copy the Secret Key**
   - Look for "SECRET KEY" (not Public Key)
   - Copy the complete key including prefixes and suffixes

4. **Update Your Configuration**
   - Update the key in `app.json` under `extra.FLW_V4_SECRET_KEY`

## Current Configuration (app.json)

```json
{
  "expo": {
    "extra": {
      "FLW_V4_SECRET_KEY": "YOUR_CORRECT_SECRET_KEY_HERE",
      "FLW_V4_ENCRYPTION_KEY": "SRpj2JLfaYXMhb0mTamna3VN3sDT9hEkWqCs4tU0eVo="
    }
  }
}
```

## Implemented Features

### 1. Bank Account Resolution
- **Endpoint**: `/v3/accounts/resolve`
- **Purpose**: Validate account numbers and get account holder names
- **Implementation**: `BankValidationService.validateAccountFlutterwave()`

### 2. Bank List Retrieval
- **Endpoint**: `/v3/banks/NG`
- **Purpose**: Get list of Nigerian banks with codes
- **Implementation**: `BankValidationService.getBanksFromFlutterwave()`

### 3. Error Handling
- Authentication error detection
- Network error handling
- Fallback to other providers (Paystack, Nubapi)

## Testing Your Integration

Once you have the correct API key:

1. **Update app.json** with the correct secret key
2. **Run the test**: `node test-flutterwave.js`
3. **Verify in your app** by testing bank validation in the Transfer screen

## API Endpoints Used

### Account Resolution
```javascript
POST https://api.flutterwave.com/v3/accounts/resolve
Headers: {
  "Authorization": "Bearer YOUR_SECRET_KEY",
  "Content-Type": "application/json"
}
Body: {
  "account_number": "0690000040",
  "account_bank": "044"
}
```

### Get Banks
```javascript
GET https://api.flutterwave.com/v3/banks/NG
Headers: {
  "Authorization": "Bearer YOUR_SECRET_KEY",
  "Content-Type": "application/json"
}
```

## Error Codes and Troubleshooting

| Error Code | Cause | Solution |
|------------|--------|----------|
| 401 | Invalid API key | Check key format and validity |
| 403 | Insufficient permissions | Verify account permissions |
| 422 | Invalid request data | Check account number/bank code |
| 500 | Server error | Retry request |

## Next Steps

1. **Get the correct API key** from your Flutterwave dashboard
2. **Update app.json** with the correct key
3. **Test the integration** using the provided test scripts
4. **Deploy and test** in your React Native app

## Support Resources

- **Flutterwave Docs**: https://developer.flutterwave.com/docs
- **API Reference**: https://developer.flutterwave.com/reference
- **Dashboard**: https://dashboard.flutterwave.com
