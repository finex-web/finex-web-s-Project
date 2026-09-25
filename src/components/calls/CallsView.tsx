import React, { useState } from 'react';
import { db } from '../../lib/db';
import { Call, CallStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Plus,
  Search,
  PhoneCall,
  Clock,
  Calendar,
  X,
  Phone,
  User,
  Building,
} from 'lucide-react';

export const CallsView: React.FC = () => {
  const calls = db.getCalls();
  const leads = db.getLeads();
  const clients = db.getClients();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add form state
  const [formData, setFormData] = useState({
    contact_name: '',
    business_name: '',
    phone: '',
    call_date: new Date().toISOString().split('T')[0],
    call_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    call_duration: '05 mins',
    call_status: 'ANSWERED' as CallStatus,
    discussion_notes: '',
    next_followup: '',
    admin_name: 'FINEX Admin',
    lead_id: '',
    client_id: '',
  });

  const statuses: CallStatus[] = [
    'ANSWERED',
    'NOT ANSWERED',
    'BUSY',
    'WRONG NUMBER',
    'CALL BACK',
    'INTERESTED',
    'NOT INTERESTED',
  ];

  const filteredCalls = calls.filter((c) => {
    const matchesSearch =
      c.contact_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.business_name && c.business_name.toLowerCase().includes(search.toLowerCase())) ||
      c.phone.includes(search) ||
      (c.discussion_notes && c.discussion_notes.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || c.call_status === statusFilter;
    const matchesDate = !dateFilter || c.call_date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleLeadSelect = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setFormData({
        ...formData,
        lead_id: lead.id,
        contact_name: lead.client_name,
        business_name: lead.business_name,
        phone: lead.phone,
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contact_name || !formData.phone) {
      alert('Please provide contact name and phone number.');
      return;
    }

    db.addCall(formData);
    setIsAddOpen(false);
    setFormData({
      contact_name: '',
      business_name: '',
      phone: '',
      call_date: new Date().toISOString().split('T')[0],
      call_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      call_duration: '05 mins',
      call_status: 'ANSWERED',
      discussion_notes: '',
      next_followup: '',
      admin_name: 'FINEX Admin',
      lead_id: '',
      client_id: '',
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Call Registry & Connects</h2>
          <p className="text-xs text-zinc-400">
            Log outbound discovery calls, pitch discussions, client updates, and callback scheduling.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold bg-[#E52D27] hover:bg-[#c92520] text-white rounded flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Call</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121316] border border-white/[0.08] p-3 rounded-lg flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussion notes, contact name, phone, business..."
            className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-[#E52D27]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Call Outcomes ({calls.length})</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-8.5 px-2 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden font-mono"
        />

        {dateFilter && (
          <button
            type="button"
            onClick={() => setDateFilter('')}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Calls Table */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#18191c] border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Contact & Business</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Outcome Status</th>
                <th className="py-2.5 px-3">Discussion Summary</th>
                <th className="py-2.5 px-3">Next Follow-up</th>
                <th className="py-2.5 px-3">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No calls recorded matching your filters.
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono text-zinc-300">
                      <div>{call.call_date}</div>
                      <div className="text-[10px] text-zinc-500">{call.call_time}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{call.contact_name}</div>
                      <div className="text-[11px] text-zinc-400">{call.business_name}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-300">
                      <a
                        href={`tel:${call.phone}`}
                        className="hover:text-sky-400 transition-colors inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-zinc-500" />
                        <span>{call.phone}</span>
                      </a>
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">
                      {call.call_duration || '—'}
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={call.call_status} />
                    </td>

                    <td className="py-3 px-3 max-w-sm">
                      <p className="text-zinc-300 leading-relaxed line-clamp-2">
                        {call.discussion_notes || 'No discussion notes.'}
                      </p>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      {call.next_followup ? (
                        <span className="text-amber-400 font-semibold">{call.next_followup}</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-zinc-400 text-[11px] font-mono">
                      {call.admin_name}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Call Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Record Outbound / Inbound Call</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              {/* Quick autofill from existing lead */}
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">
                  Autofill from Lead Pipeline (Optional)
                </label>
                <select
                  value={formData.lead_id}
                  onChange={(e) => handleLeadSelect(e.target.value)}
                  className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-zinc-300"
                >
                  <option value="">-- Choose Lead to Auto-populate --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.lead_code} - {l.business_name} ({l.client_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="e.g. Patel Healthcare"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Phone *</label>
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
                  <label className="block text-zinc-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.call_duration}
                    onChange={(e) => setFormData({ ...formData, call_duration: e.target.value })}
                    placeholder="e.g. 08 mins"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Call Outcome Status</label>
                  <select
                    value={formData.call_status}
                    onChange={(e) => setFormData({ ...formData, call_status: e.target.value as CallStatus })}
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
                  <label className="block text-zinc-300 mb-1">Schedule Follow-up Date</label>
                  <input
                    type="date"
                    value={formData.next_followup}
                    onChange={(e) => setFormData({ ...formData, next_followup: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Discussion Notes & Objections</label>
                <textarea
                  rows={3}
                  required
                  value={formData.discussion_notes}
                  onChange={(e) => setFormData({ ...formData, discussion_notes: e.target.value })}
                  placeholder="Key topics discussed, requested features, budget, next steps..."
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
                  Save Call Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
