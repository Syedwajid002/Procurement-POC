import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function NewRequest() {
  const nav = useNavigate();
  const [form, setForm] = useState({ site_project: '', priority: 'normal', notes: '' });
  const [items, setItems] = useState([{ material_name: '', qty: '', unit: 'pcs', required_date: '' }]);
  const [files, setFiles] = useState([]);

  const addItem = () => setItems([...items, { material_name: '', qty: '', unit: 'pcs', required_date: '' }]);
  const updateItem = (i, field, val) => { const n = [...items]; n[i][field] = val; setItems(n); };
  const removeItem = i => setItems(items.filter((_, idx) => idx !== i));

  const submit = async e => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('site_project', form.site_project);
    fd.append('priority', form.priority);
    fd.append('notes', form.notes);
    fd.append('items', JSON.stringify(items));
    files.forEach(f => fd.append('attachments', f));
    await api.post('/requests', fd);
    nav('/requests');
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2>New Request</h2>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label htmlFor="site">Site/Project</label><br />
            <input id="site" value={form.site_project} onChange={e => setForm({ ...form, site_project: e.target.value })} style={{ width: '100%', padding: 6 }} />
          </div>
          <div>
            <label htmlFor="priority">Priority</label><br />
            <select id="priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ width: '100%', padding: 6 }}>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <h3>Items</h3>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'end' }}>
            <div style={{ flex: 2 }}>
              {i === 0 && <label>Material</label>}
              <input placeholder="Material name" value={item.material_name} onChange={e => updateItem(i, 'material_name', e.target.value)} required style={{ width: '100%', padding: 6 }} />
            </div>
            <div style={{ flex: 1 }}>
              {i === 0 && <label>Qty</label>}
              <input type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} required style={{ width: '100%', padding: 6 }} />
            </div>
            <div style={{ flex: 1 }}>
              {i === 0 && <label>Unit</label>}
              <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} style={{ width: '100%', padding: 6 }}>
                <option>pcs</option><option>kg</option><option>m</option><option>litre</option><option>set</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              {i === 0 && <label>Required Date</label>}
              <input type="date" value={item.required_date} onChange={e => updateItem(i, 'required_date', e.target.value)} style={{ width: '100%', padding: 6 }} />
            </div>
            {items.length > 1 && <button type="button" onClick={() => removeItem(i)} style={{ color: 'red' }}>✕</button>}
          </div>
        ))}
        <button type="button" onClick={addItem} style={{ marginBottom: 16 }}>+ Add Item</button>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="notes">Notes</label><br />
          <textarea id="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} style={{ width: '100%', padding: 6 }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="attachments">Attachments</label><br />
          <input id="attachments" type="file" multiple onChange={e => setFiles([...e.target.files])} />
        </div>

        <button type="submit" style={{ padding: '8px 24px', background: '#1a365d', color: '#fff', border: 'none', cursor: 'pointer' }}>Submit Request</button>
      </form>
    </div>
  );
}
