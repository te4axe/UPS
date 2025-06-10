-- Script pour synchroniser localhost avec Neon (copier-coller dans votre terminal psql local)
-- Utilisez ce script si votre localhost n'affiche pas les 63 composants

-- Connexion à votre base locale : psql -U postgres -d ultrapc_local

-- 1. Vider les tables existantes
TRUNCATE TABLE components RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- 2. Recréer les utilisateurs
INSERT INTO users (email, password, role, first_name, last_name, is_active) VALUES
('admin@ultrapc.com', '$2b$12$LQv3c1yqBwEHXE.9oHOB.eJ5rOXQv3rKqNhTJMhGEqM4VKm7k9rgu', 'admin', 'Hamza', 'Admin', true),
('montage@ultrapc.com', '$2b$12$LQv3c1yqBwEHXE.9oHOB.eJ5rOXQv3rKqNhTJMhGEqM4VKm7k9rgu', 'technician', 'Hicham', 'Montage', true),
('reception@ultrapc.com', '$2b$12$LQv3c1yqBwEHXE.9oHOB.eJ5rOXQv3rKqNhTJMhGEqM4VKm7k9rgu', 'receptionist', 'Ayman', 'Reception', true),
('emballage@ultrapc.com', '$2b$12$LQv3c1yqBwEHXE.9oHOB.eJ5rOXQv3rKqNhTJMhGEqM4VKm7k9rgu', 'packer', 'Yahya', 'Emballage', true),
('expedition@ultrapc.com', '$2b$12$LQv3c1yqBwEHXE.9oHOB.eJ5rOXQv3rKqNhTJMhGEqM4VKm7k9rgu', 'shipper', 'Anas', 'Expedition', true),
('composants@ultrapc.com', '$2b$12$LQv3c1yqBwEHXE.9oHOB.eJ5rOXQv3rKqNhTJMhGEqM4VKm7k9rgu', 'inventory', 'Ilias', 'Composants', true);

-- 3. Insérer tous les 63 composants
INSERT INTO components (serial_number, name, type, brand, model, price, stock_quantity, location, is_active) VALUES
-- CPU (10 composants)
('CPU-INTEL-001', 'Intel Core i7-13700K', 'CPU', 'Intel', 'i7-13700K', 419.99, 15, 'A1', true),
('CPU-AMD-001', 'AMD Ryzen 7 7800X3D', 'CPU', 'AMD', 'Ryzen 7 7800X3D', 449.99, 12, 'A2', true),
('CPU-INTEL-002', 'Intel Core i5-13600K', 'CPU', 'Intel', 'i5-13600K', 319.99, 20, 'A3', true),
('CPU-AMD-002', 'AMD Ryzen 5 7600', 'CPU', 'AMD', 'Ryzen 5 7600', 229.99, 25, 'A4', true),
('CPU-AMD-005', 'AMD Ryzen 5 7600X', 'CPU', 'AMD', 'Ryzen 5 7600X', 299.99, 20, 'A4', true),
('CPU-INTEL-003', 'Intel Core i9-13900K', 'CPU', 'Intel', 'i9-13900K', 589.99, 8, 'A5', true),
('CPU-AMD-006', 'AMD Ryzen 7 7700X', 'CPU', 'AMD', 'Ryzen 7 7700X', 399.99, 12, 'A6', true),
('CPU-INTEL-004', 'Intel Core i3-13100F', 'CPU', 'Intel', 'i3-13100F', 129.99, 25, 'A7', true),
('CPU-AMD-007', 'AMD Ryzen 9 7900X', 'CPU', 'AMD', 'Ryzen 9 7900X', 549.99, 10, 'A8', true),
('CPU-INTEL-005', 'Intel Core i5-12400F', 'CPU', 'Intel', 'i5-12400F', 189.99, 18, 'A9', true),

