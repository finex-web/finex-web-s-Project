import React, { useState } from 'react';
import { db } from '../../lib/db';
import { Lead, LeadStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Plus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  UserCheck,
  Edit2,
  Trash2,
  ArrowRightCircle,
  Calendar,
  X,
  Clock,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface LeadsViewProps {
  onLogCallForLead?: (lead: Lead) => void;
  onNavigateToClient?: (clientId: string) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  onLogCallForLead,
  onNavigateToClient,
}) => {
  const leads = db.getLeads();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [convertTarget, setConvertTarget] = useState<Lead | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    business_name: '',
    client_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    city: '',
    business_category: 'Restaurant & Hospitality',
    lead_source: 'Website Inbound',
    status: 'NEW LEAD' as LeadStatus,
    next_followup: '',
    notes: '',
  });

  const categories = [
    'Restaurant & Hospitality',
    'Healthcare & Wellness',
    'Real Estate & Architecture',
    'Fashion & E-Commerce',
    'Fitness & Sports',
    'Corporate & Logistics',
    'Luxury & Jewelry',
    'Education & Coaching',
    'Other',
  ];

  const statuses: LeadStatus[] = [
    'NEW LEAD',
    'CALL PENDING',
    'CALLED',
    'INTERESTED',
    'FOLLOW-UP',
    'NOT INTERESTED',
    'CONVERTED',
  ];

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.business_name.toLowerCase().includes(search.toLowerCase()) ||
      l.client_name.toLowerCase().includes(search.toLowerCase()) ||
      l.lead_code.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesCat = categoryFilter === 'ALL' || l.business_category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCat;
  });

  const handleOpenAdd = () => {
    setEditingLead(null);
    setFormData({
      business_name: '',
      client_name: '',
      phone: '',
      whatsapp: '',
      email: '',
      city: '',
      business_category: 'Restaurant & Hospitality',
      lead_source: 'Website Inbound',
      status: 'NEW LEAD',
      next_followup: '',
      notes: '',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      business_name: lead.business_name,
      client_name: lead.client_name,
      phone: lead.phone,
      whatsapp: lead.whatsapp || '',
      email: lead.email,
      city: lead.city,
      business_category: lead.business_category,
      lead_source: lead.lead_source,
      status: lead.status,
      next_followup: lead.next_followup || '',
      notes: lead.notes || '',
    });
    setIsAddOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.business_name || !formData.client_name || !formData.phone) {
      alert('Please fill in business name, contact person, and phone number.');
      return;
    }

    if (editingLead) {
      db.updateLead(editingLead.id, formData);
    } else {
      db.addLead({
        ...formData,
        date_added: new Date().toISOString().split('T')[0],
      });
    }

    setIsAddOpen(false);
  };

  const handleConvert = (lead: Lead) => {
    const newClient = db.convertLeadToClient(lead.id);
    setConvertTarget(null);
    if (newClient && onNavigateToClient) {
      onNavigateToClient(newClient.id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Lead Pipeline Management</h2>
          <p className="text-xs text-zinc-400">
            Track inquiries from discovery to call, qualification, and client conversion.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold bg-[#E52D27] hover:bg-[#c92520] text-white rounded flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Lead</span>
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
            placeholder="Search leads by name, code, phone, city..."
            className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-[#E52D27]"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Statuses ({leads.length})</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s} ({leads.filter((l) => l.status === s).length})
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#18191c] border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                <th className="py-2.5 px-3">Lead ID</th>
                <th className="py-2.5 px-3">Business & Client</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Category / City</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Follow-up</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-amber-400">
                      {lead.lead_code}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{lead.business_name}</div>
                      <div className="text-[11px] text-zinc-400">{lead.client_name}</div>
                      {lead.notes && (
                        <div className="text-[10px] text-zinc-500 truncate max-w-xs mt-0.5">
                          {lead.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-zinc-300">{lead.phone}</div>
                      <div className="text-[10px] text-zinc-500">{lead.email}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-zinc-300">{lead.business_category}</div>
                      <div className="text-[11px] text-zinc-500">{lead.city}</div>
                    </td>

                    <td className="py-3 px-3 text-zinc-400 text-[11px]">
                      {lead.lead_source}
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={lead.status} />
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      {lead.next_followup ? (
                        <span className="text-zinc-300">{lead.next_followup}</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Trigger */}
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors"
                          title="Message on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        {/* Phone Call Trigger */}
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 text-sky-400 hover:bg-sky-950/40 rounded transition-colors"
                          title="Call Lead"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        {/* Convert to Client */}
                        {lead.status !== 'CONVERTED' && (
                          <button
                            type="button"
                            onClick={() => setConvertTarget(lead)}
                            className="p-1.5 text-[#E52D27] hover:bg-[#E52D27]/10 rounded transition-colors"
                            title="Convert to Permanent Client"
                          >
                            <ArrowRightCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(lead)}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(lead)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded"
                          title="Delete Lead"
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

      {/* Add/Edit Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">
                {editingLead ? `Edit Lead (${editingLead.lead_code})` : 'Register New Lead'}
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
                    placeholder="e.g. ABC Restaurant"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Client / Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
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
                  <label className="block text-zinc-300 mb-1">WhatsApp (Optional)</label>
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
                    placeholder="Mumbai / Delhi / Pune"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Business Category</label>
                  <select
                    value={formData.business_category}
                    onChange={(e) => setFormData({ ...formData, business_category: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Lead Source</label>
                  <select
                    value={formData.lead_source}
                    onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    <option value="Website Inbound">Website Inbound</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referral">Referral</option>
                    <option value="Direct Outreach">Direct Outreach</option>
                    <option value="WhatsApp Campaign">WhatsApp Campaign</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.next_followup}
                    onChange={(e) => setFormData({ ...formData, next_followup: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Requirement Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Website requirements, budget expectations, timeline..."
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
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Client Confirmation */}
      {convertTarget && (
        <ConfirmModal
          isOpen={Boolean(convertTarget)}
          title="Convert Lead to Permanent Client?"
          message={`Are you sure you want to convert ${convertTarget.business_name} (${convertTarget.client_name}) into a permanent client? A permanent Client ID will be assigned and the lead status will be updated to CONVERTED.`}
          confirmLabel="Convert to Client"
          isDanger={false}
          onConfirm={() => handleConvert(convertTarget)}
          onCancel={() => setConvertTarget(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Delete Lead Record?"
          message={`Are you sure you want to remove lead ${deleteTarget.lead_code} (${deleteTarget.business_name})? This action will remove the record from the pipeline.`}
          confirmLabel="Delete Lead"
          isDanger={true}
          onConfirm={() => {
            db.deleteLead(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
