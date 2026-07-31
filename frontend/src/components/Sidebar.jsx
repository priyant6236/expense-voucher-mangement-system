import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  CheckSquare,
  FileCheck,
  Shield,
  LogOut,
  User,
  X
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();

  const getNavLinks = () => {
    if (user?.role === 'Employee') {
      return [
        { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
        { name: 'Create Voucher', path: '/employee/create-voucher', icon: FilePlus },
        { name: 'My Vouchers', path: '/employee/my-vouchers', icon: FileText },
      ];
    }
    if (user?.role === 'Director') {
      return [
        { name: 'Dashboard', path: '/director/dashboard', icon: LayoutDashboard },
        { name: 'Pending Approvals', path: '/director/pending', icon: CheckSquare },
        { name: 'All Vouchers', path: '/director/vouchers', icon: FileText },
      ];
    }
    if (user?.role === 'Accounts') {
      return [
        { name: 'Dashboard', path: '/accounts/dashboard', icon: LayoutDashboard },
        { name: 'Approved Vouchers', path: '/accounts/approved', icon: FileCheck },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  const closeSidebar = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-950 border-r border-slate-800 z-50 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-white text-base leading-tight tracking-tight">
                  ExpenseVoucher
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
                  {user?.role} Portal
                </span>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer User Badge & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.department}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
