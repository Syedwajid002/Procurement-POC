import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get(`/rfqs/${id}`).then(r => {
    setRfq(r.data);
    setQItems(r.data.items.map(i => ({ material_name: i.material_name, qty: i.qty, unit_price: '' })));
  });
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const submitQuote = async e => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append('rfq_id', id);
    fd.append('total_price', qForm.total_price);
    fd.append('lead_time', qForm.lead_time);
    fd.append('validity_date', qForm.validity_date);
    fd.append('items', JSON.stringify(qItems));
    if (pdf) fd.append('pdf', pdf);
    await api.post('/quotations', fd);
    setShowQuote(false);
    setSubmitting(false);
    load();
  };

  const award = async qid => {
    if (!window.confirm('Award this quotation?')) return;
    await api.post(`/rfqs/${id}/award`, { quotation_id: qid });
    load();
  };

  if (!rfq) return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-slate-400">Loading RFQ...</div></div>;

  const statusBg = { open: 'bg-sky-100 text-sky-700', closed: 'bg-slate-100 text-slate-600', awarded: 'bg-emerald-100 text-emerald-700' };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/rfqs" className="text-slate-400 hover:text-slate-600 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">RFQ #{rfq.id}</h2>
          <p className="text-slate-500 text-sm">Created {new Date(rfq.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-8">
          <div><div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Request</div><div className="font-medium">#{rfq.request_id}</div></div>
          <div><div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</div><span className={`badge ${statusBg[rfq.status] || 'bg-slate-100 text-slate-600'}`}>{rfq.status}</span></div>
          <div><div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Priority</div><div>{rfq.priority}</div></div>
          <div><div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Site / Project</div><div>{rfq.site_project || '\u2014'}</div></div>
        </div>
      </div>

      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50"><h3 className="font-semibold text-slate-700">Request Items</h3></div>
        <table className="w-full">
          <thead><tr className="border-b border-slate-100"><th className="table-header">Material</th><th className="table-header">Qty</th><th className="table-header">Unit</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rfq.items.map(i => <tr key={i.id} className="hover:bg-slate-50/50"><td className="table-cell font-medium">{i.material_name}</td><td className="table-cell">{i.qty}</td><td className="table-cell">{i.unit}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Quotations ({rfq.quotations.length})</h3>
        </div>
        {rfq.quotations.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No quotations submitted yet</div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              <th className="table-header">Supplier</th><th className="table-header">Total Price</th><th className="table-header">Lead Time</th><th className="table-header">Valid Until</th><th className="table-header">PDF</th>
              {(user.role === 'procurement' || user.role === 'approver') && <th className="table-header"></th>}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rfq.quotations.map(q => (
                <tr key={q.id} className="hover:bg-slate-50/50">
                  <td className="table-cell font-medium">{q.company_name}</td>
                  <td className="table-cell"><span className="font-semibold text-slate-800">{q.total_price}</span></td>
                  <td className="table-cell">{q.lead_time}</td>
                  <td className="table-cell text-slate-500">{q.validity_date ? new Date(q.validity_date).toLocaleDateString() : '\u2014'}</td>
                  <td className="table-cell">{q.pdf_path ? <a href={`/uploads/${q.pdf_path}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Download</a> : <span className="text-slate-400">\u2014</span>}</td>
                  {(user.role === 'procurement' || user.role === 'approver') && rfq.status === 'open' && (
                    <td className="table-cell"><button onClick={() => award(q.id)} className="btn-success btn-sm">\u2713 Award</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {user.role === 'supplier' && rfq.status === 'open' && (
        <>
          {!showQuote ? (
            <button onClick={() => setShowQuote(true)} className="btn-primary">Submit Quotation</button>
          ) : (
            <div className="card p-6">
              <h3 className="font-semibold text-slate-700 mb-4">Submit Quotation</h3>
              <form onSubmit={submitQuote}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div><label className="label">Total Price</label><input type="number" step="0.01" value={qForm.total_price} onChange={e => setQForm({ ...qForm, total_price: e.target.value })} required className="input" /></div>
                  <div><label className="label">Lead Time</label><input value={qForm.lead_time} onChange={e => setQForm({ ...qForm, lead_time: e.target.value })} placeholder="e.g. 2 weeks" required className="input" /></div>
                  <div><label className="label">Valid Until</label><input type="date" value={qForm.validity_date} onChange={e => setQForm({ ...qForm, validity_date: e.target.value })} required className="input" /></div>
                </div>
                <div className="mb-5">
                  <label className="label">Item Prices</label>
                  <div className="space-y-2">
                    {qItems.map((item, i) => (
                      <div key={i} className="flex gap-4 items-center p-3 bg-slate-50 rounded-lg">
                        <span className="flex-[2] text-sm font-medium text-slate-700">{item.material_name} <span className="text-slate-400">(x{item.qty})</span></span>
                        <input type="number" step="0.01" placeholder="Unit price" value={item.unit_price} onChange={e => { const n = [...qItems]; n[i].unit_price = e.target.value; setQItems(n); }} className="input flex-1" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <label className="label">Upload Quotation PDF</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-indigo-400 transition">
                    <input type="file" accept=".pdf" onChange={e => setPdf(e.target.files[0])} className="text-sm text-slate-500" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit Quotation'}</button>
                  <button type="button" onClick={() => setShowQuote(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
