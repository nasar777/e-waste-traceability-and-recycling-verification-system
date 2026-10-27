@echo off
title EcoChain Launcher
echo ==============================================================
echo       EcoChain: E-Waste Traceability System Launcher
echo ==============================================================
echo.

echo [1/3] Starting Hardhat Local Blockchain Node...
start "EcoChain - Hardhat Node" cmd /k "cd blockchain && npx hardhat node"

echo Waiting 6 seconds for Hardhat Node to initialize...
timeout /t 6 /nobreak >nul

echo [2/3] Starting Express Backend Service...
start "EcoChain - Backend API" cmd /k "cd backend && npm start"

echo Waiting 3 seconds for Backend to connect...
timeout /t 3 /nobreak >nul

echo [3/3] Starting Vite Frontend Server...
start "EcoChain - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==============================================================
echo   All EcoChain services are launching!
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:5000
echo   - Hardhat:  http://127.0.0.1:8545
echo ==============================================================
echo.
pause
