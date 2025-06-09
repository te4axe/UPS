-- Migration pour corriger la base Replit: remplacer reference par serial_number
BEGIN;

-- Ajouter la colonne serial_number
ALTER TABLE components ADD COLUMN IF NOT EXISTS serial_number TEXT;

-- Copier les données de reference vers serial_number
UPDATE components SET serial_number = reference WHERE serial_number IS NULL;

-- Rendre serial_number obligatoire et unique
ALTER TABLE components ALTER COLUMN serial_number SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS components_serial_number_unique ON components(serial_number);

-- Supprimer l'ancienne colonne reference
DROP INDEX IF EXISTS components_reference_unique;
ALTER TABLE components DROP COLUMN IF EXISTS reference;

-- Supprimer minStockLevel si elle existe
ALTER TABLE components DROP COLUMN IF EXISTS min_stock_level;

COMMIT;