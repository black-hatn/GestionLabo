@echo off
REM Setup Script - Laboratoire Examens (Local Development - Windows)

echo.
echo 🚀 Setting up Laboratoire Examens...
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 3 is required but not installed.
    exit /b 1
)

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    exit /b 1
)

echo ✓ Dependencies found
echo.

REM Setup Backend
echo Setting up Backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing backend dependencies...
pip install -r requirements.txt

REM Copy environment file
if not exist ".env" (
    echo Creating .env file...
    copy ..\. .env
    echo ⚠️  Please update backend\.env with your settings
)

cd ..

echo ✓ Backend setup complete
echo.

REM Setup Frontend
echo Setting up Frontend...
cd frontend

REM Install dependencies
echo Installing frontend dependencies...
call npm install

REM Copy environment file
if not exist ".env.local" (
    echo Creating .env.local file...
    copy ..\.env.example .env.local
    echo ⚠️  Please update frontend\.env.local with your settings
)

cd ..

echo ✓ Frontend setup complete
echo.

REM Final instructions
echo ✓ Setup complete!
echo.
echo Next steps:
echo.
echo 1. Create PostgreSQL database:
echo    psql -U postgres -c "CREATE DATABASE laboratoire_examens;"
echo.
echo 2. Start Backend (from project root in Command Prompt):
echo    cd backend
echo    venv\Scripts\activate.bat
echo    uvicorn app.main:app --reload
echo.
echo 3. Start Frontend (from project root in another Command Prompt):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Access the application:
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.

pause
