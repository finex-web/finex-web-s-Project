import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys
export const SUPABASE_STORAGE_URL_KEY = 'finex_supabase_url';
export const SUPABASE_STORAGE_ANON_KEY = 'finex_supabase_anon_key';

/**
 * Normalizes user input into a standard valid URL string
 */
export function sanitizeSupabaseUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!url) return '';
  // Remove wrapping quotes if pasted by mistake
  url = url.replace(/^["']|["']$/g, '').trim();
  
  // If user pasted a domain or host without protocol (e.g. "xyz.supabase.co")
  if (!/^https?:\/\//i.test(url) && (url.includes('.') || url.startsWith('localhost') || url.startsWith('127.0.0.1'))) {
    url = `https://${url}`;
  }
  
  // Remove trailing slashes
  return url.replace(/\/+$/, '');
}

/**
 * Strictly verifies whether a string is a valid HTTP/HTTPS URL
 */
export function isValidSupabaseUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl) return false;
  const url = sanitizeSupabaseUrl(rawUrl);
  if (!url) return false;

  // Exclude dummy placeholders
  if (/^(your[_-]?|my[_-]?)?supabase[_-]?(url|project)?$/i.test(url)) return false;
  if (url === 'undefined' || url === 'null') return false;

  // Must begin with http:// or https://
  if (!/^https?:\/\//i.test(url)) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates Supabase anon API key format
 */
export function isValidSupabaseKey(rawKey: string | null | undefined): boolean {
  if (!rawKey) return false;
  const key = rawKey.trim().replace(/^["']|["']$/g, '').trim();
  if (!key) return false;
  if (/^(your[_-]?|my[_-]?)?anon[_-]?(key|token)?$/i.test(key)) return false;
  if (key === 'undefined' || key === 'null') return false;
  return key.length >= 10;
}

export function getSupabaseCredentials() {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '';
  const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '';
  let storedUrl = typeof window !== 'undefined' ? localStorage.getItem(SUPABASE_STORAGE_URL_KEY) : null;
  let storedKey = typeof window !== 'undefined' ? localStorage.getItem(SUPABASE_STORAGE_ANON_KEY) : null;

  // If storedUrl exists in localStorage but is completely invalid, purge it immediately
  if (storedUrl !== null) {
    const sanitized = sanitizeSupabaseUrl(storedUrl);
    if (!isValidSupabaseUrl(sanitized)) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SUPABASE_STORAGE_URL_KEY);
      }
      storedUrl = null;
    } else {
      storedUrl = sanitized;
    }
  }

  // If storedKey exists in localStorage but is invalid, purge it immediately
  if (storedKey !== null) {
    const trimmed = storedKey.trim();
    if (!isValidSupabaseKey(trimmed)) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SUPABASE_STORAGE_ANON_KEY);
      }
      storedKey = null;
    } else {
      storedKey = trimmed;
    }
  }

  const rawUrl = storedUrl || sanitizeSupabaseUrl(envUrl);
  const cleanUrl = isValidSupabaseUrl(rawUrl) ? sanitizeSupabaseUrl(rawUrl) : '';
  const rawKey = (storedKey && isValidSupabaseKey(storedKey) ? storedKey : (isValidSupabaseKey(envKey) ? envKey?.trim() : '')) || '';

  const isConfigured = Boolean(cleanUrl && rawKey && isValidSupabaseUrl(cleanUrl) && isValidSupabaseKey(rawKey));

  return { url: cleanUrl, anonKey: rawKey, isConfigured };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseCredentials().isConfigured;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured || !url || !anonKey || !isValidSupabaseUrl(url)) {
    supabaseInstance = null;
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e: any) {
      console.warn('Supabase initialization skipped or invalid credentials:', e?.message || e);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SUPABASE_STORAGE_URL_KEY);
      }
      supabaseInstance = null;
      return null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseClient(url?: string, anonKey?: string) {
  if (typeof window !== 'undefined') {
    if (url !== undefined) {
      const sanitized = sanitizeSupabaseUrl(url);
      if (isValidSupabaseUrl(sanitized)) {
        localStorage.setItem(SUPABASE_STORAGE_URL_KEY, sanitized);
      } else {
        localStorage.removeItem(SUPABASE_STORAGE_URL_KEY);
      }
    }
    if (anonKey !== undefined) {
      const trimmed = anonKey.trim();
      if (isValidSupabaseKey(trimmed)) {
        localStorage.setItem(SUPABASE_STORAGE_ANON_KEY, trimmed);
      } else {
        localStorage.removeItem(SUPABASE_STORAGE_ANON_KEY);
      }
    }
  }
  supabaseInstance = null;
  return getSupabase();
}

