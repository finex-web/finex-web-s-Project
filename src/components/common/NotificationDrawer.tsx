import React from 'react';
import { db } from '../../lib/db';
import {
  X,
  CreditCard,
  Wrench,
  Server,
  Globe,
  Banknote,
  CheckSquare,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const notifications = db.getNotifications();

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-rose-400" />;
      case 'MAINTENANCE':
        return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'HOSTING':
        return <Server className="w-4 h-4 text-sky-400" />;
      case 'DOMAIN':
        return <Globe className="w-4 h-4 text-indigo-400" />;
      case 'SALARY':
        return <Banknote className="w-4 h-4 text-emerald-400" />;
      case 'TASK':
        return <CheckSquare className="w-4 h-4 text-orange-400" />;
      case 'FOLLOWUP':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121316] border-l border-white/[0.08] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Agency Notifications & Alerts</h2>
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[#E52D27]/20 text-[#E52D27] border border-[#E52D27]/30 rounded">
                {notifications.length} Active
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-xs">
                No outstanding alerts or overdue items found.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded border text-xs transition-colors ${
                    notif.urgency === 'HIGH'
                      ? 'bg-rose-950/20 border-rose-900/40 text-zinc-200'
                      : 'bg-zinc-900/80 border-white/[0.06] text-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getIcon(notif.type)}
                      <span className="font-semibold text-white">{notif.title}</span>
                    </div>
                    {notif.urgency === 'HIGH' && (
                      <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                        URGENT
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 text-zinc-300 leading-relaxed">{notif.message}</p>

                  {notif.link && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(notif.link!);
                        onClose();
                      }}
                      className="mt-2 text-[#E52D27] hover:text-[#ff4f49] inline-flex items-center gap-1 font-medium text-[11px] group"
                    >
                      <span>Take Action in {notif.link.toUpperCase()}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/[0.08] bg-[#0c0d0e] text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Real-time database triggers</span>
            <span className="font-mono">Auto-generated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
