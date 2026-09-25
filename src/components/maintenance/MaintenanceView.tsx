import React, { useState } from 'react';
import { db } from '../../lib/db';
import { Maintenance, DomainRecord, HostingRecord } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Plus,
  Search,
  Wrench,
  Globe,
  Server,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  X,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';

export const MaintenanceView: React.FC = () => {
  const maintenance = db.getMaintenance();
  const domains = db.getDomains();
  const hosting = db.getHosting();
  const clients = db.getClients();
  const projects = db.getProjects();

  const [activeTab, setActiveTab] = useState<'contracts' | 'domains' | 'hosting'>('contracts');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isAddContractOpen, setIsAddContractOpen] = useState(false);
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);
  const [isAddHostingOpen, setIsAddHostingOpen] = useState(false);
  const [taskLogTarget, setTaskLogTarget] = useState<Maintenance | null>(null);
  const [whatsappReminderTarget, setWhatsappReminderTarget] = useState<Maintenance | null>(null);

  // Maintenance form
  const [contractForm, setContractForm] = useState({
    client_id: '',
    client_name: '',
    project_id: '',
    project_name: '',
    monthly_fee: 1499,
    plan_type: 'BUSINESS' as Maintenance['plan_type'],
    start_date: new Date().toISOString().split('T')[0],
    next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_status: 'PAID' as Maintenance['payment_status'],
    auto_renewal: true,
    notes: 'Monthly security audit and offsite backup included.',
  });

  // Domain form
  const [domainForm, setDomainForm] = useState({
    domain_name: '',
    client_name: '',
    registrar: 'Hostinger',
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    renewal_cost: 999,
    auto_renew: true,
    status: 'ACTIVE' as DomainRecord['status'],
    dns_records: 'A Record -> 185.199.108.153',
  });

  // Hosting form
  const [hostingForm, setHostingForm] = useState({
    provider: 'Hostinger Cloud',
    plan_name: 'Cloud Startup',
    server_ip: '194.163.145.22',
    renewal_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    renewal_cost: 3999,
    client_name: '',
    status: 'ACTIVE' as HostingRecord['status'],
  });

  // Work log input
  const [newWorkLog, setNewWorkLog] = useState('');

  const filteredContracts = maintenance.filter((m) => {
    const matchesSearch =
      m.client_name.toLowerCase().includes(search.toLowerCase()) ||
      m.project_name.toLowerCase().includes(search.toLowerCase()) ||
      m.maintenance_code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || m.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleClientSelect = (cId: string) => {
    const c = clients.find((x) => x.id === cId);
    if (c) {
      const p = projects.find((proj) => proj.client_id === c.id);
      setContractForm({
        ...contractForm,
        client_id: c.id,
        client_name: c.business_name,
        project_id: p ? p.id : '',
        project_name: p ? p.business_name : c.business_name,
      });
    }
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.client_name || !contractForm.project_name) {
      alert('Please specify client and project.');
      return;
    }

    db.addMaintenanceContract({
      ...contractForm,
      work_done_this_month: ['Server health verification', 'SSL certificate monitor'],
    });

    setIsAddContractOpen(false);
  };

  const handleAddWorkLog = (mId: string) => {
    if (!newWorkLog.trim()) return;
    db.logMaintenanceWork(mId, newWorkLog.trim());
    setNewWorkLog('');
    // refresh target
    const updated = db.getMaintenance().find((m) => m.id === mId);
    if (updated) setTaskLogTarget(updated);
  };

  const formatINR = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Maintenance, Domains & Hosting
          </h2>
          <p className="text-xs text-zinc-400">
            Monthly retainer subscriptions, SLA routine tasks, domain expiries, and server allocations.
          </p>
        </div>

        {/* Tab switch */}
        <div className="bg-[#18191c] p-0.5 rounded border border-white/10 flex items-center self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('contracts')}
            className={`px-3 py-1.5 text-xs rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'contracts'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-[#E52D27]" />
            <span>Retainers ({maintenance.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('domains')}
            className={`px-3 py-1.5 text-xs rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'domains'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Domains ({domains.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hosting')}
            className={`px-3 py-1.5 text-xs rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'hosting'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>Hosting ({hosting.length})</span>
          </button>
        </div>
      </div>

      {/* Overview Status Alerts (Section 28) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#121316] border border-emerald-900/30 rounded-lg">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>🟢 Active Retainers</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-300 tabular-nums">
            {formatINR(maintenance.reduce((acc, m) => acc + m.monthly_fee, 0))} /mo
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Recurring MRR revenue</div>
        </div>

        <div className="p-3.5 bg-[#121316] border border-amber-900/30 rounded-lg">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>🟠 Subscriptions Due</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-amber-300 tabular-nums">
            {maintenance.filter((m) => m.payment_status === 'DUE').length} Contracts
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Due for monthly renewal</div>
        </div>

        <div className="p-3.5 bg-[#121316] border border-rose-900/30 rounded-lg">
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span>🔴 Overdue Retainers</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-rose-300 tabular-nums">
            {maintenance.filter((m) => m.payment_status === 'OVERDUE').length} Expired
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Grace period expired</div>
        </div>

        <div className="p-3.5 bg-[#121316] border border-sky-900/30 rounded-lg">
          <div className="flex items-center justify-between text-xs text-sky-400">
            <span>🌐 Managed Domains</span>
            <Globe className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-sky-300 tabular-nums">
            {domains.length} Domains
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">DNS & Auto-renewals</div>
        </div>
      </div>

      {/* =========================================================
          TAB 1: MAINTENANCE CONTRACTS & WORK LOGS
         ========================================================= */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="bg-[#121316] border border-white/[0.08] p-3 rounded-lg flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search retainers by client, project, contract code..."
                className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="PAID">PAID</option>
                <option value="DUE">DUE</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setContractForm({
                    client_id: clients[0]?.id || '',
                    client_name: clients[0]?.business_name || '',
                    project_id: projects[0]?.id || '',
                    project_name: projects[0]?.business_name || '',
                    monthly_fee: 1499,
                    plan_type: 'BUSINESS',
                    start_date: new Date().toISOString().split('T')[0],
                    next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    payment_status: 'PAID',
                    auto_renewal: true,
                    notes: 'Standard SLA monthly retainer',
                  });
                  setIsAddContractOpen(true);
                }}
                className="px-3 py-1.5 bg-[#E52D27] hover:bg-[#c92520] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Retainer</span>
              </button>
            </div>
          </div>

          <div className="bg-[#121316] border border-white/[0.08] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#18191c] border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                    <th className="py-2.5 px-3">Contract Code</th>
                    <th className="py-2.5 px-3">Client & Project</th>
                    <th className="py-2.5 px-3">Plan Type</th>
                    <th className="py-2.5 px-3">Monthly Fee</th>
                    <th className="py-2.5 px-3">Next Due Date</th>
                    <th className="py-2.5 px-3">Auto Renewal</th>
                    <th className="py-2.5 px-3">Payment Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredContracts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-zinc-500">
                        No maintenance contracts found.
                      </td>
                    </tr>
                  ) : (
                    filteredContracts.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-emerald-400">
                          {m.maintenance_code}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">{m.client_name}</div>
                          <div className="text-[11px] text-zinc-400">{m.project_name}</div>
                        </td>

                        <td className="py-3 px-3 font-mono text-zinc-300">
                          <span className="px-2 py-0.5 bg-zinc-800 rounded text-[11px]">
                            {m.plan_type}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-emerald-400 font-bold tabular-nums">
                          {formatINR(m.monthly_fee)}/mo
                        </td>

                        <td className="py-3 px-3 font-mono text-zinc-300 text-[11px]">
                          {m.next_due_date}
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-zinc-400">
                          {m.auto_renewal ? 'ENABLED' : 'MANUAL'}
                        </td>

                        <td className="py-3 px-3">
                          <StatusBadge status={m.payment_status} />
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp reminder */}
                            <button
                              type="button"
                              onClick={() => setWhatsappReminderTarget(m)}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors"
                              title="Send WhatsApp Renewal Notice"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            {/* Log work */}
                            <button
                              type="button"
                              onClick={() => setTaskLogTarget(m)}
                              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] flex items-center gap-1"
                              title="View & Log Monthly Maintenance Tasks"
                            >
                              <Wrench className="w-3 h-3 text-[#E52D27]" />
                              <span>Work Log ({(m.work_done_this_month || []).length})</span>
                            </button>

                            {/* Mark paid / renew */}
                            {m.payment_status !== 'PAID' && (
                              <button
                                type="button"
                                onClick={() => db.recordMaintenancePayment(m.id)}
                                className="px-2 py-1 bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/50 rounded text-[11px]"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: DOMAIN REGISTRY & DNS TRACKING
         ========================================================= */}
      {activeTab === 'domains' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#121316] border border-white/[0.08] p-3 rounded-lg">
            <div className="text-xs text-zinc-400">
              Agency-administered client domain names, registrar lock status, and renewal schedules.
            </div>
            <button
              type="button"
              onClick={() => setIsAddDomainOpen(true)}
              className="px-3 py-1.5 bg-[#E52D27] hover:bg-[#c92520] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Domain</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domains.map((dom) => (
              <div
                key={dom.id}
                className="bg-[#121316] border border-white/[0.08] p-4 rounded-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-white font-bold text-sm">{dom.domain_name}</span>
                    <StatusBadge status={dom.status} />
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">Client: {dom.client_name}</div>

                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5 text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span>Registrar:</span>
                      <span className="text-zinc-200 font-medium">{dom.registrar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expiry Date:</span>
                      <span className="text-zinc-200 font-mono">{dom.expiry_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Renewal Cost:</span>
                      <span className="text-emerald-400 font-mono font-semibold">
                        {formatINR(dom.renewal_cost || dom.renewal_amount || 0)}/yr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-Renew:</span>
                      <span className="text-zinc-300 font-mono">
                        {dom.auto_renew ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>

                  {dom.dns_records && (
                    <div className="mt-3 p-2 bg-zinc-900/80 rounded font-mono text-[10px] text-zinc-400 truncate">
                      DNS: {dom.dns_records}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: HOSTING & SERVERS
         ========================================================= */}
      {activeTab === 'hosting' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#121316] border border-white/[0.08] p-3 rounded-lg">
            <div className="text-xs text-zinc-400">
              Allocated high-speed cloud containers, IP addresses, and renewal schedules.
            </div>
            <button
              type="button"
              onClick={() => setIsAddHostingOpen(true)}
              className="px-3 py-1.5 bg-[#E52D27] hover:bg-[#c92520] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Server Provision</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hosting.map((hst) => (
              <div
                key={hst.id}
                className="bg-[#121316] border border-white/[0.08] p-4 rounded-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{hst.provider}</span>
                    <StatusBadge status={hst.status} />
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">Tier: {hst.plan_name}</div>

                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5 text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span>Client / App:</span>
                      <span className="text-zinc-200">{hst.client_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Server IP:</span>
                      <span className="text-sky-400 font-mono">{hst.server_ip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Renewal Date:</span>
                      <span className="text-zinc-200 font-mono">{hst.renewal_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Cost:</span>
                      <span className="text-emerald-400 font-mono font-semibold">
                        {formatINR(hst.renewal_cost || hst.renewal_amount || 0)}/yr
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD RETAINER CONTRACT */}
      {isAddContractOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddContractOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Create Maintenance Retainer</h3>
              <button
                type="button"
                onClick={() => setIsAddContractOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="mt-4 space-y-3">
              <div>
                <label className="block text-zinc-300 mb-1">Select Client *</label>
                <select
                  value={contractForm.client_id}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.business_name} ({c.client_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={contractForm.project_name}
                    onChange={(e) => setContractForm({ ...contractForm, project_name: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Plan Tier</label>
                  <select
                    value={contractForm.plan_type}
                    onChange={(e) =>
                      setContractForm({
                        ...contractForm,
                        plan_type: e.target.value as Maintenance['plan_type'],
                        monthly_fee:
                          e.target.value === 'STARTER'
                            ? 999
                            : e.target.value === 'BUSINESS'
                            ? 1499
                            : e.target.value === 'PREMIUM'
                            ? 2499
                            : 4999,
                      })
                    }
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    <option value="STARTER">Starter (₹999/mo)</option>
                    <option value="BUSINESS">Business (₹1,499/mo)</option>
                    <option value="PREMIUM">Premium (₹2,499/mo)</option>
                    <option value="CUSTOM">Custom Retainer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Monthly Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={contractForm.monthly_fee}
                    onChange={(e) => setContractForm({ ...contractForm, monthly_fee: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Next Due Date *</label>
                  <input
                    type="date"
                    required
                    value={contractForm.next_due_date}
                    onChange={(e) => setContractForm({ ...contractForm, next_due_date: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Notes / Scope Details</label>
                <input
                  type="text"
                  value={contractForm.notes}
                  onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddContractOpen(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold shadow-sm"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WORK LOG FOR CONTRACT */}
      {taskLogTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setTaskLogTarget(null)} />
          <div className="relative w-full max-w-lg bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Monthly Maintenance Work Log ({taskLogTarget.maintenance_code})
                </h3>
                <p className="text-zinc-400 mt-0.5">{taskLogTarget.project_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setTaskLogTarget(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-zinc-500">
                  Completed Activities This Cycle:
                </div>
                {(taskLogTarget.work_done_this_month || []).length === 0 ? (
                  <div className="p-3 bg-zinc-900/50 rounded text-zinc-500">
                    No routine tasks logged for this billing period.
                  </div>
                ) : (
                  (taskLogTarget.work_done_this_month || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-zinc-900 border border-white/[0.04] rounded flex items-center gap-2 text-zinc-300"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Add log entry */}
              <div className="pt-2 border-t border-white/[0.06]">
                <label className="block text-zinc-300 mb-1 font-semibold">
                  Record New Routine / SLA Maintenance Task
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWorkLog}
                    onChange={(e) => setNewWorkLog(e.target.value)}
                    placeholder="e.g. Weekly database backup & SSL renewal verified"
                    className="flex-1 h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddWorkLog(taskLogTarget.id)}
                    className="px-3 py-1 bg-[#E52D27] hover:bg-[#c92520] text-white rounded font-medium"
                  >
                    Log Task
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={() => setTaskLogTarget(null)}
                className="px-4 py-1.5 rounded bg-zinc-800 text-zinc-200 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP RENEWAL NOTICE COPY MODAL */}
      {whatsappReminderTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setWhatsappReminderTarget(null)} />
          <div className="relative w-full max-w-md bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Maintenance Notice</span>
              </h3>
              <button
                type="button"
                onClick={() => setWhatsappReminderTarget(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-[#191a1d] rounded border border-white/[0.06] text-zinc-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all">
{`Hello ${whatsappReminderTarget.client_name},
Greetings from FINEX WEB!

This is regarding the monthly website maintenance & security retainer for "${whatsappReminderTarget.project_name}".

Plan: ${whatsappReminderTarget.plan_type} Retainer
Monthly Amount: ${formatINR(whatsappReminderTarget.monthly_fee)}
Renewal Date: ${whatsappReminderTarget.next_due_date}

Included services: Security audits, plugin updates, uptime monitoring, and weekly cloud backups.

To renew for the upcoming month, kindly process via UPI / Bank Transfer.

Thank you,
FINEX WEB Management`}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Hello ${whatsappReminderTarget.client_name}, your monthly maintenance renewal of ${formatINR(whatsappReminderTarget.monthly_fee)} for ${whatsappReminderTarget.project_name} is due on ${whatsappReminderTarget.next_due_date}. Thank you, FINEX WEB.`
                    );
                    alert('Copied to clipboard!');
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Notice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWhatsappReminderTarget(null)}
                  className="px-4 py-1.5 bg-[#E52D27] hover:bg-[#c92520] text-white rounded font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD DOMAIN */}
      {isAddDomainOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddDomainOpen(false)} />
          <div className="relative w-full max-w-md bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Register Domain Asset</h3>
              <button
                type="button"
                onClick={() => setIsAddDomainOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                db.addDomain(domainForm);
                setIsAddDomainOpen(false);
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="block text-zinc-300 mb-1">Domain Name *</label>
                <input
                  type="text"
                  required
                  value={domainForm.domain_name}
                  onChange={(e) => setDomainForm({ ...domainForm, domain_name: e.target.value })}
                  placeholder="e.g. clientdomain.com"
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Client Business</label>
                  <input
                    type="text"
                    required
                    value={domainForm.client_name}
                    onChange={(e) => setDomainForm({ ...domainForm, client_name: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Registrar</label>
                  <input
                    type="text"
                    value={domainForm.registrar}
                    onChange={(e) => setDomainForm({ ...domainForm, registrar: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={domainForm.expiry_date}
                    onChange={(e) => setDomainForm({ ...domainForm, expiry_date: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Renewal Cost (₹)</label>
                  <input
                    type="number"
                    value={domainForm.renewal_cost}
                    onChange={(e) => setDomainForm({ ...domainForm, renewal_cost: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddDomainOpen(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold"
                >
                  Save Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD HOSTING */}
      {isAddHostingOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddHostingOpen(false)} />
          <div className="relative w-full max-w-md bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Allocate Hosting Server</h3>
              <button
                type="button"
                onClick={() => setIsAddHostingOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                db.addHosting(hostingForm);
                setIsAddHostingOpen(false);
              }}
              className="mt-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Provider *</label>
                  <input
                    type="text"
                    required
                    value={hostingForm.provider}
                    onChange={(e) => setHostingForm({ ...hostingForm, provider: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={hostingForm.plan_name}
                    onChange={(e) => setHostingForm({ ...hostingForm, plan_name: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Server IP Address</label>
                  <input
                    type="text"
                    value={hostingForm.server_ip}
                    onChange={(e) => setHostingForm({ ...hostingForm, server_ip: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Client / Project</label>
                  <input
                    type="text"
                    value={hostingForm.client_name}
                    onChange={(e) => setHostingForm({ ...hostingForm, client_name: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Renewal Date</label>
                  <input
                    type="date"
                    value={hostingForm.renewal_date}
                    onChange={(e) => setHostingForm({ ...hostingForm, renewal_date: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Annual Cost (₹)</label>
                  <input
                    type="number"
                    value={hostingForm.renewal_cost}
                    onChange={(e) => setHostingForm({ ...hostingForm, renewal_cost: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddHostingOpen(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold"
                >
                  Save Server Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
