#!/bin/bash

# Setup Script - Laboratoire Examens (Local Development)

set -e

echo "🚀 Setting up Laboratoire Examens..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check dependencies
echo -e "${BLUE}Checking dependencies...${NC}"

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL CLI not found. Make sure PostgreSQL server is running."
fi

echo -e "${GREEN}✓ Dependencies found${NC}"
echo ""

# Setup Backend
echo -e "${BLUE}Setting up Backend...${NC}"

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Copy environment file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp ../.env.example .env
    echo -e "${YELLOW}⚠️  Please update backend/.env with your settings${NC}"
fi

cd ..

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Setup Frontend
echo -e "${BLUE}Setting up Frontend...${NC}"

cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Copy environment file
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cp ../.env.example .env.local
    echo -e "${YELLOW}⚠️  Please update frontend/.env.local with your settings${NC}"
fi

cd ..

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# Database setup
echo -e "${BLUE}Database Setup${NC}"
echo ""
echo "Create PostgreSQL database:"
echo "  psql -U postgres -c \"CREATE DATABASE laboratoire_examens;\""
echo ""
echo "Then run migrations (from backend/):"
echo "  source venv/bin/activate"
echo "  alembic upgrade head"
echo ""

# Final instructions
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Create PostgreSQL database:"
echo "   psql -U postgres -c \"CREATE DATABASE laboratoire_examens;\""
echo ""
echo "2. Start Backend (from project root):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload"
echo ""
echo "3. Start Frontend (from project root in another terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
