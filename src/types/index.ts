export type UserRole =
  | 'OWNER / ADMIN'
  | 'PROJECT MANAGER'
  | 'WEB DEVELOPER'
  | 'FRONTEND DEVELOPER'
  | 'BACKEND DEVELOPER'
  | 'UI/UX DESIGNER'
  | 'GRAPHIC DESIGNER'
  | 'CONTENT WRITER'
  | 'SEO'
  | 'TESTER'
  | 'SALES'
  | 'OTHER'
  | string;

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON LEAVE';
export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'ON LEAVE';

export type SalaryType = 'MONTHLY' | 'WEEKLY' | 'PROJECT BASED' | 'HOURLY' | 'OTHER';
export type SalaryStatus = 'PENDING' | 'PARTIALLY PAID' | 'PAID' | 'OVERDUE';

export type LeadStatus =
  | 'NEW LEAD'
  | 'CALL PENDING'
  | 'CALLED'
  | 'INTERESTED'
  | 'FOLLOW-UP'
  | 'NOT INTERESTED'
  | 'CONVERTED';

export type CallStatus =
  | 'CONNECTED'
  | 'NOT CONNECTED'
  | 'CALL BACK'
  | 'INTERESTED'
  | 'NOT INTERESTED'
  | 'ANSWERED'
  | 'NOT ANSWERED'
  | 'BUSY'
  | 'WRONG NUMBER';

export type WebsiteType =
  | 'Business'
  | 'Restaurant'
  | 'Portfolio'
  | 'Landing Page'
  | 'E-commerce'
  | 'Custom'
  | 'BUSINESS WEBSITE'
  | 'E-COMMERCE'
  | 'PORTFOLIO'
  | 'LANDING PAGE'
  | 'BLOG / NEWS'
  | 'REAL ESTATE'
  | 'CUSTOM WEB APP';

export type RequirementStatus = 'PENDING' | 'IN PROGRESS' | 'COMPLETED';

export type PlanType =
  | 'STARTER'
  | 'PROFESSIONAL'
  | 'BUSINESS'
  | 'BUSINESS PRO'
  | 'PREMIUM'
  | 'CUSTOM';

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'PAUSED' | 'TERMINATED';

export type ProjectStatus =
  | 'NEW PROJECT'
  | 'REQUIREMENTS'
  | 'DESIGN'
  | 'DEVELOPMENT'
  | 'INTERNAL TESTING'
  | 'CLIENT REVIEW'
  | 'CHANGES'
  | 'FINAL APPROVAL'
  | 'DEPLOYMENT'
  | 'COMPLETED'
  | 'MAINTENANCE';

export type TaskStatus = 'TODO' | 'IN PROGRESS' | 'IN REVIEW' | 'COMPLETED' | 'BLOCKED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export type PaymentMethod =
  | 'CASH'
  | 'BANK TRANSFER'
  | 'UPI'
  | 'ONLINE GATEWAY'
  | 'CHEQUE'
  | 'CARD'
  | 'OTHER';

export type MaintenancePaymentStatus = 'ACTIVE' | 'PAYMENT DUE' | 'DUE' | 'PAID' | 'OVERDUE' | 'PAUSED' | 'CANCELLED';

export type ExpenseCategory =
  | 'Hosting'
  | 'Domain'
  | 'Software'
  | 'Advertising'
  | 'Equipment'
  | 'Salary'
  | 'Office'
  | 'Internet'
  | 'Electricity'
  | 'Travel'
  | 'Other'
  | 'OFFICE RENT'
  | 'HOSTING & SERVERS'
  | 'DOMAIN PURCHASES'
  | 'SOFTWARE TOOLS & APIS'
  | 'MARKETING & ADS'
  | 'HARDWARE'
  | 'FREELANCER PAYMENTS'
  | 'OFFICE TEA & REFRESHMENT'
  | 'MISCELLANEOUS';

