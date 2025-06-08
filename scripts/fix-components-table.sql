-- Fix pour la table components - Ajouter la colonne reference manquante
-- Exécuter ce script sur votre base de données locale

-- Ajouter la colonne reference si elle n'existe pas
ALTER TABLE components 
ADD COLUMN IF NOT EXISTS reference TEXT;

-- Créer un index unique sur la référence
CREATE UNIQUE INDEX IF NOT EXISTS components_reference_unique 
ON components(reference);

-- Générer des références pour les composants existants
UPDATE components 
SET reference = CASE 
    WHEN type = 'CPU' THEN 'CPU-' || LPAD((ROW_NUMBER() OVER (PARTITION BY type ORDER BY id))::TEXT, 3, '0')
    WHEN type = 'GPU' THEN 'GPU-' || LPAD((ROW_NUMBER() OVER (PARTITION BY type ORDER BY id))::TEXT, 3, '0')
    WHEN type = 'Memory' THEN 'MEM-' || LPAD((ROW_NUMBER() OVER (PARTITION BY type ORDER BY id))::TEXT, 3, '0')
    WHEN type = 'Storage' THEN 'STO-' || LPAD((ROW_NUMBER() OVER (PARTITION BY type ORDER BY id))::TEXT, 3, '0')
    WHEN type = 'Motherboard' THEN 'MOB-' || LPAD((ROW_NUMBER() OVER (PARTITION BY type ORDER BY id))::TEXT, 3, '0')
    WHEN type = 'Power Supply' THEN 'PSU-' || LPAD((ROW_NUMBER() OVER (PARTITION BY type ORDER BY id))::TEXT, 3, '0')
    WHEN type = 'Case' THEN 'CAS-' || LPAD((ROW_NUMBER() OVER (PARTITION BY type ORDER BY id))::TEXT, 3, '0')
    WHEN type = 'Cooling' THEN 'COO-' || LPAD((ROW_NUMBER() OVER (PARTITION BY type ORDER BY id))::TEXT, 3, '0')
    ELSE 'CMP-' || LPAD((ROW_NUMBER() OVER (ORDER BY id))::TEXT, 3, '0')
END
WHERE reference IS NULL OR reference = '';

-- Rendre la colonne reference NOT NULL après avoir rempli les valeurs
ALTER TABLE components 
ALTER COLUMN reference SET NOT NULL;