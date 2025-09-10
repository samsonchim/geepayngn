# GeePay NGN - Banking App Prototype

A complete mobile banking application built with React Native and Expo. This is a prototype banking app that stores all data locally using AsyncStorage - no backend server required!

## ✨ Features

- **Complete Banking UI** - Modern, clean interface
- **Authentication** - Email/Password login + 4-digit passcode
- **Account Management** - View balance, account details
- **Transactions** - View transaction history, make transfers
- **Nigerian Banks** - Complete list of Nigerian banks
- **Notifications** - Transaction alerts and app notifications
- **Local Storage** - All data stored locally using AsyncStorage

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the app:**
   ```bash
   npx expo start
   ```

3. **Login with test account:**
   - Email: `samson@geepayngn.com`
   - Password: `password123`
   - Passcode: `1234`

## 📱 Test Account Details

- **Balance:** ₦800,656.60
- **Account Number:** 1234567890
- **Sample Transactions:** Salary payments, transfers, withdrawals
- **Sample Notifications:** Welcome message, transaction alerts

## 🏗️ Architecture

### Frontend (React Native + Expo)
- **React Navigation** - Navigation between screens
- **AsyncStorage** - Local data persistence
- **Expo SDK 52** - Stable development platform

### Data Storage (Local JSON)
- **LocalDataService** - Handles all data operations
- **AsyncStorage** - Stores user data, transactions, banks, notifications
- **No Backend Required** - Perfect for prototyping

## 📂 Project Structure

```
geepayngn/
├── services/
│   ├── LocalDataService.js  # Local JSON data management
│   └── ApiService.js        # API interface (now uses local data)
├── assets/                  # Icons, images, splash screens
├── MainApp.js              # Main app component
├── AppNavigator.js         # Navigation setup
├── PasscodeScreen.js       # 4-digit passcode entry
├── Transfer.js             # Money transfer screen
├── Amount.js               # Amount input screen
├── Success.js              # Success confirmation
└── BUILD_INSTRUCTIONS.md   # Detailed build instructions
```

## 🔧 Building APK

See [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) for complete build instructions.

**Quick Build:**
```bash
npx eas build -p android --profile preview
```

## 💾 Data Storage

All app data is stored locally using AsyncStorage:
- **User Data** - Profile, balance, credentials
- **Transactions** - Complete transaction history  
- **Banks** - Nigerian bank list with codes
- **Notifications** - App notifications and alerts

Data persists between app sessions and survives app updates.

## 🧪 Testing

The app comes pre-loaded with sample data:
- Test user with realistic balance
- Sample transaction history
- Nigerian banks database
- Welcome notifications

Perfect for testing all banking features without any server setup!

## 🔐 Security Note

This is a prototype app. In a production banking app:
- Passwords would be properly hashed
- Biometric authentication would be implemented
- Data would be encrypted
- Real banking API integration would be required
- Proper security audits would be conducted

## 📋 Features Completed

- ✅ User Authentication (Email + Passcode)
- ✅ Account Balance Display
- ✅ Transaction History
- ✅ Money Transfers
- ✅ Nigerian Banks List
- ✅ Push Notifications
- ✅ Local Data Persistence
- ✅ Clean Banking UI
- ✅ APK Build Configuration

## 🚀 Next Steps

1. Build and test APK on real device
2. Add more banking features (bill payments, airtime, etc.)
3. Implement biometric authentication
4. Add data encryption for production
5. Connect to real banking APIs

---

**Perfect for:** Banking app prototypes, UI/UX testing, React Native learning, offline-first apps
