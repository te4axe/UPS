/**
 * Script pour configurer l'inventaire complet sur votre PC local
 * Usage: node scripts/setup-local-inventory.js
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function setupLocalInventory() {
  console.log('🔧 Configuration de l\'inventaire local...');
  
  // Connexion à votre base locale - modifiez ces paramètres selon votre configuration
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ultrapc_local',
    password: 'password123', // Changez selon votre mot de passe
    port: 5432,
  });

  try {
    const client = await pool.connect();
    
    console.log('✅ Connexion à la base locale établie');
    
    await client.query('BEGIN');
    
    // Vider la table existante
    console.log('🗑️ Suppression des données existantes...');
    await client.query('TRUNCATE TABLE components RESTART IDENTITY CASCADE');
    
    // Insérer tous les composants
    console.log('📦 Insertion de tous les composants...');
    
    const components = [
      ['CPU-INTEL-001', 'Intel Core i7-13700K', 'CPU', 'Intel', 'i7-13700K', 399.99, 15, 'A1'],
      ['GPU-NVIDIA-001', 'RTX 4080 Super', 'GPU', 'NVIDIA', 'RTX 4080 Super', 999.99, 8, 'B2'],
      ['RAM-CORSAIR-001', 'Corsair Vengeance 32GB', 'Memory', 'Corsair', 'Vengeance LPX', 149.99, 25, 'C3'],
      ['SSD-SAMSUNG-001', 'Samsung 980 Pro 1TB', 'Storage', 'Samsung', '980 Pro', 129.99, 20, 'D1'],
      ['CPU-AMD-003', 'AMD Ryzen 9 7950X', 'CPU', 'AMD', 'Ryzen 9 7950X', 699.99, 12, 'A2'],
      ['CPU-INTEL-002', 'Intel Core i5-13600K', 'CPU', 'Intel', 'i5-13600K', 329.99, 18, 'A1'],
      ['GPU-AMD-001', 'Radeon RX 7900 XTX', 'GPU', 'AMD', 'RX 7900 XTX', 899.99, 6, 'B1'],
      ['GPU-NVIDIA-002', 'RTX 4070 Ti', 'GPU', 'NVIDIA', 'RTX 4070 Ti', 799.99, 10, 'B2'],
      ['GPU-NVIDIA-003', 'RTX 4060', 'GPU', 'NVIDIA', 'RTX 4060', 299.99, 15, 'B3'],
      ['RAM-GSKILL-001', 'G.Skill Trident Z5 32GB', 'Memory', 'G.Skill', 'Trident Z5', 179.99, 22, 'C1'],
      ['RAM-KINGSTON-001', 'Kingston Fury Beast 16GB', 'Memory', 'Kingston', 'Fury Beast', 89.99, 30, 'C2'],
      ['RAM-CORSAIR-002', 'Corsair Dominator 64GB', 'Memory', 'Corsair', 'Dominator Platinum', 399.99, 8, 'C3'],
      ['SSD-WD-001', 'WD Black SN850X 2TB', 'Storage', 'Western Digital', 'Black SN850X', 199.99, 16, 'D1'],
      ['SSD-CRUCIAL-001', 'Crucial P5 Plus 1TB', 'Storage', 'Crucial', 'P5 Plus', 99.99, 25, 'D2'],
      ['HDD-SEAGATE-001', 'Seagate Barracuda 4TB', 'Storage', 'Seagate', 'Barracuda', 89.99, 20, 'D3'],
      ['MB-ASUS-001', 'ASUS ROG STRIX X670E', 'Motherboard', 'ASUS', 'ROG STRIX X670E', 449.99, 9, 'E1'],
      ['MB-MSI-001', 'MSI B650 TOMAHAWK', 'Motherboard', 'MSI', 'B650 TOMAHAWK', 199.99, 14, 'E2'],
      ['MB-GIGABYTE-001', 'Gigabyte Z790 AORUS', 'Motherboard', 'Gigabyte', 'Z790 AORUS ELITE', 279.99, 11, 'E3'],
      ['PSU-CORSAIR-001', 'Corsair RM850x 850W', 'Power Supply', 'Corsair', 'RM850x', 149.99, 18, 'F1'],
      ['PSU-EVGA-001', 'EVGA SuperNOVA 750W', 'Power Supply', 'EVGA', 'SuperNOVA G5', 119.99, 22, 'F2'],
      ['PSU-SEASONIC-001', 'Seasonic Focus GX 1000W', 'Power Supply', 'Seasonic', 'Focus GX', 179.99, 13, 'F3'],
      ['CASE-NZXT-001', 'NZXT H7 Flow', 'Case', 'NZXT', 'H7 Flow', 129.99, 15, 'G1'],
      ['CASE-FRACTAL-001', 'Fractal Design Define 7', 'Case', 'Fractal Design', 'Define 7', 169.99, 12, 'G2'],
      ['CASE-CORSAIR-001', 'Corsair 4000D Airflow', 'Case', 'Corsair', '4000D Airflow', 94.99, 20, 'G3'],
      ['COOL-NOCTUA-001', 'Noctua NH-D15', 'Cooling', 'Noctua', 'NH-D15', 89.99, 17, 'H1'],
      ['COOL-ARCTIC-001', 'Arctic Liquid Freezer II 280', 'Cooling', 'Arctic', 'Liquid Freezer II', 99.99, 14, 'H2'],
      ['COOL-CORSAIR-001', 'Corsair H150i ELITE', 'Cooling', 'Corsair', 'H150i ELITE CAPELLIX', 189.99, 10, 'H3'],
      ['GPU-NVIDIA-004', 'RTX 4090', 'GPU', 'NVIDIA', 'RTX 4090', 1599.99, 4, 'B4'],
      ['CPU-AMD-004', 'AMD Ryzen 7 7800X3D', 'CPU', 'AMD', 'Ryzen 7 7800X3D', 449.99, 8, 'A3'],
      ['SSD-SAMSUNG-002', 'Samsung 990 EVO 2TB', 'Storage', 'Samsung', '990 EVO', 179.99, 19, 'D4'],
      ['RAM-TEAMGROUP-001', 'TeamGroup T-Force Delta 32GB', 'Memory', 'TeamGroup', 'T-Force Delta RGB', 159.99, 16, 'C4'],
      ['MB-ASROCK-001', 'ASRock B550M PRO4', 'Motherboard', 'ASRock', 'B550M PRO4', 79.99, 21, 'E4'],
      ['PSU-BEQUIET-001', 'be quiet! Straight Power 11 750W', 'Power Supply', 'be quiet!', 'Straight Power 11', 129.99, 15, 'F4']
    ];

    for (const component of components) {
      await client.query(`
        INSERT INTO components (serial_number, name, type, brand, model, price, stock_quantity, location, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW())
      `, component);
    }
    
    await client.query('COMMIT');
    
    // Vérifier le résultat
    const countResult = await client.query('SELECT COUNT(*) as count FROM components');
    const typeResult = await client.query('SELECT type, COUNT(*) as count FROM components GROUP BY type ORDER BY type');
    
    console.log(`✅ ${countResult.rows[0].count} composants ajoutés avec succès`);
    console.log('📊 Répartition par type:');
    typeResult.rows.forEach(row => {
      console.log(`  - ${row.type}: ${row.count} composants`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Vérifiez que:');
    console.log('   - PostgreSQL est démarré sur votre PC');
    console.log('   - La base "ultrapc_local" existe');
    console.log('   - Les identifiants de connexion sont corrects');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

console.log('🚀 Démarrage de la configuration de l\'inventaire local...');
main().catch(console.error);

async function main() {
  await setupLocalInventory();
  console.log('✅ Configuration terminée. Redémarrez votre serveur local avec: npm run dev');
}