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

## Solution définitive au problème de cache

**IMPORTANT**: Si vous voyez encore l'ancienne version après l'installation:

1. **Fermez complètement votre navigateur** (tous les onglets)
2. **Utilisez un navigateur différent** (ex: si vous utilisiez Chrome, utilisez Firefox)
3. **Ou utilisez la navigation privée/incognito**
4. **Videz le cache DNS** (Windows: `ipconfig /flushdns` dans cmd)

## Vérification version 3.0
L'interface doit maintenant afficher:
- ✅ "Ultra PC System v3.0" dans l'en-tête
- ✅ "Version Propre - Cache nettoyé" sur la page de connexion
- ✅ Interface responsive optimisée
- ✅ Authentification fonctionnelle
- ✅ Dashboard adaptatif selon les rôles

## Comptes de test
- **Admin**: admin@ultrapc.com / admin123
- **Réceptionniste**: reception@ultrapc.com / reception123  
- **Stock**: stock@ultrapc.com / stock123

## Port d'accès: http://localhost:5000