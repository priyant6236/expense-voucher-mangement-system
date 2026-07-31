import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { directorService } from '../../services/director.service';
import StatusBadge from '../../components/StatusBadge';
import {
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  TrendingUp,
  Check,
  X
} from 'lucide-react';

const DirectorDashboard = () => {
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalPendingAmount: 0,
    totalVouchers: 0
  });

  const [pendingVouchers, setPendingVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        directorService.getDirectorStats(),
        directorService.getPendingVouchers()
      ]);

      if (statsRes.status === 'success') {
        setStats(statsRes.data.stats);
      }
      if (pendingRes.status === 'success') {
        setPendingVouchers(pendingRes.data.vouchers.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load Director dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickApprove = async (id) => {
    try {
      await directorService.approveVoucher(id);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Director Approval Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review, approve with signature, or reject employee expense claims
          </p>
        </div>
        <Link
          to="/director/pending"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 transition-all shrink-0"
        >
          <Clock className="w-5 h-5" />
          <span>Review Pending ({stats.pendingApprovals})</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approvals */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-amber-400">{loading ? '...' : stats.pendingApprovals}</p>
          <span className="text-xs text-slate-400">Requires Director Action</span>
        </div>

        {/* Approved Today */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved Today</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{loading ? '...' : stats.approvedToday}</p>
          <span className="text-xs text-slate-400">Signed Vouchers Today</span>
        </div>

        {/* Rejected Today */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Rejected Today</span>
            <XCircle className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-rose-400">{loading ? '...' : stats.rejectedToday}</p>
          <span className="text-xs text-slate-400">Returned with Remarks</span>
        </div>

        {/* Total Pending Amount */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 bg-gradient-to-br from-amber-950/30 to-slate-900">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Amount</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-white">
            ${loading ? '0.00' : stats.totalPendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-amber-300/80">Pending Outflow Value</span>
        </div>
      </div>

      {/* Pending Vouchers Quick Review Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Pending Vouchers Queue</span>
          </h2>
          <Link
            to="/director/pending"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Go to Approval Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm py-4 text-center">Loading pending queue...</p>
        ) : pendingVouchers.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <FileCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-slate-300 text-sm font-semibold">All Pending Vouchers Reviewed!</p>
            <p className="text-slate-500 text-xs">There are no vouchers awaiting approval at this time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Voucher No</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Quick Approve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{v.voucher_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      <div>{v.employee_name}</div>
                      <span className="text-[11px] text-slate-500">{v.employee_id}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{v.department}</td>
                    <td className="py-3 px-4 text-slate-300">{v.expense_title}</td>
                    <td className="py-3 px-4 font-extrabold text-amber-400">
                      ${parseFloat(v.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleQuickApprove(v.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
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

export default DirectorDashboard;
