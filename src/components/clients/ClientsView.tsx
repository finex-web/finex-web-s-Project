import React, { useState } from 'react';
import { db } from '../../lib/db';
import { Client, ClientStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Plus,
  Search,
  Users,
  Building,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Wrench,
  CreditCard,
  Edit2,
  Trash2,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface ClientsViewProps {
  initialSelectedClientId?: string;
  onNavigateToProject?: (projectId: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  initialSelectedClientId,
  onNavigateToProject,
}) => {
  const clients = db.getClients();
  const projects = db.getProjects();
  const payments = db.getPayments();
  const maintenance = db.getMaintenance();
  const domains = db.getDomains();
  const hosting = db.getHosting();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    initialSelectedClientId
      ? clients.find((c) => c.id === initialSelectedClientId) || null
      : null
  );

  const [formData, setFormData] = useState({
    business_name: '',
    client_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    city: '',
    address: '',
    business_category: 'Corporate & Logistics',
    lead_source: 'Website Inbound',
    status: 'ACTIVE' as ClientStatus,
    notes: '',
  });

  const statuses: ClientStatus[] = ['ACTIVE', 'COMPLETED', 'PAUSED', 'TERMINATED'];

  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.business_name.toLowerCase().includes(search.toLowerCase()) ||
      c.client_name.toLowerCase().includes(search.toLowerCase()) ||
      c.client_code.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingClient(null);
    setFormData({
      business_name: '',
      client_name: '',
      phone: '',
      whatsapp: '',
      email: '',
      city: '',
      address: '',
      business_category: 'Corporate & Logistics',
      lead_source: 'Website Inbound',
      status: 'ACTIVE',
      notes: '',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      business_name: client.business_name,
      client_name: client.client_name,
      phone: client.phone,
      whatsapp: client.whatsapp || '',
      email: client.email,
      city: client.city,
      address: client.address || '',
      business_category: client.business_category,
      lead_source: client.lead_source,
      status: client.status,
      notes: client.notes || '',
    });
    setIsAddOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.business_name || !formData.client_name || !formData.phone) {
      alert('Business name, client name, and phone are required.');
      return;
    }

    if (editingClient) {
      db.updateClient(editingClient.id, formData);
    } else {
      db.addClient({
        ...formData,
        date_joined: new Date().toISOString().split('T')[0],
      });
    }

    setIsAddOpen(false);
  };

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Client Directory & Accounts</h2>
          <p className="text-xs text-zinc-400">
            Comprehensive ledger of permanent client accounts, billing status, domains, and delivery history.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold bg-[#E52D27] hover:bg-[#c92520] text-white rounded flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Client</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121316] border border-white/[0.08] p-3 rounded-lg flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, code, phone, city..."
            className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Accounts ({clients.length})</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Clients Table */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#18191c] border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                <th className="py-2.5 px-3">Client Code</th>
                <th className="py-2.5 px-3">Business Name & Owner</th>
                <th className="py-2.5 px-3">Direct Contact</th>
                <th className="py-2.5 px-3">Location & Category</th>
                <th className="py-2.5 px-3">Date Joined</th>
                <th className="py-2.5 px-3">Account Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No clients found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-emerald-400">
                      {c.client_code}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{c.business_name}</div>
                      <div className="text-[11px] text-zinc-400">{c.client_name}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-zinc-300">{c.phone}</div>
                      <div className="text-[10px] text-zinc-500">{c.email}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-zinc-300">{c.business_category}</div>
                      <div className="text-[11px] text-zinc-500">{c.city}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-400">
                      {c.date_joined}
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Trigger */}
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors"
                          title="Message on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        {/* View Full 360 Profile */}
                        <button
                          type="button"
                          onClick={() => setSelectedClient(c)}
                          className="p-1.5 text-sky-400 hover:bg-sky-950/40 rounded transition-colors"
                          title="View 360° Client Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded"
                          title="Edit Client"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Protected */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded"
                          title="Archive / Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360° CLIENT PROFILE MODAL (Section 12) */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setSelectedClient(null)} />
          <div className="relative w-full max-w-4xl bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-emerald-400 px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/40 rounded">
                    {selectedClient.client_code}
                  </span>
                  <StatusBadge status={selectedClient.status} />
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">
                  {selectedClient.business_name}
                </h3>
                <div className="text-xs text-zinc-400">
                  Primary Contact: {selectedClient.client_name} · Joined {selectedClient.date_joined}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="text-zinc-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid: Contacts, Projects, Maintenance, Payments */}
            <div className="mt-5 space-y-5 text-xs">
              {/* Contact and address row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-[#191a1d] rounded border border-white/[0.04]">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Contact Information</span>
                  <div className="mt-1 font-mono text-white">{selectedClient.phone}</div>
                  <div className="text-zinc-400">{selectedClient.email}</div>
                  <div className="text-zinc-500 mt-1">WA: {selectedClient.whatsapp || selectedClient.phone}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Business Profile</span>
                  <div className="mt-1 text-white">{selectedClient.business_category}</div>
                  <div className="text-zinc-400">{selectedClient.city}</div>
                  <div className="text-zinc-500 mt-1">{selectedClient.address || 'Address unlisted'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Lead Origin & Notes</span>
                  <div className="mt-1 text-zinc-300">Source: {selectedClient.lead_source}</div>
                  <div className="text-zinc-500 mt-1">{selectedClient.notes || 'No general notes.'}</div>
                </div>
              </div>

              {/* Projects History */}
              <div>
                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#E52D27]" />
                  <span>Projects Associated with Client</span>
                </h4>
                <div className="space-y-2">
                  {projects.filter((p) => p.client_id === selectedClient.id).length === 0 ? (
                    <div className="p-3 bg-zinc-900/50 rounded text-zinc-500">
                      No active or past projects on file for this client.
                    </div>
                  ) : (
                    projects
                      .filter((p) => p.client_id === selectedClient.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-3 bg-zinc-900/80 border border-white/[0.04] rounded flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono text-sky-400 mr-2">{p.project_code}</span>
                            <span className="font-semibold text-white">{p.business_name}</span>
                            <span className="text-zinc-400 ml-2 font-mono">({p.plan} Plan)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-zinc-400">{p.progress}%</span>
                            <StatusBadge status={p.status} />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Maintenance Subscriptions */}
              <div>
                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#E52D27]" />
                  <span>Active Maintenance Contracts</span>
                </h4>
                <div className="space-y-2">
                  {maintenance.filter((m) => m.client_id === selectedClient.id).length === 0 ? (
                    <div className="p-3 bg-zinc-900/50 rounded text-zinc-500">
                      No active monthly maintenance contracts.
                    </div>
                  ) : (
                    maintenance
                      .filter((m) => m.client_id === selectedClient.id)
                      .map((m) => (
                        <div
                          key={m.id}
                          className="p-3 bg-zinc-900/80 border border-white/[0.04] rounded flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono text-emerald-400 mr-2">
                              {m.maintenance_code}
                            </span>
                            <span className="font-medium text-white">{m.project_name}</span>
                            <span className="text-zinc-400 ml-2 font-mono">
                              {formatINR(m.monthly_fee)}/mo
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="text-zinc-400">Next Due: {m.next_due_date}</span>
                            <StatusBadge status={m.payment_status} />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Payments History */}
              <div>
                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Client Ledger & Payments</span>
                </h4>
                <div className="space-y-2">
                  {payments.filter((p) => p.client_id === selectedClient.id).length === 0 ? (
                    <div className="p-3 bg-zinc-900/50 rounded text-zinc-500">
                      No payment invoices recorded.
                    </div>
                  ) : (
                    payments
                      .filter((p) => p.client_id === selectedClient.id)
                      .map((pay) => (
                        <div
                          key={pay.id}
                          className="p-3 bg-zinc-900/80 border border-white/[0.04] rounded flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono text-zinc-400 mr-2">{pay.payment_code}</span>
                            <span className="text-zinc-200">
                              Total: {formatINR(pay.total_amount)}
                            </span>
                            <span className="text-emerald-400 font-mono ml-2">
                              Recv: {formatINR(pay.amount_received)}
                            </span>
                            {pay.remaining > 0 && (
                              <span className="text-rose-400 font-mono ml-2">
                                Due: {formatINR(pay.remaining)}
                              </span>
                            )}
                          </div>
                          <StatusBadge status={pay.status} />
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="px-4 py-1.5 rounded bg-zinc-800 text-zinc-200 hover:text-white text-xs"
              >
                Close 360° Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">
                {editingClient ? `Edit Client (${editingClient.client_code})` : 'Register Client Account'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="e.g. Apex Hospital"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="e.g. Dr. K. Sharma"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@business.com"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Pune"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Business Category</label>
                  <input
                    type="text"
                    value={formData.business_category}
                    onChange={(e) => setFormData({ ...formData, business_category: e.target.value })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address / office suite..."
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Internal Agency Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold shadow-sm"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Archive Confirmation */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Archive Client Record?"
          message={`Are you sure you want to delete ${deleteTarget.business_name} (${deleteTarget.client_code})? This will remove the client profile from the active directory.`}
          confirmLabel="Archive Client"
          isDanger={true}
          onConfirm={() => {
            db.deleteClient(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
