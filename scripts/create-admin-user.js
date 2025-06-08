#!/usr/bin/env node

/**
 * Script pour créer un utilisateur admin avec mot de passe hashé correctement
 */

const bcrypt = require('bcrypt');
const { Client } = require('pg');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

async function createAdminUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ultrapc_local'
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    // Hasher le mot de passe
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Mot de passe hashé généré');

    // Supprimer l'utilisateur existant s'il existe
    await client.query('DELETE FROM users WHERE email = $1', ['admin@ultrapc.com']);
    console.log('🗑️ Ancien utilisateur supprimé');

    // Créer le nouvel utilisateur
    const result = await client.query(`
      INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, email, first_name, last_name, role
    `, [
      'admin@ultrapc.com',
      hashedPassword,
      'Admin',
      'Ultra PC',
      'admin',
      true
    ]);

    console.log('✅ Utilisateur admin créé avec succès:');
    console.log(result.rows[0]);
    console.log('\n📋 IDENTIFIANTS DE CONNEXION:');
    console.log('Email: admin@ultrapc.com');
    console.log('Mot de passe: admin123');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

// Exécuter le script
createAdminUser();