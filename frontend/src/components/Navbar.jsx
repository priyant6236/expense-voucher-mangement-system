import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Building2, User } from 'lucide-react';

const Navbar = ({ setMobileOpen }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-semibold text-slate-300">
            {user?.department || 'Organization'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium">{user?.employee_id}</span>
        </div>
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-xs">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <span className="hidden md:inline text-xs font-semibold text-white">
            {user?.full_name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
