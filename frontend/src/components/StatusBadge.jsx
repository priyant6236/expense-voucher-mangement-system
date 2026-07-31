import React from 'react';
import { Clock, CheckCircle2, XCircle, FileEdit } from 'lucide-react';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Draft':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
          <FileEdit className="w-3.5 h-3.5 text-slate-400" />
          <span>Draft</span>
        </span>
      );
    case 'Submitted':
    case 'Pending Approval':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold animate-pulse">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Pending Approval</span>
        </span>
      );
    case 'Approved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Approved</span>
        </span>
      );
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Rejected</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
          {status}
        </span>
      );
  }
};

export default StatusBadge;
