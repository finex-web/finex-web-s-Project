import React, { useState } from 'react';
import { db } from '../../lib/db';
import { Project, ProjectStatus, PlanType } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Plus,
  Search,
  Briefcase,
  KanbanSquare,
  List,
  Calendar,
  ExternalLink,
  Users,
  CheckSquare,
  Wrench,
  Edit2,
  Trash2,
  Eye,
  X,
  ChevronRight,
  ArrowRight,
  Code,
  Globe,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface ProjectsViewProps {
  initialViewMode?: 'list' | 'kanban';
  initialProjectId?: string;
  onNavigateToClient?: (clientId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  initialViewMode = 'list',
  initialProjectId,
  onNavigateToClient,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(initialViewMode);
  const projects = db.getProjects();
  const clients = db.getClients();
  const team = db.getTeamMembers();
  const projectMembers = db.getProjectMembers();
  const tasks = db.getTasks();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(
    initialProjectId ? projects.find((p) => p.id === initialProjectId) || null : null
  );

  // New Project Form state
  const [formData, setFormData] = useState({
    business_name: '',
    client_name: '',
    client_id: '',
    plan: 'BUSINESS' as PlanType,
    project_price: 19999,
    start_date: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'NEW PROJECT' as ProjectStatus,
    progress: 10,
    website_url: '',
    domain: '',
    hosting_provider: 'Hostinger Cloud',
    maintenance_fee: 1499,
    maintenance_status: 'NOT STARTED' as Project['maintenance_status'],
    notes: '',
  });

  // Assign member state inside detail
  const [assignMemberId, setAssignMemberId] = useState('');
  const [assignRole, setAssignRole] = useState('Frontend Developer');

  const kanbanStages: ProjectStatus[] = [
    'NEW PROJECT',
    'REQUIREMENTS',
    'DESIGN',
    'DEVELOPMENT',
    'INTERNAL TESTING',
    'CLIENT REVIEW',
    'CHANGES',
    'FINAL APPROVAL',
    'DEPLOYMENT',
    'COMPLETED',
    'MAINTENANCE',
  ];

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.business_name.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name.toLowerCase().includes(search.toLowerCase()) ||
      p.project_code.toLowerCase().includes(search.toLowerCase()) ||
      (p.domain && p.domain.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      business_name: '',
      client_name: '',
      client_id: '',
      plan: 'BUSINESS',
      project_price: 19999,
      start_date: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'NEW PROJECT',
      progress: 10,
      website_url: '',
      domain: '',
      hosting_provider: 'Hostinger Cloud',
      maintenance_fee: 1499,
      maintenance_status: 'NOT STARTED',
      notes: '',
    });
    setIsAddOpen(true);
  };

  const handleClientSelect = (clientId: string) => {
    const cl = clients.find((c) => c.id === clientId);
    if (cl) {
      setFormData({
        ...formData,
        client_id: cl.id,
        client_name: cl.client_name,
        business_name: cl.business_name,
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.business_name || !formData.client_name) {
      alert('Business and client name are required.');
      return;
    }

    if (editingProject) {
      db.updateProject(editingProject.id, formData);
    } else {
      db.addProject({
        ...formData,
      });
    }

    setIsAddOpen(false);
  };

  const handleStageAdvance = (project: Project, newStage: ProjectStatus) => {
    db.updateProjectStatus(project.id, newStage);
    if (detailProject && detailProject.id === project.id) {
      setDetailProject({ ...detailProject, status: newStage });
    }
  };

  const handleAssignTeamMember = (projectId: string) => {
    if (!assignMemberId) return;
    db.assignTeamMemberToProject(projectId, assignMemberId, assignRole);
    setAssignMemberId('');
  };

  const formatINR = (v: number) => `₹${v.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Project Management & Workflow</h2>
          <p className="text-xs text-zinc-400">
            Full 11-stage delivery lifecycle from requirements, design, sprints, QA, deployment, to maintenance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View toggle */}
          <div className="bg-[#18191c] p-0.5 rounded border border-white/10 flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 text-xs rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 text-xs font-semibold bg-[#E52D27] hover:bg-[#c92520] text-white rounded flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121316] border border-white/[0.08] p-3 rounded-lg flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by code, business, client, domain..."
            className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden"
        >
          <option value="ALL">All Stages ({projects.length})</option>
          {kanbanStages.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* =========================================================
          VIEW MODE 1: LIST VIEW
         ========================================================= */}
      {viewMode === 'list' && (
        <div className="bg-[#121316] border border-white/[0.08] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#18191c] border-b border-white/[0.08] text-[11px] font-mono uppercase text-zinc-400">
                  <th className="py-2.5 px-3">Project ID</th>
                  <th className="py-2.5 px-3">Business & Client</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Stage & Status</th>
                  <th className="py-2.5 px-3">Progress</th>
                  <th className="py-2.5 px-3">Deadline</th>
                  <th className="py-2.5 px-3">Domain / URL</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500">
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((proj) => (
                    <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-sky-400">
                        {proj.project_code}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{proj.business_name}</div>
                        <div className="text-[11px] text-zinc-400">{proj.client_name}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-zinc-300">
                        <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">
                          {proj.plan}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={proj.status} />
                      </td>

                      <td className="py-3 px-3 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#E52D27] h-full rounded-full"
                              style={{ width: `${proj.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-zinc-400 tabular-nums">
                            {proj.progress}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-zinc-300">
                        {proj.deadline}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-zinc-400">
                        {proj.domain || proj.website_url || '—'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailProject(proj)}
                            className="p-1.5 text-sky-400 hover:bg-sky-950/40 rounded transition-colors"
                            title="Open Project Hub"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProject(proj);
                              setFormData({
                                business_name: proj.business_name,
                                client_name: proj.client_name,
                                client_id: proj.client_id,
                                plan: proj.plan,
                                project_price: proj.project_price || 19999,
                                start_date: proj.start_date,
                                deadline: proj.deadline,
                                status: proj.status,
                                progress: proj.progress,
                                website_url: proj.website_url || '',
                                domain: proj.domain || '',
                                hosting_provider: proj.hosting_provider || '',
                                maintenance_fee: proj.maintenance_fee || 1499,
                                maintenance_status: proj.maintenance_status,
                                notes: proj.notes || '',
                              });
                              setIsAddOpen(true);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded"
                            title="Edit Project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(proj)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded"
                            title="Delete Project"
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
      )}

      {/* =========================================================
          VIEW MODE 2: KANBAN WORKFLOW BOARD (11 STAGES)
         ========================================================= */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="inline-flex gap-3 min-w-full">
            {kanbanStages.map((stage, sIdx) => {
              const stageProjects = projects.filter((p) => p.status === stage);
              return (
                <div
                  key={stage}
                  className="w-72 bg-[#121316] border border-white/[0.08] rounded-lg p-3 shrink-0 flex flex-col max-h-[750px]"
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-zinc-400">
                        {String(sIdx + 1).padStart(2, '0')}
                      </span>
                      <h4 className="text-xs font-semibold text-white tracking-tight">{stage}</h4>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">
                      {stageProjects.length}
                    </span>
                  </div>

                  {/* Cards container */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                    {stageProjects.length === 0 ? (
                      <div className="py-6 text-center text-[11px] text-zinc-400">
                        No projects in this stage.
                      </div>
                    ) : (
                      stageProjects.map((proj) => (
                        <div
                          key={proj.id}
                          className="bg-[#18191c] border border-white/[0.06] hover:border-white/20 p-3 rounded-md transition-all shadow-xs"
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-mono text-sky-400">{proj.project_code}</span>
                            <span className="text-zinc-500 font-mono text-[10px]">
                              {proj.plan}
                            </span>
                          </div>

                          <h5
                            onClick={() => setDetailProject(proj)}
                            className="font-bold text-white text-xs hover:text-[#E52D27] cursor-pointer transition-colors"
                          >
                            {proj.business_name}
                          </h5>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            {proj.client_name}
                          </div>

                          {/* Progress bar */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#E52D27] h-full rounded-full"
                                style={{ width: `${proj.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {proj.progress}%
                            </span>
                          </div>

                          <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-zinc-500">
                            <span>Due: {proj.deadline}</span>

                            {/* Move forward trigger */}
                            {sIdx < kanbanStages.length - 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStageAdvance(proj, kanbanStages[sIdx + 1])
                                }
                                className="text-zinc-400 hover:text-white flex items-center gap-0.5"
                                title={`Move to ${kanbanStages[sIdx + 1]}`}
                              >
                                <span>Next</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 15: PROJECT DETAILS VIEW / WORKSPACE MODAL
         ========================================================= */}
      {detailProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setDetailProject(null)} />
          <div className="relative w-full max-w-4xl bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-sky-400 px-2 py-0.5 bg-sky-950/40 border border-sky-800/40 rounded">
                    {detailProject.project_code}
                  </span>
                  <StatusBadge status={detailProject.status} />
                  <span className="text-xs font-mono text-zinc-400">
                    Plan: {detailProject.plan}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">
                  {detailProject.business_name}
                </h3>
                <div className="text-xs text-zinc-400">
                  Client: {detailProject.client_name} · Deadline: {detailProject.deadline}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailProject(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-6 text-xs">
              {/* Stage transition bar */}
              <div className="p-3 bg-[#191a1d] rounded border border-white/[0.04]">
                <div className="text-[10px] font-mono text-zinc-500 uppercase mb-2">
                  Workflow Stage Navigation:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {kanbanStages.map((stage) => {
                    const isCurrent = detailProject.status === stage;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => handleStageAdvance(detailProject, stage)}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                          isCurrent
                            ? 'bg-[#E52D27] text-white font-bold'
                            : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700'
                        }`}
                      >
                        {stage}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid: Production Info & Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#191a1d] rounded border border-white/[0.04] space-y-2">
                  <h4 className="text-xs font-semibold text-white">Project Infrastructure</h4>
                  <div className="flex justify-between text-zinc-400">
                    <span>Domain:</span>
                    <span className="text-white font-mono">{detailProject.domain || 'Not configured'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Live Website:</span>
                    <span className="text-sky-400 font-mono">
                      {detailProject.website_url ? (
                        <a href={detailProject.website_url} target="_blank" rel="noreferrer" className="underline">
                          {detailProject.website_url}
                        </a>
                      ) : (
                        'Pending deployment'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Hosting Environment:</span>
                    <span className="text-white">{detailProject.hosting_provider || 'Cloud'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Maintenance Fee:</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      {formatINR(detailProject.maintenance_fee || 1499)}/month
                    </span>
                  </div>
                </div>

                {/* Team Assigned */}
                <div className="p-3.5 bg-[#191a1d] rounded border border-white/[0.04]">
                  <h4 className="text-xs font-semibold text-white mb-2">Assigned Personnel</h4>
                  <div className="space-y-1.5 mb-3">
                    {projectMembers.filter((pm) => pm.project_id === detailProject.id).length === 0 ? (
                      <div className="text-zinc-500 text-[11px]">No team members assigned yet.</div>
                    ) : (
                      projectMembers
                        .filter((pm) => pm.project_id === detailProject.id)
                        .map((pm) => (
                          <div
                            key={pm.id}
                            className="flex items-center justify-between p-1.5 bg-zinc-900 rounded"
                          >
                            <span className="text-white font-medium">{pm.member_name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">{pm.role}</span>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Add member inline */}
                  <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                    <select
                      value={assignMemberId}
                      onChange={(e) => setAssignMemberId(e.target.value)}
                      className="flex-1 h-7 px-2 bg-zinc-900 border border-white/10 rounded text-zinc-200 text-[11px]"
                    >
                      <option value="">-- Assign Team Member --</option>
                      {team.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.full_name} ({t.role})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAssignTeamMember(detailProject.id)}
                      className="px-2.5 py-1 bg-[#E52D27] text-white text-[11px] font-semibold rounded hover:bg-[#c92520]"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>

              {/* Tasks linked to this project */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-[#E52D27]" />
                    <span>Sprint & Quality Deliverables</span>
                  </h4>
                </div>

                <div className="space-y-1.5">
                  {tasks.filter((t) => t.project_id === detailProject.id).length === 0 ? (
                    <div className="p-3 bg-zinc-900/50 rounded text-zinc-500">
                      No deliverables generated yet.
                    </div>
                  ) : (
                    tasks
                      .filter((t) => t.project_id === detailProject.id)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 bg-zinc-900/80 border border-white/[0.04] rounded flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-zinc-400 text-[10px]">
                              {t.task_code}
                            </span>
                            <span className="text-white font-medium">{t.task_name}</span>
                            {t.assigned_name && (
                              <span className="text-zinc-500 text-[10px]">
                                · Assigned to {t.assigned_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={t.status} />
                            {t.status !== 'COMPLETED' && (
                              <button
                                type="button"
                                onClick={() => db.updateTaskStatus(t.id, 'COMPLETED')}
                                className="text-emerald-400 hover:text-emerald-300 text-[10px] font-mono underline"
                              >
                                Mark Done
                              </button>
                            )}
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
                onClick={() => setDetailProject(null)}
                className="px-4 py-1.5 rounded bg-zinc-800 text-zinc-200 hover:text-white text-xs"
              >
                Close Project Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#141518] border border-white/10 rounded-lg shadow-2xl p-5 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">
                {editingProject ? `Edit Project (${editingProject.project_code})` : 'Create Agency Project'}
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
              {/* Select Client */}
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">
                  Assign to Client Account
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-zinc-200"
                >
                  <option value="">-- Choose Existing Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.client_code} - {c.business_name} ({c.client_name})
                    </option>
                  ))}
                </select>
              </div>

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
                  <label className="block text-zinc-300 mb-1">Client Contact Name *</label>
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
                  <label className="block text-zinc-300 mb-1">Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value as PlanType })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    <option value="STARTER">Starter Plan</option>
                    <option value="BUSINESS">Business Plan</option>
                    <option value="PREMIUM">Premium Plan</option>
                    <option value="CUSTOM">Custom Plan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Initial Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white"
                  >
                    {kanbanStages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Delivery Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full h-8 px-2 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Domain Name</label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="e.g. apexhospital.com"
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Monthly Maintenance Fee (₹)</label>
                  <input
                    type="number"
                    value={formData.maintenance_fee}
                    onChange={(e) => setFormData({ ...formData, maintenance_fee: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Staging / Production URL</label>
                <input
                  type="text"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full h-8 px-2.5 bg-[#1a1b1f] border border-white/10 rounded text-white font-mono"
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
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Delete Project?"
          message={`Are you sure you want to delete project ${deleteTarget.project_code} (${deleteTarget.business_name})?`}
          confirmLabel="Delete Project"
          isDanger={true}
          onConfirm={() => {
            db.deleteProject(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
