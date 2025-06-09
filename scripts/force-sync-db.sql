-- Synchronisation forcée de la base de données locale avec le schéma correct
BEGIN;

-- Supprimer et recréer la table components avec la bonne structure
DROP TABLE IF EXISTS order_components CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS components CASCADE;

-- Recréer la table components avec la structure correcte
CREATE TABLE components (
    id SERIAL PRIMARY KEY,
    serial_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    specifications JSONB,
    price NUMERIC(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insérer quelques données de test
INSERT INTO components (serial_number, name, type, brand, model, price, stock_quantity, location) VALUES
('CPU-INTEL-001', 'Intel Core i7-13700K', 'CPU', 'Intel', 'i7-13700K', 399.99, 15, 'A1'),
('GPU-NVIDIA-001', 'RTX 4080 Super', 'GPU', 'NVIDIA', 'RTX 4080 Super', 999.99, 8, 'B2'),
('RAM-CORSAIR-001', 'Corsair Vengeance 32GB', 'Memory', 'Corsair', 'Vengeance LPX', 149.99, 25, 'C3'),
('SSD-SAMSUNG-001', 'Samsung 980 Pro 1TB', 'Storage', 'Samsung', '980 Pro', 129.99, 20, 'D1');

COMMIT;

-- Vérifier la structure finale
SELECT 'Structure de la table components:' as info;
\d components;

SELECT 'Données de test insérées:' as info;
SELECT id, serial_number, name, type, stock_quantity FROM components;