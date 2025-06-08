@echo off
echo Installation Ultra PC System v3.0...

REM Nettoyage complet
echo Nettoyage des caches...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

REM Copie du package.json correct
echo Configuration du projet...
copy package-clean.json package.json

REM Installation avec resolution forcee
echo Installation des dependances...
npm install --legacy-peer-deps

REM Demarrage
echo Demarrage du serveur...
npm run dev

pause