export type FollowupStatus = 'PENDING' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED';
export type FollowupType = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING';
export type FollowupPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Entity Interfaces

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  lead_code: string;
  business_name: string;
  client_name: string;
  phone: string;
  whatsapp?: string;
  email: string;
  city: string;
  business_category: string;
  lead_source: string;
  date_added: string;
  status: LeadStatus;
  next_followup?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Call {
  id: string;
  lead_id?: string;
  client_id?: string;
  contact_name: string;
  business_name?: string;
  phone: string;
  call_date: string;
  call_time: string;
  call_status: CallStatus;
  call_duration?: string;
  admin_name?: string;
  notes?: string;
  discussion_notes?: string;
  next_followup?: string;
  created_at: string;
}

export interface Requirement {
  id: string;
  req_code: string;
  business_name: string;
  client_id?: string;
  lead_id?: string;
  client_name: string;
  business_type: string;
  website_type: WebsiteType;
  number_of_pages: number;
  pages_count?: number;
  features: string[];
  reference_websites?: string;
  budget: number;
  budget_range?: string;
  deadline?: string;
  target_delivery_date?: string;
  domain_needed?: boolean;
  hosting_needed?: boolean;
  logo_needed?: boolean;
  design_preference?: string;
  special_requirements?: string;
  notes?: string;
  status: RequirementStatus;
  date_collected?: string;
  created_at: string;
}

export interface Quote {
  id: string;
  quote_code: string;
  client_id?: string;
  project_id?: string;
  client_name: string;
  business_name: string;
  selected_plan: PlanType;
  plan_price?: number;
  development_price: number;
  maintenance_price: number;
  hosting: string;
  domain: string;
  discount: number;
  final_price: number;
  quote_date: string;
  created_date?: string;
  valid_till?: string;
  payment_terms?: string;
  included_services?: string[];
  status: QuoteStatus;
  notes?: string;
  created_at: string;
}

export interface Client {
  id: string;
  client_code: string;
  client_name: string;
  business_name: string;
  phone: string;
  whatsapp?: string;
  email: string;
  city: string;
  address?: string;
  business_category: string;
  lead_source: string;
  date_joined: string;
  status: ClientStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  project_code: string;
  client_id: string;
  client_name: string;
  business_name: string;
  plan: PlanType;
  project_price: number;
  maintenance_fee: number;
  start_date: string;
  deadline: string;
  status: ProjectStatus;
  website_url?: string;
  github_url?: string;
  domain?: string;
  hosting?: string;
  hosting_provider?: string;
  maintenance_status?: string;
  notes?: string;
  progress: number; // 0-100%
  created_at: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  task_code: string;
  project_id: string;
  project_name?: string;
  task_name: string;
  description?: string;
  assigned_to?: string; // Team member ID
  assigned_name?: string;
  priority: TaskPriority;
  due_date: string;
  status: TaskStatus;
  created_date: string;
  completed_date?: string;
  notes?: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  team_member_id: string;
  member_name: string;
  role: string;
  assigned_date: string;
  work_status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  notes?: string;
}

export interface Payment {
  id: string;
  payment_code: string;
  invoice_number?: string;
  client_id: string;
  client_name: string;
  project_id?: string;
  project_name?: string;
  quote_id?: string;
  total_amount: number;
  amount_received: number;
  remaining: number;
  payment_date: string;
  due_date: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  created_at: string;
}

export interface Followup {
  id: string;
  followup_code?: string;
  related_type?: 'LEAD' | 'CLIENT' | 'PAYMENT' | 'MAINTENANCE';
  related_name?: string;
  client_id?: string;
  lead_id?: string;
  client_name?: string;
  phone: string;
  type?: FollowupType;
  scheduled_date?: string;
  scheduled_time?: string;
  priority?: FollowupPriority;
  status: FollowupStatus;
  reason?: string;
  date?: string;
  time?: string;
  notes?: string;
  outcome?: string;
  next_followup_date?: string;
  created_at: string;
}

export interface Maintenance {
  id: string;
  maintenance_code: string;
  client_id: string;
  client_name: string;
  project_id: string;
  project_name: string;
  plan: PlanType;
  plan_type?: 'STARTER' | 'BUSINESS' | 'PREMIUM' | 'CUSTOM';
  monthly_fee: number;
  start_date: string;
  next_due_date: string;
  last_payment_date?: string;
  payment_status: MaintenancePaymentStatus;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  auto_renewal?: boolean;
  work_done_this_month?: string[];
  notes?: string;
  created_at: string;
}

