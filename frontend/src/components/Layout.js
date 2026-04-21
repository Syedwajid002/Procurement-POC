import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = {
  engineer: [{ to: '/requests', label: 'My Requests' }, { to: '/requests/new', label: 'New Request' }],
  store: [{ to: '/requests', label: 'Requests' }],
  procurement: [{ to: '/requests', label: 'Requests' }, { to: '/rfqs', label: 'RFQs' }],
  approver: [{ to: '/requests', label: 'Requests' }],
  supplier: [{ to: '/rfqs', label: 'My RFQs' }],
  admin: [{ to: '/admin/users', label: 'Users' }, { to: '/admin/materials', label: 'Materials' }, { to: '/admin/suppliers', label: 'Suppliers' }],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const items = navItems[user.role] || [];

  return (
    <div>
      <nav style={{ background: '#1a365d', color: '#fff', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <strong style={{ marginRight: 16 }}>Procurement</strong>
        {items.map(i => <Link key={i.to} to={i.to} style={{ color: '#fff', textDecoration: 'none' }}>{i.label}</Link>)}
        <span style={{ marginLeft: 'auto' }}>{user.name} ({user.role})</span>
        <button onClick={logout} style={{ background: 'none', border: '1px solid #fff', color: '#fff', padding: '4px 12px', cursor: 'pointer' }}>Logout</button>
      </nav>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}
