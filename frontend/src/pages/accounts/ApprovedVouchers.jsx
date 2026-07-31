import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { accountsService } from '../../services/accounts.service';
import StatusBadge from '../../components/StatusBadge';
import {
  FileCheck, Search, Filter, Eye, X, Printer,
  Building, Calendar, CheckCircle2, FileSignature, DollarSign
} from 'lucide-react';

const ApprovedVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchApproved = async () => {
    setLoading(true);
    try {
      const res = await accountsService.getApprovedVouchers({
        department: departmentFilter,
        category: categoryFilter,
        search: searchQuery,
        startDate,
        endDate
      });
      if (res.status === 'success') setVouchers(res.data.vouchers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApproved(); }, [departmentFilter, categoryFilter, searchQuery, startDate, endDate]);

  const totalAmount = vouchers.reduce((s, v) => s + parseFloat(v.amount || 0), 0);

  const handlePrint = () => {
    if (!selectedVoucher) return;
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>${selectedVoucher.voucher_number}</title>
    <style>body{font-family:Arial,sans-serif;margin:40px;color:#1a1a2e;}
    h1{color:#1a1a2e;border-bottom:3px solid #0c93e7;padding-bottom:10px;}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;}
    .label{font-size:11px;color:#666;font-weight:bold;text-transform:uppercase;}
    .value{font-size:14px;font-weight:600;margin-top:3px;}
    .amount{font-size:26px;font-weight:900;color:#059669;}
    .sig-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px;}
    .sig-box{border:2px solid #ddd;padding:16px;border-radius:8px;text-align:center;}
    .desc-box{background:#f8f9fa;border:1px solid #ddd;padding:12px;border-radius:6px;margin-top:8px;}
    .approved-badge{background:#d1fae5;color:#065f46;padding:4px 14px;border-radius:99px;font-size:12px;font-weight:bold;}
    </style></head><body>
    <h1>Expense Reimbursement Voucher</h1>
    <p style="font-size:12px;color:#888;">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; <span class="approved-badge">✓ APPROVED</span></p>
    <div class="grid">
      <div>
        <div class="label">Voucher Number</div><div class="value" style="font-size:20px;color:#0c93e7;">${selectedVoucher.voucher_number}</div>
        <br><div class="label">Employee Name</div><div class="value">${selectedVoucher.employee_name}</div>
        <br><div class="label">Employee ID</div><div class="value">${selectedVoucher.employee_id}</div>
        <br><div class="label">Department</div><div class="value">${selectedVoucher.department}</div>
      </div>
      <div>
        <div class="label">Claim Amount</div><div class="amount">$${parseFloat(selectedVoucher.amount).toFixed(2)}</div>
        <br><div class="label">Expense Title</div><div class="value">${selectedVoucher.expense_title}</div>
        <br><div class="label">Category</div><div class="value">${selectedVoucher.expense_category}</div>
        <br><div class="label">Expense Date</div><div class="value">${selectedVoucher.expense_date}</div>
      </div>
    </div>
    <div class="label">Business Description</div>
    <div class="desc-box">${selectedVoucher.expense_description || 'No description provided.'}</div>
    <div class="sig-row">
      <div class="sig-box">
        <div class="label">Employee Signature</div>
        <div style="height:60px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#22c55e;font-weight:bold;">✓ Digitally Signed by ${selectedVoucher.employee_name}</span>
        </div>
      </div>
      <div class="sig-box">
        <div class="label">Director Approval Signature</div>
        <div style="height:60px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#22c55e;font-weight:bold;">✓ Director Approved</span>
        </div>
        <div style="font-size:11px;color:#666;margin-top:6px;">
          Approval Date: ${selectedVoucher.approval_date ? new Date(selectedVoucher.approval_date).toLocaleDateString() : 'N/A'}
        </div>
      </div>
    </div>
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Approved Vouchers Registry</h1>
          <p className="text-slate-400 text-sm mt-1">Verified expense claims cleared for financial disbursement</p>
        </div>
        {!loading && vouchers.length > 0 && (
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-400">Total Disbursement</div>
            <div className="text-2xl font-black text-emerald-400">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input type="text" placeholder="Search voucher, employee, title..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500" />
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
          <Building className="w-3.5 h-3.5 text-emerald-400" />
          <span>Dept:</span>
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="bg-transparent text-white focus:outline-none cursor-pointer">
            <option value="All" className="bg-slate-900">All</option>
            <option value="Engineering" className="bg-slate-900">Engineering</option>
            <option value="Marketing" className="bg-slate-900">Marketing</option>
            <option value="Sales" className="bg-slate-900">Sales</option>
            <option value="Operations" className="bg-slate-900">Operations</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <span>Category:</span>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-transparent text-white focus:outline-none cursor-pointer">
            <option value="All" className="bg-slate-900">All</option>
            <option value="IT Infrastructure" className="bg-slate-900">IT Infrastructure</option>
            <option value="Meals & Entertainment" className="bg-slate-900">Meals</option>
            <option value="Office Supplies" className="bg-slate-900">Office Supplies</option>
            <option value="Travel & Transport" className="bg-slate-900">Travel</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-white focus:outline-none cursor-pointer text-xs" />
          </div>
          <span className="text-slate-500 text-xs">→</span>
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-white focus:outline-none cursor-pointer text-xs" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading approved vouchers...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-semibold">No approved vouchers matching criteria.</p>
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
                  <th className="py-3.5 px-4">Approved On</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vouchers.map((v) => (
                  <tr key={v.id} onClick={() => setSelectedVoucher(v)} className="hover:bg-slate-800/40 cursor-pointer transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{v.voucher_number}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{v.employee_name}</div>
                      <div className="text-[11px] text-slate-500">{v.employee_id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">{v.department}</td>
                    <td className="py-3.5 px-4 text-slate-300">{v.expense_title}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400 text-base">${parseFloat(v.amount).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">{v.approval_date ? new Date(v.approval_date).toLocaleDateString() : '—'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedVoucher(v); }} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-950/30 border-t-2 border-emerald-500/30">
                  <td colSpan="4" className="py-3 px-4 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Total Disbursement Due ({vouchers.length} vouchers)
                  </td>
                  <td className="py-3 px-4 font-black text-emerald-400 text-lg">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Approved Voucher</span>
                <h2 className="text-xl font-black text-white">{selectedVoucher.voucher_number}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  <Printer className="w-4 h-4" /><span>Print</span>
                </button>
                <button onClick={() => setSelectedVoucher(null)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm">Approved & Cleared for Reimbursement</span>
              <span className="ml-auto text-xs text-emerald-300/80">{selectedVoucher.approval_date ? new Date(selectedVoucher.approval_date).toLocaleDateString() : ''}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-xs text-slate-500">Employee</span>
                <p className="font-bold text-white">{selectedVoucher.employee_name}</p>
                <p className="text-xs text-slate-400">{selectedVoucher.employee_id} · {selectedVoucher.department}</p>
              </div>
              <div><span className="text-xs text-slate-500">Claim Amount</span>
                <p className="font-black text-emerald-400 text-2xl">${parseFloat(selectedVoucher.amount).toFixed(2)}</p>
              </div>
              <div><span className="text-xs text-slate-500">Expense Title</span>
                <p className="font-semibold text-slate-200">{selectedVoucher.expense_title}</p>
              </div>
              <div><span className="text-xs text-slate-500">Category</span>
                <p className="text-slate-300">{selectedVoucher.expense_category}</p>
              </div>
              <div><span className="text-xs text-slate-500">Expense Date</span>
                <p className="text-slate-300">{selectedVoucher.expense_date}</p>
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-500">Business Description</span>
              <p className="text-slate-300 text-sm bg-slate-900 p-3 rounded-xl border border-slate-800">
                {selectedVoucher.expense_description || 'No description provided.'}
              </p>
            </div>

            {/* Dual Signature */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-emerald-400" /> Digital Signature Verification
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-bold">Employee Signature</div>
                  <div className="text-xs text-emerald-400 font-bold">✓ Signed</div>
                  <div className="text-[11px] text-slate-500">{selectedVoucher.employee_name}</div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase font-bold">Director Approval</div>
                  <div className="text-xs text-emerald-400 font-bold">✓ Approved</div>
                  <div className="text-[11px] text-slate-500">{selectedVoucher.approval_date ? new Date(selectedVoucher.approval_date).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button onClick={handlePrint} className="flex-1 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-sm font-semibold flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" /><span>Print / Download Voucher</span>
              </button>
              <button onClick={() => setSelectedVoucher(null)} className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedVouchers;
