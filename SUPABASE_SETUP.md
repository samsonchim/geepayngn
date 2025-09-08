# GeePay Banking App - Supabase Setup Guide

## Prerequisites
- Node.js (version 16 or higher)
- Supabase account (free tier available)
- Git

## 1. Supabase Database Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Choose a region close to your users (Nigeria/West Africa recommended)
4. Set a strong database password and save it securely

### Step 2: Database Configuration
1. In your Supabase dashboard, go to **Settings > Database**
2. Note down your connection details:
   - **Host**: `db.your-project-ref.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **Username**: `postgres`
   - **Password**: Your project password

### Step 3: Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire content of `backend/database.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema

Alternatively, you can use the Supabase CLI:
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## 2. Backend Configuration

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Supabase Database Configuration
DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_SSL=true

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase API (Optional - for future features)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

### Step 3: Test Database Connection
```bash
# Test the connection
npm run test-db

# Or start the server
npm start
```

## 3. Frontend Configuration

### Step 1: Update API Base URL
In `services/ApiService.js`, update the base URL to your deployed backend:

```javascript
const API_BASE_URL = 'https://your-backend-url.herokuapp.com'; // or your server URL
```

For local development:
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

### Step 2: Install Frontend Dependencies
```bash
# In the root directory
npm install
```

## 4. Deployment Options

### Option A: Deploy Backend to Heroku
1. Create a Heroku account and install Heroku CLI
2. In the backend directory:
```bash
git init
git add .
git commit -m "Initial commit"

heroku create your-app-name
heroku config:set DB_HOST=db.your-project-ref.supabase.co
heroku config:set DB_PORT=5432
heroku config:set DB_NAME=postgres
heroku config:set DB_USER=postgres
heroku config:set DB_PASSWORD=your-database-password
heroku config:set DB_SSL=true
heroku config:set JWT_SECRET=your-jwt-secret

git push heroku main
```

### Option B: Deploy Backend to Railway
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically from GitHub

### Option C: Deploy Backend to Render
1. Connect your GitHub repository to Render
2. Create a new web service
3. Add environment variables
4. Deploy

## 5. Mobile App Development

### Step 1: Install Expo CLI
```bash
npm install -g @expo/cli
```

### Step 2: Start Development Server
```bash
# In the root directory
npx expo start
```

### Step 3: Test on Device
- Install Expo Go app on your phone
- Scan the QR code to test the app

## 6. Database Management

### Access Database Directly
You can access your PostgreSQL database using any PostgreSQL client:

**Connection String:**
```
postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
```

**Recommended Tools:**
- pgAdmin 4 (GUI)
- TablePlus (GUI)
- psql (Command line)
- Supabase Dashboard (Web-based)

### Backup Strategy
```sql
-- Create backup
pg_dump "postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres" > backup.sql

-- Restore backup
psql "postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres" < backup.sql
```

## 7. Security Considerations

### Database Security
- Enable Row Level Security (RLS) in Supabase
- Use strong passwords
- Regularly rotate JWT secrets
- Monitor database access logs

### API Security
- Implement rate limiting (already configured)
- Use HTTPS in production
- Validate all input data
- Implement proper error handling

## 8. Testing

### Backend API Testing
```bash
cd backend
npm test

# Test specific endpoints
curl http://localhost:3000/api/auth/health
```

### Sample Test User
- **Email**: samson@geepayngn.com
- **Password**: password123
- **Passcode**: 1234
- **Account**: 8006566000

## 9. Production Checklist

- [ ] Database schema deployed to Supabase
- [ ] Backend deployed and accessible
- [ ] Environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] Error monitoring setup (Sentry recommended)
- [ ] Database backups configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Mobile app tested on real devices
- [ ] API documentation updated

## 10. Troubleshooting

### Common Issues

**Database Connection Failed:**
- Check if your IP is whitelisted in Supabase
- Verify connection string format
- Ensure SSL is enabled for production

**JWT Token Issues:**
- Verify JWT_SECRET is set correctly
- Check token expiration time
- Ensure consistent secret across deployments

**CORS Errors:**
- Update CORS configuration in backend
- Check API base URL in frontend
- Verify request headers

### Support
For issues specific to this banking app implementation, check the main README.md file or create an issue in the repository.

## 11. Next Steps

1. **Real-time Features**: Implement using Supabase Realtime
2. **File Storage**: Use Supabase Storage for documents
3. **Authentication**: Migrate to Supabase Auth (optional)
4. **Push Notifications**: Implement using Expo Notifications
5. **Analytics**: Add user analytics and transaction monitoring
