import React, { useState } from 'react';
import { db } from '../../lib/db';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  CheckSquare,
  FileSpreadsheet,
  Printer,
  Calendar,
  Percent,
} from 'lucide-react';
import { Logo } from '../common/Logo';

export const ReportsView: React.FC = () => {
  const stats = db.getDashboardStats();
  const leads = db.getLeads();
  const calls = db.getCalls();
  const quotes = db.getQuotes();
  const clients = db.getClients();
  const projects = db.getProjects();
  const tasks = db.getTasks();
  const team = db.getTeamMembers();
  const salaryRecords = db.getSalaryRecords();
  const expenses = db.getExpenses();
  const payments = db.getPayments();

  const [activeReportTab, setActiveReportTab] = useState<
    'financial' | 'clients' | 'projects' | 'team' | 'pipeline'
  >('financial');

  // Calculations
  const totalProjectRevenue = payments.reduce((acc, p) => acc + p.amount_received, 0);
  const totalMaintenanceRevenue = stats.monthlyMaintenanceRevenue;
  const grossRevenue = totalProjectRevenue + totalMaintenanceRevenue;

  const totalSalariesDisbursed = salaryRecords.reduce((acc, s) => acc + s.amount_paid, 0);
  const totalExpensesOutflow = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalOutflows = totalSalariesDisbursed + totalExpensesOutflow;

  const netOperatingProfit = grossRevenue - totalOutflows;
  const profitMargin = grossRevenue > 0 ? ((netOperatingProfit / grossRevenue) * 100).toFixed(1) : '0';

  // Pipeline metrics
  const totalLeadsCount = leads.length;
  const convertedLeadsCount = leads.filter((l) => l.status === 'CONVERTED').length;
  const leadConversionRate =
    totalLeadsCount > 0 ? ((convertedLeadsCount / totalLeadsCount) * 100).toFixed(1) : '0';

  const formatINR = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Metric', 'Value'],
        ['Gross Agency Revenue', grossRevenue],
        ['Project Inflow', totalProjectRevenue],
        ['Monthly Maintenance Inflow', totalMaintenanceRevenue],
        ['Salaries Disbursed', totalSalariesDisbursed],
        ['Operational Expenses', totalExpensesOutflow],
        ['Net Operating Profit', netOperatingProfit],
        ['Profit Margin %', profitMargin + '%'],
        ['Total Leads', totalLeadsCount],
        ['Converted Clients', convertedLeadsCount],
        ['Conversion Rate', leadConversionRate + '%'],
      ]
        .map((e) => e.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FINEX_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Financial & Performance Intelligence
          </h2>
          <p className="text-xs text-zinc-400">
            Real-time balance sheet, lead-to-client conversion funnels, developer velocities, and project margins.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.08] pb-1">
        <button
          type="button"
          onClick={() => setActiveReportTab('financial')}
          className={`px-3 py-1.5 rounded-t text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeReportTab === 'financial'
              ? 'bg-[#18191c] text-white border-b-2 border-[#E52D27]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-[#E52D27]" />
          <span>Financial Audit & Profit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('pipeline')}
          className={`px-3 py-1.5 rounded-t text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeReportTab === 'pipeline'
              ? 'bg-[#18191c] text-white border-b-2 border-[#E52D27]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pipeline & Conversion</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('projects')}
          className={`px-3 py-1.5 rounded-t text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeReportTab === 'projects'
              ? 'bg-[#18191c] text-white border-b-2 border-[#E52D27]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-sky-400" />
          <span>Projects & Delivery</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('team')}
          className={`px-3 py-1.5 rounded-t text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeReportTab === 'team'
              ? 'bg-[#18191c] text-white border-b-2 border-[#E52D27]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>Team Velocity</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: FINANCIAL AUDIT & PROFIT
         ========================================================= */}
      {activeReportTab === 'financial' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#121316] border border-emerald-900/40 rounded-lg">
              <span className="text-[11px] font-mono text-emerald-400 uppercase">Gross Inflows</span>
              <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
                {formatINR(grossRevenue)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Projects: {formatINR(totalProjectRevenue)} · MRR: {formatINR(totalMaintenanceRevenue)}
              </div>
            </div>

            <div className="p-4 bg-[#121316] border border-rose-900/40 rounded-lg">
              <span className="text-[11px] font-mono text-rose-400 uppercase">Total Outflows</span>
              <div className="mt-2 text-2xl font-bold font-mono text-rose-400 tabular-nums">
                -{formatINR(totalOutflows)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Salaries: {formatINR(totalSalariesDisbursed)} · Ops: {formatINR(totalExpensesOutflow)}
              </div>
            </div>

            <div className="p-4 bg-[#121316] border border-white/[0.08] rounded-lg">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">Net Operating Profit</span>
              <div
                className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
                  netOperatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatINR(netOperatingProfit)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Retained agency cash surplus</div>
            </div>

            <div className="p-4 bg-[#121316] border border-[#E52D27]/30 rounded-lg">
              <span className="text-[11px] font-mono text-[#E52D27] uppercase">Operating Margin</span>
              <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
                {profitMargin}%
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">Net profit after all costs</div>
            </div>
          </div>

          {/* Breakdown Ledger Table */}
          <div className="bg-[#121316] border border-white/[0.08] rounded-lg p-5">
            <h3 className="text-sm font-bold text-white mb-4">Official Operating Balance Breakdown</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-zinc-300">Client Project Invoices Realized</span>
                <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                  +{formatINR(totalProjectRevenue)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-zinc-300">Monthly Website Maintenance Subscriptions (MRR)</span>
                <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                  +{formatINR(totalMaintenanceRevenue)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-zinc-300">Staff & Engineering Payroll Disbursed</span>
                <span className="font-mono text-rose-400 font-semibold tabular-nums">
                  -{formatINR(totalSalariesDisbursed)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/[0.04]">
                <span className="text-zinc-300">Servers, SaaS Tools, Office & Agency Overhead</span>
                <span className="font-mono text-rose-400 font-semibold tabular-nums">
                  -{formatINR(totalExpensesOutflow)}
                </span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-white/10 text-base font-bold font-mono">
                <span className="text-white font-sans">Final Net Agency Profit:</span>
                <span className={netOperatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatINR(netOperatingProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: PIPELINE & CONVERSION
         ========================================================= */}
      {activeReportTab === 'pipeline' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 bg-[#121316] border border-white/[0.08] rounded-lg">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Total Leads</span>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums">
                {totalLeadsCount}
              </div>
            </div>
            <div className="p-3.5 bg-[#121316] border border-white/[0.08] rounded-lg">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Calls Logged</span>
              <div className="mt-1 text-xl font-bold font-mono text-sky-400 tabular-nums">
                {calls.length}
              </div>
            </div>
            <div className="p-3.5 bg-[#121316] border border-white/[0.08] rounded-lg">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Quotes Sent</span>
              <div className="mt-1 text-xl font-bold font-mono text-amber-400 tabular-nums">
                {quotes.length}
              </div>
            </div>
            <div className="p-3.5 bg-[#121316] border border-white/[0.08] rounded-lg">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Converted Clients</span>
              <div className="mt-1 text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {convertedLeadsCount}
              </div>
            </div>
            <div className="p-3.5 bg-[#121316] border border-[#E52D27]/40 rounded-lg">
              <span className="text-[10px] font-mono text-[#E52D27] uppercase">Conversion Rate</span>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums">
                {leadConversionRate}%
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#121316] border border-white/[0.08] rounded-lg">
            <h3 className="text-sm font-bold text-white mb-3">Agency Sales Funnel Velocity</h3>
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>1. Initial Lead Discovery (100%)</span>
                  <span className="font-mono text-white">{totalLeadsCount} Leads</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-400 w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>2. Client Discovery Calls Connected</span>
                  <span className="font-mono text-sky-400">
                    {calls.length} ({totalLeadsCount > 0 ? ((calls.length / totalLeadsCount) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500"
                    style={{
                      width: `${totalLeadsCount > 0 ? (calls.length / totalLeadsCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>3. Commercial Quotations Delivered</span>
                  <span className="font-mono text-amber-400">
                    {quotes.length} ({totalLeadsCount > 0 ? ((quotes.length / totalLeadsCount) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${totalLeadsCount > 0 ? (quotes.length / totalLeadsCount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>4. Paid & Converted Website Accounts</span>
                  <span className="font-mono text-emerald-400">{convertedLeadsCount} ({leadConversionRate}%)</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E52D27]"
                    style={{ width: `${leadConversionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: PROJECTS & DELIVERY
         ========================================================= */}
      {activeReportTab === 'projects' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#121316] border border-white/[0.08] rounded-lg">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">Active Projects</span>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums">
                {stats.activeProjects}
              </div>
            </div>
            <div className="p-3.5 bg-[#121316] border border-emerald-900/30 rounded-lg">
              <span className="text-[11px] font-mono text-emerald-400 uppercase">Completed Delivery</span>
              <div className="mt-1 text-xl font-bold font-mono text-emerald-300 tabular-nums">
                {stats.completedProjects}
              </div>
            </div>
            <div className="p-3.5 bg-[#121316] border border-sky-900/30 rounded-lg">
              <span className="text-[11px] font-mono text-sky-400 uppercase">In Development</span>
              <div className="mt-1 text-xl font-bold font-mono text-sky-300 tabular-nums">
                {stats.projectsInDevelopment}
              </div>
            </div>
            <div className="p-3.5 bg-[#121316] border border-white/[0.08] rounded-lg">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">Average Progress</span>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums">
                {(
                  projects.reduce((acc, p) => acc + p.progress, 0) /
                  (projects.length || 1)
                ).toFixed(0)}
                %
              </div>
            </div>
          </div>

          <div className="bg-[#121316] border border-white/[0.08] rounded-lg p-4">
            <h3 className="text-sm font-bold text-white mb-3">Project Execution Health</h3>
            <div className="space-y-3 text-xs">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-zinc-900/70 border border-white/[0.04] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-mono text-sky-400 mr-2">{p.project_code}</span>
                    <strong className="text-white">{p.business_name}</strong>
                    <span className="text-zinc-500 text-[11px] ml-2 font-mono">
                      (Deadline: {p.deadline})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">
                      {p.status}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: TEAM VELOCITY
         ========================================================= */}
      {activeReportTab === 'team' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#121316] border border-white/[0.08] rounded-lg">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">Total Agency Personnel</span>
              <div className="mt-1 text-xl font-bold font-mono text-white tabular-nums">
                {team.length} Staff
              </div>
            </div>
            <div className="p-3.5 bg-[#121316] border border-amber-900/30 rounded-lg">
              <span className="text-[11px] font-mono text-amber-400 uppercase">Active Sprint Tasks</span>
              <div className="mt-1 text-xl font-bold font-mono text-amber-300 tabular-nums">
                {stats.tasksPending} Pending
              </div>
            </div>
            <div className="p-3.5 bg-[#121316] border border-emerald-900/30 rounded-lg">
              <span className="text-[11px] font-mono text-emerald-400 uppercase">Closed Deliverables</span>
              <div className="mt-1 text-xl font-bold font-mono text-emerald-300 tabular-nums">
                {stats.tasksCompleted} Done
              </div>
            </div>
          </div>

          <div className="bg-[#121316] border border-white/[0.08] rounded-lg p-4">
            <h3 className="text-sm font-bold text-white mb-3">Individual Workload & Delivery Velocity</h3>
            <div className="space-y-2.5 text-xs">
              {team.map((m) => {
                const w = db.getTeamMemberWorkload(m.id);
                return (
                  <div
                    key={m.id}
                    className="p-3 bg-zinc-900/70 border border-white/[0.04] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <strong className="text-white">{m.full_name}</strong>
                      <span className="text-[#E52D27] text-[11px] ml-2 font-medium">({m.role})</span>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {m.department} · Monthly: {formatINR(m.monthly_salary)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[11px]">
                      <span className="text-amber-400">{w.pendingTasks} Pending Tasks</span>
                      <span className="text-emerald-400">{w.completedTasks} Completed</span>
                      <span className="text-zinc-400">{w.currentProjects} Projects</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
