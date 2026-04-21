const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');
const { auth, authorize } = require('../middleware/auth');

router.use(auth, authorize('admin'));

// --- Users ---
router.get('/users', async (req, res) => {
  const { rows } = await db.query('SELECT id,name,email,role,active,created_at FROM users ORDER BY id');
  res.json(rows);
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      'INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role,active',
      [name, email, hash, role]
    );
    // If supplier role, create supplier profile
    if (role === 'supplier') {
      await db.query('INSERT INTO suppliers (user_id, company_name) VALUES ($1,$2)', [rows[0].id, name]);
    }
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { active } = req.body;
    await db.query('UPDATE users SET active=$1 WHERE id=$2', [active, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const { password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password=$1 WHERE id=$2', [hash, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Materials ---
router.get('/materials', async (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM materials';
  const params = [];
  if (search) { query += ' WHERE name ILIKE $1'; params.push(`%${search}%`); }
  query += ' ORDER BY id';
  const { rows } = await db.query(query, params);
  res.json(rows);
});

router.post('/materials', async (req, res) => {
  try {
    const { name, unit, category } = req.body;
    const { rows } = await db.query(
      'INSERT INTO materials (name,unit,category) VALUES ($1,$2,$3) RETURNING *', [name, unit, category]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/materials/:id', async (req, res) => {
  try {
    const { active } = req.body;
    await db.query('UPDATE materials SET active=$1 WHERE id=$2', [active, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Suppliers ---
router.get('/suppliers', async (req, res) => {
  const { rows } = await db.query(
    'SELECT s.*, u.email FROM suppliers s JOIN users u ON s.user_id=u.id ORDER BY s.id'
  );
  res.json(rows);
});

router.patch('/suppliers/:id', async (req, res) => {
  try {
    const { active, company_name, phone, address, categories } = req.body;
    const fields = [], params = [];
    let i = 1;
    if (active !== undefined) { fields.push(`active=$${i++}`); params.push(active); }
    if (company_name) { fields.push(`company_name=$${i++}`); params.push(company_name); }
    if (phone !== undefined) { fields.push(`phone=$${i++}`); params.push(phone); }
    if (address !== undefined) { fields.push(`address=$${i++}`); params.push(address); }
    if (categories) { fields.push(`categories=$${i++}`); params.push(categories); }
    params.push(req.params.id);
    await db.query(`UPDATE suppliers SET ${fields.join(',')} WHERE id=$${i}`, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/suppliers/:id/quotations', async (req, res) => {
  const { rows } = await db.query(
    'SELECT q.*, rfq.request_id FROM quotations q JOIN rfqs rfq ON q.rfq_id=rfq.id WHERE q.supplier_id=$1 ORDER BY q.submitted_at DESC',
    [req.params.id]
  );
  res.json(rows);
});

module.exports = router;
