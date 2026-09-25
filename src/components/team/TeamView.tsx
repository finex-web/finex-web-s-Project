import React, { useState } from 'react';
import { db } from '../../lib/db';
import { TeamMember, EmploymentStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Plus,
  Search,
  UserCog,
  Briefcase,
  CheckSquare,
  Banknote,
  Phone,
  Mail,
  Calendar,
  X,
  Edit2,
  Trash2,
  Eye,
  Shield,
  Clock,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const TeamView: React.FC = () => {
  const team = db.getTeamMembers();
  const tasks = db.getTasks();
  const projects = db.getProjects();
  const salaryRecords = db.getSalaryRecords();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<TeamMember | null>(null);

  const availableRoles = [
    'Project Manager',
    'UI/UX Designer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'QA Tester',
    'Content Writer',
    'SEO Specialist',
  ];

  const departments = ['Engineering', 'Design & UI/UX', 'Operations & Management', 'Quality Assurance', 'Marketing'];

  const [formData, setFormData] = useState({
    full_name: '',
    role: 'Frontend Developer',
    department: 'Engineering',
    phone: '',
    email: '',
    monthly_salary: 28000,
    joining_date: new Date().toISOString().split('T')[0],
    employment_status: 'ACTIVE' as EmploymentStatus,
    notes: '',
  });

  const filtered = team.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      full_name: '',
      role: 'Frontend Developer',
      department: 'Engineering',
      phone: '',
      email: '',
      monthly_salary: 28000,
      joining_date: new Date().toISOString().split('T')[0],
      employment_status: 'ACTIVE',
      notes: '',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (m: TeamMember) => {
    setEditingMember(m);
    setFormData({
      full_name: m.full_name,
      role: m.role,
      department: m.department,
      phone: m.phone,
      email: m.email,
      monthly_salary: m.monthly_salary,
      joining_date: m.joining_date,
      employment_status: m.employment_status,
      notes: m.notes || '',
    });
    setIsAddOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone || !formData.email) {
      alert('Full name, phone, and email are required.');
      return;
    }

    if (editingMember) {
      db.updateTeamMember(editingMember.id, formData);
    } else {
      db.addTeamMember({
        ...formData,
        salary_type: 'MONTHLY',
        payment_schedule: '1st of month',
        skills: ['Web Development', 'Client Engineering'],
      });
    }

    setIsAddOpen(false);
  };

  const formatINR = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Team Directory & Workload</h2>
          <p className="text-xs text-zinc-400">
            Engineers, designers, managers, compensation structures, and live capacity tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold bg-[#E52D27] hover:bg-[#c92520] text-white rounded flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
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
            placeholder="Search team members by name, ID, role, department..."
            className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Roles ({team.length})</option>
          {availableRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Team Members Grid Cards (Section 18 Workload indicators) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-8 text-center text-zinc-500 text-xs bg-[#121316] border border-white/[0.08] rounded-lg">
            No team members found.
          </div>
        ) : (
          filtered.map((member) => {
            const workload = db.getTeamMemberWorkload(member.id);
            return (
              <div
                key={member.id}
                className="bg-[#121316] border border-white/[0.08] hover:border-white/20 p-4 rounded-lg flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] text-zinc-500">{member.employee_id}</span>
                      <h3 className="font-bold text-white text-sm mt-0.5">{member.full_name}</h3>
                      <div className="text-xs text-[#E52D27] font-medium">{member.role}</div>
                      <div className="text-[11px] text-zinc-500">{member.department}</div>
                    </div>
                    <StatusBadge status={workload.availability} />
                  </div>

                  {/* Workload Matrix */}
                  <div className="mt-3.5 pt-3 border-t border-white/[0.06] grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-zinc-900/60 rounded">
                      <div className="text-[10px] text-zinc-500 font-mono">Tasks</div>
                      <div className="text-sm font-bold font-mono text-white tabular-nums">
                        {workload.pendingTasks}
                      </div>
                    </div>
                    <div className="p-2 bg-zinc-900/60 rounded">
                      <div className="text-[10px] text-zinc-500 font-mono">Projects</div>
                      <div className="text-sm font-bold font-mono text-white tabular-nums">
                        {workload.currentProjects}
                      </div>
                    </div>
                    <div className="p-2 bg-zinc-900/60 rounded">
                      <div className="text-[10px] text-zinc-500 font-mono">Completed</div>
                      <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                        {workload.completedTasks}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs space-y-1 text-zinc-400">
                    <div className="flex justify-between">
                      <span>Monthly Salary:</span>
                      <span className="font-mono text-white font-semibold">
                        {formatINR(member.monthly_salary)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Joining Date:</span>
                      <span className="font-mono text-zinc-300">{member.joining_date}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedProfile(member)}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Member Dossier</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded"
                      title="Edit Member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(member)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded"
                      title="Deactivate / Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SECTION 20: TEAM MEMBER DOSSIER MODAL */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setSelectedProfile(null)} />
          <div className="relative w-full max-w-3xl bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                    {selectedProfile.employee_id}
                  </span>
                  <StatusBadge status={selectedProfile.employment_status} />
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">{selectedProfile.full_name}</h3>
                <div className="text-xs text-[#E52D27] font-medium">
                  {selectedProfile.role} · {selectedProfile.department}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#191a1d] rounded">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Contact</span>
                  <div className="mt-1 font-mono text-white">{selectedProfile.phone}</div>
                  <div className="text-zinc-400">{selectedProfile.email}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Compensation</span>
                  <div className="mt-1 font-mono text-emerald-400 font-bold text-sm">
                    {formatINR(selectedProfile.monthly_salary)} / month
                  </div>
                  <div className="text-zinc-500">Joined: {selectedProfile.joining_date}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Capacity</span>
                  <div className="mt-1">
                    <StatusBadge status={db.getTeamMemberWorkload(selectedProfile.id).availability} />
                  </div>
                  <div className="text-zinc-500 mt-1">
                    {selectedProfile.notes || 'Full-time agency staff'}
                  </div>
                </div>
              </div>

              {/* Tasks currently assigned */}
              <div>
                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#E52D27]" />
                  <span>Tasks Assigned to {selectedProfile.full_name}</span>
                </h4>
                <div className="space-y-1.5">
                  {tasks.filter((t) => t.assigned_to === selectedProfile.id).length === 0 ? (
                    <div className="p-3 bg-zinc-900/50 rounded text-zinc-500">
                      No active tasks currently assigned.
                    </div>
                  ) : (
                    tasks
                      .filter((t) => t.assigned_to === selectedProfile.id)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 bg-zinc-900/80 border border-white/[0.04] rounded flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono text-zinc-400 text-[10px] mr-2">
                              {t.task_code}
                            </span>
                            <span className="font-medium text-white">{t.task_name}</span>
                            <span className="text-zinc-500 text-[10px] ml-2 font-mono">
                              (Due: {t.due_date})
                            </span>
                          </div>
                          <StatusBadge status={t.status} />
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Salary Payment History */}
              <div>
                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Salary Disbursement History</span>
                </h4>
                <div className="space-y-1.5">
                  {salaryRecords.filter((s) => s.employee_id === selectedProfile.id).length === 0 ? (
                    <div className="p-3 bg-zinc-900/50 rounded text-zinc-500">
                      No monthly payroll records generated yet.
                    </div>
                  ) : (
                    salaryRecords
                      .filter((s) => s.employee_id === selectedProfile.id)
                      .map((s) => (
                        <div
                          key={s.id}
                          className="p-2.5 bg-zinc-900/80 border border-white/[0.04] rounded flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-white">
                              {s.month} {s.year}
                            </span>
                            <span className="text-zinc-400 font-mono ml-2">
                              Base: {formatINR(s.salary_amount)} · Final: {formatINR(s.final_salary)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-zinc-300">
                              Paid: {formatINR(s.amount_paid)}
                            </span>
                            <StatusBadge status={s.payment_status} />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-1.5 rounded bg-zinc-800 text-zinc-200 hover:text-white text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">
                {editingMember ? `Edit Member (${editingMember.employee_id})` : 'Add Team Member'}
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
                  <label className="block text-zinc-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Vikram Joshi"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Designation / Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.monthly_salary}
                    onChange={(e) => setFormData({ ...formData, monthly_salary: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
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
                  <label className="block text-zinc-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="member@finexweb.com"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joining_date}
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Status</label>
                  <select
                    value={formData.employment_status}
                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value as EmploymentStatus })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="TERMINATED">TERMINATED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Notes / Skills</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Primary tech stack, certifications..."
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
                  Save Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Remove Team Member?"
          message={`Are you sure you want to remove ${deleteTarget.full_name} (${deleteTarget.employee_id}) from active agency personnel?`}
          confirmLabel="Remove Member"
          isDanger={true}
          onConfirm={() => {
            db.deleteTeamMember(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
