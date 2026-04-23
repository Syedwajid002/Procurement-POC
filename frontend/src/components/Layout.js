import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = {
  engineer: [{ to: '/requests', label: 'My Requests', icon: '📋' }, { to: '/requests/new', label: 'New Request', icon: '➕' }],
  store: [{ to: '/requests', label: 'Requests', icon: '📋' }],
  procurement: [{ to: '/requests', label: 'Requests', icon: '📋' }, { to: '/rfqs', label: 'RFQs', icon: '📄' }],
  approver: [{ to: '/requests', label: 'Requests', icon: '📋' }],
  supplier: [{ to: '/rfqs', label: 'My RFQs', icon: '📄' }],
  admin: [{ to: '/admin/users', label: 'Users', icon: '👥' }, { to: '/admin/materials', label: 'Materials', icon: '📦' }, { to: '/admin/suppliers', label: 'Suppliers', icon: '🏢' }],
};

const roleColors = {
  engineer: 'bg-blue-100 text-blue-700',
  store: 'bg-amber-100 text-amber-700',
  procurement: 'bg-indigo-100 text-indigo-700',
  approver: 'bg-emerald-100 text-emerald-700',
  supplier: 'bg-purple-100 text-purple-700',
  admin: 'bg-rose-100 text-rose-700',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const items = navItems[user.role] || [];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <span className="font-bold text-slate-800 text-lg">Procurement</span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                {items.map(i => {
                  const active = location.pathname === i.to || (i.to !== '/' && location.pathname.startsWith(i.to) && i.to.length > 1);
                  return (
                    <Link key={i.to} to={i.to} className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                      <span className="mr-1.5">{i.icon}</span>{i.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-semibold text-slate-600">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-slate-700">{user.name}</div>
                  <span className={`${roleColors[user.role]} badge text-[10px]`}>{user.role}</span>
                </div>
              </div>
              <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition">Logout</button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-500 hover:text-slate-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            {items.map(i => (
              <Link key={i.to} to={i.to} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">{i.icon} {i.label}</Link>
            ))}
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
