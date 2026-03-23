@echo off
REM ============================================
REM Traefik CORS Fix - Deployment Script (Windows)
REM ============================================
REM This script sets up your entire stack with Traefik

setlocal enabledelayedexpansion

echo.
echo 🚀 Starting Sbali Stack with Traefik...
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found!
    echo.
    echo Please copy .env.traefik.example to .env and fill in the values:
    echo   copy .env.traefik.example .env
    echo.
    pause
    exit /b 1
)

echo ✅ .env file found
echo.

REM Create letsencrypt directory if it doesn't exist
if not exist "letsencrypt" (
    mkdir letsencrypt
    echo ✅ Directories created
) else (
    echo ✅ Directories ready
)
echo.

REM Pull latest images
echo 📦 Pulling latest images...
docker-compose -f docker-compose.traefik.yml pull
if errorlevel 1 (
    echo ❌ Failed to pull images
    pause
    exit /b 1
)
echo.

REM Build custom images
echo 🔨 Building custom images...
docker-compose -f docker-compose.traefik.yml build
if errorlevel 1 (
    echo ❌ Failed to build images
    pause
    exit /b 1
)
echo.

REM Start services
echo 🚀 Starting services...
docker-compose -f docker-compose.traefik.yml up -d
if errorlevel 1 (
    echo ❌ Failed to start services
    pause
    exit /b 1
)
echo.

REM Wait for services to be healthy
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak
echo.

REM Check service status
echo 📊 Service Status:
echo ==================
docker-compose -f docker-compose.traefik.yml ps
echo.

echo ✅ Stack is running!
echo.
echo 📍 Access Points:
echo =================
echo 🌐 Frontend:        https://sbali.in
echo 🌐 Frontend (www):  https://www.sbali.in
echo 🔌 Backend API:     https://api.sbali.in
echo 📊 Traefik:         http://localhost:8080 (Dashboard)
echo.
echo 🔗 Test CORS:
echo ============
echo curl -X OPTIONS https://api.sbali.in/api/v1/auth/login ^
echo   -H "Origin: https://sbali.in" ^
echo   -H "Access-Control-Request-Method: POST" ^
echo   -v
echo.
echo 📝 Common Commands:
echo ===================
echo docker-compose -f docker-compose.traefik.yml logs -f [service]
echo docker-compose -f docker-compose.traefik.yml restart [service]
echo docker-compose -f docker-compose.traefik.yml down
echo.
pause
