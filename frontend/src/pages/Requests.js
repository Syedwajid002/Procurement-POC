import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const statusConfig = {
  pending: { bg: 'bg-amber-100 text-amber-700', label: 'Pending' },
  store_review: { bg: 'bg-sky-100 text-sky-700', label: 'Store Review' },
  approved: { bg: 'bg-emerald-100 text-emerald-700', label: 'Approved' },
  rejected: { bg: 'bg-rose-100 text-rose-700', label: 'Rejected' },
  rfq_created: { bg: 'bg-indigo-100 text-indigo-700', label: 'RFQ Created' },
  quoted: { bg: 'bg-purple-100 text-purple-700', label: 'Quoted' },
  awarded: { bg: 'bg-teal-100 text-teal-700', label: 'Awarded' },
};

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/requests').then(r => setRequests(r.data)).finally(() => setLoading(false)); }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Requests</h2>
          <p className="text-slate-500 text-sm mt-1">{requests.length} total requests</p>
        </div>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No requests found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="table-header">ID</th>
                <th className="table-header">Created By</th>
                <th className="table-header">Site / Project</th>
                <th className="table-header">Priority</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map(r => {
                const sc = statusConfig[r.status] || { bg: 'bg-slate-100 text-slate-600', label: r.status };
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="table-cell font-medium">#{r.id}</td>
                    <td className="table-cell">{r.created_by_name}</td>
                    <td className="table-cell">{r.site_project || <span className="text-slate-400">—</span>}</td>
                    <td className="table-cell">
                      {r.priority === 'urgent'
                        ? <span className="badge bg-rose-100 text-rose-700">🔴 Urgent</span>
                        : <span className="text-slate-500">Normal</span>}
                    </td>
                    <td className="table-cell"><span className={`badge ${sc.bg}`}>{sc.label}</span></td>
                    <td className="table-cell text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="table-cell"><Link to={`/requests/${r.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">View →</Link></td>
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
