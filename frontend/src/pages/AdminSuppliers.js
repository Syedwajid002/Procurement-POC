import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [history, setHistory] = useState(null);

  const load = () => api.get('/admin/suppliers').then(r => setSuppliers(r.data));
  useEffect(() => { load(); }, []);

  const toggle = async (id, active) => { await api.patch(`/admin/suppliers/${id}`, { active: !active }); load(); };

  const viewHistory = async id => {
    const { data } = await api.get(`/admin/suppliers/${id}/quotations`);
    setHistory({ id, data });
  };

  return (
    <div>
      <h2>Suppliers</h2>
      <p style={{ color: '#718096', fontSize: 14 }}>Suppliers are created automatically when a user with "supplier" role is added.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: '#f7fafc', textAlign: 'left' }}>
          <th style={{ padding: 8 }}>Company</th><th style={{ padding: 8 }}>Email</th><th style={{ padding: 8 }}>Phone</th><th style={{ padding: 8 }}>Status</th><th style={{ padding: 8 }}>Actions</th>
        </tr></thead>
        <tbody>{suppliers.map(s => (
          <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td style={{ padding: 8 }}>{s.company_name}</td>
            <td style={{ padding: 8 }}>{s.email}</td>
            <td style={{ padding: 8 }}>{s.phone || '-'}</td>
            <td style={{ padding: 8 }}><span style={{ color: s.active ? 'green' : 'red' }}>{s.active ? 'Active' : 'Inactive'}</span></td>
            <td style={{ padding: 8 }}>
              <button onClick={() => toggle(s.id, s.active)} style={{ marginRight: 8 }}>{s.active ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => viewHistory(s.id)}>Quotation History</button>
            </td>
          </tr>
        ))}</tbody>
      </table>

      {history && (
        <div style={{ marginTop: 16, background: '#f7fafc', padding: 16, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Quotation History</h3>
            <button onClick={() => setHistory(null)}>Close</button>
          </div>
          {history.data.length === 0 ? <p>No quotations.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ textAlign: 'left' }}>
                <th style={{ padding: 8 }}>RFQ</th><th style={{ padding: 8 }}>Request</th><th style={{ padding: 8 }}>Total Price</th><th style={{ padding: 8 }}>Lead Time</th><th style={{ padding: 8 }}>Date</th>
              </tr></thead>
              <tbody>{history.data.map(q => (
                <tr key={q.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: 8 }}>#{q.rfq_id}</td>
                  <td style={{ padding: 8 }}>#{q.request_id}</td>
                  <td style={{ padding: 8 }}>{q.total_price}</td>
                  <td style={{ padding: 8 }}>{q.lead_time}</td>
                  <td style={{ padding: 8 }}>{new Date(q.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
