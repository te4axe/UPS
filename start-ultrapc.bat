@echo off
echo Ultra PC - Installation et Demarrage
echo ===================================

REM Verifier si les dependances sont installees
if not exist node_modules (
    echo Installation des dependances...
    copy package-minimal.json package.json
    npm install --legacy-peer-deps
)

REM Demarrage du serveur
echo Demarrage du serveur Ultra PC...
node server-simple.js

pause