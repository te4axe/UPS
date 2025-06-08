# Guide d'importation de la base de données locale

## Prérequis
- PostgreSQL installé sur votre PC
- Fichier SQL exporté de Replit

## Option 1 : Installation PostgreSQL native

### Windows
```bash
# Télécharger PostgreSQL depuis https://www.postgresql.org/download/windows/
# Après installation :
createdb ultrapc_local
psql -d ultrapc_local -f ultrapc-db-export-*.sql
```

### macOS
```bash
# Avec Homebrew
brew install postgresql
brew services start postgresql
createdb ultrapc_local
psql -d ultrapc_local -f ultrapc-db-export-*.sql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb ultrapc_local
sudo -u postgres psql -d ultrapc_local -f ultrapc-db-export-*.sql
```

## Option 2 : Docker (Recommandé)

```bash
# Lancer PostgreSQL dans Docker
docker run --name postgres-ultrapc \
  -e POSTGRES_DB=ultrapc_local \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password123 \
  -p 5432:5432 \
  -d postgres:16

# Attendre que le conteneur démarre (quelques secondes)
sleep 10

# Importer la base de données
docker exec -i postgres-ultrapc psql -U admin -d ultrapc_local < ultrapc-db-export-*.sql
```

## Option 3 : Avec pgAdmin

1. Installer pgAdmin : https://www.pgadmin.org/download/
2. Créer une connexion vers votre serveur PostgreSQL
3. Créer une base `ultrapc_local`
4. Clic droit → Restore → Sélectionner le fichier SQL

## Configuration de l'application locale

Créez un fichier `.env.local` :

```env
# Base de données locale
DATABASE_URL=postgresql://admin:password123@localhost:5432/ultrapc_local

# Ou pour installation native
DATABASE_URL=postgresql://postgres:votremotdepasse@localhost:5432/ultrapc_local

# Variables de session
SESSION_SECRET=votre-secret-local-ultra-securise
NODE_ENV=development
```

## Vérification

```bash
# Tester la connexion
psql "postgresql://admin:password123@localhost:5432/ultrapc_local" -c "\dt"

# Vérifier les données
psql "postgresql://admin:password123@localhost:5432/ultrapc_local" -c "SELECT COUNT(*) FROM users;"
```

## Synchronisation continue

Pour maintenir la base locale à jour, relancez le script d'export :

```bash
node scripts/export-db.js
# Puis ré-importez le nouveau fichier
```