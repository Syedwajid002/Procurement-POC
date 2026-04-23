import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminMaterials() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', unit: 'pcs', category: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => api.get(`/admin/materials?search=${search}`).then(r => setMaterials(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [search]); // eslint-disable-line

  const create = async e => {
    e.preventDefault();
    await api.post('/admin/materials', form);
    setForm({ name: '', unit: 'pcs', category: '' });
    setShow(false);
    load();
  };

  const toggle = async (id, active) => { await api.patch(`/admin/materials/${id}`, { active: !active }); load(); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Materials</h2>
          <p className="text-slate-500 text-sm mt-1">Manage material master data</p>
        </div>
        <button onClick={() => setShow(!show)} className={show ? 'btn-secondary' : 'btn-primary'}>{show ? 'Cancel' : '+ Add Material'}</button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input placeholder="Search materials..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" />
        </div>
      </div>

      {show && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-slate-700 mb-4">Add New Material</h3>
          <form onSubmit={create} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]"><label className="label">Name</label><input placeholder="e.g. Steel Rod" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="input" /></div>
            <div className="w-32"><label className="label">Unit</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="input">
                <option>pcs</option><option>kg</option><option>m</option><option>litre</option><option>set</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]"><label className="label">Category</label><input placeholder="e.g. Construction" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input" /></div>
            <button type="submit" className="btn-success">Add Material</button>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-400">Loading materials...</div> : materials.length === 0 ? <div className="p-12 text-center text-slate-400">No materials found</div> : (
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-header">Name</th><th className="table-header">Unit</th><th className="table-header">Category</th><th className="table-header">Status</th><th className="table-header">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition">
                  <td className="table-cell font-medium">{m.name}</td>
                  <td className="table-cell"><span className="bg-slate-100 text-slate-600 badge">{m.unit}</span></td>
                  <td className="table-cell text-slate-500">{m.category || <span className="text-slate-300">\u2014</span>}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${m.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      <span className={`text-sm ${m.active ? 'text-emerald-600' : 'text-slate-400'}`}>{m.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="table-cell"><button onClick={() => toggle(m.id, m.active)} className={`btn-sm ${m.active ? 'btn-secondary text-amber-600 border-amber-200 hover:bg-amber-50' : 'btn-secondary text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>{m.active ? 'Deactivate' : 'Activate'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
