# Guide d'installation propre - Ultra PC System v3.0

## Important: Résolution du problème de cache

Si vous voyez encore l'ancienne version malgré le formatage, suivez ces étapes:

## Téléchargement et installation

1. **Téléchargez le projet complet depuis Replit**
   - Cliquez sur les 3 points (...) dans Replit
   - Sélectionnez "Download as zip"

2. **Installation PROPRE sur votre PC**
   ```bash
   # 1. Supprimez TOUT ancien dossier ultrapc/ultrapc-management
   rm -rf ultrapc*
   
   # 2. Créez un nouveau dossier avec un nom différent
   mkdir ultrapc-system-v3
   cd ultrapc-system-v3
   
   # 3. Extrayez le zip ICI (pas dans un sous-dossier)
   
   # 4. Copiez le package.json propre
   cp package-clean.json package.json
   
   # 5. Nettoyage cache navigateur OBLIGATOIRE
   # - Chrome: Ctrl+Shift+Delete → Tout supprimer
   # - Firefox: Ctrl+Shift+Delete → Tout supprimer
   # - Edge: Ctrl+Shift+Delete → Tout supprimer
   
   # 6. Installation des dépendances
   npm install
   
   # 7. Démarrage sur un port différent
   npm run dev
   
   # 8. Ouvrez http://localhost:5000 en navigation privée
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
- ✅ Serveur démarré sur le port 5000
- ✅ Interface responsive sur tous appareils
- ✅ Connexion/déconnexion automatique avec admin@ultrapc.com / admin123
- ✅ Menu utilisateur visible sur mobile
- ✅ Dashboard adaptatif selon le rôle
- ✅ Navigation fluide sans erreurs
- ✅ WebSocket connecté pour notifications temps réel

## Compte administrateur par défaut
- Email: admin@ultrapc.com
- Mot de passe: admin123
- Accès complet à toutes les fonctionnalités