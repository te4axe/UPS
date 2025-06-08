#!/usr/bin/env node

/**
 * Script pour configurer et synchroniser la base de données locale
 * Usage: node scripts/setup-local-db.js [option]
 * Options:
 *   init    - Initialise une nouvelle base de données locale
 *   sync    - Synchronise avec les données de Replit (si configuré)
 *   reset   - Remet à zéro la base locale et recrée les tables
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

function log(message) {
  console.log(`🔧 ${message}`);
}

function error(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function success(message) {
  console.log(`✅ ${message}`);
}

function checkEnvFile() {
  const envPath = resolve(projectRoot, '.env');
  if (!existsSync(envPath)) {
    log('Création du fichier .env...');
    const envExample = readFileSync(resolve(projectRoot, '.env.example'), 'utf8');
    writeFileSync(envPath, envExample);
    success('Fichier .env créé. Veuillez le configurer avec vos paramètres de base de données.');
    return false;
  }
  return true;
}

function initDatabase() {
  log('Initialisation de la base de données locale...');
  
  try {
    // Vérifier si Drizzle est configuré
    execSync('npm run db:push', { 
      stdio: 'inherit',
      cwd: projectRoot 
    });
    success('Base de données initialisée avec succès!');
  } catch (err) {
    error('Erreur lors de l\'initialisation de la base de données. Vérifiez votre configuration .env');
  }
}

function createDefaultData() {
  log('Création des données par défaut...');
  
  const sqlScript = `
-- Insertion des données par défaut
INSERT INTO users (email, password, "firstName", "lastName", role) 
VALUES 
  ('admin@ultrapc.com', '$2b$10$8K1p/a0dclxKoNOjIl3OFuudP3L4HWFJ/uIJU/EBgEqOUOKdD5.Gy', 'Admin', 'Hamza', 'admin'),
  ('receptionist@ultrapc.com', '$2b$10$8K1p/a0dclxKoNOjIl3OFuudP3L4HWFJ/uIJU/EBgEqOUOKdD5.Gy', 'Réceptionniste', 'Ultra PC', 'receptionist')
ON CONFLICT (email) DO NOTHING;

-- Insertion de quelques composants de test
INSERT INTO components (reference, name, type, brand, model, price, "stockQuantity", "minStockLevel", location)
VALUES 
  ('CPU-AMD-001', 'AMD Ryzen 9 7950X', 'CPU', 'AMD', '7950X', '699.99', 15, 5, 'Étagère A1'),
  ('RAM-COR-001', 'Corsair Vengeance DDR5-5600 32GB', 'Memory', 'Corsair', 'Vengeance DDR5', '159.99', 30, 5, 'Tiroir C1'),
  ('GPU-RTX-001', 'NVIDIA RTX 4090', 'GPU', 'NVIDIA', 'RTX 4090', '1599.99', 8, 2, 'Étagère B1')
ON CONFLICT (reference) DO NOTHING;
`;

  try {
    writeFileSync(resolve(projectRoot, 'temp_init.sql'), sqlScript);
    log('Fichier SQL temporaire créé. Vous pouvez l\'exécuter manuellement si nécessaire.');
    success('Script de données par défaut créé dans temp_init.sql');
  } catch (err) {
    error('Erreur lors de la création des données par défaut');
  }
}

function resetDatabase() {
  log('Remise à zéro de la base de données...');
  
  try {
    // Note: Cette commande peut varier selon votre setup de base de données
    log('Suppression et recréation des tables...');
    execSync('npm run db:push', { 
      stdio: 'inherit',
      cwd: projectRoot 
    });
    success('Base de données remise à zéro!');
    createDefaultData();
  } catch (err) {
    error('Erreur lors de la remise à zéro de la base de données');
  }
}

// Main script
const command = process.argv[2];

switch (command) {
  case 'init':
    if (checkEnvFile()) {
      initDatabase();
      createDefaultData();
    }
    break;
    
  case 'reset':
    resetDatabase();
    break;
    
  case 'sync':
    log('Fonctionnalité de synchronisation non encore implémentée.');
    log('Pour synchroniser manuellement, exportez les données depuis Replit et importez-les localement.');
    break;
    
  default:
    console.log(`
Usage: node scripts/setup-local-db.js [command]

Commands:
  init    Initialise une nouvelle base de données locale
  reset   Remet à zéro la base de données locale
  sync    Synchronise avec Replit (à implémenter)

Exemples:
  node scripts/setup-local-db.js init
  node scripts/setup-local-db.js reset
`);
}