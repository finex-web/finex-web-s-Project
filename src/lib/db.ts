import {
  Client,
  Lead,
  Call,
  Requirement,
  Quote,
  Project,
  Task,
  TeamMember,
  ProjectMember,
  Payment,
  Maintenance,
  HostingRecord,
  DomainRecord,
  Followup,
  SalaryRecord,
  SalaryPayment,
  Expense,
  ActivityLog,
  AppNotification,
  AgencySettings,
  DashboardStats,
  PlanType,
  PaymentMethod,
  ProjectStatus,
  TaskStatus,
} from '../types';

import {
  INITIAL_SETTINGS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_CLIENTS,
  INITIAL_LEADS,
  INITIAL_CALLS,
  INITIAL_REQUIREMENTS,
  INITIAL_QUOTES,
  INITIAL_PROJECTS,
  INITIAL_PROJECT_MEMBERS,
  INITIAL_TASKS,
  INITIAL_PAYMENTS,
  INITIAL_MAINTENANCE,
  INITIAL_HOSTING,
  INITIAL_DOMAINS,
  INITIAL_FOLLOWUPS,
  INITIAL_SALARY_RECORDS,
  INITIAL_SALARY_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_ACTIVITY_LOGS,
} from './initialData';

import { getSupabase } from './supabase';

const STORAGE_KEY = 'finex_web_crm_db_v1';

interface DBState {
  settings: AgencySettings;
  teamMembers: TeamMember[];
  clients: Client[];
  leads: Lead[];
  calls: Call[];
  requirements: Requirement[];
  quotes: Quote[];
  projects: Project[];
  projectMembers: ProjectMember[];
  tasks: Task[];
  payments: Payment[];
  maintenance: Maintenance[];
  hosting: HostingRecord[];
  domains: DomainRecord[];
  followups: Followup[];
  salaryRecords: SalaryRecord[];
  salaryPayments: SalaryPayment[];
  expenses: Expense[];
  activityLogs: ActivityLog[];
}

function loadState(): DBState {
  if (typeof window === 'undefined') {
    return getInitialState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...getInitialState(),
        ...parsed,
      };
    }
  } catch (e) {
    console.error('Error reading localStorage DB:', e);
  }
  return getInitialState();
}

function getInitialState(): DBState {
  return {
    settings: INITIAL_SETTINGS,
    teamMembers: INITIAL_TEAM_MEMBERS,
    clients: INITIAL_CLIENTS,
    leads: INITIAL_LEADS,
    calls: INITIAL_CALLS,
    requirements: INITIAL_REQUIREMENTS,
    quotes: INITIAL_QUOTES,
    projects: INITIAL_PROJECTS,
    projectMembers: INITIAL_PROJECT_MEMBERS,
    tasks: INITIAL_TASKS,
    payments: INITIAL_PAYMENTS,
    maintenance: INITIAL_MAINTENANCE,
    hosting: INITIAL_HOSTING,
    domains: INITIAL_DOMAINS,
    followups: INITIAL_FOLLOWUPS,
    salaryRecords: INITIAL_SALARY_RECORDS,
    salaryPayments: INITIAL_SALARY_PAYMENTS,
    expenses: INITIAL_EXPENSES,
    activityLogs: INITIAL_ACTIVITY_LOGS,
  };
}

class DatabaseManager {
  private state: DBState = loadState();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.saveState();
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to persist DB state:', e);
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Activity Logger
  public logActivity(action: string, related_record: string, description: string) {
    const now = new Date();
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      admin_name: 'FINEX Admin',
      action,
      related_record,
      description,
      created_at: now.toISOString(),
    };
    this.state.activityLogs = [newLog, ...this.state.activityLogs].slice(0, 100);

    // If Supabase is connected, attempt sync asynchronously
    const sb = getSupabase();
    if (sb) {
      sb.from('activity_logs').insert([newLog]).then();
    }

