import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function RFQDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [rfq, setRfq] = useState(null);
  const [showQuote, setShowQuote] = useState(false);
  const [qForm, setQForm] = useState({ total_price: '', lead_time: '', validity_date: '' });
  const [qItems, setQItems] = useState([]);
  const [pdf, setPdf] = useState(null);

  const load = () => api.get(`/rfqs/${id}`).then(r => {
    setRfq(r.data);
    setQItems(r.data.items.map(i => ({ material_name: i.material_name, qty: i.qty, unit_price: '' })));
  });
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const submitQuote = async e => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('rfq_id', id);
    fd.append('total_price', qForm.total_price);
    fd.append('lead_time', qForm.lead_time);
    fd.append('validity_date', qForm.validity_date);
    fd.append('items', JSON.stringify(qItems));
    if (pdf) fd.append('pdf', pdf);
    await api.post('/quotations', fd);
    setShowQuote(false);
    load();
  };

  const award = async qid => {
    if (!window.confirm('Award this quotation?')) return;
    await api.post(`/rfqs/${id}/award`, { quotation_id: qid });
    load();
  };

  if (!rfq) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>RFQ #{rfq.id}</h2>
      <div style={{ background: '#f7fafc', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <p><strong>Request:</strong> #{rfq.request_id} | <strong>Status:</strong> {rfq.status} | <strong>Priority:</strong> {rfq.priority}</p>
        <p><strong>Site/Project:</strong> {rfq.site_project || '-'}</p>
      </div>

      <h3>Request Items</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead><tr style={{ background: '#f7fafc', textAlign: 'left' }}>
          <th style={{ padding: 8 }}>Material</th><th style={{ padding: 8 }}>Qty</th><th style={{ padding: 8 }}>Unit</th>
        </tr></thead>
        <tbody>{rfq.items.map(i => (
          <tr key={i.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td style={{ padding: 8 }}>{i.material_name}</td><td style={{ padding: 8 }}>{i.qty}</td><td style={{ padding: 8 }}>{i.unit}</td>
          </tr>
        ))}</tbody>
      </table>

      <h3>Quotations ({rfq.quotations.length})</h3>
      {rfq.quotations.length === 0 ? <p>No quotations yet.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead><tr style={{ background: '#f7fafc', textAlign: 'left' }}>
            <th style={{ padding: 8 }}>Supplier</th><th style={{ padding: 8 }}>Total Price</th><th style={{ padding: 8 }}>Lead Time</th><th style={{ padding: 8 }}>Valid Until</th><th style={{ padding: 8 }}>PDF</th>
            {(user.role === 'procurement' || user.role === 'approver') && <th style={{ padding: 8 }}>Action</th>}
          </tr></thead>
          <tbody>{rfq.quotations.map(q => (
            <tr key={q.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: 8 }}>{q.company_name}</td>
              <td style={{ padding: 8 }}>{q.total_price}</td>
              <td style={{ padding: 8 }}>{q.lead_time}</td>
              <td style={{ padding: 8 }}>{q.validity_date ? new Date(q.validity_date).toLocaleDateString() : '-'}</td>
              <td style={{ padding: 8 }}>{q.pdf_path ? <a href={`/uploads/${q.pdf_path}`} target="_blank" rel="noreferrer">Download</a> : '-'}</td>
              {(user.role === 'procurement' || user.role === 'approver') && rfq.status === 'open' && (
                <td style={{ padding: 8 }}><button onClick={() => award(q.id)} style={{ background: '#38b2ac', color: '#fff', border: 'none', padding: '4px 12px', cursor: 'pointer' }}>Award</button></td>
              )}
            </tr>
          ))}</tbody>
        </table>
      )}

      {user.role === 'supplier' && rfq.status === 'open' && (
        <>
          {!showQuote ? (
            <button onClick={() => setShowQuote(true)} style={{ padding: '8px 16px', background: '#1a365d', color: '#fff', border: 'none', cursor: 'pointer' }}>Submit Quotation</button>
          ) : (
            <div style={{ background: '#f7fafc', padding: 16, borderRadius: 8 }}>
              <h3>Submit Quotation</h3>
              <form onSubmit={submitQuote}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div><label>Total Price</label><br /><input type="number" step="0.01" value={qForm.total_price} onChange={e => setQForm({ ...qForm, total_price: e.target.value })} required style={{ width: '100%', padding: 6 }} /></div>
                  <div><label>Lead Time</label><br /><input value={qForm.lead_time} onChange={e => setQForm({ ...qForm, lead_time: e.target.value })} placeholder="e.g. 2 weeks" required style={{ width: '100%', padding: 6 }} /></div>
                  <div><label>Valid Until</label><br /><input type="date" value={qForm.validity_date} onChange={e => setQForm({ ...qForm, validity_date: e.target.value })} required style={{ width: '100%', padding: 6 }} /></div>
                </div>
                <h4>Item Prices</h4>
                {qItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                    <span style={{ flex: 2 }}>{item.material_name} (x{item.qty})</span>
                    <input type="number" step="0.01" placeholder="Unit price" value={item.unit_price} onChange={e => { const n = [...qItems]; n[i].unit_price = e.target.value; setQItems(n); }} style={{ flex: 1, padding: 6 }} />
                  </div>
                ))}
                <div style={{ marginTop: 12 }}><label>Upload PDF</label><br /><input type="file" accept=".pdf" onChange={e => setPdf(e.target.files[0])} /></div>
                <div style={{ marginTop: 12 }}>
                  <button type="submit" style={{ padding: '8px 16px', background: '#1a365d', color: '#fff', border: 'none', cursor: 'pointer' }}>Submit</button>
                  <button type="button" onClick={() => setShowQuote(false)} style={{ marginLeft: 8 }}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
