# GeePay NGN Banking App Setup Script for Windows
Write-Host "🚀 Setting up GeePay NGN Banking App..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16+ first." -ForegroundColor Red
    exit 1
}

# Check if MySQL is installed
try {
    $mysqlVersion = mysql --version
    Write-Host "✅ MySQL found" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL is not installed. Please install MySQL 8.0+ first." -ForegroundColor Red
    Write-Host "   You can download it from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green

# Backend setup
Write-Host "📦 Setting up backend..." -ForegroundColor Cyan
Set-Location backend

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Initialize database
Write-Host "🗄️ Initializing database..." -ForegroundColor Cyan
npm run init-db
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to initialize database" -ForegroundColor Red
    Write-Host "Please check your MySQL connection and credentials in .env" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database initialized successfully" -ForegroundColor Green

# Go back to root
Set-Location ..

# Frontend setup
Write-Host "📱 Setting up frontend..." -ForegroundColor Cyan

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

# Create startup script
@"
@echo off
echo 🚀 Starting GeePay NGN Banking App...

echo 🔧 Starting backend server...
cd backend
start "Backend Server" cmd /c "npm start"
cd ..

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 📱 Starting frontend...
npm start

pause
"@ | Out-File -FilePath "start-app.bat" -Encoding ASCII

Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Backend dependencies installed" -ForegroundColor Green
Write-Host "   ✅ Database created and initialized" -ForegroundColor Green
Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host "   ✅ Startup script created" -ForegroundColor Green
Write-Host ""
Write-Host "🔐 Default login credentials:" -ForegroundColor Yellow
Write-Host "   Email: samson@geepayngn.com"
Write-Host "   Password: password123"
Write-Host "   Passcode: 1234"
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Cyan
Write-Host "   Double-click start-app.bat"
Write-Host ""
Write-Host "   Or manually:" -ForegroundColor Gray
Write-Host "   1. cd backend && npm start"
Write-Host "   2. In another terminal: npm start"
Write-Host ""
Write-Host "📖 For more information, see README.md" -ForegroundColor Cyan
