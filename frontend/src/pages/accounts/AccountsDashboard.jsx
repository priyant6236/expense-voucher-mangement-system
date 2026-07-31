import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { accountsService } from '../../services/accounts.service';
import StatusBadge from '../../components/StatusBadge';
import {
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  FileCheck,
  ArrowRight,
  TrendingUp,
  Shield
} from 'lucide-react';

const AccountsDashboard = () => {
  const [stats, setStats] = useState({
    totalVouchers: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    totalApprovedAmount: 0
  });
  const [recentApproved, setRecentApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, approvedRes] = await Promise.all([
          accountsService.getAccountsStats(),
          accountsService.getApprovedVouchers()
        ]);
        if (statsRes.status === 'success') setStats(statsRes.data.stats);
        if (approvedRes.status === 'success') setRecentApproved(approvedRes.data.vouchers.slice(0, 6));
      } catch (error) {
        console.error('Failed to load accounts dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Accounts & Finance Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit approved vouchers, verify signatures, and process reimbursements
          </p>
        </div>
        <Link
          to="/accounts/approved"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all shrink-0"
        >
          <FileCheck className="w-5 h-5" />
          <span>Approved Vouchers ({stats.approvedCount})</span>
        </Link>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <Shield className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-black text-white">{loading ? '...' : stats.totalVouchers}</p>
          <span className="text-[11px] text-slate-500">All Org. Vouchers</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{loading ? '...' : stats.approvedCount}</p>
          <span className="text-[11px] text-slate-500">Ready for Disbursement</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-400">{loading ? '...' : stats.pendingCount}</p>
          <span className="text-[11px] text-slate-500">Awaiting Director</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-rose-400">{loading ? '...' : stats.rejectedCount}</p>
          <span className="text-[11px] text-slate-500">Not Reimbursable</span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2 bg-gradient-to-br from-emerald-950/30 to-slate-900">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved $</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-white">
            ${loading ? '0.00' : stats.totalApprovedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-emerald-300/80">Total Disbursement Due</span>
        </div>
      </div>

      {/* Recent Approved Vouchers */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Recent Approved Vouchers</span>
          </h2>
          <Link
            to="/accounts/approved"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm py-4 text-center">Loading approved vouchers...</p>
        ) : recentApproved.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <FileCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm">No approved vouchers available yet.</p>
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
                  <th className="py-3 px-4">Approval Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentApproved.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{v.voucher_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{v.employee_name}</div>
                      <div className="text-[11px] text-slate-500">{v.employee_id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{v.department}</td>
                    <td className="py-3 px-4 text-slate-300">{v.expense_title}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-400">
                      ${parseFloat(v.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {v.approval_date ? new Date(v.approval_date).toLocaleDateString() : 'N/A'}
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

export default AccountsDashboard;
