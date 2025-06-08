# Instructions de mise à jour - Ultra PC

## Problème
Le zip téléchargé contient l'ancienne version du projet. Voici comment obtenir la version mise à jour.

## Solution 1: Copier les fichiers modifiés manuellement

Remplacez ces fichiers dans votre projet local avec les versions de Replit:

### Fichiers principaux modifiés:
1. `client/src/components/Layout.tsx` - Navigation responsive et menu utilisateur mobile
2. `client/src/pages/Dashboard.tsx` - Dashboard responsive pour tous appareils
3. `client/src/pages/Login.tsx` - Page de connexion responsive
4. `client/src/pages/UserManagement.tsx` - Ordre fixe des utilisateurs
5. `client/src/hooks/useAuth.ts` - Authentification avec redirection automatique
6. `client/src/App.tsx` - Router avec gestion d'état améliorée
7. `client/src/index.css` - Classes CSS responsive
8. `server/routes.ts` - Routes API complètes
9. `server/storage.ts` - Stockage base de données
10. `shared/schema.ts` - Schémas et types

### Pour chaque fichier:
1. Ouvrez le fichier sur Replit
2. Copiez tout le contenu
3. Remplacez le contenu du même fichier dans votre projet local
4. Sauvegardez

## Solution 2: Git (si disponible)
Si vous avez accès au repository Git de Replit:
```bash
git clone [URL_DU_REPO_REPLIT]
```

## Solution 3: Export complet depuis Replit
1. Sur Replit, cliquez sur les trois points (...) 
2. Sélectionnez "Download as zip"
3. Cela devrait donner la version actuelle mise à jour

## Vérification après mise à jour
Une fois les fichiers copiés, dans votre projet local:

```bash
npm install
npm run dev
```

Vous devriez voir:
- Interface responsive sur mobile/tablette/PC
- Bouton changement mot de passe visible sur mobile
- Navigation avec overlay mobile
- Ordre fixe des utilisateurs
- Connexion/déconnexion automatique sans refresh

## Fichiers les plus importants à copier en priorité:
1. `client/src/components/Layout.tsx` - Fix mobile
2. `client/src/hooks/useAuth.ts` - Fix authentification
3. `client/src/index.css` - Responsive CSS
4. `client/src/pages/Dashboard.tsx` - Interface responsive

Ces 4 fichiers contiennent les corrections principales.