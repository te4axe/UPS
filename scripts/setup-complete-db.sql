-- Script complet pour configurer la base de données Ultra PC avec tous les employés
-- Exécuter avec: psql -U postgres -d ultrapc_local -f scripts/setup-complete-db.sql

BEGIN;

-- Supprimer tous les utilisateurs existants
DELETE FROM users;

-- Créer les 6 employés avec mots de passe hashés
-- Tous les mots de passe sont: password123

-- 1. Administrateur Hamza
INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at) VALUES
(1, 'admin@ultrapc.com', '$2b$10$CJLw7Ws2VfehhU.xh0eoq.Fsm2RycJmuPji2kq2h3N4yZsdgbxyDC', 'Hamza', 'Administrateur', 'admin', true, NOW(), NOW());

-- 2. Montage Hicham
INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at) VALUES
(2, 'montage@ultrapc.com', '$2b$10$CJLw7Ws2VfehhU.xh0eoq.Fsm2RycJmuPji2kq2h3N4yZsdgbxyDC', 'Hicham', 'Montage', 'assembly', true, NOW(), NOW());

-- 3. Réception Ayman
INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at) VALUES
(3, 'reception@ultrapc.com', '$2b$10$CJLw7Ws2VfehhU.xh0eoq.Fsm2RycJmuPji2kq2h3N4yZsdgbxyDC', 'Ayman', 'Réception', 'receptionist', true, NOW(), NOW());

-- 4. Employé Emballage
INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at) VALUES
(4, 'emballage@ultrapc.com', '$2b$10$CJLw7Ws2VfehhU.xh0eoq.Fsm2RycJmuPji2kq2h3N4yZsdgbxyDC', 'Employé', 'Emballage', 'packaging', true, NOW(), NOW());

-- 5. Employé Expédition
INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at) VALUES
(5, 'expedition@ultrapc.com', '$2b$10$CJLw7Ws2VfehhU.xh0eoq.Fsm2RycJmuPji2kq2h3N4yZsdgbxyDC', 'Employé', 'Expédition', 'shipping', true, NOW(), NOW());

-- 6. Responsable Composants
INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at) VALUES
(6, 'composants@ultrapc.com', '$2b$10$CJLw7Ws2VfehhU.xh0eoq.Fsm2RycJmuPji2kq2h3N4yZsdgbxyDC', 'Responsable', 'Composants', 'admin', true, NOW(), NOW());

-- Réinitialiser la séquence des IDs
SELECT setval('users_id_seq', 6, true);

-- Supprimer tous les composants existants
DELETE FROM components;

