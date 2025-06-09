/**
 * Script pour corriger la base de données locale
 * Usage: node scripts/fix-local-database.js
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function fixLocalDatabase() {
  console.log('🔧 Correction de la base de données locale...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const client = await pool.connect();
    
    // Vérifier la structure actuelle
    console.log('📋 Vérification de la structure actuelle...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'components' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Colonnes actuelles:', columnsResult.rows);
    
    // Migration
    console.log('🚀 Application de la migration...');
    await client.query('BEGIN');
    
    try {
      // Vérifier si serial_number existe
      const serialNumberExists = columnsResult.rows.some(row => row.column_name === 'serial_number');
      const referenceExists = columnsResult.rows.some(row => row.column_name === 'reference');
      
      if (!serialNumberExists) {
        console.log('➕ Ajout de la colonne serial_number...');
        await client.query('ALTER TABLE components ADD COLUMN serial_number TEXT');
        
        if (referenceExists) {
          console.log('📄 Copie des données de reference vers serial_number...');
          await client.query('UPDATE components SET serial_number = reference WHERE reference IS NOT NULL');
        } else {
          console.log('🔢 Génération de serial_number uniques...');
          await client.query("UPDATE components SET serial_number = 'SN' || LPAD(id::text, 6, '0') WHERE serial_number IS NULL");
        }
        
        console.log('🔒 Configuration des contraintes...');
        await client.query('ALTER TABLE components ALTER COLUMN serial_number SET NOT NULL');
        await client.query('ALTER TABLE components ADD CONSTRAINT components_serial_number_unique UNIQUE (serial_number)');
        
        if (referenceExists) {
          console.log('🗑️ Suppression de l\'ancienne colonne reference...');
          await client.query('ALTER TABLE components DROP COLUMN reference');
        }
      } else {
        console.log('✅ La colonne serial_number existe déjà');
      }
      
      // Supprimer min_stock_level si elle existe
      const minStockExists = columnsResult.rows.some(row => row.column_name === 'min_stock_level');
      if (minStockExists) {
        console.log('🗑️ Suppression de min_stock_level...');
        await client.query('ALTER TABLE components DROP COLUMN min_stock_level');
      }
      
      await client.query('COMMIT');
      console.log('✅ Migration terminée avec succès!');
      
      // Vérifier la structure finale
      const finalResult = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'components' 
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Structure finale:');
      finalResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Fonction pour redémarrer l'application
async function restartApp() {
  console.log('🔄 Redémarrage de l\'application...');
  // L'application se redémarre automatiquement avec nodemon
  console.log('✅ Migration terminée. L\'application va redémarrer automatiquement.');
}

async function main() {
  await fixLocalDatabase();
  await restartApp();
}

main().catch(console.error);