    this.saveState();
  }

  // Getters
  public getSettings() {
    return this.state.settings;
  }
  public getTeamMembers() {
    return this.state.teamMembers;
  }
  public getClients() {
    return this.state.clients;
  }
  public getLeads() {
    return this.state.leads;
  }
  public getCalls() {
    return this.state.calls;
  }
  public getRequirements() {
    return this.state.requirements;
  }
  public getQuotes() {
    return this.state.quotes;
  }
  public getProjects() {
    return this.state.projects;
  }
  public getProjectMembers() {
    return this.state.projectMembers;
  }
  public getTasks() {
    return this.state.tasks;
  }
  public getPayments() {
    return this.state.payments;
  }
  public getMaintenance() {
    return this.state.maintenance;
  }
  public getHosting() {
    return this.state.hosting;
  }
  public getDomains() {
    return this.state.domains;
  }
  public getFollowups() {
    return this.state.followups;
  }
  public getSalaryRecords() {
    return this.state.salaryRecords;
  }
  public getSalaryPayments() {
    return this.state.salaryPayments;
  }
  public getExpenses() {
    return this.state.expenses;
  }
  public getActivityLogs() {
    return this.state.activityLogs;
  }

  // -------------------------------------------------------------
  // LEADS
  // -------------------------------------------------------------
  public addLead(lead: Omit<Lead, 'id' | 'lead_code' | 'created_at' | 'updated_at'>) {
    const code = `LD-${100 + this.state.leads.length + 1}`;
    const newLead: Lead = {
      ...lead,
      id: `ld-${Date.now()}`,
      lead_code: code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.leads = [newLead, ...this.state.leads];
    this.logActivity('Lead Created', `${code} (${newLead.business_name})`, `Added lead for ${newLead.client_name}`);
    this.saveState();

    const sb = getSupabase();
    if (sb) sb.from('leads').insert([newLead]).then();
    return newLead;
  }

  public updateLead(id: string, updates: Partial<Lead>) {
    this.state.leads = this.state.leads.map((l) =>
      l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
    );
    const updated = this.state.leads.find((l) => l.id === id);
    if (updated) {
      this.logActivity('Lead Updated', `${updated.lead_code}`, `Updated details for ${updated.business_name}`);
      const sb = getSupabase();
      if (sb) sb.from('leads').update(updates).eq('id', id).then();
    }
    this.saveState();
  }

  public deleteLead(id: string) {
    const target = this.state.leads.find((l) => l.id === id);
    if (target) {
      this.state.leads = this.state.leads.filter((l) => l.id !== id);
      this.logActivity('Lead Deleted', `${target.lead_code}`, `Removed lead ${target.business_name}`);
      const sb = getSupabase();
      if (sb) sb.from('leads').delete().eq('id', id).then();
      this.saveState();
    }
  }

  public convertLeadToClient(leadId: string) {
    const lead = this.state.leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const clientCode = `CL-${100 + this.state.clients.length + 1}`;
    const newClient: Client = {
      id: `cl-${Date.now()}`,
      client_code: clientCode,
      client_name: lead.client_name,
      business_name: lead.business_name,
      phone: lead.phone,
      whatsapp: lead.whatsapp || lead.phone,
      email: lead.email,
      city: lead.city,
      address: '',
      business_category: lead.business_category,
      lead_source: lead.lead_source,
      date_joined: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      notes: `Converted from Lead ${lead.lead_code}. ${lead.notes || ''}`,
      created_at: new Date().toISOString(),
    };

    this.state.clients = [newClient, ...this.state.clients];
    this.state.leads = this.state.leads.map((l) =>
      l.id === leadId ? { ...l, status: 'CONVERTED', updated_at: new Date().toISOString() } : l
    );

    this.logActivity(
      'Lead Converted to Client',
      `${lead.lead_code} → ${clientCode}`,
      `Lead ${lead.business_name} converted into permanent client ${newClient.client_name}`
    );
    this.saveState();

    const sb = getSupabase();
    if (sb) {
      sb.from('clients').insert([newClient]).then();
      sb.from('leads').update({ status: 'CONVERTED' }).eq('id', leadId).then();
    }
    return newClient;
  }

  // -------------------------------------------------------------
  // CALLS
  // -------------------------------------------------------------
  public addCall(call: Omit<Call, 'id' | 'created_at'>) {
    const newCall: Call = {
      ...call,
      id: `cl-call-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.state.calls = [newCall, ...this.state.calls];
    this.logActivity('Call Logged', `${newCall.contact_name}`, `Status: ${newCall.call_status}. Notes: ${newCall.notes || 'None'}`);

    if (newCall.next_followup) {
      this.addFollowup({
        lead_id: newCall.lead_id,
        client_id: newCall.client_id,
        client_name: newCall.contact_name,
        phone: newCall.phone,
        reason: `Follow-up from call: ${newCall.notes?.slice(0, 40) || 'Review proposal'}`,
        date: newCall.next_followup,
        time: '11:00 AM',
        notes: newCall.notes,
        status: 'PENDING',
      });
    }

    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('calls').insert([newCall]).then();
    return newCall;
  }

  // -------------------------------------------------------------
  // REQUIREMENTS
  // -------------------------------------------------------------
  public addRequirement(req: Omit<Requirement, 'id' | 'req_code' | 'created_at'>) {
    const code = `REQ-${100 + this.state.requirements.length + 1}`;
    const newReq: Requirement = {
      ...req,
      id: `req-${Date.now()}`,
      req_code: code,
      created_at: new Date().toISOString(),
    };
    this.state.requirements = [newReq, ...this.state.requirements];
    this.logActivity('Requirement Added', `${code}`, `Website specification for ${newReq.business_name}`);
    this.saveState();

    const sb = getSupabase();
    if (sb) sb.from('requirements').insert([newReq]).then();
    return newReq;
  }

  public updateRequirement(id: string, updates: Partial<Requirement>) {
    this.state.requirements = this.state.requirements.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    this.logActivity('Requirement Updated', id, `Updated requirement specs`);
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('requirements').update(updates).eq('id', id).then();
  }

  // -------------------------------------------------------------
  // QUOTES
  // -------------------------------------------------------------
  public addQuote(quote: Omit<Quote, 'id' | 'quote_code' | 'created_at'>) {
    const code = `QT-${500 + this.state.quotes.length + 1}`;
    const newQuote: Quote = {
      ...quote,
      id: `qt-${Date.now()}`,
      quote_code: code,
      created_at: new Date().toISOString(),
    };
    this.state.quotes = [newQuote, ...this.state.quotes];
    this.logActivity('Quote Created', `${code} (${newQuote.selected_plan})`, `Quote for ${newQuote.business_name} of ₹${newQuote.final_price.toLocaleString('en-IN')}`);
    this.saveState();

    const sb = getSupabase();
    if (sb) sb.from('quotes').insert([newQuote]).then();
    return newQuote;
  }

  public updateQuoteStatus(id: string, status: Quote['status']) {
    this.state.quotes = this.state.quotes.map((q) => (q.id === id ? { ...q, status } : q));
    const target = this.state.quotes.find((q) => q.id === id);
    if (target) {
      this.logActivity('Quote Status Changed', `${target.quote_code}`, `Marked as ${status}`);
    }
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('quotes').update({ status }).eq('id', id).then();
  }

  // -------------------------------------------------------------
  // CLIENTS
  // -------------------------------------------------------------
  public addClient(client: Omit<Client, 'id' | 'client_code' | 'created_at'>) {
    const code = `CL-${100 + this.state.clients.length + 1}`;
    const newClient: Client = {
      ...client,
      id: `cl-${Date.now()}`,
      client_code: code,
      created_at: new Date().toISOString(),
    };
    this.state.clients = [newClient, ...this.state.clients];
    this.logActivity('Client Created', `${code} (${newClient.business_name})`, `New client registered: ${newClient.client_name}`);
    this.saveState();

    const sb = getSupabase();
    if (sb) sb.from('clients').insert([newClient]).then();
    return newClient;
  }

  public updateClient(id: string, updates: Partial<Client>) {
    this.state.clients = this.state.clients.map((c) =>
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    );
    const target = this.state.clients.find((c) => c.id === id);
    if (target) {
      this.logActivity('Client Updated', `${target.client_code}`, `Updated profile for ${target.business_name}`);
    }
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('clients').update(updates).eq('id', id).then();
  }

  public deleteClient(id: string) {
    const target = this.state.clients.find((c) => c.id === id);
    if (target) {
      this.state.clients = this.state.clients.filter((c) => c.id !== id);
      this.logActivity('Client Archived', `${target.client_code}`, `Removed client ${target.business_name}`);
      this.saveState();
      const sb = getSupabase();
      if (sb) sb.from('clients').delete().eq('id', id).then();
    }
  }

  // -------------------------------------------------------------
  // PROJECTS & KANBAN
  // -------------------------------------------------------------
  public addProject(project: Omit<Project, 'id' | 'project_code' | 'created_at'>) {
    const code = `PRJ-${300 + this.state.projects.length + 1}`;
    const newProj: Project = {
      ...project,
      id: `prj-${Date.now()}`,
      project_code: code,
      created_at: new Date().toISOString(),
    };
    this.state.projects = [newProj, ...this.state.projects];
    this.logActivity('Project Created', `${code}`, `Initiated project for ${newProj.business_name} (${newProj.plan})`);

    // Auto-create default standard tasks for web agency workflow
    const defaultTaskNames = [
      'Requirements Finalization',
      'Figma UI/UX Design Mockups',
      'Homepage Development',
      'Responsive Mobile & Tablet Layout',
      'Contact Forms & WhatsApp Integration',
      'Cross Browser & Performance Testing',
      'Client Review & Revision Cycle',
      'Production Deployment & SSL Setup',
    ];

    defaultTaskNames.forEach((tName, idx) => {
      this.addTask({
        project_id: newProj.id,
        project_name: newProj.business_name,
        task_name: tName,
        priority: idx === 0 || idx === 1 ? 'HIGH' : 'MEDIUM',
        due_date: newProj.deadline,
        status: idx === 0 ? 'IN PROGRESS' : 'TODO',
        notes: `Default pipeline task for ${newProj.business_name}`,
      });
    });

    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('projects').insert([newProj]).then();
    return newProj;
  }

  public updateProjectStatus(id: string, status: ProjectStatus, progress?: number) {
    const current = this.state.projects.find((p) => p.id === id);
    if (!current) return;

    const newProgress =
      progress !== undefined
        ? progress
        : status === 'COMPLETED' || status === 'MAINTENANCE'
        ? 100
        : status === 'NEW PROJECT'
        ? 10
        : status === 'REQUIREMENTS'
        ? 20
        : status === 'DESIGN'
        ? 35
        : status === 'DEVELOPMENT'
        ? 65
        : status === 'INTERNAL TESTING'
        ? 80
        : status === 'CLIENT REVIEW'
        ? 85
        : status === 'CHANGES'
        ? 90
        : status === 'FINAL APPROVAL'
        ? 95
        : status === 'DEPLOYMENT'
        ? 98
        : current.progress;

    this.state.projects = this.state.projects.map((p) =>
      p.id === id
        ? {
            ...p,
            status,
            progress: newProgress,
            updated_at: new Date().toISOString(),
          }
        : p
    );

    this.logActivity(
      'Project Stage Changed',
      `${current.project_code} (${current.business_name})`,
      `Moved from ${current.status} to ${status}`
    );

    // If moved to MAINTENANCE and not already in maintenance table, auto-enroll
    if (status === 'MAINTENANCE' && !this.state.maintenance.some((m) => m.project_id === id)) {
      this.addMaintenance({
        client_id: current.client_id,
        client_name: current.client_name,
        project_id: current.id,
        project_name: current.business_name,
        plan: current.plan,
        monthly_fee: current.maintenance_fee || 999,
        start_date: new Date().toISOString().split('T')[0],
        next_due_date: this.calculateNextMonthDate(new Date()),
        payment_status: 'ACTIVE',
        status: 'ACTIVE',
        notes: `Auto-enrolled upon project completion`,
      });
    }

    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('projects').update({ status, progress: newProgress }).eq('id', id).then();
  }

  public updateProject(id: string, updates: Partial<Project>) {
    this.state.projects = this.state.projects.map((p) =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('projects').update(updates).eq('id', id).then();
  }

  public deleteProject(id: string) {
    const target = this.state.projects.find((p) => p.id === id);
    if (target) {
      this.state.projects = this.state.projects.filter((p) => p.id !== id);
      this.logActivity('Project Deleted', `${target.project_code}`, `Deleted ${target.business_name}`);
      this.saveState();
      const sb = getSupabase();
      if (sb) sb.from('projects').delete().eq('id', id).then();
    }
  }

  // Project Members Assignment
  public assignTeamMemberToProject(projectId: string, memberId: string, role: string) {
    const member = this.state.teamMembers.find((m) => m.id === memberId);
    if (!member) return;

    const exists = this.state.projectMembers.some(
      (pm) => pm.project_id === projectId && pm.team_member_id === memberId
    );
    if (exists) return;

    const newPm: ProjectMember = {
      id: `pm-${Date.now()}`,
      project_id: projectId,
      team_member_id: memberId,
      member_name: member.full_name,
      role,
      assigned_date: new Date().toISOString().split('T')[0],
      work_status: 'ACTIVE',
    };
    this.state.projectMembers = [...this.state.projectMembers, newPm];
    this.logActivity('Team Assigned to Project', member.full_name, `Assigned as ${role} to project`);
    this.saveState();

    const sb = getSupabase();
    if (sb) sb.from('project_members').insert([newPm]).then();
  }

  public removeTeamMemberFromProject(projectId: string, memberId: string) {
    this.state.projectMembers = this.state.projectMembers.filter(
      (pm) => !(pm.project_id === projectId && pm.team_member_id === memberId)
    );
    this.saveState();
    const sb = getSupabase();
    if (sb) {
      sb.from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('team_member_id', memberId)
        .then();
    }
  }

  // -------------------------------------------------------------
  // TASKS
  // -------------------------------------------------------------
  public addTask(task: Omit<Task, 'id' | 'task_code' | 'created_date'>) {
    const code = `TSK-${400 + this.state.tasks.length + 1}`;
    const assignedMember = task.assigned_to
      ? this.state.teamMembers.find((m) => m.id === task.assigned_to)
      : undefined;

    const newTask: Task = {
      ...task,
      id: `tsk-${Date.now()}`,
      task_code: code,
      assigned_name: assignedMember ? assignedMember.full_name : undefined,
      created_date: new Date().toISOString().split('T')[0],
    };
    this.state.tasks = [newTask, ...this.state.tasks];
    this.logActivity('Task Created', `${code}: ${newTask.task_name}`, `Assigned to ${newTask.assigned_name || 'Unassigned'}`);
    this.saveState();

    const sb = getSupabase();
    if (sb) sb.from('tasks').insert([newTask]).then();
    return newTask;
  }

  public updateTaskStatus(id: string, status: TaskStatus) {
    const current = this.state.tasks.find((t) => t.id === id);
    if (!current) return;

    const completed_date = status === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined;
    this.state.tasks = this.state.tasks.map((t) =>
      t.id === id ? { ...t, status, completed_date } : t
    );

    this.logActivity('Task Updated', `${current.task_code}`, `Status changed to ${status}`);
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('tasks').update({ status, completed_date }).eq('id', id).then();
  }

  public updateTask(id: string, updates: Partial<Task>) {
    if (updates.assigned_to) {
      const mem = this.state.teamMembers.find((m) => m.id === updates.assigned_to);
      if (mem) updates.assigned_name = mem.full_name;
    }
    this.state.tasks = this.state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('tasks').update(updates).eq('id', id).then();
  }

  public deleteTask(id: string) {
    this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('tasks').delete().eq('id', id).then();
  }

  // -------------------------------------------------------------
  // TEAM MEMBERS
  // -------------------------------------------------------------
  public addTeamMember(member: Omit<TeamMember, 'id' | 'employee_id' | 'created_at'>) {
    const code = `EMP-${String(this.state.teamMembers.length + 1).padStart(2, '0')}`;
    const newMember: TeamMember = {
      ...member,
      id: `tm-${Date.now()}`,
      employee_id: code,
      created_at: new Date().toISOString(),
    };
    this.state.teamMembers = [...this.state.teamMembers, newMember];
    this.logActivity('Team Member Added', `${code}: ${newMember.full_name}`, `Role: ${newMember.role}`);
    this.saveState();

    const sb = getSupabase();
    if (sb) sb.from('team_members').insert([newMember]).then();
    return newMember;
  }

  public updateTeamMember(id: string, updates: Partial<TeamMember>) {
    this.state.teamMembers = this.state.teamMembers.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('team_members').update(updates).eq('id', id).then();
  }

  public deleteTeamMember(id: string) {
    const target = this.state.teamMembers.find((m) => m.id === id);
    if (target) {
      this.state.teamMembers = this.state.teamMembers.filter((m) => m.id !== id);
      this.logActivity('Team Member Removed', `${target.employee_id}`, `Removed ${target.full_name}`);
      this.saveState();
      const sb = getSupabase();
      if (sb) sb.from('team_members').delete().eq('id', id).then();
    }
  }

  // -------------------------------------------------------------
  // SALARIES & MONTHLY SALARY TRACKING
  // Formula:
  // Final Salary = Salary + Bonus - Deduction - Advance
  // Pending = Final Salary - Amount Paid
  // -------------------------------------------------------------
  public generateMonthlySalaries(month: string, year: number) {
    const activeMembers = this.state.teamMembers.filter((m) => m.employment_status === 'ACTIVE');
    let generatedCount = 0;

    activeMembers.forEach((member) => {
      // Avoid duplicate salary record for same employee, month, year
      const exists = this.state.salaryRecords.some(
        (sr) => sr.employee_id === member.id && sr.month === month && sr.year === year
      );
      if (!exists) {
        const salary_amount = member.monthly_salary;
        const bonus = 0;
        const deduction = 0;
        const advance = 0;
        const final_salary = Math.max(0, salary_amount + bonus - deduction - advance);
        const amount_paid = 0;
        const amount_pending = final_salary;

        const record: SalaryRecord = {
          id: `sal-${Date.now()}-${member.id.slice(-4)}`,
          employee_id: member.id,
          employee_name: member.full_name,
          role: member.role,
          month,
          year,
          salary_amount,
          bonus,
          deduction,
          advance,
          final_salary,
          amount_paid,
          amount_pending,
          payment_status: 'PENDING',
          created_at: new Date().toISOString(),
        };
        this.state.salaryRecords = [record, ...this.state.salaryRecords];
        generatedCount++;

        const sb = getSupabase();
        if (sb) sb.from('salary_records').insert([record]).then();
      }
    });

    if (generatedCount > 0) {
      this.logActivity(
        'Salaries Generated',
        `${month} ${year}`,
        `Generated ${generatedCount} salary records for active staff`
      );
      this.saveState();
    }
    return generatedCount;
  }

  public updateSalaryRecord(
    id: string,
    updates: Partial<Pick<SalaryRecord, 'bonus' | 'deduction' | 'advance' | 'notes'>>
  ) {
    this.state.salaryRecords = this.state.salaryRecords.map((sr) => {
      if (sr.id === id) {
        const bonus = updates.bonus !== undefined ? updates.bonus : sr.bonus;
        const deduction = updates.deduction !== undefined ? updates.deduction : sr.deduction;
        const advance = updates.advance !== undefined ? updates.advance : sr.advance;
        const final_salary = Math.max(0, sr.salary_amount + bonus - deduction - advance);
        const amount_pending = Math.max(0, final_salary - sr.amount_paid);
        let payment_status: SalaryRecord['payment_status'] = sr.payment_status;

        if (amount_pending === 0 && final_salary > 0) {
          payment_status = 'PAID';
        } else if (sr.amount_paid > 0) {
          payment_status = 'PARTIALLY PAID';
        } else {
          payment_status = 'PENDING';
        }

        return {
          ...sr,
          ...updates,
          bonus,
          deduction,
          advance,
          final_salary,
          amount_pending,
          payment_status,
        };
      }
      return sr;
    });

    this.saveState();
    const sb = getSupabase();
    if (sb) {
      const updated = this.state.salaryRecords.find((s) => s.id === id);
      if (updated) sb.from('salary_records').update(updated).eq('id', id).then();
    }
  }

  public recordSalaryPayment(payment: {
    salary_record_id: string;
    amount_paid: number;
    payment_method: PaymentMethod;
    reference_id?: string;
    notes?: string;
  }) {
    const record = this.state.salaryRecords.find((r) => r.id === payment.salary_record_id);
    if (!record) return null;

    const newAmountPaid = record.amount_paid + payment.amount_paid;
    const newPending = Math.max(0, record.final_salary - newAmountPaid);
    const newStatus: SalaryRecord['payment_status'] =
      newPending === 0 ? 'PAID' : newAmountPaid > 0 ? 'PARTIALLY PAID' : 'PENDING';

    const paymentEntry: SalaryPayment = {
      id: `spay-${Date.now()}`,
      salary_record_id: record.id,
      employee_id: record.employee_id,
      employee_name: record.employee_name,
      amount_paid: payment.amount_paid,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: payment.payment_method,
      reference_id: payment.reference_id,
      notes: payment.notes,
      created_at: new Date().toISOString(),
    };

    this.state.salaryPayments = [paymentEntry, ...this.state.salaryPayments];

    this.state.salaryRecords = this.state.salaryRecords.map((r) =>
      r.id === record.id
        ? {
            ...r,
            amount_paid: newAmountPaid,
            amount_pending: newPending,
            payment_status: newStatus,
            payment_date: paymentEntry.payment_date,
            payment_method: paymentEntry.payment_method,
          }
        : r
    );

    this.logActivity(
      'Salary Disbursed',
      `${record.employee_name} (${record.month} ${record.year})`,
      `Paid ₹${payment.amount_paid.toLocaleString('en-IN')} via ${payment.payment_method}. Pending: ₹${newPending.toLocaleString('en-IN')}`
    );

    this.saveState();

    const sb = getSupabase();
    if (sb) {
      sb.from('salary_payments').insert([paymentEntry]).then();
      sb.from('salary_records')
        .update({
          amount_paid: newAmountPaid,
          amount_pending: newPending,
          payment_status: newStatus,
          payment_date: paymentEntry.payment_date,
          payment_method: paymentEntry.payment_method,
        })
        .eq('id', record.id)
        .then();
    }

    return paymentEntry;
  }

  // -------------------------------------------------------------
  // PAYMENTS (Client)
  // -------------------------------------------------------------
  public addPayment(payment: Omit<Payment, 'id' | 'payment_code' | 'created_at' | 'remaining'>) {
    const code = `PAY-${700 + this.state.payments.length + 1}`;
    const remaining = Math.max(0, payment.total_amount - payment.amount_received);
    const status: Payment['status'] =
      remaining === 0 ? 'PAID' : payment.amount_received > 0 ? 'PARTIAL' : 'UNPAID';

    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now()}`,
      payment_code: code,
      remaining,
      status,
      created_at: new Date().toISOString(),
    };
    this.state.payments = [newPayment, ...this.state.payments];
    this.logActivity(
      'Payment Recorded',
      `${code} (${newPayment.client_name})`,
      `Received ₹${newPayment.amount_received.toLocaleString('en-IN')} of ₹${newPayment.total_amount.toLocaleString('en-IN')}`
    );
    this.saveState();

    const sb = getSupabase();
    if (sb) sb.from('payments').insert([newPayment]).then();
    return newPayment;
  }

  public updatePayment(id: string, amount_received: number, payment_method: PaymentMethod, notes?: string) {
    const p = this.state.payments.find((x) => x.id === id);
    if (!p) return;

    const remaining = Math.max(0, p.total_amount - amount_received);
    const status: Payment['status'] = remaining === 0 ? 'PAID' : amount_received > 0 ? 'PARTIAL' : 'UNPAID';

    this.state.payments = this.state.payments.map((x) =>
      x.id === id
        ? {
            ...x,
            amount_received,
            remaining,
            status,
            payment_method,
            notes: notes || x.notes,
            payment_date: new Date().toISOString().split('T')[0],
          }
        : x
    );

    this.logActivity('Payment Updated', p.payment_code, `Updated received amount to ₹${amount_received.toLocaleString('en-IN')}`);
    this.saveState();
    const sb = getSupabase();
    if (sb) {
      sb.from('payments')
        .update({
          amount_received,
          remaining,
          status,
          payment_method,
          notes,
          payment_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', id)
        .then();
    }
  }

  // -------------------------------------------------------------
  // MAINTENANCE & BILLING CYCLES
  // -------------------------------------------------------------
  public addMaintenance(maint: Omit<Maintenance, 'id' | 'maintenance_code' | 'created_at'>) {
    const code = `MNT-${800 + this.state.maintenance.length + 1}`;
    const newMaint: Maintenance = {
      ...maint,
      id: `mnt-${Date.now()}`,
      maintenance_code: code,
      created_at: new Date().toISOString(),
    };
    this.state.maintenance = [newMaint, ...this.state.maintenance];
    this.logActivity(
      'Maintenance Contract Created',
      `${code} (${newMaint.project_name})`,
      `Fee: ₹${newMaint.monthly_fee.toLocaleString('en-IN')}/mo. Next due: ${newMaint.next_due_date}`
    );
    this.saveState();

    const sb = getSupabase();
    if (sb) sb.from('maintenance').insert([newMaint]).then();
    return newMaint;
  }

  public recordMaintenancePayment(id: string) {
    const current = this.state.maintenance.find((m) => m.id === id);
    if (!current) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextDate = this.calculateNextMonthDate(new Date(current.next_due_date));

    this.state.maintenance = this.state.maintenance.map((m) =>
      m.id === id
        ? {
            ...m,
            last_payment_date: todayStr,
            next_due_date: nextDate,
            payment_status: 'ACTIVE',
          }
        : m
    );

    this.logActivity(
      'Maintenance Paid & Cycle Advanced',
      `${current.maintenance_code} (${current.client_name})`,
      `Received ₹${current.monthly_fee.toLocaleString('en-IN')}. Next billing date moved to ${nextDate}`
    );

    this.saveState();
    const sb = getSupabase();
    if (sb) {
      sb.from('maintenance')
        .update({
          last_payment_date: todayStr,
          next_due_date: nextDate,
          payment_status: 'ACTIVE',
        })
        .eq('id', id)
        .then();
    }
  }

  public updateMaintenanceStatus(id: string, status: Maintenance['status'] | string) {
    this.state.maintenance = this.state.maintenance.map((m) => (m.id === id ? { ...m, status: status as any } : m));
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('maintenance').update({ status }).eq('id', id).then();
  }

  public addMaintenanceContract(contract: any) {
    const code = `MNT-${String(this.state.maintenance.length + 1).padStart(3, '0')}`;
    const newRecord: Maintenance = {
      ...contract,
      id: `mnt-${Date.now()}`,
      maintenance_code: code,
      plan: contract.plan || contract.plan_type || 'BUSINESS',
      status: 'ACTIVE',
      work_done_this_month: contract.work_done_this_month || [],
      created_at: new Date().toISOString(),
    };
    this.state.maintenance = [newRecord, ...this.state.maintenance];
    this.logActivity('Maintenance Contract Created', newRecord.maintenance_code, `Retainer for ${newRecord.client_name}`);
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('maintenance').insert([newRecord]).then();
    return newRecord;
  }

  public logMaintenanceWork(id: string, workItem: string) {
    this.state.maintenance = this.state.maintenance.map((m) => {
      if (m.id === id) {
        const currentLogs = m.work_done_this_month || [];
        return { ...m, work_done_this_month: [...currentLogs, workItem] };
      }
      return m;
    });
    this.saveState();
    const sb = getSupabase();
    if (sb) {
      const target = this.state.maintenance.find((m) => m.id === id);
      if (target) {
        sb.from('maintenance').update({ work_done_this_month: target.work_done_this_month }).eq('id', id).then();
      }
    }
  }

  private calculateNextMonthDate(baseDate: Date): string {
    const d = new Date(baseDate);
    const day = d.getDate();
    d.setMonth(d.getMonth() + 1);
    // Handle month-end rollover (e.g. Aug 31 -> Sept 30)
    if (d.getDate() !== day) {
      d.setDate(0);
    }
    return d.toISOString().split('T')[0];
  }

  // -------------------------------------------------------------
  // HOSTING & DOMAIN
  // -------------------------------------------------------------
  public addHosting(record: Omit<HostingRecord, 'id' | 'created_at'>) {
    const newRecord: HostingRecord = {
      ...record,
      id: `hst-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.state.hosting = [newRecord, ...this.state.hosting];
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('hosting').insert([newRecord]).then();
    return newRecord;
  }

  public addDomain(record: Omit<DomainRecord, 'id' | 'created_at'>) {
    const newRecord: DomainRecord = {
      ...record,
      id: `dom-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.state.domains = [newRecord, ...this.state.domains];
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('domains').insert([newRecord]).then();
    return newRecord;
  }

  // -------------------------------------------------------------
  // FOLLOW-UPS
  // -------------------------------------------------------------
  public addFollowup(followup: Omit<Followup, 'id' | 'created_at'>) {
    const newFollowup: Followup = {
      ...followup,
      id: `fol-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.state.followups = [newFollowup, ...this.state.followups];
    this.logActivity('Follow-up Scheduled', newFollowup.client_name || newFollowup.related_name || 'Client', `${newFollowup.reason || 'Followup'} on ${newFollowup.scheduled_date || newFollowup.date || 'Scheduled date'}`);
    this.saveState();

    const sb = getSupabase();
    if (sb) sb.from('followups').insert([newFollowup]).then();
    return newFollowup;
  }

  public rescheduleFollowup(id: string, date: string, time: string, notes?: string) {
    this.state.followups = this.state.followups.map((f) =>
      f.id === id
        ? {
            ...f,
            scheduled_date: date,
            scheduled_time: time,
            date,
            time,
            notes: notes !== undefined ? notes : f.notes,
            status: 'RESCHEDULED',
          }
        : f
    );
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('followups').update({ scheduled_date: date, scheduled_time: time, notes, status: 'RESCHEDULED' }).eq('id', id).then();
  }

  public deleteFollowup(id: string) {
    this.state.followups = this.state.followups.filter((f) => f.id !== id);
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('followups').delete().eq('id', id).then();
  }

  public updateFollowupStatus(id: string, status: Followup['status']) {
    this.state.followups = this.state.followups.map((f) => (f.id === id ? { ...f, status } : f));
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('followups').update({ status }).eq('id', id).then();
  }

  // -------------------------------------------------------------
  // EXPENSES
  // -------------------------------------------------------------
  public addExpense(expense: Omit<Expense, 'id' | 'expense_code' | 'created_at'>) {
    const code = `EXP-${900 + this.state.expenses.length + 1}`;
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      expense_code: code,
      created_at: new Date().toISOString(),
    };
    this.state.expenses = [newExp, ...this.state.expenses];
    this.logActivity(
      'Expense Recorded',
      `${code} (${newExp.category})`,
      `₹${newExp.amount.toLocaleString('en-IN')} for ${newExp.description || newExp.expense_name || ''}`
    );
    this.saveState();

    const sb = getSupabase();
    if (sb) sb.from('expenses').insert([newExp]).then();
    return newExp;
  }

  public updateExpense(id: string, data: Partial<Expense>) {
    this.state.expenses = this.state.expenses.map((e) => (e.id === id ? { ...e, ...data } : e));
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('expenses').update(data).eq('id', id).then();
  }

  public deleteExpense(id: string) {
    this.state.expenses = this.state.expenses.filter((e) => e.id !== id);
    this.saveState();
    const sb = getSupabase();
    if (sb) sb.from('expenses').delete().eq('id', id).then();
  }

  // -------------------------------------------------------------
  // SETTINGS
  // -------------------------------------------------------------
  public updateSettings(updates: Partial<AgencySettings>) {
    this.state.settings = { ...this.state.settings, ...updates };
    this.logActivity('Settings Updated', 'Agency Preferences', 'Updated rates and configurations');
    this.saveState();
  }

  // -------------------------------------------------------------
  // STATS & CALCULATIONS (REAL DB DERIVED)
  // -------------------------------------------------------------
  public getDashboardStats(): DashboardStats {
    const todayStr = new Date().toISOString().split('T')[0];

    // Leads stats
    const totalLeads = this.state.leads.length;
    const newLeads = this.state.leads.filter((l) => l.status === 'NEW LEAD' || l.status === 'CALL PENDING').length;
    const interestedLeads = this.state.leads.filter((l) => l.status === 'INTERESTED').length;

    // Clients stats
    const totalClients = this.state.clients.length;

    // Projects stats
    const activeProjects = this.state.projects.filter(
      (p) => p.status !== 'COMPLETED' && p.status !== 'MAINTENANCE'
    ).length;
    const completedProjects = this.state.projects.filter((p) => p.status === 'COMPLETED' || p.status === 'MAINTENANCE').length;
    const projectsInDevelopment = this.state.projects.filter((p) => p.status === 'DEVELOPMENT').length;

    // Payments stats
    const pendingClientPayments = this.state.payments.reduce((acc, p) => acc + p.remaining, 0);
    const overduePayments = this.state.payments
      .filter((p) => (p.status === 'OVERDUE' || (p.due_date < todayStr && p.remaining > 0)))
      .reduce((acc, p) => acc + p.remaining, 0);

    // Maintenance stats
    const monthlyMaintenanceRevenue = this.state.maintenance
      .filter((m) => m.status === 'ACTIVE')
      .reduce((acc, m) => acc + m.monthly_fee, 0);

    const maintenanceDueCount = this.state.maintenance.filter(
      (m) => m.next_due_date <= todayStr && m.status === 'ACTIVE'
    ).length;

    // Team stats
    const teamMembersCount = this.state.teamMembers.filter((m) => m.employment_status === 'ACTIVE').length;
    const tasksPending = this.state.tasks.filter((t) => t.status !== 'COMPLETED').length;
    const tasksCompleted = this.state.tasks.filter((t) => t.status === 'COMPLETED').length;

    // Salary stats
    const salaryPending = this.state.salaryRecords.reduce((acc, s) => acc + s.amount_pending, 0);

    // Expenses stats (this month)
    const currentMonthPrefix = todayStr.slice(0, 7); // '2026-09'
    const monthlyExpenses = this.state.expenses
      .filter((e) => e.date.startsWith(currentMonthPrefix))
      .reduce((acc, e) => acc + e.amount, 0);

    // Net Business Amount = (Received Revenue + Maintenance Revenue) - (Total Salary Paid + Total Expenses)
    const totalClientReceived = this.state.payments.reduce((acc, p) => acc + p.amount_received, 0);
    const totalSalariesPaid = this.state.salaryRecords.reduce((acc, s) => acc + s.amount_paid, 0);
    const totalAllExpenses = this.state.expenses.reduce((acc, e) => acc + e.amount, 0);

    const netBusinessAmount =
      totalClientReceived + monthlyMaintenanceRevenue - (totalSalariesPaid + totalAllExpenses);

    return {
      totalLeads,
      newLeads,
      interestedLeads,
      totalClients,
      activeProjects,
      completedProjects,
      projectsInDevelopment,
      pendingClientPayments,
      overduePayments,
      monthlyMaintenanceRevenue,
      maintenanceDueCount,
      teamMembersCount,
      tasksPending,
      tasksCompleted,
      salaryPending,
      monthlyExpenses,
      netBusinessAmount,
    };
  }

  // Workload calculator for team members
  public getTeamMemberWorkload(memberId: string) {
    const memberTasks = this.state.tasks.filter((t) => t.assigned_to === memberId);
    const completedTasks = memberTasks.filter((t) => t.status === 'COMPLETED').length;
    const pendingTasks = memberTasks.filter((t) => t.status !== 'COMPLETED').length;
    const highPriorityTasks = memberTasks.filter(
      (t) => (t.priority === 'HIGH' || t.priority === 'URGENT') && t.status !== 'COMPLETED'
    ).length;

    // Projects where member is assigned
    const assignedProjectIds = new Set([
      ...this.state.projectMembers
        .filter((pm) => pm.team_member_id === memberId)
        .map((pm) => pm.project_id),
      ...memberTasks.map((t) => t.project_id),
    ]);
    const currentProjectsCount = assignedProjectIds.size;

    let availability: 'AVAILABLE' | 'BUSY' | 'OVERLOADED' = 'AVAILABLE';
    if (pendingTasks >= 4 || currentProjectsCount >= 3) {
      availability = 'BUSY';
    }
    if (pendingTasks >= 7 || highPriorityTasks >= 3) {
      availability = 'OVERLOADED';
    }

    return {
      assignedTasks: memberTasks.length,
      completedTasks,
      pendingTasks,
      highPriorityTasks,
      currentProjects: currentProjectsCount,
      availability,
    };
  }

  // Real Notifications Generator
  public getNotifications(): AppNotification[] {
    const notifs: AppNotification[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Overdue payments
    this.state.payments
      .filter((p) => p.due_date < todayStr && p.remaining > 0)
      .forEach((p) => {
        notifs.push({
          id: `notif-pay-${p.id}`,
          title: 'Client Payment Overdue',
          message: `${p.client_name} has ₹${p.remaining.toLocaleString('en-IN')} overdue since ${p.due_date}`,
          type: 'PAYMENT',
          urgency: 'HIGH',
          link: 'payments',
          is_read: false,
          date: todayStr,
          created_at: new Date().toISOString(),
        });
      });

    // 2. Maintenance due / overdue
    this.state.maintenance
      .filter((m) => m.next_due_date <= todayStr && m.status === 'ACTIVE')
      .forEach((m) => {
        const isOverdue = m.next_due_date < todayStr;
        notifs.push({
          id: `notif-mnt-${m.id}`,
          title: isOverdue ? 'Maintenance Overdue' : 'Maintenance Due Today',
          message: `${m.client_name} - ₹${m.monthly_fee.toLocaleString('en-IN')} (${m.plan} Plan)`,
          type: 'MAINTENANCE',
          urgency: isOverdue ? 'HIGH' : 'MEDIUM',
          link: 'maintenance',
          is_read: false,
          date: todayStr,
          created_at: new Date().toISOString(),
        });
      });

    // 3. Salary overdue or pending
    this.state.salaryRecords
      .filter((s) => s.payment_status === 'OVERDUE' || (s.payment_status === 'PENDING' && s.amount_pending > 0))
      .forEach((s) => {
        notifs.push({
          id: `notif-sal-${s.id}`,
          title: s.payment_status === 'OVERDUE' ? 'Salary Overdue' : 'Salary Pending',
          message: `${s.employee_name} (${s.month} ${s.year}) - Pending: ₹${s.amount_pending.toLocaleString('en-IN')}`,
          type: 'SALARY',
          urgency: s.payment_status === 'OVERDUE' ? 'HIGH' : 'MEDIUM',
          link: 'salaries',
          is_read: false,
          date: todayStr,
          created_at: new Date().toISOString(),
        });
      });

    // 4. Today's follow-ups
    this.state.followups
      .filter((f) => f.date === todayStr && f.status === 'PENDING')
      .forEach((f) => {
        notifs.push({
          id: `notif-fol-${f.id}`,
          title: "Today's Follow-up Scheduled",
          message: `${f.client_name} at ${f.time}: ${f.reason}`,
          type: 'FOLLOWUP',
          urgency: 'MEDIUM',
          link: 'followups',
          is_read: false,
          date: todayStr,
          created_at: new Date().toISOString(),
        });
      });

    // 5. Urgent pending tasks
    this.state.tasks
      .filter((t) => t.priority === 'URGENT' && t.status !== 'COMPLETED')
      .forEach((t) => {
        notifs.push({
          id: `notif-tsk-${t.id}`,
          title: 'Urgent Task Pending',
          message: `${t.task_name} (Due: ${t.due_date}) - Assigned to ${t.assigned_name || 'Unassigned'}`,
          type: 'TASK',
          urgency: 'HIGH',
          link: 'tasks',
          is_read: false,
          date: todayStr,
          created_at: new Date().toISOString(),
        });
      });

    return notifs;
  }

  // Global Search across entire agency database
  public searchGlobal(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return { clients: [], leads: [], projects: [], team: [], quotes: [] };

    const clients = this.state.clients.filter(
      (c) =>
        c.client_name.toLowerCase().includes(q) ||
        c.business_name.toLowerCase().includes(q) ||
        c.client_code.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
    );

    const leads = this.state.leads.filter(
      (l) =>
        l.client_name.toLowerCase().includes(q) ||
        l.business_name.toLowerCase().includes(q) ||
        l.lead_code.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email.toLowerCase().includes(q)
    );

    const projects = this.state.projects.filter(
      (p) =>
        p.business_name.toLowerCase().includes(q) ||
        p.project_code.toLowerCase().includes(q) ||
        p.client_name.toLowerCase().includes(q) ||
        (p.domain && p.domain.toLowerCase().includes(q)) ||
        (p.website_url && p.website_url.toLowerCase().includes(q))
    );

    const team = this.state.teamMembers.filter(
      (t) =>
        t.full_name.toLowerCase().includes(q) ||
        t.employee_id.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.includes(q)
    );

    const quotes = this.state.quotes.filter(
      (qt) =>
        qt.quote_code.toLowerCase().includes(q) ||
        qt.business_name.toLowerCase().includes(q) ||
        qt.client_name.toLowerCase().includes(q)
    );

    return { clients, leads, projects, team, quotes };
  }

  public getRawState(): DBState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public exportFullBackup(): string {
    return JSON.stringify(
      {
        appName: 'FINEX WEB',
        agency: this.state.settings.agency_name,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        data: this.state,
      },
      null,
      2
    );
  }

  public importFullBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      const incomingState = parsed.data || parsed;
      if (!incomingState || typeof incomingState !== 'object') {
        return { success: false, message: 'Invalid backup file: Could not detect agency database structure.' };
      }

      this.state = {
        ...getInitialState(),
        ...incomingState,
      };
      this.saveState();
      this.logActivity('Data Restored', 'Full System Backup', 'Imported complete agency database backup from JSON file.');
      return { success: true, message: 'Database backup imported successfully! All records have been restored.' };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Failed to parse backup JSON.' };
    }
  }

  public resetToInitialData() {
    this.state = getInitialState();
    this.saveState();
  }
}

export const db = new DatabaseManager();
