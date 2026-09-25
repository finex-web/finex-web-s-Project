import React from 'react';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  UserCheck,
  PhoneCall,
  FileCode,
  FileSpreadsheet,
  Users,
  Briefcase,
  KanbanSquare,
  CheckSquare,
  UserCog,
  Banknote,
  CreditCard,
  Wrench,
  CalendarClock,
  Receipt,
  BarChart3,
  History,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react';
import { db } from '../../lib/db';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpen,
  onClose,
}) => {
  const stats = db.getDashboardStats();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: UserCheck, count: stats.newLeads > 0 ? stats.newLeads : undefined },
    { id: 'calls', label: 'Calls', icon: PhoneCall },
    { id: 'requirements', label: 'Requirements', icon: FileCode },
    { id: 'quotes', label: 'Quotes', icon: FileSpreadsheet },
    { id: 'clients', label: 'Clients', icon: Users, count: stats.totalClients },
    { id: 'projects', label: 'Projects', icon: Briefcase, count: stats.activeProjects },
    { id: 'kanban', label: 'Kanban', icon: KanbanSquare },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: stats.tasksPending > 0 ? stats.tasksPending : undefined },
    { id: 'team', label: 'Team', icon: UserCog },
    { id: 'salaries', label: 'Salaries', icon: Banknote },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, count: stats.maintenanceDueCount > 0 ? stats.maintenanceDueCount : undefined },
    { id: 'followups', label: 'Follow-ups', icon: CalendarClock },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'activity', label: 'Activity Log', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0e0f11] border-r border-white/[0.08] z-50 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-white/[0.08]">
          <Logo size="sm" showTagline={true} />
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            Workspace Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E52D27] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-black/30 text-white font-semibold'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Private system badge in footer */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0c0d0e]">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-mono">FINEX WEB OS</span>
            <span className="text-[#E52D27] font-semibold">v2.4 PRIVATE</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1 truncate">
            finexxweb@gmail.com
          </div>
        </div>
      </aside>
    </>
  );
};
