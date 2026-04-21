import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Requests from './pages/Requests';
import NewRequest from './pages/NewRequest';
import RequestDetail from './pages/RequestDetail';
import RFQs from './pages/RFQs';
import RFQDetail from './pages/RFQDetail';
import AdminUsers from './pages/AdminUsers';
import AdminMaterials from './pages/AdminMaterials';
import AdminSuppliers from './pages/AdminSuppliers';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/requests" />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  const home = user?.role === 'admin' ? '/admin/users' : user?.role === 'supplier' ? '/rfqs' : '/requests';

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={home} /> : <Login />} />
      <Route path="/requests" element={<PrivateRoute roles={['engineer','store','procurement','approver']}><Requests /></PrivateRoute>} />
      <Route path="/requests/new" element={<PrivateRoute roles={['engineer']}><NewRequest /></PrivateRoute>} />
      <Route path="/requests/:id" element={<PrivateRoute roles={['engineer','store','procurement','approver']}><RequestDetail /></PrivateRoute>} />
      <Route path="/rfqs" element={<PrivateRoute roles={['procurement','supplier']}><RFQs /></PrivateRoute>} />
      <Route path="/rfqs/:id" element={<PrivateRoute roles={['procurement','supplier','approver']}><RFQDetail /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
      <Route path="/admin/materials" element={<PrivateRoute roles={['admin']}><AdminMaterials /></PrivateRoute>} />
      <Route path="/admin/suppliers" element={<PrivateRoute roles={['admin']}><AdminSuppliers /></PrivateRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
