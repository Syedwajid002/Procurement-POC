import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [req, setReq] = useState(null);
  const [comment, setComment] = useState('');

  const load = () => api.get(`/requests/${id}`).then(r => setReq(r.data));
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const handleApproval = async action => {
    if (action === 'reject' && !comment) return alert('Comment required for rejection');
    await api.post(`/requests/${id}/approve`, { action, comment });
    load();
  };

  const handleStock = async (item_id, in_stock) => {
    await api.patch(`/requests/${id}/stock`, { item_id, in_stock });
    load();
  };

  if (!req) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 800 }}>
      <h2>Request #{req.id}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16, background: '#f7fafc', padding: 16, borderRadius: 8 }}>
        <div><strong>Created by:</strong> {req.created_by_name}</div>
        <div><strong>Status:</strong> {req.status}</div>
        <div><strong>Priority:</strong> <span style={{ color: req.priority === 'urgent' ? 'red' : 'inherit' }}>{req.priority}</span></div>
        <div><strong>Site/Project:</strong> {req.site_project || '-'}</div>
        <div style={{ gridColumn: '1/3' }}><strong>Notes:</strong> {req.notes || '-'}</div>
      </div>

      <h3>Items</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#f7fafc', textAlign: 'left' }}>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Material</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Qty</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Unit</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Required Date</th>
            {user.role === 'store' && <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Stock</th>}
          </tr>
        </thead>
        <tbody>
          {req.items.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: 8 }}>{item.material_name}</td>
              <td style={{ padding: 8 }}>{item.qty}</td>
              <td style={{ padding: 8 }}>{item.unit}</td>
              <td style={{ padding: 8 }}>{item.required_date ? new Date(item.required_date).toLocaleDateString() : '-'}</td>
              {user.role === 'store' && (
                <td style={{ padding: 8 }}>
                  <button onClick={() => handleStock(item.id, true)} style={{ marginRight: 4, background: item.in_stock === true ? '#48bb78' : '#eee', color: item.in_stock === true ? '#fff' : '#000', border: 'none', padding: '2px 8px', cursor: 'pointer' }}>In Stock</button>
                  <button onClick={() => handleStock(item.id, false)} style={{ background: item.in_stock === false ? '#f56565' : '#eee', color: item.in_stock === false ? '#fff' : '#000', border: 'none', padding: '2px 8px', cursor: 'pointer' }}>Out</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {req.attachments?.length > 0 && (
        <>
          <h3>Attachments</h3>
          <ul>{req.attachments.map(a => <li key={a.id}><a href={`/uploads/${a.filepath}`} target="_blank" rel="noreferrer">{a.filename}</a></li>)}</ul>
        </>
      )}

      {req.approvals?.length > 0 && (
        <>
          <h3>Approval History</h3>
          {req.approvals.map(a => (
            <div key={a.id} style={{ padding: 8, marginBottom: 8, background: a.action === 'approve' ? '#f0fff4' : '#fff5f5', borderRadius: 4 }}>
              <strong>{a.approver_name}</strong> — {a.action}d {a.comment && <span>— "{a.comment}"</span>}
              <div style={{ fontSize: 12, color: '#718096' }}>{new Date(a.created_at).toLocaleString()}</div>
            </div>
          ))}
        </>
      )}

      {user.role === 'approver' && (req.status === 'pending' || req.status === 'store_review') && (
        <div style={{ marginTop: 16, padding: 16, background: '#f7fafc', borderRadius: 8 }}>
          <h3>Approval Action</h3>
          <textarea placeholder="Comment (required for rejection)" value={comment} onChange={e => setComment(e.target.value)} rows={2} style={{ width: '100%', padding: 6, marginBottom: 8 }} />
          <button onClick={() => handleApproval('approve')} style={{ padding: '8px 16px', background: '#48bb78', color: '#fff', border: 'none', marginRight: 8, cursor: 'pointer' }}>Approve</button>
          <button onClick={() => handleApproval('reject')} style={{ padding: '8px 16px', background: '#f56565', color: '#fff', border: 'none', cursor: 'pointer' }}>Reject</button>
        </div>
      )}
    </div>
  );
}
