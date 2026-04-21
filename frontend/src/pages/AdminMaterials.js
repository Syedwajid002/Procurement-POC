import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminMaterials() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', unit: 'pcs', category: '' });
  const [show, setShow] = useState(false);

  const load = () => api.get(`/admin/materials?search=${search}`).then(r => setMaterials(r.data));
  useEffect(() => { load(); }, [search]); // eslint-disable-line

  const create = async e => {
    e.preventDefault();
    await api.post('/admin/materials', form);
    setForm({ name: '', unit: 'pcs', category: '' });
    setShow(false);
    load();
  };

  const toggle = async (id, active) => { await api.patch(`/admin/materials/${id}`, { active: !active }); load(); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Materials</h2>
        <button onClick={() => setShow(!show)} style={{ padding: '8px 16px' }}>{show ? 'Cancel' : 'Add Material'}</button>
      </div>
      <input placeholder="Search materials..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: 8, marginBottom: 16, width: 300 }} />
      {show && (
        <form onSubmit={create} style={{ background: '#f7fafc', padding: 16, borderRadius: 8, marginBottom: 16, display: 'flex', gap: 12 }}>
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ padding: 6 }} />
          <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ padding: 6 }}>
            <option>pcs</option><option>kg</option><option>m</option><option>litre</option><option>set</option>
          </select>
          <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ padding: 6 }} />
          <button type="submit" style={{ padding: '6px 16px' }}>Add</button>
        </form>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: '#f7fafc', textAlign: 'left' }}>
          <th style={{ padding: 8 }}>Name</th><th style={{ padding: 8 }}>Unit</th><th style={{ padding: 8 }}>Category</th><th style={{ padding: 8 }}>Status</th><th style={{ padding: 8 }}>Action</th>
        </tr></thead>
        <tbody>{materials.map(m => (
          <tr key={m.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td style={{ padding: 8 }}>{m.name}</td>
            <td style={{ padding: 8 }}>{m.unit}</td>
            <td style={{ padding: 8 }}>{m.category || '-'}</td>
            <td style={{ padding: 8 }}><span style={{ color: m.active ? 'green' : 'red' }}>{m.active ? 'Active' : 'Inactive'}</span></td>
            <td style={{ padding: 8 }}><button onClick={() => toggle(m.id, m.active)}>{m.active ? 'Deactivate' : 'Activate'}</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
