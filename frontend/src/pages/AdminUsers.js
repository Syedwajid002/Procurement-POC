import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'engineer' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const create = async e => {
    e.preventDefault();
    await api.post('/admin/users', form);
    setForm({ name: '', email: '', password: '', role: 'engineer' });
    setShow(false);
    load();
  };

  const toggle = async (id, active) => { await api.patch(`/admin/users/${id}`, { active: !active }); load(); };
  const resetPw = async id => {
    const pw = prompt('Enter new password:');
    if (pw) { await api.post(`/admin/users/${id}/reset-password`, { password: pw }); alert('Password reset successfully'); }
  };

  const roleColors = {
    engineer: 'bg-blue-100 text-blue-700', store: 'bg-amber-100 text-amber-700',
    procurement: 'bg-indigo-100 text-indigo-700', approver: 'bg-emerald-100 text-emerald-700',
    supplier: 'bg-purple-100 text-purple-700', admin: 'bg-rose-100 text-rose-700',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Users</h2>
          <p className="text-slate-500 text-sm mt-1">Manage system users and roles</p>
        </div>
        <button onClick={() => setShow(!show)} className={show ? 'btn-secondary' : 'btn-primary'}>{show ? 'Cancel' : '+ Add User'}</button>
      </div>

      {show && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-slate-700 mb-4">Create New User</h3>
          <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="John Doe" className="input" /></div>
            <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="john@company.com" className="input" /></div>
            <div><label className="label">Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Min 6 characters" className="input" /></div>
            <div><label className="label">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input">
                {['engineer','store','procurement','approver','supplier','admin'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><button type="submit" className="btn-success">Create User</button></div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? <div className="p-12 text-center text-slate-400">Loading users...</div> : (
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="table-header">Name</th><th className="table-header">Email</th><th className="table-header">Role</th><th className="table-header">Status</th><th className="table-header">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="table-cell"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-semibold text-slate-600">{u.name.charAt(0)}</div><span className="font-medium">{u.name}</span></div></td>
                  <td className="table-cell text-slate-500">{u.email}</td>
                  <td className="table-cell"><span className={`badge ${roleColors[u.role] || 'bg-slate-100 text-slate-600'}`}>{u.role}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      <span className={`text-sm ${u.active ? 'text-emerald-600' : 'text-slate-400'}`}>{u.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => toggle(u.id, u.active)} className={`btn-sm ${u.active ? 'btn-secondary text-amber-600 border-amber-200 hover:bg-amber-50' : 'btn-secondary text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>{u.active ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={() => resetPw(u.id)} className="btn-sm btn-secondary">Reset PW</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
