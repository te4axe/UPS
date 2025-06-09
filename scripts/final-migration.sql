-- Script de migration complet pour corriger tous les problèmes
BEGIN;

-- Recréer la table components avec la structure correcte
DROP TABLE IF EXISTS order_components CASCADE;
DROP TABLE IF EXISTS components CASCADE;

CREATE TABLE components (
  id SERIAL PRIMARY KEY,
  serial_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  specifications JSONB,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insérer des composants d'exemple
INSERT INTO components (serial_number, name, type, brand, model, price, stock_quantity, location) VALUES
('SN-CPU-001', 'Intel Core i7-13700K', 'CPU', 'Intel', 'Core i7-13700K', 399.99, 15, 'A1'),
('SN-CPU-002', 'AMD Ryzen 7 7700X', 'CPU', 'AMD', 'Ryzen 7 7700X', 349.99, 12, 'A2'),
('SN-GPU-001', 'NVIDIA RTX 4070', 'GPU', 'NVIDIA', 'GeForce RTX 4070', 599.99, 8, 'B1'),
('SN-GPU-002', 'AMD RX 7700 XT', 'GPU', 'AMD', 'Radeon RX 7700 XT', 449.99, 6, 'B2'),
('SN-MEM-001', 'Corsair Vengeance 32GB DDR5', 'Memory', 'Corsair', 'Vengeance LPX', 159.99, 20, 'C1');

COMMIT;
