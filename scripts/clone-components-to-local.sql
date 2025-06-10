-- Script pour cloner tous les composants de Replit vers votre base locale
-- À exécuter sur votre PC: psql -U postgres -d ultrapc_local -f scripts/clone-components-to-local.sql

BEGIN;

-- Supprimer tous les composants existants
TRUNCATE TABLE components RESTART IDENTITY CASCADE;

-- Insérer tous les composants de Replit
INSERT INTO components (serial_number, name, type, brand, model, price, stock_quantity, location, specifications, is_active, created_at) VALUES
('CPU-INTEL-001', 'Intel Core i7-13700K', 'CPU', 'Intel', 'i7-13700K', 399.99, 15, 'A1', NULL, true, '2025-06-09 00:47:05.939989'),
('GPU-NVIDIA-001', 'RTX 4080 Super', 'GPU', 'NVIDIA', 'RTX 4080 Super', 999.99, 8, 'B2', NULL, true, '2025-06-09 00:47:05.939989'),
('RAM-CORSAIR-001', 'Corsair Vengeance 32GB', 'Memory', 'Corsair', 'Vengeance LPX', 149.99, 25, 'C3', NULL, true, '2025-06-09 00:47:05.939989'),
('SSD-SAMSUNG-001', 'Samsung 980 Pro 1TB', 'Storage', 'Samsung', '980 Pro', 129.99, 20, 'D1', NULL, true, '2025-06-09 00:47:05.939989'),
('CPU-AMD-003', 'AMD Ryzen 9 7950X', 'CPU', 'AMD', 'Ryzen 9 7950X', 699.99, 12, 'A2', NULL, true, '2025-06-10 08:56:22.775612'),
('CPU-INTEL-002', 'Intel Core i5-13600K', 'CPU', 'Intel', 'i5-13600K', 329.99, 18, 'A1', NULL, true, '2025-06-10 08:56:22.775612'),
('GPU-AMD-001', 'Radeon RX 7900 XTX', 'GPU', 'AMD', 'RX 7900 XTX', 899.99, 6, 'B1', NULL, true, '2025-06-10 08:56:22.775612'),
('GPU-NVIDIA-002', 'RTX 4070 Ti', 'GPU', 'NVIDIA', 'RTX 4070 Ti', 799.99, 10, 'B2', NULL, true, '2025-06-10 08:56:22.775612'),
('GPU-NVIDIA-003', 'RTX 4060', 'GPU', 'NVIDIA', 'RTX 4060', 299.99, 15, 'B3', NULL, true, '2025-06-10 08:56:22.775612'),
('RAM-GSKILL-001', 'G.Skill Trident Z5 32GB', 'Memory', 'G.Skill', 'Trident Z5', 179.99, 22, 'C1', NULL, true, '2025-06-10 08:56:22.775612'),
('RAM-KINGSTON-001', 'Kingston Fury Beast 16GB', 'Memory', 'Kingston', 'Fury Beast', 89.99, 30, 'C2', NULL, true, '2025-06-10 08:56:22.775612'),
('RAM-CORSAIR-002', 'Corsair Dominator 64GB', 'Memory', 'Corsair', 'Dominator Platinum', 399.99, 8, 'C3', NULL, true, '2025-06-10 08:56:22.775612'),
('SSD-WD-001', 'WD Black SN850X 2TB', 'Storage', 'Western Digital', 'Black SN850X', 199.99, 16, 'D1', NULL, true, '2025-06-10 08:56:22.775612'),
('SSD-CRUCIAL-001', 'Crucial P5 Plus 1TB', 'Storage', 'Crucial', 'P5 Plus', 99.99, 25, 'D2', NULL, true, '2025-06-10 08:56:22.775612'),
('HDD-SEAGATE-001', 'Seagate Barracuda 4TB', 'Storage', 'Seagate', 'Barracuda', 89.99, 20, 'D3', NULL, true, '2025-06-10 08:56:22.775612'),
('MB-ASUS-001', 'ASUS ROG STRIX X670E', 'Motherboard', 'ASUS', 'ROG STRIX X670E', 449.99, 9, 'E1', NULL, true, '2025-06-10 08:56:22.775612'),
('MB-MSI-001', 'MSI B650 TOMAHAWK', 'Motherboard', 'MSI', 'B650 TOMAHAWK', 199.99, 14, 'E2', NULL, true, '2025-06-10 08:56:22.775612'),
('MB-GIGABYTE-001', 'Gigabyte Z790 AORUS', 'Motherboard', 'Gigabyte', 'Z790 AORUS ELITE', 279.99, 11, 'E3', NULL, true, '2025-06-10 08:56:22.775612'),
('PSU-CORSAIR-001', 'Corsair RM850x 850W', 'Power Supply', 'Corsair', 'RM850x', 149.99, 18, 'F1', NULL, true, '2025-06-10 08:56:22.775612'),
('PSU-EVGA-001', 'EVGA SuperNOVA 750W', 'Power Supply', 'EVGA', 'SuperNOVA G5', 119.99, 22, 'F2', NULL, true, '2025-06-10 08:56:22.775612'),
('PSU-SEASONIC-001', 'Seasonic Focus GX 1000W', 'Power Supply', 'Seasonic', 'Focus GX', 179.99, 13, 'F3', NULL, true, '2025-06-10 08:56:22.775612'),
('CASE-NZXT-001', 'NZXT H7 Flow', 'Case', 'NZXT', 'H7 Flow', 129.99, 15, 'G1', NULL, true, '2025-06-10 08:56:22.775612'),
('CASE-FRACTAL-001', 'Fractal Design Define 7', 'Case', 'Fractal Design', 'Define 7', 169.99, 12, 'G2', NULL, true, '2025-06-10 08:56:22.775612'),
('CASE-CORSAIR-001', 'Corsair 4000D Airflow', 'Case', 'Corsair', '4000D Airflow', 94.99, 20, 'G3', NULL, true, '2025-06-10 08:56:22.775612'),
('COOL-NOCTUA-001', 'Noctua NH-D15', 'Cooling', 'Noctua', 'NH-D15', 89.99, 17, 'H1', NULL, true, '2025-06-10 08:56:22.775612'),
('COOL-ARCTIC-001', 'Arctic Liquid Freezer II 280', 'Cooling', 'Arctic', 'Liquid Freezer II', 99.99, 14, 'H2', NULL, true, '2025-06-10 08:56:22.775612'),
('COOL-CORSAIR-001', 'Corsair H150i ELITE', 'Cooling', 'Corsair', 'H150i ELITE CAPELLIX', 189.99, 10, 'H3', NULL, true, '2025-06-10 08:56:22.775612'),
('GPU-NVIDIA-004', 'RTX 4090', 'GPU', 'NVIDIA', 'RTX 4090', 1599.99, 4, 'B4', NULL, true, '2025-06-10 08:56:22.775612'),
('CPU-AMD-004', 'AMD Ryzen 7 7800X3D', 'CPU', 'AMD', 'Ryzen 7 7800X3D', 449.99, 8, 'A3', NULL, true, '2025-06-10 08:56:22.775612'),
('SSD-SAMSUNG-002', 'Samsung 990 EVO 2TB', 'Storage', 'Samsung', '990 EVO', 179.99, 19, 'D4', NULL, true, '2025-06-10 08:56:22.775612'),
('RAM-TEAMGROUP-001', 'TeamGroup T-Force Delta 32GB', 'Memory', 'TeamGroup', 'T-Force Delta RGB', 159.99, 16, 'C4', NULL, true, '2025-06-10 08:56:22.775612'),
('MB-ASROCK-001', 'ASRock B550M PRO4', 'Motherboard', 'ASRock', 'B550M PRO4', 79.99, 21, 'E4', NULL, true, '2025-06-10 08:56:22.775612'),
('PSU-BEQUIET-001', 'be quiet! Straight Power 11 750W', 'Power Supply', 'be quiet!', 'Straight Power 11', 129.99, 15, 'F4', NULL, true, '2025-06-10 08:56:22.775612');

COMMIT;

-- Vérifier le résultat
SELECT COUNT(*) as total_components FROM components;
SELECT type, COUNT(*) as count FROM components GROUP BY type ORDER BY type;