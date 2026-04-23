import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function NewRequest() {
  const nav = useNavigate();
  const [form, setForm] = useState({ site_project: '', priority: 'normal', notes: '' });
  const [items, setItems] = useState([{ material_name: '', qty: '', unit: 'pcs', required_date: '' }]);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => setItems([...items, { material_name: '', qty: '', unit: 'pcs', required_date: '' }]);
  const updateItem = (i, field, val) => { const n = [...items]; n[i][field] = val; setItems(n); };
  const removeItem = i => setItems(items.filter((_, idx) => idx !== i));

  const submit = async e => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append('site_project', form.site_project);
    fd.append('priority', form.priority);
    fd.append('notes', form.notes);
    fd.append('items', JSON.stringify(items));
    files.forEach(f => fd.append('attachments', f));
    await api.post('/requests', fd);
    nav('/requests');
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">New Request</h2>
        <p className="text-slate-500 text-sm mt-1">Submit a new procurement request</p>
      </div>
      <form onSubmit={submit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="site" className="label">Site / Project</label>
            <input id="site" value={form.site_project} onChange={e => setForm({ ...form, site_project: e.target.value })} placeholder="e.g. Building A" className="input" />
          </div>
          <div>
            <label htmlFor="priority" className="label">Priority</label>
            <select id="priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input">
              <option value="normal">Normal</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Material Items</h3>
            <button type="button" onClick={addItem} className="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition">+ Add Item</button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-[2]">
                  {i === 0 && <label className="text-xs text-slate-500 mb-1 block">Material</label>}
                  <input placeholder="Material name" value={item.material_name} onChange={e => updateItem(i, 'material_name', e.target.value)} required className="input" />
                </div>
                <div className="flex-1">
                  {i === 0 && <label className="text-xs text-slate-500 mb-1 block">Qty</label>}
                  <input type="number" placeholder="0" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} required className="input" />
                </div>
                <div className="flex-1">
                  {i === 0 && <label className="text-xs text-slate-500 mb-1 block">Unit</label>}
                  <select value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className="input">
                    <option>pcs</option><option>kg</option><option>m</option><option>litre</option><option>set</option>
                  </select>
                </div>
                <div className="flex-1">
                  {i === 0 && <label className="text-xs text-slate-500 mb-1 block">Required</label>}
                  <input type="date" value={item.required_date} onChange={e => updateItem(i, 'required_date', e.target.value)} className="input" />
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="mt-1 text-slate-400 hover:text-rose-500 transition p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="label">Notes</label>
          <textarea id="notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Any additional notes..." className="input" />
        </div>

        <div>
          <label htmlFor="attachments" className="label">Attachments</label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-indigo-400 transition cursor-pointer">
            <input id="attachments" type="file" multiple onChange={e => setFiles([...e.target.files])} className="text-sm text-slate-500" />
            {files.length > 0 && <p className="text-xs text-slate-500 mt-2">{files.length} file(s) selected</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
          <button type="button" onClick={() => nav('/requests')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
