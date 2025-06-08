-- Correction rapide pour ajouter la colonne reference manquante
-- Exécuter avec: psql -U postgres -d ultrapc_local -f scripts/fix-components-reference.sql

BEGIN;

-- Ajouter la colonne reference si elle n'existe pas
ALTER TABLE components 
ADD COLUMN IF NOT EXISTS reference TEXT;

-- Créer un index unique sur reference si pas encore fait
CREATE UNIQUE INDEX IF NOT EXISTS components_reference_unique 
ON components(reference);

-- Générer des références pour les composants existants sans référence
UPDATE components 
SET reference = 'COMP-' || LPAD(id::TEXT, 3, '0')
WHERE reference IS NULL OR reference = '';

-- Rendre la colonne reference obligatoire
ALTER TABLE components 
ALTER COLUMN reference SET NOT NULL;

COMMIT;

-- Vérifier que tout est OK
SELECT 'Vérification des composants:' as info;
SELECT id, reference, name, type FROM components LIMIT 5;