/**
 * Removes all past Supabase history, stored keys, and session tokens from local storage
 */
export function removePastSupabaseHistory() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SUPABASE_STORAGE_URL_KEY);
    localStorage.removeItem(SUPABASE_STORAGE_ANON_KEY);
    
    // Clear all Supabase auth and local cached items
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('sb-') || k.includes('supabase') || k.includes('finex_admin_session'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
  supabaseInstance = null;
}

/**
 * Test connectivity to a Supabase project URL and anon key
 */
export async function testSupabaseConnection(
  testUrl: string,
  testKey: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!testUrl || !testKey) {
      return { success: false, message: 'Please provide both Project URL and Anon API Key.' };
    }
    const cleanUrl = sanitizeSupabaseUrl(testUrl);
    const cleanKey = testKey.trim();

    if (!isValidSupabaseUrl(cleanUrl)) {
      return { 
        success: false, 
        message: 'Invalid URL format. Supabase project URL must begin with https:// (e.g. https://your-project.supabase.co)' 
      };
    }

    if (!isValidSupabaseKey(cleanKey)) {
      return {
        success: false,
        message: 'Invalid Anon Key format. Please paste your full public anon API key from Supabase Project Settings > API.'
      };
    }

    const testClient = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false },
    });

    // Test query against settings or profiles
    const { error } = await testClient.from('settings').select('agency_name').limit(1);

    if (error) {
      // If table doesn't exist yet, connection is valid!
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return {
          success: true,
          message: 'Connection verified! (Database reached successfully. Tables need to be created via the Migration SQL script).',
        };
      }
      if (error.code === '42501' || error.message?.includes('policy') || error.message?.includes('permission denied')) {
        return {
          success: true,
          message: 'Connection verified! (RLS policy active. Supabase PostgreSQL is connected).',
        };
      }
      return {
        success: false,
        message: `Supabase Error: ${error.message} (Code: ${error.code || 'UNKNOWN'})`,
      };
    }

    return {
      success: true,
      message: 'Connection verified successfully! Live connection to Supabase PostgreSQL established.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Connection test failed. Check network, URL, and API key.',
    };
  }
}

/**
 * SQL script to completely DROP all past Supabase history and tables
 */
export const SUPABASE_WIPE_SQL = `-- ====================================================================
-- FINEX WEB - PURGE / WIPE ALL PAST SUPABASE DATABASE TABLES & HISTORY
-- WARNING: This will completely DROP all 22 FINEX WEB tables and past records.
-- Run this in Supabase SQL Editor if you want to start fresh from scratch.
-- ====================================================================

-- 1. Drop trigger on auth.users if previously created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Drop all private business tables in reverse dependency order
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.salary_payments CASCADE;
DROP TABLE IF EXISTS public.salary_records CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.followups CASCADE;
DROP TABLE IF EXISTS public.domains CASCADE;
DROP TABLE IF EXISTS public.hosting CASCADE;
DROP TABLE IF EXISTS public.maintenance CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.project_members CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.requirements CASCADE;
DROP TABLE IF EXISTS public.calls CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Confirmation query
SELECT 'Past FINEX WEB database history wiped successfully. Ready for fresh migration.' AS status;
`;

