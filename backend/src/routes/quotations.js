const router = require('express').Router();
const db = require('../models/db');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');
const { sendEmail } = require('../utils/email');

router.use(auth);

// Submit quotation (Supplier)
router.post('/', authorize('supplier'), upload.single('pdf'), async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows: [sup] } = await client.query('SELECT id FROM suppliers WHERE user_id=$1', [req.user.id]);
    if (!sup) throw new Error('Supplier profile not found');
    const { rfq_id, total_price, lead_time, validity_date, items } = req.body;
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    const { rows: [quotation] } = await client.query(
      'INSERT INTO quotations (rfq_id, supplier_id, total_price, lead_time, validity_date, pdf_path) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [rfq_id, sup.id, total_price, lead_time, validity_date, req.file?.filename || null]
    );
    if (parsedItems) {
      for (const item of parsedItems) {
        await client.query(
          'INSERT INTO quotation_items (quotation_id, material_name, unit_price, qty, total) VALUES ($1,$2,$3,$4,$5)',
          [quotation.id, item.material_name, item.unit_price, item.qty, item.unit_price * item.qty]
        );
      }
    }
    await client.query("UPDATE requests SET status='quoted', updated_at=NOW() WHERE id=(SELECT request_id FROM rfqs WHERE id=$1)", [rfq_id]);
    await client.query('COMMIT');
    // Notify procurement
    const notify = await db.query("SELECT email FROM users WHERE role='procurement' AND active=true");
    for (const u of notify.rows) {
      sendEmail(u.email, 'New Quotation Submitted', `<p>A quotation has been submitted for RFQ #${rfq_id}.</p>`);
    }
    res.status(201).json(quotation);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
