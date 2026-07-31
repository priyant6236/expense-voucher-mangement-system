import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { voucherService } from '../../services/voucher.service';
import { useAuth } from '../../context/AuthContext';
import { FilePlus, Save, Send, ArrowLeft, AlertCircle, CheckCircle2, FileSignature } from 'lucide-react';

const VoucherForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;

  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    expense_title: '',
    expense_category: 'IT Infrastructure',
    expense_date: new Date().toISOString().split('T')[0],
    voucher_date: new Date().toISOString().split('T')[0],
    amount: '',
    expense_description: '',
    employee_signature_path: user?.signature_path || '/uploads/demo-signature.png'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      const fetchVoucher = async () => {
        try {
          const res = await voucherService.getVoucherById(id);
          if (res.status === 'success') {
            const v = res.data.voucher;
            if (v.status !== 'Draft') {
              setError('Only Draft vouchers can be edited.');
            }
            setFormData({
              expense_title: v.expense_title || '',
              expense_category: v.expense_category || 'IT Infrastructure',
              expense_date: v.expense_date || '',
              voucher_date: v.voucher_date || '',
              amount: v.amount || '',
              expense_description: v.expense_description || '',
              employee_signature_path: v.employee_signature_path || user?.signature_path || '/uploads/demo-signature.png'
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load voucher for editing.');
        } finally {
          setFetching(false);
        }
      };
      fetchVoucher();
    }
  }, [id, isEditMode, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, submitStatus) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.expense_title.trim()) {
      setError('Expense Title is required.');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (submitStatus === 'Submitted' && !formData.employee_signature_path) {
      setError('Employee signature is required before submitting for approval.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        status: submitStatus === 'Submitted' ? 'Pending Approval' : 'Draft'
      };

      let res;
      if (isEditMode) {
        res = await voucherService.updateVoucher(id, payload);
        if (submitStatus === 'Submitted') {
          await voucherService.submitVoucher(id, formData.employee_signature_path);
        }
      } else {
        res = await voucherService.createVoucher(payload);
      }

      setSuccess(submitStatus === 'Submitted' ? 'Voucher submitted successfully!' : 'Draft saved successfully!');
      setTimeout(() => {
        navigate('/employee/my-vouchers');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center text-slate-400">
        Loading voucher details...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vouchers</span>
        </button>
        <span className="text-xs text-slate-500 font-medium">Department: {user?.department}</span>
      </div>

      {/* Main Form Panel */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
            <FilePlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {isEditMode ? 'Edit Draft Voucher' : 'Create New Expense Voucher'}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Fill in expense details and attach your signature
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form className="space-y-6">
          {/* Title & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Expense Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="expense_title"
                required
                value={formData.expense_title}
                onChange={handleChange}
                placeholder="e.g. AWS Cloud Hosting Bill"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Expense Category <span className="text-rose-400">*</span>
              </label>
              <select
                name="expense_category"
                value={formData.expense_category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="IT Infrastructure">IT Infrastructure</option>
                <option value="Meals & Entertainment">Meals & Entertainment</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Travel & Transport">Travel & Transport</option>
                <option value="Software Subscriptions">Software Subscriptions</option>
                <option value="Training & Courses">Training & Courses</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
          </div>

          {/* Date & Amount Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Expense Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="expense_date"
                required
                value={formData.expense_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Amount ($ USD) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                required
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Expense Description & Business Justification
            </label>
            <textarea
              name="expense_description"
              rows="3"
              value={formData.expense_description}
              onChange={handleChange}
              placeholder="Provide context regarding business justification..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
            ></textarea>
          </div>

          {/* Digital Signature Preview */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-brand-400" />
                <span>Employee Signature Status</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">Signature Attached</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Digital signature of employee <strong>{user?.full_name} ({user?.employee_id})</strong> will be stamped upon voucher submission.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, 'Draft')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, 'Submitted')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Submit Voucher</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoucherForm;