/**
 * SQL script to TRUNCATE / PURGE all data while keeping the table structures
 */
export const SUPABASE_TRUNCATE_SQL = `-- ====================================================================
-- FINEX WEB - TRUNCATE / PURGE ALL PAST DATA RECORDS ONLY
-- Keeps all 22 tables, columns, indexes, and RLS policies intact.
-- Deletes all past rows/history so you can start with a clean slate.
-- ====================================================================

TRUNCATE TABLE 
  public.activity_logs,
  public.notifications,
  public.salary_payments,
  public.salary_records,
  public.expenses,
  public.followups,
  public.domains,
  public.hosting,
  public.maintenance,
  public.payments,
  public.project_members,
  public.tasks,
  public.quotes,
  public.projects,
  public.requirements,
  public.calls,
  public.leads,
  public.clients,
  public.team_members,
  public.settings,
  public.profiles
CASCADE;

SELECT 'All past table records cleared. Schema is intact.' AS status;
`;

/**
 * Complete SQL Migration Script for Supabase PostgreSQL
 * Creates all 22 tables, foreign keys, timestamps, indexes, and Row Level Security (RLS) policies
 */
export const SUPABASE_MIGRATION_SQL = `-- ====================================================================
-- FINEX WEB - PRIVATE AGENCY OPERATING SYSTEM DATABASE MIGRATION
-- Target: Supabase PostgreSQL (with RLS enabled for all private tables)
-- ====================================================================

-- 1. Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'OWNER / ADMIN',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_code TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  city TEXT,
  business_category TEXT,
  lead_source TEXT DEFAULT 'Website',
  status TEXT DEFAULT 'NEW LEAD',
  next_followup DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Calls Table
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  client_id UUID,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  call_date DATE NOT NULL DEFAULT CURRENT_DATE,
  call_time TEXT NOT NULL,
  call_status TEXT NOT NULL DEFAULT 'CONNECTED',
  notes TEXT,
  next_followup DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Requirements Table
CREATE TABLE IF NOT EXISTS public.requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  req_code TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  client_id UUID,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  business_type TEXT,
  website_type TEXT NOT NULL DEFAULT 'Business',
  number_of_pages INT DEFAULT 5,
  features JSONB DEFAULT '[]'::JSONB,
  reference_websites TEXT,
  budget NUMERIC(12,2) DEFAULT 0,
  deadline DATE,
  special_requirements TEXT,
  notes TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_code TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  city TEXT,
  address TEXT,
  business_category TEXT,
  lead_source TEXT DEFAULT 'Inbound',
  date_joined DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'ACTIVE',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_code TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  plan TEXT DEFAULT 'STARTER',
  project_price NUMERIC(12,2) DEFAULT 9999,
  maintenance_fee NUMERIC(12,2) DEFAULT 999,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  deadline DATE NOT NULL,
  status TEXT DEFAULT 'NEW PROJECT',
  website_url TEXT,
  github_url TEXT,
  domain TEXT,
  hosting TEXT,
  notes TEXT,
  progress INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Quotes Table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_code TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  selected_plan TEXT NOT NULL DEFAULT 'STARTER',
  development_price NUMERIC(12,2) NOT NULL DEFAULT 9999,
  maintenance_price NUMERIC(12,2) NOT NULL DEFAULT 999,
  hosting TEXT DEFAULT '1 Year Included',
  domain TEXT DEFAULT 'Separate',
  discount NUMERIC(12,2) DEFAULT 0,
  final_price NUMERIC(12,2) NOT NULL,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'DRAFT',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'WEB DEVELOPER',
  department TEXT NOT NULL DEFAULT 'Development',
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  employment_status TEXT NOT NULL DEFAULT 'ACTIVE',
  salary_type TEXT NOT NULL DEFAULT 'MONTHLY',
  monthly_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_schedule TEXT DEFAULT '1st of month',
  skills JSONB DEFAULT '[]'::JSONB,
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_code TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  task_name TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'TODO',
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_date DATE,
  notes TEXT
);

-- 10. Project Members Table (Many-to-Many Assignment)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  work_status TEXT DEFAULT 'ACTIVE',
  notes TEXT,
  UNIQUE(project_id, team_member_id)
);

-- 11. Payments Table (Client payments)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_code TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  amount_received NUMERIC(12,2) NOT NULL DEFAULT 0,
  remaining NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'BANK TRANSFER',
  status TEXT NOT NULL DEFAULT 'UNPAID',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Maintenance Table
CREATE TABLE IF NOT EXISTS public.maintenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  maintenance_code TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'STARTER',
  monthly_fee NUMERIC(12,2) NOT NULL DEFAULT 999,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_due_date DATE NOT NULL,
  last_payment_date DATE,
  payment_status TEXT NOT NULL DEFAULT 'ACTIVE',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Hosting Table
CREATE TABLE IF NOT EXISTS public.hosting (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  domain_name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'FINEX Cloud / Hostinger',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  renewal_amount NUMERIC(12,2) NOT NULL DEFAULT 999,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Domains Table
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_name TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'Namecheap / GoDaddy',
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  renewal_amount NUMERIC(12,2) NOT NULL DEFAULT 1200,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Follow-ups Table
CREATE TABLE IF NOT EXISTS public.followups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  reason TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL DEFAULT '11:00 AM',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Salary Records Table
CREATE TABLE IF NOT EXISTS public.salary_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  employee_name TEXT NOT NULL,
  role TEXT NOT NULL,
  month TEXT NOT NULL,
  year INT NOT NULL,
  salary_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  bonus NUMERIC(12,2) NOT NULL DEFAULT 0,
  deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
  advance NUMERIC(12,2) NOT NULL DEFAULT 0,
  final_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_pending NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_date DATE,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- 17. Salary Payments Table
CREATE TABLE IF NOT EXISTS public.salary_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salary_record_id UUID REFERENCES public.salary_records(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  employee_name TEXT NOT NULL,
  amount_paid NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_code TEXT UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'BANK TRANSFER',
  vendor TEXT,
  related_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT NOT NULL,
  admin_name TEXT NOT NULL DEFAULT 'FINEX Admin',
  action TEXT NOT NULL,
  related_record TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'MEDIUM',
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_name TEXT NOT NULL DEFAULT 'FINEX WEB',
  logo_url TEXT,
  phone TEXT DEFAULT '+91 98765 43210',
  email TEXT DEFAULT 'finexxweb@gmail.com',
  website TEXT DEFAULT 'https://finexweb.com',
  address TEXT DEFAULT 'Mumbai, India',
  starter_price NUMERIC(12,2) DEFAULT 9999,
  starter_maint NUMERIC(12,2) DEFAULT 999,
  pro_price NUMERIC(12,2) DEFAULT 14999,
  pro_maint NUMERIC(12,2) DEFAULT 1499,
  biz_price NUMERIC(12,2) DEFAULT 24999,
  biz_maint NUMERIC(12,2) DEFAULT 1999,
  hosting_renewal NUMERIC(12,2) DEFAULT 999,
  currency TEXT DEFAULT 'INR',
  currency_symbol TEXT DEFAULT '₹',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR FAST QUERYING AND METRICS
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_due ON public.maintenance(next_due_date, payment_status);
CREATE INDEX IF NOT EXISTS idx_salary_records_emp ON public.salary_records(employee_id, month, year);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Only authenticated users (admins) can view, insert, update or delete records.
-- Public/anon cannot access these private agency tables.
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins full access to all private tables
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admin Full Access" ON public.%I', tbl);
    EXECUTE format('CREATE POLICY "Admin Full Access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;

-- ====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER FOR SUPABASE AUTH
-- When a user is added in Authentication > Users (e.g. finexxweb@gmail.com),
-- an admin profile is automatically created in public.profiles.
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'FINEX Admin'),
    'OWNER / ADMIN'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;
