import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { voucherService } from '../../services/voucher.service';
import StatusBadge from '../../components/StatusBadge';
import {
  FileText,
  FileEdit,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  PlusCircle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });

  const [recentVouchers, setRecentVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, vouchersRes] = await Promise.all([
          voucherService.getEmployeeStats(),
          voucherService.getMyVouchers()
        ]);

        if (statsRes.status === 'success') {
          setStats(statsRes.data.stats);
        }
        if (vouchersRes.status === 'success') {
          setRecentVouchers(vouchersRes.data.vouchers.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load employee dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Employee Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track and manage your expense reimbursement vouchers
          </p>
        </div>
        <Link
          to="/employee/create-voucher"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Voucher</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Vouchers */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <FileText className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-black text-white">{loading ? '...' : stats.total}</p>
          <span className="text-[11px] text-slate-500">All Created Vouchers</span>
        </div>

        {/* Draft Vouchers */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
            <FileEdit className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-200">{loading ? '...' : stats.draft}</p>
          <span className="text-[11px] text-slate-500">Unsubmitted Drafts</span>
        </div>

        {/* Pending Approval */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-400">{loading ? '...' : stats.pending}</p>
          <span className="text-[11px] text-slate-500">Awaiting Review</span>
        </div>

        {/* Approved */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{loading ? '...' : stats.approved}</p>
          <span className="text-[11px] text-slate-500">Reimbursement Ready</span>
        </div>

        {/* Rejected */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-rose-400">{loading ? '...' : stats.rejected}</p>
          <span className="text-[11px] text-slate-500">Requires Revision</span>
        </div>

        {/* Total Amount Claimed */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2 bg-gradient-to-br from-brand-950/40 to-slate-900">
          <div className="flex items-center justify-between text-brand-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Claimed</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-white">
            ${loading ? '0.00' : stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-brand-300/80">Total Expense Value</span>
        </div>
      </div>

      {/* Recent Activity Table Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            <span>Recent Vouchers</span>
          </h2>
          <Link
            to="/employee/my-vouchers"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm py-4 text-center">Loading recent activity...</p>
        ) : recentVouchers.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm">No vouchers created yet.</p>
            <Link
              to="/employee/create-voucher"
              className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
            >
              Create Your First Voucher
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Voucher No</th>
                  <th className="py-3 px-4">Expense Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{v.voucher_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">{v.expense_title}</td>
                    <td className="py-3 px-4 text-slate-400">{v.expense_category}</td>
                    <td className="py-3 px-4 text-slate-400">{v.expense_date}</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      ${parseFloat(v.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
