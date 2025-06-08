# Guide d'installation propre - Ultra PC

## Téléchargement et installation

1. **Téléchargez le projet complet depuis Replit**
   - Cliquez sur les 3 points (...) dans Replit
   - Sélectionnez "Download as zip"

2. **Installation sur votre PC**
   ```bash
   # Supprimez complètement l'ancien dossier du projet s'il existe
   
   # Extrayez le nouveau zip dans un dossier vide
   
   # Naviguez vers le dossier du projet
   cd ultrapc-management
   
   # Copiez le package.json propre
   cp package-clean.json package.json
   
   # Installation des dépendances
   npm install
   
   # Démarrage du projet
   npm run dev
   ```

3. **Configuration de la base de données**
   - Créez un fichier `.env` avec votre DATABASE_URL
   - Ou utilisez SQLite en local (automatique)

## Fichiers supprimés pour éviter les conflits
- Tous les scripts de test (create-*.js, check-*.js)
- Fichiers de cache et temporaires
- Dépendances Replit spécifiques
- Configuration Git (pour éviter les conflits)

## Le projet contient maintenant seulement
- Code source nécessaire (client/, server/, shared/)
- Configuration minimale (package.json, tsconfig.json, etc.)
- Styles optimisés (responsive design)
- Authentification fonctionnelle
- Base de données configurée

## Vérification du bon fonctionnement
Après `npm run dev`, vous devriez voir :
- ✅ Interface responsive sur tous appareils
- ✅ Connexion/déconnexion automatique
- ✅ Menu utilisateur visible sur mobile
- ✅ Dashboard adaptatif
- ✅ Navigation fluide sans erreurs