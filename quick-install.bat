@echo off
echo Ultra PC System v3.0 - Installation Rapide
echo ========================================

REM Nettoyage complet
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

REM Configuration
copy package-minimal.json package.json

REM Installation
echo Installation des dependances...
npm install --legacy-peer-deps

REM Demarrage direct avec serveur standalone
echo Demarrage du serveur...
npm run dev

pause