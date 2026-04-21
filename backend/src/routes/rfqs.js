const router = require('express').Router();
const db = require('../models/db');
const { auth, authorize } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

router.use(auth);

// Create RFQ (Procurement)
router.post('/', authorize('procurement'), async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { request_id, supplier_ids } = req.body;
    const { rows: [rfq] } = await client.query(
      'INSERT INTO rfqs (request_id, created_by) VALUES ($1,$2) RETURNING *',
      [request_id, req.user.id]
    );
    for (const sid of supplier_ids) {
      await client.query('INSERT INTO rfq_suppliers (rfq_id, supplier_id) VALUES ($1,$2)', [rfq.id, sid]);
    }
    await client.query("UPDATE requests SET status='rfq_created', updated_at=NOW() WHERE id=$1", [request_id]);
    await client.query('COMMIT');
    // Notify suppliers
    const suppliers = await db.query(
      'SELECT u.email FROM suppliers s JOIN users u ON s.user_id=u.id WHERE s.id=ANY($1) AND s.active=true',
      [supplier_ids]
    );
    for (const s of suppliers.rows) {
      sendEmail(s.email, 'New RFQ Received', `<p>You have received RFQ #${rfq.id}. Please submit your quotation.</p>`);
    }
    res.status(201).json(rfq);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// List RFQs
router.get('/', async (req, res) => {
  try {
    let query, params = [];
    if (req.user.role === 'supplier') {
      const { rows: [sup] } = await db.query('SELECT id FROM suppliers WHERE user_id=$1', [req.user.id]);
      if (!sup) return res.json([]);
      query = `SELECT rfq.*, r.site_project FROM rfqs rfq
               JOIN rfq_suppliers rs ON rs.rfq_id=rfq.id
               JOIN requests r ON rfq.request_id=r.id
               WHERE rs.supplier_id=$1 ORDER BY rfq.created_at DESC`;
      params = [sup.id];
    } else {
      query = 'SELECT rfq.*, r.site_project FROM rfqs rfq JOIN requests r ON rfq.request_id=r.id ORDER BY rfq.created_at DESC';
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get RFQ detail with request items and quotations
router.get('/:id', async (req, res) => {
  try {
    const { rows: [rfq] } = await db.query(
      `SELECT rfq.*, r.site_project, r.priority, r.notes FROM rfqs rfq
       JOIN requests r ON rfq.request_id=r.id WHERE rfq.id=$1`, [req.params.id]
    );
    if (!rfq) return res.status(404).json({ error: 'Not found' });
    const items = await db.query('SELECT * FROM request_items WHERE request_id=$1', [rfq.request_id]);
    const quotations = await db.query(
      `SELECT q.*, s.company_name FROM quotations q
       JOIN suppliers s ON q.supplier_id=s.id WHERE q.rfq_id=$1`, [req.params.id]
    );
    const suppliers = await db.query(
      `SELECT s.id, s.company_name FROM rfq_suppliers rs
       JOIN suppliers s ON rs.supplier_id=s.id WHERE rs.rfq_id=$1`, [req.params.id]
    );
    res.json({ ...rfq, items: items.rows, quotations: quotations.rows, suppliers: suppliers.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Award RFQ
router.post('/:id/award', authorize('procurement','approver'), async (req, res) => {
  try {
    const { quotation_id } = req.body;
    await db.query("UPDATE rfqs SET status='awarded' WHERE id=$1", [req.params.id]);
    const { rows: [rfq] } = await db.query('SELECT request_id FROM rfqs WHERE id=$1', [req.params.id]);
    await db.query("UPDATE requests SET status='awarded', updated_at=NOW() WHERE id=$1", [rfq.request_id]);
    // Notify supplier + internal
    const { rows: [q] } = await db.query(
      'SELECT s.user_id FROM quotations q JOIN suppliers s ON q.supplier_id=s.id WHERE q.id=$1', [quotation_id]
    );
    const notify = await db.query(
      "SELECT email FROM users WHERE (id=$1 OR role IN ('procurement','approver')) AND active=true", [q.user_id]
    );
    for (const u of notify.rows) {
      sendEmail(u.email, `RFQ #${req.params.id} Awarded`, `<p>RFQ #${req.params.id} has been awarded.</p>`);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