-- GPU (11 composants)
('GPU-NVIDIA-001', 'RTX 4080', 'GPU', 'NVIDIA', 'RTX 4080', 1199.99, 8, 'B1', true),
('GPU-AMD-001', 'Radeon RX 7900 XTX', 'GPU', 'AMD', 'RX 7900 XTX', 899.99, 10, 'B2', true),
('GPU-NVIDIA-002', 'RTX 4070 Super', 'GPU', 'NVIDIA', 'RTX 4070 Super', 599.99, 12, 'B3', true),
('GPU-NVIDIA-003', 'RTX 4060', 'GPU', 'NVIDIA', 'RTX 4060', 299.99, 18, 'B4', true),
('GPU-NVIDIA-004', 'RTX 3070', 'GPU', 'NVIDIA', 'RTX 3070', 499.99, 15, 'B5', true),
('GPU-AMD-002', 'Radeon RX 7800 XT', 'GPU', 'AMD', 'RX 7800 XT', 499.99, 12, 'B5', true),
('GPU-NVIDIA-005', 'RTX 4070', 'GPU', 'NVIDIA', 'RTX 4070', 599.99, 14, 'B6', true),
('GPU-AMD-003', 'Radeon RX 7600', 'GPU', 'AMD', 'RX 7600', 269.99, 16, 'B7', true),
('GPU-NVIDIA-006', 'RTX 3060 Ti', 'GPU', 'NVIDIA', 'RTX 3060 Ti', 399.99, 11, 'B8', true),
('GPU-INTEL-001', 'Arc A770', 'GPU', 'Intel', 'Arc A770', 329.99, 8, 'B9', true),
('GPU-NVIDIA-007', 'RTX 4060 Ti', 'GPU', 'NVIDIA', 'RTX 4060 Ti', 399.99, 13, 'B10', true),

-- Memory (11 composants)
('RAM-CORSAIR-001', 'Corsair Dominator Platinum RGB 32GB', 'Memory', 'Corsair', 'Dominator Platinum RGB', 199.99, 22, 'C1', true),
('RAM-GSKILL-001', 'G.Skill Trident Z5 RGB 32GB', 'Memory', 'G.Skill', 'Trident Z5 RGB', 179.99, 25, 'C2', true),
('RAM-KINGSTON-001', 'Kingston Fury Beast 16GB', 'Memory', 'Kingston', 'Fury Beast', 69.99, 30, 'C3', true),
('RAM-TEAMGROUP-001', 'Team T-Force Delta RGB 32GB', 'Memory', 'Team Group', 'T-Force Delta RGB', 149.99, 20, 'C4', true),
('RAM-HYPERX-001', 'HyperX Predator 64GB', 'Memory', 'HyperX', 'Predator', 329.99, 12, 'C5', true),
('RAM-CRUCIAL-001', 'Crucial Ballistix 16GB', 'Memory', 'Crucial', 'Ballistix', 79.99, 28, 'C5', true),
('RAM-PATRIOT-001', 'Patriot Viper Steel 32GB', 'Memory', 'Patriot', 'Viper Steel', 139.99, 18, 'C6', true),
('RAM-ADATA-001', 'ADATA XPG Spectrix 16GB', 'Memory', 'ADATA', 'XPG Spectrix D60G', 89.99, 24, 'C7', true),
('RAM-MUSHKIN-001', 'Mushkin Redline 32GB', 'Memory', 'Mushkin', 'Redline Lumina', 149.99, 15, 'C8', true),
('RAM-GSKILL-002', 'G.Skill Ripjaws V 64GB', 'Memory', 'G.Skill', 'Ripjaws V', 289.99, 10, 'C9', true),
('RAM-CORSAIR-003', 'Corsair Vengeance RGB Pro 16GB', 'Memory', 'Corsair', 'Vengeance RGB Pro', 94.99, 22, 'C10', true),

-- Storage (11 composants)
('SSD-SAMSUNG-001', 'Samsung 980 PRO 2TB', 'Storage', 'Samsung', '980 PRO', 199.99, 20, 'D1', true),
('SSD-WD-001', 'WD Black SN850X 1TB', 'Storage', 'Western Digital', 'Black SN850X', 129.99, 25, 'D2', true),
('SSD-CRUCIAL-001', 'Crucial MX4 4TB', 'Storage', 'Crucial', 'MX4', 399.99, 15, 'D3', true),
('HDD-SEAGATE-001', 'Seagate Barracuda 2TB', 'Storage', 'Seagate', 'Barracuda', 59.99, 30, 'D4', true),
('SSD-CORSAIR-001', 'Corsair MP600 PRO 1TB', 'Storage', 'Corsair', 'MP600 PRO', 149.99, 18, 'D5', true),
('SSD-KINGSTON-001', 'Kingston NV2 1TB', 'Storage', 'Kingston', 'NV2', 69.99, 30, 'D5', true),
('SSD-ADATA-001', 'ADATA XPG SX8200 Pro 2TB', 'Storage', 'ADATA', 'XPG SX8200 Pro', 149.99, 18, 'D6', true),
('HDD-WD-001', 'WD Blue 2TB', 'Storage', 'Western Digital', 'Blue', 54.99, 25, 'D7', true),
('SSD-MUSHKIN-001', 'Mushkin Pilot-E 1TB', 'Storage', 'Mushkin', 'Pilot-E', 89.99, 20, 'D8', true),
('SSD-PATRIOT-001', 'Patriot P300 512GB', 'Storage', 'Patriot', 'P300', 39.99, 35, 'D9', true),
('HDD-TOSHIBA-001', 'Toshiba X300 4TB', 'Storage', 'Toshiba', 'X300', 109.99, 15, 'D10', true),

