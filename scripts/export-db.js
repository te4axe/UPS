#!/usr/bin/env node

/**
 * Script pour exporter la base de données Replit vers un fichier SQL
 * Usage: node scripts/export-db.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

function log(message) {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

function error(message) {
  console.error(`[${new Date().toLocaleTimeString()}] ❌ ${message}`);
}

function success(message) {
  console.log(`[${new Date().toLocaleTimeString()}] ✅ ${message}`);
}

async function exportDatabase() {
  try {
    log('🚀 Début de l\'export de la base de données...');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL n\'est pas définie dans les variables d\'environnement');
    }

    // Créer le dossier d'export s'il n'existe pas
    const exportDir = 'database-exports';
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Nom du fichier avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ultrapc-db-export-${timestamp}.sql`;
    const filepath = path.join(exportDir, filename);

    log('📊 Export de la structure et des données...');
    
    // Commande pg_dump pour exporter toute la base
    const pgDumpCommand = `pg_dump "${databaseUrl}" --clean --if-exists --create --verbose > "${filepath}"`;
    
    await execAsync(pgDumpCommand);
    
    // Vérifier que le fichier a été créé
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      success(`Export terminé avec succès !`);
      success(`Fichier: ${filepath}`);
      success(`Taille: ${(stats.size / 1024).toFixed(2)} KB`);
      
      // Afficher un aperçu du contenu
      log('📋 Aperçu du fichier:');
      const content = fs.readFileSync(filepath, 'utf8');
      const lines = content.split('\n').slice(0, 10);
      lines.forEach(line => console.log(`   ${line}`));
      
      return filepath;
    } else {
      throw new Error('Le fichier d\'export n\'a pas été créé');
    }
    
  } catch (err) {
    error(`Erreur lors de l'export: ${err.message}`);
    
    // Fallback: export manuel table par table
    log('🔄 Tentative d\'export manuel...');
    return await manualExport();
  }
}

async function manualExport() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ultrapc-manual-export-${timestamp}.sql`;
    const filepath = path.join('database-exports', filename);
    
    let sqlContent = `-- Export manuel de la base de données Ultra PC
-- Date: ${new Date().toISOString()}
-- 
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

`;

    // Tables à exporter dans l'ordre des dépendances
    const tables = [
      'users',
      'sessions', 
      'customers',
      'products',
      'components',
      'orders',
      'order_status_history',
      'order_items',
      'inventory_items',
      'notifications'
    ];

    log('📋 Export des schémas de tables...');
    for (const table of tables) {
      try {
        // Récupérer la structure de la table
        const { stdout: schema } = await execAsync(`pg_dump "${process.env.DATABASE_URL}" --schema-only --table=${table}`);
        sqlContent += `\n-- Structure pour la table ${table}\n`;
        sqlContent += schema + '\n';
      } catch (err) {
        log(`⚠️  Table ${table} ignorée: ${err.message}`);
      }
    }

    log('📊 Export des données...');
    for (const table of tables) {
      try {
        // Récupérer les données de la table
        const { stdout: data } = await execAsync(`pg_dump "${process.env.DATABASE_URL}" --data-only --table=${table} --inserts`);
        if (data.trim()) {
          sqlContent += `\n-- Données pour la table ${table}\n`;
          sqlContent += data + '\n';
        }
      } catch (err) {
        log(`⚠️  Données de ${table} ignorées: ${err.message}`);
      }
    }

    // Écrire le fichier
    fs.writeFileSync(filepath, sqlContent);
    
    const stats = fs.statSync(filepath);
    success(`Export manuel terminé !`);
    success(`Fichier: ${filepath}`);
    success(`Taille: ${(stats.size / 1024).toFixed(2)} KB`);
    
    return filepath;
    
  } catch (err) {
    error(`Erreur lors de l'export manuel: ${err.message}`);
    throw err;
  }
}

// Instructions pour l'utilisateur
function printInstructions(filepath) {
  console.log('\n📝 INSTRUCTIONS POUR IMPORTER SUR VOTRE PC:');
  console.log('');
  console.log('1. Téléchargez le fichier:', filepath);
  console.log('');
  console.log('2. Sur votre PC, installez PostgreSQL si ce n\'est pas fait');
  console.log('');
  console.log('3. Créez une nouvelle base de données:');
  console.log('   createdb ultrapc_local');
  console.log('');
  console.log('4. Importez le fichier SQL:');
  console.log(`   psql -d ultrapc_local -f ${path.basename(filepath)}`);
  console.log('');
  console.log('5. Ou avec une URL complète:');
  console.log(`   psql "postgresql://username:password@localhost:5432/ultrapc_local" -f ${path.basename(filepath)}`);
  console.log('');
  console.log('💡 Alternative avec Docker:');
  console.log('   docker run --name postgres-local -e POSTGRES_DB=ultrapc_local -e POSTGRES_PASSWORD=mypassword -p 5432:5432 -d postgres');
  console.log(`   docker exec -i postgres-local psql -U postgres -d ultrapc_local < ${path.basename(filepath)}`);
}

// Exécution
if (import.meta.url === `file://${process.argv[1]}`) {
  exportDatabase()
    .then(filepath => {
      printInstructions(filepath);
      process.exit(0);
    })
    .catch(err => {
      error(`Échec de l'export: ${err.message}`);
      process.exit(1);
    });
}

export { exportDatabase };