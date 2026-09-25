import React, { useState } from 'react';
import { db } from '../../lib/db';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Plus,
  Search,
  CheckSquare,
  Clock,
  User,
  AlertTriangle,
  Briefcase,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const TasksView: React.FC = () => {
  const tasks = db.getTasks();
  const projects = db.getProjects();
  const team = db.getTeamMembers();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [memberFilter, setMemberFilter] = useState<string>('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    project_id: '',
    project_name: '',
    task_name: '',
    assigned_to: '',
    priority: 'MEDIUM' as TaskPriority,
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'TODO' as TaskStatus,
    notes: '',
  });

  const priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const statuses: TaskStatus[] = ['TODO', 'IN PROGRESS', 'IN REVIEW', 'COMPLETED'];

  const filtered = tasks.filter((t) => {
    const matchesSearch =
      t.task_name.toLowerCase().includes(search.toLowerCase()) ||
      t.task_code.toLowerCase().includes(search.toLowerCase()) ||
      (t.assigned_name && t.assigned_name.toLowerCase().includes(search.toLowerCase())) ||
      (t.project_name && t.project_name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesMember = memberFilter === 'ALL' || t.assigned_to === memberFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesMember;
  });

  const handleProjectSelect = (projId: string) => {
    const p = projects.find((x) => x.id === projId);
    if (p) {
      setFormData({
        ...formData,
        project_id: p.id,
        project_name: p.business_name,
      });
    }
  };

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData({
      project_id: projects[0]?.id || '',
      project_name: projects[0]?.business_name || '',
      task_name: '',
      assigned_to: team[0]?.id || '',
      priority: 'MEDIUM',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'TODO',
      notes: '',
    });
    setIsAddOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.task_name) {
      alert('Please enter a task title.');
      return;
    }

    if (editingTask) {
      db.updateTask(editingTask.id, formData);
    } else {
      db.addTask(formData);
    }

    setIsAddOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Task Allocations & Review</h2>
          <p className="text-xs text-zinc-400">
            Sprint tickets, QA test runs, priority escalations, and technical review approvals.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold bg-[#E52D27] hover:bg-[#c92520] text-white rounded flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Task Ticket</span>
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
            placeholder="Search tasks by title, code, developer, project..."
            className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Statuses ({tasks.length})</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Priorities</option>
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p} Priority
            </option>
          ))}
        </select>

        <select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Assignees</option>
          {team.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Tasks Table */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#18191c] border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                <th className="py-2.5 px-3">Task ID</th>
                <th className="py-2.5 px-3">Deliverable & Project</th>
                <th className="py-2.5 px-3">Assignee</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-amber-400">
                      {t.task_code}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{t.task_name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {t.project_name || 'General Agency'}
                      </div>
                      {t.notes && (
                        <div className="text-[10px] text-zinc-500 truncate max-w-xs mt-0.5">
                          {t.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-zinc-200">{t.assigned_name || 'Unassigned'}</div>
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={t.priority} />
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-300">
                      {t.due_date}
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={t.status} />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Status advancement buttons */}
                        {t.status === 'TODO' && (
                          <button
                            type="button"
                            onClick={() => db.updateTaskStatus(t.id, 'IN PROGRESS')}
                            className="px-2 py-0.5 bg-sky-950/50 text-sky-400 border border-sky-800/40 rounded text-[11px] hover:bg-sky-900/50"
                          >
                            Start Sprint
                          </button>
                        )}
                        {t.status === 'IN PROGRESS' && (
                          <button
                            type="button"
                            onClick={() => db.updateTaskStatus(t.id, 'IN REVIEW')}
                            className="px-2 py-0.5 bg-amber-950/50 text-amber-400 border border-amber-800/40 rounded text-[11px] hover:bg-amber-900/50"
                          >
                            Submit Review
                          </button>
                        )}
                        {t.status === 'IN REVIEW' && (
                          <button
                            type="button"
                            onClick={() => db.updateTaskStatus(t.id, 'COMPLETED')}
                            className="px-2 py-0.5 bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 rounded text-[11px] hover:bg-emerald-900/50"
                          >
                            Approve & Close
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setEditingTask(t);
                            setFormData({
                              project_id: t.project_id || '',
                              project_name: t.project_name || '',
                              task_name: t.task_name,
                              assigned_to: t.assigned_to || '',
                              priority: t.priority,
                              due_date: t.due_date,
                              status: t.status,
                              notes: t.notes || '',
                            });
                            setIsAddOpen(true);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-white rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(t)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 rounded"
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

      {/* Add / Edit Task Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">
                {editingTask ? `Edit Task (${editingTask.task_code})` : 'Create Task Deliverable'}
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
              <div>
                <label className="block text-zinc-300 mb-1">Associate Project</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                >
                  <option value="">-- General Agency Task --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.project_code} - {p.business_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Task Title / Deliverable *</label>
                <input
                  type="text"
                  required
                  value={formData.task_name}
                  onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                  placeholder="e.g. Implement payment gateway webhook & receipt email"
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Assign Team Member</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    <option value="">-- Unassigned --</option>
                    {team.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>
                        {p} Priority
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
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
                <label className="block text-zinc-300 mb-1">Technical Notes / Specs</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Acceptance criteria, API doc references..."
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Delete Task?"
          message={`Are you sure you want to delete task ${deleteTarget.task_code}: "${deleteTarget.task_name}"?`}
          confirmLabel="Delete Task"
          isDanger={true}
          onConfirm={() => {
            db.deleteTask(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