export interface HostingRecord {
  id: string;
  client_id?: string;
  client_name: string;
  project_id?: string;
  domain_name?: string;
  provider: string;
  plan_name?: string;
  server_ip?: string;
  start_date?: string;
  expiry_date?: string;
  renewal_date?: string;
  renewal_amount?: number;
  renewal_cost?: number;
  status: 'ACTIVE' | 'EXPIRING SOON' | 'EXPIRED';
  notes?: string;
  created_at: string;
}

export interface DomainRecord {
  id: string;
  domain_name: string;
  client_id?: string;
  client_name: string;
  project_id?: string;
  provider?: string;
  registrar?: string;
  registration_date?: string;
  expiry_date: string;
  renewal_amount?: number;
  renewal_cost?: number;
  auto_renew?: boolean;
  status: 'ACTIVE' | 'EXPIRING SOON' | 'EXPIRED';
  dns_records?: string;
  notes?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  employee_id: string;
  full_name: string;
  phone: string;
  email: string;
  role: UserRole;
  department: string;
  joining_date: string;
  employment_status: EmploymentStatus;
  salary_type: SalaryType;
  monthly_salary: number;
  payment_schedule: string;
  skills: string[];
  notes?: string;
  avatar_url?: string;
  created_at: string;
}

export interface SalaryRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  role: string;
  month: string; // e.g., 'September'
  year: number; // e.g., 2026
  salary_amount: number;
  bonus: number;
  deduction: number;
  advance: number;
  final_salary: number; // salary_amount + bonus - deduction - advance
  amount_paid: number;
  amount_pending: number; // final_salary - amount_paid
  payment_date?: string;
  payment_method?: PaymentMethod;
  payment_status: SalaryStatus;
  notes?: string;
  created_at: string;
}

export interface SalaryPayment {
  id: string;
  salary_record_id: string;
  employee_id: string;
  employee_name: string;
  amount_paid: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  expense_code: string;
  expense_name?: string;
  date: string;
  category: ExpenseCategory;
  description?: string;
  amount: number;
  paid_to?: string;
  payment_method: PaymentMethod;
  vendor?: string;
  related_project_id?: string;
  related_project_name?: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  date: string;
  time: string;
  admin_name: string;
  performed_by?: string;
  action: string;
  related_record: string;
  entity_type?: string;
  entity_id?: string;
  description: string;
  details?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'PAYMENT' | 'MAINTENANCE' | 'HOSTING' | 'DOMAIN' | 'SALARY' | 'TASK' | 'PROJECT' | 'FOLLOWUP';
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  link?: string;
  is_read: boolean;
  date: string;
  created_at: string;
}

export interface AgencySettings {
  id: string;
  agency_name: string;
  tagline?: string;
  logo_url?: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  starter_price: number;
  starter_maint: number;
  pro_price: number;
  pro_maint: number;
  biz_price: number;
  biz_maint: number;
  hosting_renewal: number;
  currency: string;
  currency_symbol: string;
  bank_details?: {
    bank_name: string;
    account_name: string;
    account_number: string;
    ifsc: string;
    upi_id: string;
  };
  whatsapp_templates?: {
    lead_greeting: string;
    quote_proposal: string;
    payment_reminder: string;
    maintenance_reminder: string;
  };
  supabase_url?: string;
  supabase_anon_key?: string;
  created_at: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  interestedLeads: number;
  totalClients: number;
  activeProjects: number;
  completedProjects: number;
  projectsInDevelopment: number;
  pendingClientPayments: number;
  overduePayments: number;
  monthlyMaintenanceRevenue: number;
  maintenanceDueCount: number;
  teamMembersCount: number;
  tasksPending: number;
  tasksCompleted: number;
  salaryPending: number;
  monthlyExpenses: number;
  netBusinessAmount: number;
}

export type ViewType =
  | 'dashboard'
  | 'leads'
  | 'calls'
  | 'requirements'
  | 'quotes'
  | 'clients'
  | 'projects'
  | 'tasks'
  | 'team'
  | 'salaries'
  | 'payments'
  | 'maintenance'
  | 'followups'
  | 'expenses'
  | 'reports'
  | 'activity'
  | 'settings';
