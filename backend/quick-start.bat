@echo off
echo Setting up Class Zenith Backend with MongoDB Atlas...

REM Create .env file with Atlas connection
(
echo # Database Configuration - MongoDB Atlas ^(Cloud^)
echo MONGODB_URI=mongodb+srv://demo:demo123@cluster0.mongodb.net/class-zenith?retryWrites=true^&w=majority
echo.
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=development
echo.
echo # JWT Configuration
echo JWT_SECRET=class-zenith-super-secret-jwt-key-2024-production-ready
echo JWT_EXPIRES_IN=7d
echo.
echo # CORS Configuration
echo FRONTEND_URL=http://localhost:5173
echo.
echo # Rate Limiting
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
echo.
echo # File Upload Configuration
echo MAX_FILE_SIZE=5242880
echo UPLOAD_PATH=./uploads
echo.
echo # Logging Configuration
echo LOG_LEVEL=info
) > .env

echo .env file created with MongoDB Atlas connection!
echo.
echo Installing dependencies...
call npm install

echo.
echo Seeding database with sample data...
call npm run seed

echo.
echo Starting server...
call npm run dev
