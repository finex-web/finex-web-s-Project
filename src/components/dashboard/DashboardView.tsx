import React from 'react';
import { db } from '../../lib/db';
import { StatusBadge } from '../common/Badge';
import {
  UserCheck,
  Users,
  Briefcase,
  CheckSquare,
  Banknote,
  CreditCard,
  Wrench,
  Receipt,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  ExternalLink,
  Plus,
  PhoneCall,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenAddModal: (type: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddModal,
}) => {
  const stats = db.getDashboardStats();
  const clients = db.getClients();
  const projects = db.getProjects();
  const maintenance = db.getMaintenance();
  const salaryRecords = db.getSalaryRecords();
  const recentActivities = db.getActivityLogs().slice(0, 6);
  const followups = db.getFollowups();

  const todayStr = new Date().toISOString().split('T')[0];

  // Maintenance alerts
  const dueTodayMaintenance = maintenance.filter(
    (m) => m.next_due_date === todayStr && m.status === 'ACTIVE'
  );
  const overdueMaintenance = maintenance.filter(
    (m) => m.next_due_date < todayStr && m.status === 'ACTIVE'
  );

  // Salary alert categories
  const overdueSalaries = salaryRecords.filter((s) => s.payment_status === 'OVERDUE');
  const partialSalaries = salaryRecords.filter((s) => s.payment_status === 'PARTIALLY PAID');
  const pendingSalaries = salaryRecords.filter((s) => s.payment_status === 'PENDING');
  const paidSalaries = salaryRecords.filter((s) => s.payment_status === 'PAID');

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Top Banner: Agency Status & Quick Workflow Actions */}
      <div className="bg-[#131417] border border-white/[0.08] rounded-lg p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              FINEX WEB OPERATING SYSTEM · LIVE
            </span>
          </div>
          <h2 className="mt-1 text-lg sm:text-xl font-bold text-white tracking-tight">
            Agency Performance & Operations Command
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time PostgreSQL telemetry across clients, pipeline, engineering, and cash flow.
          </p>
        </div>

        {/* Quick Workflow Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAddModal('lead')}
            className="px-3 py-1.5 text-xs font-semibold bg-[#E52D27] hover:bg-[#c92520] text-white rounded flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAddModal('call')}
            className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-1.5 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#E52D27]" />
            <span>Log Call</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAddModal('quote')}
            className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#E52D27]" />
            <span>Create Quote</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAddModal('payment')}
            className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-1.5 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Payment</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAddModal('expense')}
            className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-1.5 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-rose-400" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* 17 Mandatory Dashboard Cards (Section 5) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Database Metrics Matrix (Live Records)
          </h3>
          <span className="text-[11px] font-mono text-zinc-400">17 Indicators Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* 1. Total Leads */}
          <div
            onClick={() => onNavigate('leads')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Total Leads</span>
              <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
              {stats.totalLeads}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Pipeline total</div>
          </div>

          {/* 2. New Leads */}
          <div
            onClick={() => onNavigate('leads')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">New Leads</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E52D27]" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-amber-400 tabular-nums">
              {stats.newLeads}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Needs first call</div>
          </div>

          {/* 3. Interested Leads */}
          <div
            onClick={() => onNavigate('leads')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Interested Leads</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {stats.interestedLeads}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Ready for quotation</div>
          </div>

          {/* 4. Total Clients */}
          <div
            onClick={() => onNavigate('clients')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Total Clients</span>
              <Users className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
              {stats.totalClients}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Permanent accounts</div>
          </div>

          {/* 5. Active Projects */}
          <div
            onClick={() => onNavigate('projects')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Active Projects</span>
              <Briefcase className="w-3.5 h-3.5 text-[#E52D27]" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
              {stats.activeProjects}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">In production</div>
          </div>

          {/* 6. Completed Projects */}
          <div
            onClick={() => onNavigate('projects')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Completed Projects</span>
              <span className="text-emerald-400 text-xs">✓</span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {stats.completedProjects}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Delivered & live</div>
          </div>

          {/* 7. Projects in Development */}
          <div
            onClick={() => onNavigate('projects')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">In Development</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-sky-400 tabular-nums">
              {stats.projectsInDevelopment}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Coding sprint active</div>
          </div>

          {/* 8. Pending Client Payments */}
          <div
            onClick={() => onNavigate('payments')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Pending Payments</span>
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-2 text-lg font-bold font-mono text-amber-400 tabular-nums">
              {formatINR(stats.pendingClientPayments)}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Due from clients</div>
          </div>

          {/* 9. Overdue Payments */}
          <div
            onClick={() => onNavigate('payments')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Overdue Payments</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="mt-2 text-lg font-bold font-mono text-rose-400 tabular-nums">
              {formatINR(stats.overduePayments)}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Follow-up needed</div>
          </div>

          {/* 10. Monthly Maintenance Revenue */}
          <div
            onClick={() => onNavigate('maintenance')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Monthly Maint. Rev</span>
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="mt-2 text-lg font-bold font-mono text-emerald-400 tabular-nums">
              {formatINR(stats.monthlyMaintenanceRevenue)}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Recurring ARR base</div>
          </div>

          {/* 11. Maintenance Due */}
          <div
            onClick={() => onNavigate('maintenance')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Maintenance Due</span>
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
              {stats.maintenanceDueCount}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Due today or prior</div>
          </div>

          {/* 12. Team Members */}
          <div
            onClick={() => onNavigate('team')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Team Members</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
              {stats.teamMembersCount}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Active personnel</div>
          </div>

          {/* 13. Tasks Pending */}
          <div
            onClick={() => onNavigate('tasks')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Tasks Pending</span>
              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-amber-400 tabular-nums">
              {stats.tasksPending}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Open deliverables</div>
          </div>

          {/* 14. Tasks Completed */}
          <div
            onClick={() => onNavigate('tasks')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Tasks Completed</span>
              <span className="text-emerald-400 text-xs">✓</span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {stats.tasksCompleted}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Closed tickets</div>
          </div>

          {/* 15. Salary Pending */}
          <div
            onClick={() => onNavigate('salaries')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Salary Pending</span>
              <Banknote className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="mt-2 text-lg font-bold font-mono text-rose-400 tabular-nums">
              {formatINR(stats.salaryPending)}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Payroll obligation</div>
          </div>

          {/* 16. Monthly Expenses */}
          <div
            onClick={() => onNavigate('expenses')}
            className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-medium">Monthly Expenses</span>
              <Receipt className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="mt-2 text-lg font-bold font-mono text-zinc-200 tabular-nums">
              {formatINR(stats.monthlyExpenses)}
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">Current month op-ex</div>
          </div>

          {/* 17. Net Business Amount */}
          <div
            onClick={() => onNavigate('reports')}
            className="col-span-2 sm:col-span-3 lg:col-span-4 xl:col-span-2 bg-gradient-to-br from-[#1b1c20] to-[#121316] border border-[#E52D27]/30 p-3.5 rounded-lg cursor-pointer"
          >
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-xs font-semibold">Net Business Amount</span>
              <TrendingUp className="w-4 h-4 text-[#E52D27]" />
            </div>
            <div className="mt-1.5 text-2xl font-black font-mono text-white tabular-nums tracking-tight">
              {formatINR(stats.netBusinessAmount)}
            </div>
            <div className="mt-1 text-[10px] text-zinc-400">
              Cash received + Maint. - (Payroll paid + All OpEx)
            </div>
          </div>
        </div>
      </div>

      {/* Salary & Maintenance Real Alert Strips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Salary Status Alerts (Section 23) */}
        <div className="bg-[#121316] border border-white/[0.08] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#E52D27]" />
              <h3 className="text-xs font-semibold text-white">Salary Status & Payroll Alerts</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('salaries')}
              className="text-xs text-[#E52D27] hover:underline"
            >
              Manage Salaries →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded">
              <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Overdue
              </div>
              <div className="mt-1 text-base font-mono font-bold text-rose-300">
                {overdueSalaries.length}
              </div>
            </div>

            <div className="p-2.5 bg-amber-950/20 border border-amber-900/40 rounded">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
              </div>
              <div className="mt-1 text-base font-mono font-bold text-amber-300">
                {pendingSalaries.length}
              </div>
            </div>

            <div className="p-2.5 bg-yellow-950/20 border border-yellow-900/40 rounded">
              <div className="flex items-center gap-1.5 text-[11px] text-yellow-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-yellow-500" /> Partial
              </div>
              <div className="mt-1 text-base font-mono font-bold text-yellow-300">
                {partialSalaries.length}
              </div>
            </div>

            <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 rounded">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Paid
              </div>
              <div className="mt-1 text-base font-mono font-bold text-emerald-300">
                {paidSalaries.length}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {salaryRecords
              .filter((s) => s.amount_pending > 0)
              .slice(0, 3)
              .map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 bg-zinc-900/80 border border-white/[0.04] rounded flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{s.employee_name}</span>
                    <span className="text-zinc-500 ml-1.5">
                      {s.month} {s.year} · Final: {formatINR(s.final_salary)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-rose-400 font-semibold">
                      Pending: {formatINR(s.amount_pending)}
                    </span>
                    <StatusBadge status={s.payment_status} />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Maintenance Alerts (Section 29) */}
        <div className="bg-[#121316] border border-white/[0.08] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#E52D27]" />
              <h3 className="text-xs font-semibold text-white">Maintenance Billing Alerts</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('maintenance')}
              className="text-xs text-[#E52D27] hover:underline"
            >
              View Billing Cycles →
            </button>
          </div>

          <div className="space-y-2.5">
            {dueTodayMaintenance.length === 0 && overdueMaintenance.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                All maintenance subscriptions are up to date.
              </div>
            ) : (
              <>
                {overdueMaintenance.map((m) => {
                  const days = Math.floor(
                    (new Date().getTime() - new Date(m.next_due_date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={m.id}
                      className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{m.project_name}</div>
                        <div className="text-[11px] text-zinc-400">
                          {m.client_name} · {formatINR(m.monthly_fee)}/mo
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono text-rose-400 font-bold block">
                          OVERDUE ({days} days)
                        </span>
                        <span className="text-[10px] text-zinc-500">Due: {m.next_due_date}</span>
                      </div>
                    </div>
                  );
                })}

                {dueTodayMaintenance.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 bg-amber-950/20 border border-amber-900/40 rounded flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{m.project_name}</div>
                      <div className="text-[11px] text-zinc-400">
                        {m.client_name} · {formatINR(m.monthly_fee)}/mo
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-amber-400 font-bold block">
                        DUE TODAY
                      </span>
                      <span className="text-[10px] text-zinc-500">Cycle renewals</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active Projects & Recent Activity Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Tracker */}
        <div className="lg:col-span-2 bg-[#121316] border border-white/[0.08] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-white">Active Development Projects</h3>
            <button
              type="button"
              onClick={() => onNavigate('projects')}
              className="text-xs text-[#E52D27] hover:underline"
            >
              Kanban Board →
            </button>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigate('projects', p.id)}
                className="p-3 bg-zinc-900/70 hover:bg-zinc-900 border border-white/[0.04] rounded-md cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-sky-400">{p.project_code}</span>
                    <span className="font-semibold text-white">{p.business_name}</span>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-[#E52D27] h-full rounded-full transition-all duration-300"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 font-mono">
                  <span>Plan: {p.plan}</span>
                  <span>Deadline: {p.deadline}</span>
                  <span>{p.progress}% completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Trail */}
        <div className="bg-[#121316] border border-white/[0.08] rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-white">Recent Audit Trail</h3>
            <button
              type="button"
              onClick={() => onNavigate('activity')}
              className="text-xs text-zinc-400 hover:text-white"
            >
              All Logs →
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-80 custom-scrollbar pr-1">
            {recentActivities.map((act) => (
              <div key={act.id} className="text-xs border-b border-white/[0.04] pb-2 last:border-0">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>{act.action}</span>
                  <span>{act.time}</span>
                </div>
                <div className="font-medium text-zinc-200 mt-0.5">{act.related_record}</div>
                <p className="text-zinc-400 text-[11px] mt-0.5 line-clamp-2">{act.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
