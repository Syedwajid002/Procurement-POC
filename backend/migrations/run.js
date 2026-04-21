const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('engineer','store','procurement','approver','supplier','admin')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  company_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  categories TEXT[],
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  created_by INT REFERENCES users(id),
  site_project VARCHAR(255),
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('normal','urgent')),
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','store_review','approved','rejected','rfq_created','quoted','awarded')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS request_items (
  id SERIAL PRIMARY KEY,
  request_id INT REFERENCES requests(id) ON DELETE CASCADE,
  material_name VARCHAR(255) NOT NULL,
  qty NUMERIC NOT NULL,
  unit VARCHAR(50) NOT NULL,
  required_date DATE,
  in_stock BOOLEAN
);

CREATE TABLE IF NOT EXISTS request_attachments (
  id SERIAL PRIMARY KEY,
  request_id INT REFERENCES requests(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approvals (
  id SERIAL PRIMARY KEY,
  request_id INT REFERENCES requests(id) ON DELETE CASCADE,
  approver_id INT REFERENCES users(id),
  action VARCHAR(10) CHECK (action IN ('approve','reject')),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rfqs (
  id SERIAL PRIMARY KEY,
  request_id INT REFERENCES requests(id),
  created_by INT REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','closed','awarded')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rfq_suppliers (
  id SERIAL PRIMARY KEY,
  rfq_id INT REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id INT REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS quotations (
  id SERIAL PRIMARY KEY,
  rfq_id INT REFERENCES rfqs(id),
  supplier_id INT REFERENCES suppliers(id),
  total_price NUMERIC,
  lead_time VARCHAR(100),
  validity_date DATE,
  pdf_path VARCHAR(500),
  submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id SERIAL PRIMARY KEY,
  quotation_id INT REFERENCES quotations(id) ON DELETE CASCADE,
  material_name VARCHAR(255),
  unit_price NUMERIC,
  qty NUMERIC,
  total NUMERIC
);

-- Seed admin user (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@procurement.com', '$2a$10$5uYMnIRnCpJC8otwGV3YSuMONRaZyzCqTZ0Mz9S3tJn1B7f2emGnG', 'admin')
ON CONFLICT (email) DO NOTHING;
`;

async function migrate() {
  try {
    await pool.query(sql);
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