-- Motherboard (7 composants)
('MB-ASUS-001', 'ASUS ROG Strix Z790-E', 'Motherboard', 'ASUS', 'ROG Strix Z790-E', 399.99, 12, 'E1', true),
('MB-MSI-001', 'MSI MPG B550 Gaming Plus', 'Motherboard', 'MSI', 'MPG B550 Gaming Plus', 149.99, 18, 'E2', true),
('MB-GIGABYTE-001', 'Gigabyte X670E Aorus Master', 'Motherboard', 'Gigabyte', 'X670E Aorus Master', 499.99, 8, 'E3', true),
('MB-ASROCK-001', 'ASRock B650M Pro4', 'Motherboard', 'ASRock', 'B650M Pro4', 129.99, 20, 'E4', true),
('MB-BIOSTAR-001', 'Biostar B550MH', 'Motherboard', 'Biostar', 'B550MH', 89.99, 16, 'E5', true),
('MB-EVGA-001', 'EVGA Z690 Dark K|NGP|N', 'Motherboard', 'EVGA', 'Z690 Dark K|NGP|N', 599.99, 5, 'E6', true),
('MB-SUPERMICRO-001', 'Supermicro X12SPi-TF', 'Motherboard', 'Supermicro', 'X12SPi-TF', 349.99, 8, 'E7', true),

-- Power Supply (7 composants)
('PSU-CORSAIR-001', 'Corsair RM850x', 'Power Supply', 'Corsair', 'RM850x', 149.99, 20, 'F1', true),
('PSU-EVGA-001', 'EVGA SuperNOVA 750 G5', 'Power Supply', 'EVGA', 'SuperNOVA 750 G5', 119.99, 22, 'F2', true),
('PSU-SEASONIC-001', 'Seasonic Focus GX-650', 'Power Supply', 'Seasonic', 'Focus GX-650', 99.99, 25, 'F3', true),
('PSU-BEQUIET-001', 'be quiet! Straight Power 11 850W', 'Power Supply', 'be quiet!', 'Straight Power 11', 159.99, 18, 'F4', true),
('PSU-THERMALTAKE-001', 'Thermaltake Toughpower GF1 750W', 'Power Supply', 'Thermaltake', 'Toughpower GF1', 109.99, 20, 'F5', true),
('PSU-COOLERMASTER-001', 'Cooler Master MWE Gold 650W', 'Power Supply', 'Cooler Master', 'MWE Gold V2', 89.99, 25, 'F6', true),
('PSU-ANTEC-001', 'Antec HCG Gold 850W', 'Power Supply', 'Antec', 'HCG Gold', 139.99, 18, 'F7', true),

-- Case (3 composants)
('CASE-NZXT-001', 'NZXT H7 Flow', 'Case', 'NZXT', 'H7 Flow', 139.99, 15, 'G1', true),
('CASE-FRACTAL-001', 'Fractal Design Define 7', 'Case', 'Fractal Design', 'Define 7', 179.99, 12, 'G2', true),
('CASE-CORSAIR-001', 'Corsair 4000D Airflow', 'Case', 'Corsair', '4000D Airflow', 104.99, 18, 'G3', true),

-- Cooling (3 composants)
('COOL-NOCTUA-001', 'Noctua NH-D15', 'Cooling', 'Noctua', 'NH-D15', 99.99, 20, 'H1', true),
('COOL-ARCTIC-001', 'Arctic Liquid Freezer II 280', 'Cooling', 'Arctic', 'Liquid Freezer II 280', 119.99, 15, 'H2', true),
('COOL-CORSAIR-001', 'Corsair H100i RGB Platinum', 'Cooling', 'Corsair', 'H100i RGB Platinum', 159.99, 12, 'H3', true);

-- Vérifier le résultat
SELECT 'TOTAL COMPONENTS' as info, COUNT(*) as count FROM components;
SELECT type, COUNT(*) as count FROM components GROUP BY type ORDER BY count DESC;