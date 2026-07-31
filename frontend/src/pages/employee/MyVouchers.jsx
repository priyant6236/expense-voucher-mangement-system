import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { voucherService } from '../../services/voucher.service';
import StatusBadge from '../../components/StatusBadge';
import {
  FileText,
  Search,
  Filter,
  FileEdit,
  Trash2,
  Send,
  Eye,
  PlusCircle,
  X,
  AlertCircle,
  Calendar,
  DollarSign,
  Building
} from 'lucide-react';

const MyVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Voucher Modal State
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery
      };
      const res = await voucherService.getMyVouchers(filters);
      if (res.status === 'success') {
        setVouchers(res.data.vouchers);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [statusFilter, categoryFilter, searchQuery]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this draft voucher?')) return;

    try {
      await voucherService.deleteVoucher(id);
      fetchVouchers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete voucher');
    }
  };

  const handleSubmitDraft = async (id, e) => {
    e.stopPropagation();
    try {
      await voucherService.submitVoucher(id);
      fetchVouchers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit voucher');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Expense Vouchers
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track reimbursement status, edit drafts, and review rejection notes
          </p>
        </div>
        <Link
          to="/employee/create-voucher"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Voucher</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search voucher number or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-brand-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Statuses</option>
              <option value="Draft" className="bg-slate-900">Draft</option>
              <option value="Pending Approval" className="bg-slate-900">Pending Approval</option>
              <option value="Approved" className="bg-slate-900">Approved</option>
              <option value="Rejected" className="bg-slate-900">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
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

      {/* Vouchers Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading your vouchers...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-semibold">No vouchers matching your filter criteria.</p>
            <p className="text-slate-500 text-xs">Create a new voucher or adjust your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Voucher No</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Expense Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
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
                    <td className="py-3.5 px-4 font-medium text-slate-200">{v.expense_title}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">{v.expense_category}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">{v.expense_date}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      ${parseFloat(v.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVoucher(v);
                        }}
                        title="View Details"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {v.status === 'Draft' && (
                        <>
                          <Link
                            to={`/employee/edit-voucher/${v.id}`}
                            onClick={(e) => e.stopPropagation()}
                            title="Edit Draft"
                            className="inline-block p-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 transition-colors"
                          >
                            <FileEdit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={(e) => handleSubmitDraft(v.id, e)}
                            title="Submit for Approval"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => handleDelete(v.id, e)}
                            title="Delete Draft"
                            className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Voucher View Detail Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 border border-slate-800 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                  Voucher Details
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

            {/* Status & Rejection Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-medium text-slate-400">Current Lifecycle Status:</span>
              <StatusBadge status={selectedVoucher.status} />
            </div>

            {selectedVoucher.status === 'Rejected' && selectedVoucher.rejection_reason && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1 text-rose-300">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Director Rejection Remark:</span>
                </div>
                <p className="text-sm font-medium">{selectedVoucher.rejection_reason}</p>
              </div>
            )}

            {/* Main Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">Expense Title</span>
                <p className="font-semibold text-white">{selectedVoucher.expense_title}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">Expense Amount</span>
                <p className="font-extrabold text-brand-400 text-lg">
                  ${parseFloat(selectedVoucher.amount).toFixed(2)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">Department</span>
                <p className="text-slate-300 font-medium">{selectedVoucher.department}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">Category</span>
                <p className="text-slate-300 font-medium">{selectedVoucher.expense_category}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">Expense Date</span>
                <p className="text-slate-300 font-medium">{selectedVoucher.expense_date}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">Voucher Date</span>
                <p className="text-slate-300 font-medium">{selectedVoucher.voucher_date}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Business Description</span>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {selectedVoucher.expense_description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Signatures Row */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Employee Signature</span>
                <span className="text-xs text-emerald-400 font-bold">✓ Signed ({selectedVoucher.employee_name})</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold block uppercase">Director Signature</span>
                {selectedVoucher.status === 'Approved' ? (
                  <span className="text-xs text-emerald-400 font-bold">✓ Approved & Signed</span>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">Pending Approval</span>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedVoucher(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVouchers;
