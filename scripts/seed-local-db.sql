-- Script pour créer les données de base dans votre PostgreSQL local
-- Exécuter après avoir créé la base de données

-- Créer la table users si elle n'existe pas
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Créer la table sessions pour l'authentification
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Créer la table components si elle n'existe pas
CREATE TABLE IF NOT EXISTS components (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  specifications JSONB,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Créer la table customers
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Créer la table orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  product_id INTEGER,
  current_assignee_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'created',
  total_amount DECIMAL(10,2) NOT NULL,
  specifications JSONB,
  notes TEXT,
  tracking_number TEXT,
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Créer la table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  related_order_id INTEGER REFERENCES orders(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insérer l'utilisateur admin par défaut
-- Mot de passe: admin123 (hashé avec bcrypt)
INSERT INTO users (email, password, first_name, last_name, role, is_active) 
VALUES (
  'admin@ultrapc.com',
  '$2b$10$rJK7Dj1J5H8L9N6p5Q2r3OuE8K7F6G9H1I2J3K4L5M6N7O8P9Q0R1S',
  'Admin',
  'Ultra PC',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insérer quelques composants d'exemple
INSERT INTO components (reference, name, type, brand, model, price, stock_quantity, min_stock_level, location) VALUES
('CPU-001', 'Intel Core i7-13700K', 'CPU', 'Intel', 'Core i7-13700K', 399.99, 15, 5, 'A1'),
('CPU-002', 'AMD Ryzen 7 7700X', 'CPU', 'AMD', 'Ryzen 7 7700X', 349.99, 12, 5, 'A2'),
('GPU-001', 'NVIDIA RTX 4070', 'GPU', 'NVIDIA', 'GeForce RTX 4070', 599.99, 8, 3, 'B1'),
('GPU-002', 'AMD RX 7700 XT', 'GPU', 'AMD', 'Radeon RX 7700 XT', 449.99, 6, 3, 'B2'),
('MEM-001', 'Corsair Vengeance 32GB DDR5', 'Memory', 'Corsair', 'Vengeance LPX', 159.99, 20, 10, 'C1'),
('STO-001', 'Samsung 980 PRO 1TB', 'Storage', 'Samsung', '980 PRO', 129.99, 25, 10, 'D1')
ON CONFLICT (reference) DO NOTHING;

COMMIT;