# Ultra PC - Système de Gestion des Commandes

## Configuration pour le développement local

### Problème : Les modifications Replit ne s'affichent pas localement

Vous utilisez Neon comme base de données, qui est accessible depuis n'importe où. Le problème est que votre environnement local n'est pas configuré pour utiliser la même base de données.

### Solution Simple : Utiliser la même base Neon

1. **Créer le fichier de configuration**
   ```bash
   # Copier le fichier d'exemple
   cp .env.example .env
   ```

2. **Le fichier .env est déjà configuré avec votre URL Neon**
   ```
   DATABASE_URL="postgresql://neondb_owner:npg_CZKjNpQw7H5W@ep-red-sun-a8k1v496-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"
   ```

3. **Installer les dépendances et démarrer**
   ```bash
   npm install
   npm run dev
   ```

**C'est tout !** Votre environnement local utilisera maintenant la même base de données que Replit. Toutes les modifications (comme "admin" → "admin hamza") seront synchronisées automatiquement.

#### Option 2: Exporter/Importer les données de Replit

1. **Exporter depuis Replit** (dans la console Replit)
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Importer dans votre base locale**
   ```bash
   psql -d ultrapc_db -f backup.sql
   ```

#### Option 3: Base de données SQLite (Plus simple)

1. **Modifier la configuration**
   ```bash
   # Dans .env
   DATABASE_URL=file:./local.db
   ```

2. **Adapter le schéma pour SQLite**
   - Modifier `server/db.ts` pour utiliser `drizzle/better-sqlite3`
   - Installer: `npm install better-sqlite3 drizzle-orm`

### Synchronisation continue

Pour garder vos données synchronisées entre Replit et votre PC local :

1. **Script de synchronisation** (à créer)
   ```bash
   # sync-db.sh
   pg_dump $REPLIT_DATABASE_URL > temp_backup.sql
   psql -d ultrapc_db -f temp_backup.sql
   ```

2. **Utiliser un tunnel** (pour accéder directement à la DB Replit)
   ```bash
   # Exposer le port PostgreSQL de Replit
   # Puis connecter depuis votre PC
   ```

### Étapes immédiates

1. Créez un fichier `.env` basé sur `.env.example`
2. Configurez votre base de données locale
3. Exécutez `npm run db:push` pour créer les tables
4. Ajoutez des données de test ou importez depuis Replit

### Commandes utiles

```bash
# Démarrer le projet localement
npm run dev

# Pousser le schéma vers la DB
npm run db:push

# Construire pour la production
npm run build

# Démarrer en production
npm start
```

Les modifications que vous faites dans le code seront visibles, mais les données (utilisateurs, commandes, etc.) seront différentes entre Replit et votre environnement local jusqu'à ce que vous configuriez la synchronisation.