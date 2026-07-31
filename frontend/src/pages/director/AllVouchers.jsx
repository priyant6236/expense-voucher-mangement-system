import React, { useState, useEffect } from 'react';
import { directorService } from '../../services/director.service';
import StatusBadge from '../../components/StatusBadge';
import { FileText, Search, Filter, Eye, X, Building, DollarSign } from 'lucide-react';

const AllVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const filters = {
        status: statusFilter,
        department: departmentFilter,
        category: categoryFilter,
        search: searchQuery
      };
      const res = await directorService.getAllVouchers(filters);
      if (res.status === 'success') {
        setVouchers(res.data.vouchers);
      }
    } catch (error) {
      console.error('Error fetching all vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [statusFilter, departmentFilter, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Organization Vouchers Registry
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Complete read-only repository of all organization expense claims across all statuses
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
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
            <Building className="w-3.5 h-3.5 text-brand-400" />
            <span>Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Depts</option>
              <option value="Engineering" className="bg-slate-900">Engineering</option>
              <option value="Marketing" className="bg-slate-900">Marketing</option>
              <option value="Sales" className="bg-slate-900">Sales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading vouchers registry...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-semibold">No vouchers matching criteria.</p>
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
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">View</th>
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
                    <td className="py-3.5 px-4 font-medium text-slate-200">{v.employee_name}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">{v.department}</td>
                    <td className="py-3.5 px-4 text-slate-300">{v.expense_title}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      ${parseFloat(v.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVoucher(v);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Read-Only Voucher Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 border border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                  Voucher Overview
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

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-medium text-slate-400">Current Status:</span>
              <StatusBadge status={selectedVoucher.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 font-medium">Employee Name</span>
                <p className="font-bold text-white">{selectedVoucher.employee_name}</p>
                <p className="text-xs text-slate-400">{selectedVoucher.employee_id} ({selectedVoucher.department})</p>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium">Claim Amount</span>
                <p className="font-black text-brand-400 text-xl">${parseFloat(selectedVoucher.amount).toFixed(2)}</p>
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

            <div className="space-y-1 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-500 font-medium">Business Description</span>
              <p className="text-slate-300 text-sm bg-slate-900 p-3 rounded-xl border border-slate-800">
                {selectedVoucher.expense_description || 'No description provided.'}
              </p>
            </div>

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

export default AllVouchers;
