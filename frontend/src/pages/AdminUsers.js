import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'engineer' });
  const [show, setShow] = useState(false);

  const load = () => api.get('/admin/users').then(r => setUsers(r.data));
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
    const pw = prompt('New password:');
    if (pw) { await api.post(`/admin/users/${id}/reset-password`, { password: pw }); alert('Password reset'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Users</h2>
        <button onClick={() => setShow(!show)} style={{ padding: '8px 16px' }}>{show ? 'Cancel' : 'Add User'}</button>
      </div>
      {show && (
        <form onSubmit={create} style={{ background: '#f7fafc', padding: 16, borderRadius: 8, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label>Name</label><br /><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ width: '100%', padding: 6 }} /></div>
          <div><label>Email</label><br /><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={{ width: '100%', padding: 6 }} /></div>
          <div><label>Password</label><br /><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ width: '100%', padding: 6 }} /></div>
          <div><label>Role</label><br />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ width: '100%', padding: 6 }}>
              {['engineer','store','procurement','approver','supplier','admin'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div><button type="submit" style={{ padding: '8px 16px' }}>Create User</button></div>
        </form>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: '#f7fafc', textAlign: 'left' }}>
          <th style={{ padding: 8 }}>Name</th><th style={{ padding: 8 }}>Email</th><th style={{ padding: 8 }}>Role</th><th style={{ padding: 8 }}>Status</th><th style={{ padding: 8 }}>Actions</th>
        </tr></thead>
        <tbody>{users.map(u => (
          <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td style={{ padding: 8 }}>{u.name}</td>
            <td style={{ padding: 8 }}>{u.email}</td>
            <td style={{ padding: 8 }}>{u.role}</td>
            <td style={{ padding: 8 }}><span style={{ color: u.active ? 'green' : 'red' }}>{u.active ? 'Active' : 'Inactive'}</span></td>
            <td style={{ padding: 8 }}>
              <button onClick={() => toggle(u.id, u.active)} style={{ marginRight: 8 }}>{u.active ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => resetPw(u.id)}>Reset PW</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
