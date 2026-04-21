import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function RFQs() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [requests, setRequests] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ request_id: '', supplier_ids: [] });

  useEffect(() => { api.get('/rfqs').then(r => setRfqs(r.data)); }, []);

  const openCreate = async () => {
    const [r, s] = await Promise.all([api.get('/requests'), api.get('/admin/suppliers').catch(() => ({ data: [] }))]);
    setRequests(r.data.filter(x => x.status === 'approved'));
    setSuppliers(s.data.filter(x => x.active));
    setShowCreate(true);
  };

  const toggleSupplier = id => {
    setForm(f => ({ ...f, supplier_ids: f.supplier_ids.includes(id) ? f.supplier_ids.filter(x => x !== id) : [...f.supplier_ids, id] }));
  };

  const createRFQ = async e => {
    e.preventDefault();
    await api.post('/rfqs', form);
    setShowCreate(false);
    api.get('/rfqs').then(r => setRfqs(r.data));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>RFQs</h2>
        {user.role === 'procurement' && <button onClick={openCreate} style={{ padding: '8px 16px' }}>Create RFQ</button>}
      </div>

      {showCreate && (
        <div style={{ background: '#f7fafc', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <form onSubmit={createRFQ}>
            <div style={{ marginBottom: 8 }}>
              <label htmlFor="rfq-request">Request</label><br />
              <select id="rfq-request" value={form.request_id} onChange={e => setForm({ ...form, request_id: e.target.value })} required style={{ padding: 6 }}>
                <option value="">Select approved request</option>
                {requests.map(r => <option key={r.id} value={r.id}>#{r.id} - {r.site_project || 'No project'}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Suppliers</label><br />
              {suppliers.map(s => (
                <label key={s.id} style={{ display: 'block' }}>
                  <input type="checkbox" checked={form.supplier_ids.includes(s.id)} onChange={() => toggleSupplier(s.id)} /> {s.company_name}
                </label>
              ))}
            </div>
            <button type="submit" style={{ padding: '8px 16px' }}>Create</button>
            <button type="button" onClick={() => setShowCreate(false)} style={{ marginLeft: 8 }}>Cancel</button>
          </form>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f7fafc', textAlign: 'left' }}>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>RFQ ID</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Request</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Site/Project</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Status</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Date</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rfqs.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: 8 }}>#{r.id}</td>
              <td style={{ padding: 8 }}>#{r.request_id}</td>
              <td style={{ padding: 8 }}>{r.site_project || '-'}</td>
              <td style={{ padding: 8 }}>{r.status}</td>
              <td style={{ padding: 8 }}>{new Date(r.created_at).toLocaleDateString()}</td>
              <td style={{ padding: 8 }}><Link to={`/rfqs/${r.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
