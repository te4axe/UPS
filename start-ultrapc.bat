@echo off
echo Ultra PC System v3.0 - Demarrage Rapide
echo ======================================

REM Verifier si les dependances sont installees
if not exist node_modules (
    echo Installation des dependances...
    copy package-minimal.json package.json
    npm install --legacy-peer-deps
)

REM Demarrage du serveur simple
echo Demarrage du serveur Ultra PC v3.0...
node server-simple.js

pause