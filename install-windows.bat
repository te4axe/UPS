@echo off
echo Installation Ultra PC System v3.0...

REM Nettoyage complet
echo Nettoyage des caches...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

REM Copie du package.json correct
echo Configuration du projet...
copy package-minimal.json package.json

REM Installation avec resolution forcee
echo Installation des dependances...
npm install --legacy-peer-deps

REM Copie de la configuration Vite locale
echo Configuration Vite pour installation locale...
copy vite.config.local.ts vite.config.ts

REM Demarrage
echo Demarrage du serveur...
npm run dev

pause