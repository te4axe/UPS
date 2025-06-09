-- Migration pour base de données locale : reference -> serial_number
-- À exécuter dans votre environnement local PostgreSQL

BEGIN;

-- Vérifier si la colonne serial_number existe déjà
DO $$
BEGIN
    -- Si serial_number n'existe pas, la créer
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'components' AND column_name = 'serial_number'
    ) THEN
        -- Ajouter la colonne serial_number
        ALTER TABLE components ADD COLUMN serial_number TEXT;
        
        -- Copier les données de reference vers serial_number
        UPDATE components SET serial_number = reference WHERE reference IS NOT NULL;
        
        -- Si pas de colonne reference, générer des serial_number uniques
        UPDATE components SET serial_number = 'SN' || LPAD(id::text, 6, '0') WHERE serial_number IS NULL;
        
        -- Rendre serial_number obligatoire et unique
        ALTER TABLE components ALTER COLUMN serial_number SET NOT NULL;
        ALTER TABLE components ADD CONSTRAINT components_serial_number_unique UNIQUE (serial_number);
        
        -- Supprimer l'ancienne colonne reference si elle existe
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'components' AND column_name = 'reference'
        ) THEN
            ALTER TABLE components DROP COLUMN reference;
        END IF;
        
        RAISE NOTICE 'Migration completed: reference -> serial_number';
    ELSE
        RAISE NOTICE 'Column serial_number already exists, migration skipped';
    END IF;
END
$$;

-- Supprimer min_stock_level si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'components' AND column_name = 'min_stock_level'
    ) THEN
        ALTER TABLE components DROP COLUMN min_stock_level;
        RAISE NOTICE 'Removed min_stock_level column';
    END IF;
END
$$;

COMMIT;

-- Vérifier la structure finale
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'components' 
ORDER BY ordinal_position;