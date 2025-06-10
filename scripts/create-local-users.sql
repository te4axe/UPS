-- Script pour créer tous les utilisateurs dans votre base locale
-- À exécuter: psql -U postgres -d ultrapc_local -f scripts/create-local-users.sql

BEGIN;

-- Créer la table users si elle n'existe pas
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Supprimer les utilisateurs existants
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- Créer les 6 employés avec mots de passe hashés
INSERT INTO users (email, password, first_name, last_name, role, is_active) VALUES
('admin@ultrapc.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Admin', 'Hamza', 'admin', true),
('montage@ultrapc.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Montage', 'Hicham', 'assembly', true),
('reception@ultrapc.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Reception', 'Ayman', 'receptionist', true),
('emballage@ultrapc.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Emballage', 'Employee', 'packaging', true),
('expedition@ultrapc.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Expedition', 'Employee', 'shipping', true),
('composants@ultrapc.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Composants', 'Employee', 'components', true);

-- Créer la table sessions pour l'authentification
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

COMMIT;

-- Vérifier les utilisateurs créés
SELECT email, first_name, last_name, role FROM users ORDER BY id;