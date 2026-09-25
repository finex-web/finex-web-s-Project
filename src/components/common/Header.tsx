import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { getSupabaseCredentials } from '../../lib/supabase';
import {
  Search,
  Bell,
  Database,
  LogOut,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Menu,
  Github,
} from 'lucide-react';
import { db } from '../../lib/db';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onNavigateToSettings?: () => void;
  onOpenGitHub?: () => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSearch,
  onOpenNotifications,
  onNavigateToSettings,
  onOpenGitHub,
  activeView,
}) => {
  const { user, logout } = useAuth();
  const { isConfigured } = getSupabaseCredentials();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = db.getNotifications();
  const unreadCount = notifications.length;

  const viewTitles: Record<string, string> = {
    dashboard: 'Agency Dashboard',
    leads: 'Lead Pipeline',
    calls: 'Call Logs & Connects',
    requirements: 'Requirement Specifications',
    quotes: 'Quotations & Plans',
    clients: 'Client Roster',
    projects: 'Project Management',
    kanban: 'Project Workflow Kanban',
    tasks: 'Task Allocations',
    team: 'Team Directory & Workload',
    salaries: 'Salary Ledger & Payouts',
    payments: 'Client Payments & Revenue',
    maintenance: 'Recurring Maintenance & Billing',
    followups: 'Scheduled Follow-ups',
    expenses: 'Operating Expenses',
    reports: 'Business & Performance Reports',
    activity: 'Audit & Activity Trail',
    settings: 'Agency & Database Configuration',
  };

  const title = viewTitles[activeView] || 'FINEX WEB OS';

  return (
    <header className="h-14 bg-[#111214] border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Breadcrumb & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden text-zinc-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 truncate">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider hidden sm:inline">
            FINEX ADMIN
          </span>
          <span className="text-zinc-600 hidden sm:inline">/</span>
          <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Zone 2: Global Search Quick Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-[#18191c] border border-white/[0.08] hover:border-white/20 rounded-md text-zinc-400 hover:text-zinc-200 transition-all text-xs"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span>Search clients, leads, projects, team, domains...</span>
          </div>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions, Notifications, Database indicator, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="md:hidden text-zinc-400 hover:text-white p-1.5 rounded hover:bg-white/5"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Database Status Indicator */}
        <button
          type="button"
          onClick={onNavigateToSettings}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors ${
            isConfigured
              ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-800/40 text-emerald-400'
              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400'
          }`}
          title={isConfigured ? 'Supabase Live Connection Active (Click to manage database)' : 'Operating in Secure Local DB Mode (Click to configure Supabase)'}
        >
          <Database className="w-3 h-3" />
          <span className="hidden sm:inline font-mono text-[11px]">
            {isConfigured ? 'SUPABASE' : 'LOCAL DB'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'
            }`}
          />
        </button>

        {/* GitHub Publish / Push Changes Button */}
        <button
          type="button"
          onClick={onOpenGitHub}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          title="Push Code & Changes to GitHub"
        >
          <Github className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-mono text-[11px]">PUSH GITHUB</span>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative text-zinc-400 hover:text-white p-1.5 rounded hover:bg-white/5 transition-colors"
          title="Notifications & Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#E52D27] text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 rounded bg-[#E52D27] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
              FW
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium text-zinc-200 leading-tight">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono leading-none">
                {user?.email || 'finexxweb@gmail.com'}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-[#16171a] border border-white/10 rounded-md shadow-2xl py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-white/[0.08]">
                  <p className="font-semibold text-white">{user?.name || 'FINEX Admin'}</p>
                  <p className="text-zinc-400 font-mono text-[11px] truncate">
                    {user?.email || 'finexxweb@gmail.com'}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-[#E52D27] font-semibold tracking-wider">
                    <Shield className="w-3 h-3" /> PRIVATE ADMIN
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-3 py-1.5 text-zinc-400 text-[11px]">
                    Status: <span className="text-emerald-400 font-medium">Session Active</span>
                  </div>
                </div>

                <div className="border-t border-white/[0.08] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
