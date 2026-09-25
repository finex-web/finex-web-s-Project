import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant, className = '' }) => {
  const getStyle = () => {
    const s = status.toUpperCase();
    if (variant) {
      switch (variant) {
        case 'success':
          return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
        case 'warning':
          return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
        case 'danger':
          return 'text-rose-400 bg-rose-950/40 border-rose-800/40';
        case 'info':
          return 'text-sky-400 bg-sky-950/40 border-sky-800/40';
        default:
          return 'text-zinc-300 bg-zinc-800/60 border-zinc-700/50';
      }
    }

    // Auto-detect based on status semantics
    if (
      s === 'ACTIVE' ||
      s === 'COMPLETED' ||
      s === 'PAID' ||
      s === 'ACCEPTED' ||
      s === 'CONVERTED' ||
      s === 'CONNECTED'
    ) {
      return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
    }
    if (
      s === 'OVERDUE' ||
      s === 'NOT INTERESTED' ||
      s === 'CANCELLED' ||
      s === 'REJECTED' ||
      s === 'EXPIRED' ||
      s === 'URGENT'
    ) {
      return 'text-rose-400 bg-rose-950/40 border-rose-800/40';
    }
    if (
      s === 'PAYMENT DUE' ||
      s === 'PARTIALLY PAID' ||
      s === 'PARTIAL' ||
      s === 'CALL BACK' ||
      s === 'EXPIRING SOON' ||
      s === 'HIGH' ||
      s === 'BUSY'
    ) {
      return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
    }
    if (
      s === 'DEVELOPMENT' ||
      s === 'IN PROGRESS' ||
      s === 'INTERESTED' ||
      s === 'CLIENT REVIEW' ||
      s === 'SENT'
    ) {
      return 'text-sky-400 bg-sky-950/40 border-sky-800/40';
    }
    return 'text-zinc-400 bg-zinc-900 border-zinc-800';
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded ${getStyle()} ${className}`}
    >
      {status}
    </span>
  );
};
