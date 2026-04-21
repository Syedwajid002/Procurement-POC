import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Requests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => { api.get('/requests').then(r => setRequests(r.data)); }, []);

  const statusColor = { pending: '#ecc94b', approved: '#48bb78', rejected: '#f56565', rfq_created: '#4299e1', quoted: '#9f7aea', awarded: '#38b2ac' };

  return (
    <div>
      <h2>Requests</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f7fafc', textAlign: 'left' }}>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>ID</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Created By</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Site/Project</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Priority</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Status</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Date</th>
            <th style={{ padding: 8, borderBottom: '2px solid #e2e8f0' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: 8 }}>#{r.id}</td>
              <td style={{ padding: 8 }}>{r.created_by_name}</td>
              <td style={{ padding: 8 }}>{r.site_project || '-'}</td>
              <td style={{ padding: 8 }}><span style={{ color: r.priority === 'urgent' ? 'red' : 'inherit' }}>{r.priority}</span></td>
              <td style={{ padding: 8 }}><span style={{ background: statusColor[r.status] || '#ccc', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{r.status}</span></td>
              <td style={{ padding: 8 }}>{new Date(r.created_at).toLocaleDateString()}</td>
              <td style={{ padding: 8 }}><Link to={`/requests/${r.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
