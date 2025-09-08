#!/bin/bash

# GeePay NGN Banking App Setup Script
echo "🚀 Setting up GeePay NGN Banking App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL 8.0+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Backend setup
echo "📦 Setting up backend..."
cd backend

# Install backend dependencies
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Initialize database
echo "🗄️ Initializing database..."
npm run init-db
if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    echo "Please check your MySQL connection and credentials in .env"
    exit 1
fi

echo "✅ Database initialized successfully"

# Go back to root
cd ..

# Frontend setup
echo "📱 Setting up frontend..."

# Install frontend dependencies
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"

# Create startup script
cat > start-app.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting GeePay NGN Banking App..."

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend
echo "📱 Starting frontend..."
npm start

# Cleanup function
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Handle Ctrl+C
trap cleanup INT
wait
EOF

chmod +x start-app.sh

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "   ✅ Backend dependencies installed"
echo "   ✅ Database created and initialized"
echo "   ✅ Frontend dependencies installed"
echo "   ✅ Startup script created"
echo ""
echo "🔐 Default login credentials:"
echo "   Email: samson@geepayngn.com"
echo "   Password: password123"
echo "   Passcode: 1234"
echo ""
echo "🚀 To start the application:"
echo "   ./start-app.sh"
echo ""
echo "   Or manually:"
echo "   1. cd backend && npm start"
echo "   2. In another terminal: npm start"
echo ""
echo "📖 For more information, see README.md"
