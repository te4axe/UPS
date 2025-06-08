# Configuration Locale - Ultra PC

## Étapes pour synchroniser votre PC avec Replit

### 1. Configuration de l'environnement

Sur votre PC, dans le dossier du projet :

```bash
# Copier la configuration
cp .env.example .env
```

### 2. Vérifier le fichier .env

Le fichier `.env` doit contenir :
```
DATABASE_URL="postgresql://neondb_owner:npg_CZKjNpQw7H5W@ep-red-sun-a8k1v496-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"
SESSION_SECRET=ultrapc_secret_key_2024
```

### 3. Installation et démarrage

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### 4. Résultat

Votre application locale utilisera maintenant la même base de données Neon que Replit. Les modifications apportées sur Replit (comme le changement de "admin" en "admin hamza") apparaîtront immédiatement sur votre PC local.

### Troubleshooting

Si vous avez des erreurs :

1. **Erreur de connexion à la base de données** : Vérifiez que l'URL DATABASE_URL est correcte dans votre fichier .env

2. **Port déjà utilisé** : Le serveur démarre sur le port 5000. Si occupé, tuez le processus :
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill
   ```

3. **Dépendances manquantes** : Supprimez node_modules et réinstallez :
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Connexion

Utilisez les mêmes identifiants que sur Replit :
- Email: `admin@ultrapc.com`
- Mot de passe: `admin123`