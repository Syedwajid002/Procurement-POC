const router = require('express').Router();
const db = require('../models/db');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');
const { sendEmail } = require('../utils/email');

router.use(auth);

// Create request (Engineer)
router.post('/', authorize('engineer'), upload.array('attachments', 5), async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { site_project, priority, notes, items } = req.body;
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    const { rows } = await client.query(
      'INSERT INTO requests (created_by, site_project, priority, notes) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.id, site_project, priority || 'normal', notes]
    );
    const request = rows[0];
    for (const item of parsedItems) {
      await client.query(
        'INSERT INTO request_items (request_id, material_name, qty, unit, required_date) VALUES ($1,$2,$3,$4,$5)',
        [request.id, item.material_name, item.qty, item.unit, item.required_date || null]
      );
    }
    if (req.files) {
      for (const file of req.files) {
        await client.query(
          'INSERT INTO request_attachments (request_id, filename, filepath) VALUES ($1,$2,$3)',
          [request.id, file.originalname, file.filename]
        );
      }
    }
    await client.query('COMMIT');
    // Notify store & procurement
    const notify = await db.query("SELECT email FROM users WHERE role IN ('store','procurement') AND active=true");
    for (const u of notify.rows) {
      sendEmail(u.email, 'New Request Submitted', `<p>Request #${request.id} has been submitted.</p>`);
    }
    res.status(201).json(request);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// List requests
router.get('/', async (req, res) => {
  try {
    let query, params = [];
    if (req.user.role === 'engineer') {
      query = 'SELECT r.*, u.name as created_by_name FROM requests r JOIN users u ON r.created_by=u.id WHERE r.created_by=$1 ORDER BY r.created_at DESC';
      params = [req.user.id];
    } else {
      query = 'SELECT r.*, u.name as created_by_name FROM requests r JOIN users u ON r.created_by=u.id ORDER BY r.created_at DESC';
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single request with items
router.get('/:id', async (req, res) => {
  try {
    const { rows: [request] } = await db.query(
      'SELECT r.*, u.name as created_by_name FROM requests r JOIN users u ON r.created_by=u.id WHERE r.id=$1', [req.params.id]
    );
    if (!request) return res.status(404).json({ error: 'Not found' });
    const items = await db.query('SELECT * FROM request_items WHERE request_id=$1', [req.params.id]);
    const attachments = await db.query('SELECT * FROM request_attachments WHERE request_id=$1', [req.params.id]);
    const approvals = await db.query('SELECT a.*, u.name as approver_name FROM approvals a JOIN users u ON a.approver_id=u.id WHERE a.request_id=$1 ORDER BY a.created_at DESC', [req.params.id]);
    res.json({ ...request, items: items.rows, attachments: attachments.rows, approvals: approvals.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Store: update stock status
router.patch('/:id/stock', authorize('store'), async (req, res) => {
  try {
    const { item_id, in_stock } = req.body;
    await db.query('UPDATE request_items SET in_stock=$1 WHERE id=$2', [in_stock, item_id]);
    if (!in_stock) {
      await db.query("UPDATE requests SET status='store_review' WHERE id=$1", [req.params.id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve/Reject
router.post('/:id/approve', authorize('approver'), async (req, res) => {
  try {
    const { action, comment } = req.body;
    if (action === 'reject' && !comment) return res.status(400).json({ error: 'Comment required on reject' });
    await db.query('INSERT INTO approvals (request_id, approver_id, action, comment) VALUES ($1,$2,$3,$4)',
      [req.params.id, req.user.id, action, comment]);
    const status = action === 'approve' ? 'approved' : 'rejected';
    await db.query('UPDATE requests SET status=$1, updated_at=NOW() WHERE id=$2', [status, req.params.id]);
    // Notify engineer & procurement
    const { rows: [request] } = await db.query('SELECT created_by FROM requests WHERE id=$1', [req.params.id]);
    const notify = await db.query("SELECT email FROM users WHERE (id=$1 OR role='procurement') AND active=true", [request.created_by]);
    for (const u of notify.rows) {
      sendEmail(u.email, `Request #${req.params.id} ${status}`, `<p>Request #${req.params.id} has been ${status}.</p>`);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
