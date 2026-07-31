import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import VoucherForm from './pages/employee/VoucherForm';
import MyVouchers from './pages/employee/MyVouchers';

// Director Pages
import DirectorDashboard from './pages/director/DirectorDashboard';
import PendingApprovals from './pages/director/PendingApprovals';
import AllVouchers from './pages/director/AllVouchers';

// Accounts Pages
import AccountsDashboard from './pages/accounts/AccountsDashboard';
import ApprovedVouchers from './pages/accounts/ApprovedVouchers';

// Role Dashboard Redirector
const RoleBasedRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'Employee') return <Navigate to="/employee/dashboard" replace />;
  if (user?.role === 'Director') return <Navigate to="/director/dashboard" replace />;
  if (user?.role === 'Accounts') return <Navigate to="/accounts/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Employee Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Employee']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/employee/create-voucher" element={<VoucherForm />} />
              <Route path="/employee/edit-voucher/:id" element={<VoucherForm />} />
              <Route path="/employee/my-vouchers" element={<MyVouchers />} />
            </Route>
          </Route>

          {/* Director Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Director']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/director/dashboard" element={<DirectorDashboard />} />
              <Route path="/director/pending" element={<PendingApprovals />} />
              <Route path="/director/vouchers" element={<AllVouchers />} />
            </Route>
          </Route>

          {/* Accounts Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Accounts']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
              <Route path="/accounts/approved" element={<ApprovedVouchers />} />
            </Route>
          </Route>

          {/* Default */}
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
