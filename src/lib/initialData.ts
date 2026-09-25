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
  AgencySettings,
} from '../types';

export const INITIAL_SETTINGS: AgencySettings = {
  id: 'stg-01',
  agency_name: 'FINEX WEB',
  phone: '+91 98765 43210',
  email: 'finexxweb@gmail.com',
  website: 'https://finexweb.com',
  address: 'Mumbai, Maharashtra, India',
  starter_price: 9999,
  starter_maint: 999,
  pro_price: 14999,
  pro_maint: 1499,
  biz_price: 24999,
  biz_maint: 1999,
  hosting_renewal: 999,
  currency: 'INR',
  currency_symbol: '₹',
  created_at: new Date().toISOString(),
};

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-admin-01',
    employee_id: 'EMP-01',
    full_name: 'FINEX Admin',
    phone: '+91 98765 43210',
    email: 'finexxweb@gmail.com',
    role: 'OWNER / ADMIN',
    department: 'Management',
    joining_date: new Date().toISOString().split('T')[0],
    employment_status: 'ACTIVE',
    salary_type: 'MONTHLY',
    monthly_salary: 0,
    payment_schedule: '1st of month',
    skills: ['Agency Management', 'Operations'],
    created_at: new Date().toISOString(),
  },
];

// Completely clean arrays - NO DEMO RECORDS
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_CALLS: Call[] = [];
export const INITIAL_REQUIREMENTS: Requirement[] = [];
export const INITIAL_QUOTES: Quote[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_PROJECT_MEMBERS: ProjectMember[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_PAYMENTS: Payment[] = [];
export const INITIAL_MAINTENANCE: Maintenance[] = [];
export const INITIAL_HOSTING: HostingRecord[] = [];
export const INITIAL_DOMAINS: DomainRecord[] = [];
export const INITIAL_FOLLOWUPS: Followup[] = [];
export const INITIAL_SALARY_RECORDS: SalaryRecord[] = [];
export const INITIAL_SALARY_PAYMENTS: SalaryPayment[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];
