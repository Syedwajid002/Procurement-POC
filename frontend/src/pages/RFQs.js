import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  open: { bg: 'bg-sky-100 text-sky-700', label: 'Open' },
  closed: { bg: 'bg-slate-100 text-slate-600', label: 'Closed' },
  awarded: { bg: 'bg-emerald-100 text-emerald-700', label: 'Awarded' },
};

export default function RFQs() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [requests, setRequests] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ request_id: '', supplier_ids: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/rfqs').then(r => setRfqs(r.data)).finally(() => setLoading(false)); }, []);

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
    setForm({ request_id: '', supplier_ids: [] });
    api.get('/rfqs').then(r => setRfqs(r.data));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">RFQs</h2>
          <p className="text-slate-500 text-sm mt-1">{rfqs.length} total RFQs</p>
        </div>
        {user.role === 'procurement' && <button onClick={openCreate} className="btn-primary">+ Create RFQ</button>}
      </div>

      {showCreate && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-slate-700 mb-4">Create New RFQ</h3>
          <form onSubmit={createRFQ}>
            <div className="mb-4">
              <label htmlFor="rfq-request" className="label">Select Approved Request</label>
              <select id="rfq-request" value={form.request_id} onChange={e => setForm({ ...form, request_id: e.target.value })} required className="input max-w-md">
                <option value="">Choose a request...</option>
                {requests.map(r => <option key={r.id} value={r.id}>#{r.id} — {r.site_project || 'No project'}</option>)}
              </select>
            </div>
            <div className="mb-5">
              <label className="label">Select Suppliers</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {suppliers.map(s => (
                  <label key={s.id} className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition ${form.supplier_ids.includes(s.id) ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="checkbox" checked={form.supplier_ids.includes(s.id)} onChange={() => toggleSupplier(s.id)} className="rounded text-indigo-600" />
                    <span className="text-sm font-medium text-slate-700">{s.company_name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Create RFQ</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading RFQs...</div>
        ) : rfqs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No RFQs found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="table-header">RFQ ID</th>
                <th className="table-header">Request</th>
                <th className="table-header">Site / Project</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rfqs.map(r => {
                const sc = statusConfig[r.status] || { bg: 'bg-slate-100 text-slate-600', label: r.status };
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="table-cell font-medium">#{r.id}</td>
                    <td className="table-cell">#{r.request_id}</td>
                    <td className="table-cell">{r.site_project || <span className="text-slate-400">—</span>}</td>
                    <td className="table-cell"><span className={`badge ${sc.bg}`}>{sc.label}</span></td>
                    <td className="table-cell text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="table-cell"><Link to={`/rfqs/${r.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">View →</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
