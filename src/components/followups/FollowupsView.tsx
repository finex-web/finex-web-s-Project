import React, { useState } from 'react';
import { db } from '../../lib/db';
import { Followup, FollowupType, FollowupPriority, FollowupStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  Mail,
  Users,
  AlertTriangle,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  RotateCw,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const FollowupsView: React.FC = () => {
  const followups = db.getFollowups();
  const leads = db.getLeads();
  const clients = db.getClients();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Followup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Followup | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    related_type: 'LEAD' as Followup['related_type'],
    related_name: '',
    phone: '',
    type: 'CALL' as FollowupType,
    scheduled_date: todayStr,
    scheduled_time: '11:00 AM',
    priority: 'HIGH' as FollowupPriority,
    status: 'PENDING' as FollowupStatus,
    notes: 'Follow up on technical quote proposal and pricing queries.',
  });

  const [rescheduleDate, setRescheduleDate] = useState(todayStr);
  const [rescheduleTime, setRescheduleTime] = useState('03:00 PM');
  const [rescheduleNotes, setRescheduleNotes] = useState('');

  const filtered = followups.filter((f) => {
    const rName = f.related_name || f.client_name || '';
    const fCode = f.followup_code || '';
    const sDate = f.scheduled_date || f.date || '';

    const matchesSearch =
      rName.toLowerCase().includes(search.toLowerCase()) ||
      fCode.toLowerCase().includes(search.toLowerCase()) ||
      (f.notes && f.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === 'ALL' || f.related_type === filterType;

    let matchesPeriod = true;
    if (filterPeriod === 'today') {
      matchesPeriod = sDate === todayStr && f.status === 'PENDING';
    } else if (filterPeriod === 'overdue') {
      matchesPeriod = sDate < todayStr && f.status === 'PENDING';
    } else if (filterPeriod === 'upcoming') {
      matchesPeriod = sDate > todayStr && f.status === 'PENDING';
    }

    return matchesSearch && matchesType && matchesPeriod;
  });

  const handleOpenAdd = () => {
    setFormData({
      related_type: 'LEAD',
      related_name: leads[0]?.business_name || '',
      phone: leads[0]?.phone || '',
      type: 'CALL',
      scheduled_date: todayStr,
      scheduled_time: '11:00 AM',
      priority: 'HIGH',
      status: 'PENDING',
      notes: 'Follow up on proposal review.',
    });
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.related_name) {
      alert('Please provide contact/business name.');
      return;
    }

    db.addFollowup({
      ...formData,
    });

    setIsAddOpen(false);
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    db.rescheduleFollowup(
      rescheduleTarget.id,
      rescheduleDate,
      rescheduleTime,
      rescheduleNotes || 'Rescheduled via admin action'
    );

    setRescheduleTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Follow-ups & Outreach Pipeline
          </h2>
          <p className="text-xs text-zinc-400">
            Timely client touches across quotation closes, advance releases, and retainer renewals.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold bg-[#E52D27] hover:bg-[#c92520] text-white rounded flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Follow-up Reminders Summary (Section 32) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setFilterPeriod('today')}
          className={`p-3.5 text-left rounded-lg border transition-all ${
            filterPeriod === 'today'
              ? 'bg-[#1a1b1f] border-[#E52D27]'
              : 'bg-[#121316] border-amber-900/30 hover:border-amber-700/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>📅 Today's Follow-ups</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-amber-300 tabular-nums">
            {followups.filter((f) => f.scheduled_date === todayStr && f.status === 'PENDING').length} Due
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Scheduled for today</div>
        </button>

        <button
          type="button"
          onClick={() => setFilterPeriod('overdue')}
          className={`p-3.5 text-left rounded-lg border transition-all ${
            filterPeriod === 'overdue'
              ? 'bg-[#1a1b1f] border-[#E52D27]'
              : 'bg-[#121316] border-rose-900/30 hover:border-rose-700/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span>🔴 Overdue Action</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-rose-300 tabular-nums">
            {followups.filter((f) => (f.scheduled_date || f.date || '') < todayStr && f.status === 'PENDING').length} Overdue
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Missed follow-ups</div>
        </button>

        <button
          type="button"
          onClick={() => setFilterPeriod('upcoming')}
          className={`p-3.5 text-left rounded-lg border transition-all ${
            filterPeriod === 'upcoming'
              ? 'bg-[#1a1b1f] border-[#E52D27]'
              : 'bg-[#121316] border-sky-900/30 hover:border-sky-700/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-sky-400">
            <span>📆 Upcoming This Week</span>
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-sky-300 tabular-nums">
            {followups.filter((f) => (f.scheduled_date || f.date || '') > todayStr && f.status === 'PENDING').length} Scheduled
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Future planned touches</div>
        </button>

        <button
          type="button"
          onClick={() => setFilterPeriod('all')}
          className={`p-3.5 text-left rounded-lg border transition-all ${
            filterPeriod === 'all'
              ? 'bg-[#1a1b1f] border-[#E52D27]'
              : 'bg-[#121316] border-emerald-900/30 hover:border-emerald-700/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>✓ Completed Touches</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-300 tabular-nums">
            {followups.filter((f) => f.status === 'COMPLETED').length} Closed
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Total resolved calls</div>
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
            placeholder="Search follow-ups by code, name, notes..."
            className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Categories</option>
          <option value="LEAD">LEAD Follow-ups</option>
          <option value="CLIENT">CLIENT Follow-ups</option>
          <option value="PAYMENT">PAYMENT Collection</option>
          <option value="MAINTENANCE">MAINTENANCE Renewal</option>
        </select>
      </div>

      {/* Follow-ups Table */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#18191c] border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                <th className="py-2.5 px-3">Follow-up ID</th>
                <th className="py-2.5 px-3">Category & Target</th>
                <th className="py-2.5 px-3">Medium</th>
                <th className="py-2.5 px-3">Scheduled Slot</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Notes / Agenda</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-500">
                    No follow-up items found.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => {
                  const isOverdue = (f.scheduled_date || f.date || '') < todayStr && f.status === 'PENDING';
                  return (
                    <tr
                      key={f.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isOverdue ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-medium text-amber-400">
                        {f.followup_code || 'FOL'}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{f.related_name || f.client_name || ''}</div>
                        <div className="text-[10px] font-mono text-zinc-500">
                          {f.related_type || 'CLIENT'} · {f.phone}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-zinc-300">
                        <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px]">
                          {f.type || 'CALL'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-zinc-300 text-[11px]">
                        <div>{f.scheduled_date || f.date}</div>
                        <div className="text-[10px] text-zinc-500">{f.scheduled_time || f.time}</div>
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={f.priority || 'MEDIUM'} />
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={f.status} />
                      </td>

                      <td className="py-3 px-3 text-zinc-400 text-xs max-w-xs">
                        {f.notes || '—'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp Call or Chat */}
                          {f.phone && (
                            <a
                              href={`https://wa.me/${f.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors"
                              title="Connect on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Complete action */}
                          {f.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() =>
                                db.updateFollowupStatus(
                                  f.id,
                                  'COMPLETED'
                                )
                              }
                              className="px-2 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/40 rounded text-[11px]"
                              title="Mark Done"
                            >
                              Done
                            </button>
                          )}

                          {/* Reschedule */}
                          {f.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => {
                                setRescheduleTarget(f);
                                setRescheduleDate(f.scheduled_date || f.date || todayStr);
                                setRescheduleTime(f.scheduled_time || f.time || '03:00 PM');
                                setRescheduleNotes('');
                              }}
                              className="p-1.5 text-zinc-400 hover:text-white rounded"
                              title="Reschedule"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(f)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE FOLLOWUP MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-md bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Schedule Outreach Follow-up</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Context Category</label>
                  <select
                    value={formData.related_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        related_type: e.target.value as Followup['related_type'],
                      })
                    }
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    <option value="LEAD">LEAD Outreach</option>
                    <option value="CLIENT">Existing CLIENT</option>
                    <option value="PAYMENT">PAYMENT Collection</option>
                    <option value="MAINTENANCE">MAINTENANCE Renewal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Medium</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as FollowupType })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    <option value="CALL">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp Message</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">Video / Physical Meeting</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Business / Person Name *</label>
                <input
                  type="text"
                  required
                  value={formData.related_name}
                  onChange={(e) => setFormData({ ...formData, related_name: e.target.value })}
                  placeholder="e.g. Apex Hospital (Dr. K. Sharma)"
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as FollowupPriority })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    placeholder="e.g. 11:30 AM"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Notes / Call Agenda</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Items to discuss, objections to resolve..."
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
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setRescheduleTarget(null)} />
          <div className="relative w-full max-w-md bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">
                Reschedule Follow-up ({rescheduleTarget.followup_code})
              </h3>
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="mt-4 space-y-3">
              <div className="p-2.5 bg-[#191a1d] rounded text-zinc-300">
                Rescheduling contact with <strong className="text-white">{rescheduleTarget.related_name}</strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">New Date *</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">New Time *</label>
                  <input
                    type="text"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    placeholder="e.g. 04:00 PM"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Reason for Rescheduling</label>
                <input
                  type="text"
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="Client in meeting, asked to call later..."
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Delete Follow-up?"
          message={`Are you sure you want to delete follow-up ${deleteTarget.followup_code} for ${deleteTarget.related_name}?`}
          confirmLabel="Delete Follow-up"
          isDanger={true}
          onConfirm={() => {
            db.deleteFollowup(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
