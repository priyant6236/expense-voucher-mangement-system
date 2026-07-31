import React, { useState, useEffect } from 'react';
import { directorService } from '../../services/director.service';
import StatusBadge from '../../components/StatusBadge';
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  FileSignature,
  X,
  AlertCircle,
  Check,
  Building
} from 'lucide-react';

const PendingApprovals = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    try {
      const filters = {
        department: departmentFilter,
        category: categoryFilter,
        search: searchQuery
      };
      const res = await directorService.getPendingVouchers(filters);
      if (res.status === 'success') {
        setVouchers(res.data.vouchers);
      }
    } catch (error) {
      console.error('Error loading pending vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [departmentFilter, categoryFilter, searchQuery]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    setModalError('');
    try {
      await directorService.approveVoucher(id);
      setSelectedVoucher(null);
      fetchPending();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to approve voucher');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setModalError('Rejection reason is mandatory.');
      return;
    }

    setActionLoading(true);
    setModalError('');
    try {
      await directorService.rejectVoucher(selectedVoucher.id, rejectionReason);
      setSelectedVoucher(null);
      setRejectModalOpen(false);
      setRejectionReason('');
      fetchPending();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to reject voucher');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Pending Approvals Desk
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review employee expense claims, inspect digital signatures, and approve or reject
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search voucher, title, or employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Departments</option>
              <option value="Engineering" className="bg-slate-900">Engineering</option>
              <option value="Marketing" className="bg-slate-900">Marketing</option>
              <option value="Sales" className="bg-slate-900">Sales</option>
              <option value="Executive Management" className="bg-slate-900">Executive Management</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Categories</option>
              <option value="IT Infrastructure" className="bg-slate-900">IT Infrastructure</option>
              <option value="Meals & Entertainment" className="bg-slate-900">Meals & Entertainment</option>
              <option value="Office Supplies" className="bg-slate-900">Office Supplies</option>
              <option value="Travel & Transport" className="bg-slate-900">Travel & Transport</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading pending vouchers...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-slate-300 font-semibold">No pending vouchers awaiting approval.</p>
            <p className="text-slate-500 text-xs">Great job! All submitted expense claims have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Voucher No</th>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Dept</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Expense Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vouchers.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVoucher(v)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-white">{v.voucher_number}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{v.employee_name}</div>
                      <div className="text-[11px] text-slate-400">{v.employee_id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">{v.department}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">{v.expense_title}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">{v.expense_date}</td>
                    <td className="py-3.5 px-4 font-black text-amber-400 text-base">
                      ${parseFloat(v.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVoucher(v);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Approve Modal */}
      {selectedVoucher && !rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 border border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Pending Voucher Review
                </span>
                <h2 className="text-xl font-black text-white">{selectedVoucher.voucher_number}</h2>
              </div>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Voucher Details Table Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 font-medium">Employee Name</span>
                <p className="font-bold text-white">{selectedVoucher.employee_name}</p>
                <p className="text-xs text-slate-400">{selectedVoucher.employee_id} ({selectedVoucher.department})</p>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium">Claim Amount</span>
                <p className="font-black text-amber-400 text-xl">${parseFloat(selectedVoucher.amount).toFixed(2)}</p>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium">Expense Title</span>
                <p className="font-semibold text-slate-200">{selectedVoucher.expense_title}</p>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium">Category</span>
                <p className="text-slate-300 font-medium">{selectedVoucher.expense_category}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Business Description</span>
              <p className="text-slate-300 text-sm bg-slate-900 p-3 rounded-xl border border-slate-800">
                {selectedVoucher.expense_description || 'No description provided.'}
              </p>
            </div>

            {/* Signature Validation */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <FileSignature className="w-4 h-4 text-amber-400" />
                  <span>Employee Signature Verified</span>
                </span>
                <span className="text-emerald-400 font-bold">✓ Signed by {selectedVoucher.employee_name}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Approving this voucher will attach your digital Director approval signature and update state to <strong>Approved</strong>.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRejectModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Voucher</span>
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleApprove(selectedVoucher.id)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Remarks Modal */}
      {rejectModalOpen && selectedVoucher && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-6 border border-rose-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>Reject Voucher {selectedVoucher.voucher_number}</span>
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Rejection Remarks <span className="text-rose-400">* (Mandatory)</span>
                </label>
                <textarea
                  required
                  rows="4"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Specify why this voucher is being rejected (e.g. Missing receipt, invalid amount, missing itemization)..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/25 disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
