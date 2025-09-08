# GeePay NGN - Complete Banking App

A full-featured React Native banking application with a robust Node.js backend, designed for Nigerian users with support for local banks and seamless transactions.

## 🚀 Features

### Frontend (React Native)
- **Modern UI/UX**: Dark theme with orange accent colors
- **Secure Authentication**: 4-digit passcode login system
- **Real-time Balance**: Live balance updates with visibility toggle
- **Bank Transfers**: Support for transfers to 33+ Nigerian banks
- **Transaction History**: Complete transaction listing with pull-to-refresh
- **Account Validation**: Real-time account name resolution
- **Notifications**: In-app notification system with badge counts
- **Responsive Design**: Optimized for various screen sizes

### Backend (Node.js + PostgreSQL)
- **RESTful API**: Complete REST API with proper error handling
- **JWT Authentication**: Secure token-based authentication
- **PostgreSQL Database**: Robust relational database with proper indexing
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation using Joi
- **Security Features**: Helmet, CORS, and bcrypt password hashing
- **Transaction Management**: ACID-compliant financial transactions
- **Real-time Notifications**: User notification system
- **Supabase Ready**: Optimized for Supabase PostgreSQL hosting

## 🛠 Technology Stack

### Frontend
- React Native 0.76.5
- Expo SDK 52
- React Navigation 7
- AsyncStorage for local data
- Axios for API calls

### Backend
- Node.js with Express.js
- PostgreSQL 14+ database (Supabase compatible)
- JWT for authentication
- bcryptjs for password hashing
- Joi for validation
- Helmet for security
- CORS for cross-origin requests

## 📦 Quick Setup with Supabase

### 🎯 Recommended Setup (5 minutes)
1. **Create Supabase Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Run Database Schema**: Copy `backend/database.sql` to Supabase SQL Editor and execute
3. **Configure Backend**: Copy `backend/.env.example` to `backend/.env` and add your Supabase credentials
4. **Start Development**:
   ```bash
   # Backend
   cd backend && npm install && npm start
   
   # Frontend (new terminal)
   npx expo start
   ```

For detailed setup instructions, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

## 📱 Test Account
- **Email**: samson@geepayngn.com
- **Password**: password123
- **Passcode**: 1234
- **Balance**: ₦800,656.60

## 📦 Manual Installation

### Prerequisites
- Node.js 16+ installed
- PostgreSQL 14+ or Supabase account
- Expo CLI installed globally: `npm install -g @expo/cli`
- Git installed

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` (if exists) or use the provided `.env`
   - Update database credentials in `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=geepayngn_bank
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   ```

4. **Initialize database:**
   ```bash
   npm run init-db
   ```
   This will create the database, tables, and insert sample data.

5. **Start the backend server:**
   ```bash
   npm run dev
   # or for production
   npm start
   ```

   Server will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..  # If you're in backend directory
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API endpoint:**
   - Open `services/ApiService.js`
   - Update `API_BASE_URL` to point to your backend:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000/api'; // For emulator
   // For physical device, use your computer's IP:
   // const API_BASE_URL = 'http://192.168.1.100:3000/api';
   ```

4. **Start the React Native app:**
   ```bash
   npm start
   ```

5. **Run on device/emulator:**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## 📱 Usage

### Default Login Credentials
- **Email**: `samson@geepayngn.com`
- **Password**: `password123`
- **Passcode**: `1234`
- **Account Number**: `8006566000`
- **Initial Balance**: ₦800,656.60

### Testing Transfers
1. Use any 10-digit account number
2. Select a bank code (e.g., `044` for Access Bank)
3. The system will generate a mock account name
4. Enter transfer amount (minimum ₦50)
5. Use passcode `1234` to confirm

## 🗄️ Database Schema

The application uses a comprehensive MySQL database with the following key tables:

- **users**: User accounts and authentication
- **transactions**: All financial transactions
- **banks**: Supported Nigerian banks
- **notifications**: User notifications
- **account_validations**: Cached account validations
- **user_sessions**: JWT session management
- **account_limits**: User transaction limits

## 🔐 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Configured CORS policies
- **Security Headers**: Helmet.js security middleware

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-passcode` - Passcode verification
- `POST /api/auth/logout` - User logout

### Banks
- `GET /api/banks` - List all banks
- `POST /api/banks/validate` - Validate account number

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions/external` - External bank transfer
- `POST /api/transactions/internal` - Internal transfer

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/balance` - Get account balance
- `PUT /api/users/passcode` - Change passcode

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count

## 🚦 Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
npm start  # Starts Expo development server
```

### Database Management
```bash
cd backend
npm run init-db  # Initialize/reset database
```

## 🧪 Testing

The app includes sample data for testing:
- Pre-configured user account
- Sample transaction history
- Mock bank account validation
- Test notification system

## 📱 Supported Banks

The application supports transfers to 20+ Nigerian banks including:
- Access Bank
- Guaranty Trust Bank  
- Zenith Bank
- First Bank of Nigeria
- United Bank for Africa
- Fidelity Bank
- And many more...

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Ensure MySQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **API Connection Error**:
   - Check backend server is running
   - Verify API_BASE_URL in `services/ApiService.js`
   - For physical devices, use computer's IP address

3. **Authentication Issues**:
   - Clear app data/storage
   - Use default credentials for testing
   - Check JWT secret configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the 0BSD License - see the LICENSE file for details.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Note**: This is a demonstration banking app. Do not use in production without proper security audits and compliance checks.
Banking APP


This a fake banking app that could actually make a fake transfer to a real bank and generate recipt only that the reciptment won't see any money. 


PHP was used as the backend for doubtful reasons. No complex setup required.