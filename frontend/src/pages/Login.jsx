import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login({ email, password });
      
      // Redirect based on user role
      if (loggedInUser.role === 'Employee') navigate('/employee/dashboard');
      else if (loggedInUser.role === 'Director') navigate('/director/dashboard');
      else if (loggedInUser.role === 'Accounts') navigate('/accounts/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Login fill helper
  const fillDemoUser = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Header Header Brand Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 shadow-lg shadow-brand-500/20 text-white mb-2">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Expense Voucher Management
          </h2>
          <p className="text-slate-400 text-sm">
            Sign in to access your reimbursement portal
          </p>
        </div>

        {/* 1-Click Demo Login Accounts Selector */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>⚡ Quick Demo Logins (1-Click Fill)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoUser('employee@company.com', 'Password@123')}
              className="px-2 py-2 rounded-xl bg-slate-800/80 hover:bg-brand-600/20 hover:border-brand-500/50 border border-slate-700/50 text-slate-200 text-xs font-medium transition-all flex flex-col items-center gap-1 group"
            >
              <UserCheck className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
              <span>Employee</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoUser('director@company.com', 'Password@123')}
              className="px-2 py-2 rounded-xl bg-slate-800/80 hover:bg-amber-600/20 hover:border-amber-500/50 border border-slate-700/50 text-slate-200 text-xs font-medium transition-all flex flex-col items-center gap-1 group"
            >
              <UserCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Director</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoUser('accounts@company.com', 'Password@123')}
              className="px-2 py-2 rounded-xl bg-slate-800/80 hover:bg-emerald-600/20 hover:border-emerald-500/50 border border-slate-700/50 text-slate-200 text-xs font-medium transition-all flex flex-col items-center gap-1 group"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Accounts</span>
            </button>
          </div>
        </div>

        {/* Main Login Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Work Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="text-center pt-2 border-t border-slate-800/60">
            <p className="text-xs text-slate-400">
              Need an employee account?{' '}
              <Link to="/register" className="text-brand-400 font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