-- Ajouter des composants d'exemple avec références
INSERT INTO components (id, reference, name, type, brand, model, specifications, price, stock_quantity, min_stock_level, location, is_active, created_at) VALUES
(1, 'CPU-I7-13700K', 'Intel Core i7-13700K', 'CPU', 'Intel', 'Core i7-13700K', '{"cores": 16, "threads": 24, "base_clock": "3.4 GHz", "boost_clock": "5.4 GHz"}', 399.99, 15, 5, 'Rayon A - Étagère 1', true, NOW()),
(2, 'CPU-R7-7700X', 'AMD Ryzen 7 7700X', 'CPU', 'AMD', 'Ryzen 7 7700X', '{"cores": 8, "threads": 16, "base_clock": "4.5 GHz", "boost_clock": "5.4 GHz"}', 349.99, 12, 5, 'Rayon A - Étagère 2', true, NOW()),
(3, 'GPU-RTX-4070', 'NVIDIA GeForce RTX 4070', 'GPU', 'NVIDIA', 'GeForce RTX 4070', '{"memory": "12GB GDDR6X", "memory_bus": "192-bit", "boost_clock": "2475 MHz"}', 599.99, 8, 3, 'Rayon B - Étagère 1', true, NOW()),
(4, 'GPU-RX-7700XT', 'AMD Radeon RX 7700 XT', 'GPU', 'AMD', 'Radeon RX 7700 XT', '{"memory": "12GB GDDR6", "memory_bus": "192-bit", "boost_clock": "2544 MHz"}', 449.99, 6, 3, 'Rayon B - Étagère 2', true, NOW()),
(5, 'MEM-CORS-32GB', 'Corsair Vengeance LPX 32GB DDR5', 'Memory', 'Corsair', 'Vengeance LPX', '{"capacity": "32GB", "type": "DDR5", "speed": "5600 MHz", "latency": "CL36"}', 159.99, 20, 10, 'Rayon C - Étagère 1', true, NOW()),
(6, 'STO-SAM-980PRO', 'Samsung 980 PRO 1TB NVMe', 'Storage', 'Samsung', '980 PRO', '{"capacity": "1TB", "interface": "PCIe 4.0", "read_speed": "7000 MB/s", "write_speed": "5000 MB/s"}', 129.99, 25, 10, 'Rayon D - Étagère 1', true, NOW()),
(7, 'MB-ASUS-B650', 'ASUS ROG Strix B650-E', 'Motherboard', 'ASUS', 'ROG Strix B650-E', '{"socket": "AM5", "chipset": "B650E", "form_factor": "ATX", "memory_slots": 4}', 279.99, 10, 5, 'Rayon E - Étagère 1', true, NOW()),
(8, 'PSU-CORS-850W', 'Corsair RM850x 850W 80+ Gold', 'Power Supply', 'Corsair', 'RM850x', '{"wattage": "850W", "efficiency": "80+ Gold", "modular": "Fully Modular"}', 149.99, 15, 8, 'Rayon F - Étagère 1', true, NOW()),
(9, 'CASE-FRAC-MESH', 'Fractal Design Meshify C', 'Case', 'Fractal Design', 'Meshify C', '{"form_factor": "Mid Tower", "material": "Steel, Tempered Glass", "color": "Black"}', 89.99, 12, 6, 'Rayon G - Étagère 1', true, NOW()),
(10, 'COOL-NZXT-X63', 'NZXT Kraken X63 280mm AIO', 'Cooling', 'NZXT', 'Kraken X63', '{"type": "AIO Liquid Cooler", "radiator_size": "280mm", "fan_speed": "500-2000 RPM"}', 149.99, 8, 4, 'Rayon H - Étagère 1', true, NOW());

-- Réinitialiser la séquence des IDs pour les composants
SELECT setval('components_id_seq', 10, true);

-- Supprimer tous les clients existants
DELETE FROM customers;

-- Ajouter quelques clients d'exemple
INSERT INTO customers (id, first_name, last_name, email, phone, address, city, state, zip_code, created_at) VALUES
(1, 'Lucas', 'Dubois', 'lucas.dubois@email.com', '06 12 34 56 78', '123 Rue de la Paix', 'Paris', 'Île-de-France', '75001', NOW()),
(2, 'Emma', 'Martin', 'emma.martin@email.com', '06 23 45 67 89', '456 Avenue des Champs', 'Lyon', 'Auvergne-Rhône-Alpes', '69001', NOW()),
(3, 'Thomas', 'Bernard', 'thomas.bernard@email.com', '06 34 56 78 90', '789 Boulevard Saint-Michel', 'Marseille', 'Provence-Alpes-Côte d''Azur', '13001', NOW());

-- Réinitialiser la séquence des IDs pour les clients
SELECT setval('customers_id_seq', 3, true);

COMMIT;

-- Afficher les comptes créés
SELECT 'COMPTES UTILISATEURS CRÉÉS:' as info;
SELECT id, email, first_name, last_name, role FROM users ORDER BY id;

SELECT 'COMPOSANTS AJOUTÉS:' as info;
SELECT reference, name, type, brand, stock_quantity FROM components ORDER BY id LIMIT 5;

SELECT 'CLIENTS AJOUTÉS:' as info;
SELECT first_name, last_name, email, city FROM customers ORDER BY id;