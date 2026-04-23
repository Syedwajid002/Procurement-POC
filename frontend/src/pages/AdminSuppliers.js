import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/admin/suppliers').then(r => setSuppliers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggle = async (id, active) => { await api.patch(`/admin/suppliers/${id}`, { active: !active }); load(); };
  const viewHistory = async id => {
    const { data } = await api.get(`/admin/suppliers/${id}/quotations`);
    setHistory({ id, data });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Suppliers</h2>
        <p className="text-slate-500 text-sm mt-1">Suppliers are auto-created when a user with "supplier" role is added</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-400">Loading suppliers...</div> : suppliers.length === 0 ? <div className="p-12 text-center text-slate-400">No suppliers found</div> : (
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-header">Company</th><th className="table-header">Email</th><th className="table-header">Phone</th><th className="table-header">Status</th><th className="table-header">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center text-sm font-semibold text-indigo-600">{s.company_name.charAt(0)}</div>
                      <span className="font-medium">{s.company_name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-slate-500">{s.email}</td>
                  <td className="table-cell text-slate-500">{s.phone || <span className="text-slate-300">—</span>}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${s.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      <span className={`text-sm ${s.active ? 'text-emerald-600' : 'text-slate-400'}`}>{s.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => toggle(s.id, s.active)} className={`btn-sm ${s.active ? 'btn-secondary text-amber-600 border-amber-200 hover:bg-amber-50' : 'btn-secondary text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>{s.active ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={() => viewHistory(s.id)} className="btn-sm btn-secondary">Quotations</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {history && (
        <div className="card p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-700">Quotation History</h3>
            <button onClick={() => setHistory(null)} className="text-slate-400 hover:text-slate-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          {history.data.length === 0 ? <p className="text-slate-400 text-sm">No quotations submitted yet.</p> : (
            <table className="w-full">
              <thead><tr className="border-b border-slate-200">
                <th className="table-header">RFQ</th><th className="table-header">Request</th><th className="table-header">Total Price</th><th className="table-header">Lead Time</th><th className="table-header">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {history.data.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/50">
                    <td className="table-cell font-medium">#{q.rfq_id}</td>
                    <td className="table-cell">#{q.request_id}</td>
                    <td className="table-cell font-semibold">{q.total_price}</td>
                    <td className="table-cell">{q.lead_time}</td>
                    <td className="table-cell text-slate-500">{new Date(q.submitted_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
