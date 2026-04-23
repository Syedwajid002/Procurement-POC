import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  pending: { bg: 'bg-amber-100 text-amber-700', label: 'Pending' },
  store_review: { bg: 'bg-sky-100 text-sky-700', label: 'Store Review' },
  approved: { bg: 'bg-emerald-100 text-emerald-700', label: 'Approved' },
  rejected: { bg: 'bg-rose-100 text-rose-700', label: 'Rejected' },
  rfq_created: { bg: 'bg-indigo-100 text-indigo-700', label: 'RFQ Created' },
  quoted: { bg: 'bg-purple-100 text-purple-700', label: 'Quoted' },
  awarded: { bg: 'bg-teal-100 text-teal-700', label: 'Awarded' },
};

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
    setComment('');
    load();
  };

  const handleStock = async (item_id, in_stock) => {
    await api.patch(`/requests/${id}/stock`, { item_id, in_stock });
    load();
  };

  if (!req) return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-slate-400">Loading request...</div></div>;

  const sc = statusConfig[req.status] || { bg: 'bg-slate-100 text-slate-600', label: req.status };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/requests" className="text-slate-400 hover:text-slate-600 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Request #{req.id}</h2>
          <p className="text-slate-500 text-sm">Created {new Date(req.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Created By</div>
            <div className="font-medium text-slate-800">{req.created_by_name}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</div>
            <span className={`badge ${sc.bg}`}>{sc.label}</span>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Priority</div>
            {req.priority === 'urgent'
              ? <span className="badge bg-rose-100 text-rose-700">🔴 Urgent</span>
              : <span className="text-slate-700">Normal</span>}
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Site / Project</div>
            <div className="text-slate-700">{req.site_project || '—'}</div>
          </div>
        </div>
        {req.notes && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notes</div>
            <div className="text-slate-700 text-sm">{req.notes}</div>
          </div>
        )}
      </div>

      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-700">Items ({req.items.length})</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="table-header">Material</th>
              <th className="table-header">Qty</th>
              <th className="table-header">Unit</th>
              <th className="table-header">Required Date</th>
              {user.role === 'store' && <th className="table-header">Stock Status</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {req.items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50">
                <td className="table-cell font-medium">{item.material_name}</td>
                <td className="table-cell">{item.qty}</td>
                <td className="table-cell">{item.unit}</td>
                <td className="table-cell text-slate-500">{item.required_date ? new Date(item.required_date).toLocaleDateString() : '—'}</td>
                {user.role === 'store' && (
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => handleStock(item.id, true)} className={`btn-sm rounded-md text-xs font-medium transition ${item.in_stock === true ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}>In Stock</button>
                      <button onClick={() => handleStock(item.id, false)} className={`btn-sm rounded-md text-xs font-medium transition ${item.in_stock === false ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'}`}>Out of Stock</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {req.attachments?.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-slate-700 mb-3">Attachments</h3>
          <div className="space-y-2">
            {req.attachments.map(a => (
              <a key={a.id} href={`/uploads/${a.filepath}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                {a.filename}
              </a>
            ))}
          </div>
        </div>
      )}

      {req.approvals?.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-slate-700 mb-3">Approval History</h3>
          <div className="space-y-3">
            {req.approvals.map(a => (
              <div key={a.id} className={`p-4 rounded-lg border ${a.action === 'approve' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${a.action === 'approve' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  <span className="font-medium text-sm">{a.approver_name}</span>
                  <span className={`badge text-xs ${a.action === 'approve' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{a.action}d</span>
                </div>
                {a.comment && <p className="text-sm text-slate-600 mt-2 ml-4">"{a.comment}"</p>}
                <div className="text-xs text-slate-400 mt-1 ml-4">{new Date(a.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {user.role === 'approver' && (req.status === 'pending' || req.status === 'store_review') && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Approval Action</h3>
          <textarea placeholder="Add a comment (required for rejection)" value={comment} onChange={e => setComment(e.target.value)} rows={3} className="input mb-4" />
          <div className="flex gap-3">
            <button onClick={() => handleApproval('approve')} className="btn-success">✓ Approve</button>
            <button onClick={() => handleApproval('reject')} className="btn-danger">✕ Reject</button>
          </div>
        </div>
      )}
    </div>
  );
}
