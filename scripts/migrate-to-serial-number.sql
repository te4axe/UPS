-- Migration de reference vers serial_number
-- Exécuter avec: psql -U postgres -d ultrapc_local -f scripts/migrate-to-serial-number.sql

BEGIN;

-- Ajouter la nouvelle colonne serial_number
ALTER TABLE components 
ADD COLUMN IF NOT EXISTS serial_number TEXT;

-- Copier les données de reference vers serial_number
UPDATE components 
SET serial_number = reference 
WHERE serial_number IS NULL;

-- Rendre serial_number obligatoire et unique
ALTER TABLE components 
ALTER COLUMN serial_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS components_serial_number_unique 
ON components(serial_number);

-- Supprimer l'ancienne colonne reference et son index
DROP INDEX IF EXISTS components_reference_unique;
ALTER TABLE components 
DROP COLUMN IF EXISTS reference;

COMMIT;

-- Vérifier
SELECT 'Migration terminée - vérification:' as info;
SELECT id, serial_number, name, type FROM components LIMIT 3;