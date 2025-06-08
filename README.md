# Ultra PC - Système de Gestion des Composants

## Installation

1. **Téléchargez le projet depuis Replit**
   - Cliquez sur les 3 points (...) → Download as zip

2. **Installation locale**
   ```bash
   # Extrayez le zip dans un dossier
   # Puis dans le dossier du projet:
   
   copy package-minimal.json package.json
   npm install --legacy-peer-deps
   npm run dev
   ```

3. **Démarrage automatique**
   - Double-cliquez sur `start-ultrapc.bat` (Windows)

## Accès

- URL: http://localhost:5000
- Login: admin@ultrapc.com
- Password: admin123

## Structure du projet

- `client/` - Interface utilisateur React
- `server/` - API backend Express
- `shared/` - Types et schémas partagés
- `server-simple.js` - Serveur simplifié pour installation locale
- `package-minimal.json` - Configuration optimisée

## Fonctionnalités

- Gestion des utilisateurs et rôles
- Suivi des commandes
- Inventaire des composants
- Interface responsive
- Authentification sécurisée