import React, { useState, useRef } from 'react';
import { db } from '../../lib/db';
import { Logo } from '../common/Logo';
import {
  Building2,
  CreditCard,
  MessageSquare,
  Database,
  Save,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Lock,
  Server,
  Layers,
  Download,
  Upload,
  GitBranch,
  Github,
  Copy,
  Check,
  FileJson,
  Terminal,
  ExternalLink,
  ShieldCheck,
  FileText,
  Users,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import { isSupabaseConfigured, getSupabaseCredentials } from '../../lib/supabase';
import { SupabaseManager } from './SupabaseManager';

export const SettingsView: React.FC = () => {
  const settings = db.getSettings();

  const [activeSection, setActiveSection] = useState<'data' | 'supabase' | 'general'>('data');

  const [agencyName, setAgencyName] = useState(settings.agency_name || 'FINEX WEB');
  const [tagline, setTagline] = useState(settings.tagline || 'Private Agency Operating System');
  const [phone, setPhone] = useState(settings.phone || '+91 98765 43210');
  const [email, setEmail] = useState(settings.email || 'admin@finexweb.com');
  const [address, setAddress] = useState(settings.address || 'Tech Park Avenue, Phase 2, Pune, Maharashtra');
  const [currency, setCurrency] = useState(settings.currency || 'INR');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol || '₹');

  // Bank & UPI details
  const [bankName, setBankName] = useState(settings.bank_details?.bank_name || 'HDFC Bank');
  const [accountName, setAccountName] = useState(settings.bank_details?.account_name || 'FINEX WEB');
  const [accountNumber, setAccountNumber] = useState(settings.bank_details?.account_number || '9876543210123');
  const [ifsc, setIfsc] = useState(settings.bank_details?.ifsc || 'HDFC0001234');
  const [upiId, setUpiId] = useState(settings.bank_details?.upi_id || 'pay@finexweb');

  // WhatsApp templates
  const [tplGreeting, setTplGreeting] = useState(
    settings.whatsapp_templates?.lead_greeting ||
      'Hello! Thank you for contacting FINEX WEB. We specialize in high-conversion web engineering.'
  );
  const [tplQuote, setTplQuote] = useState(
    settings.whatsapp_templates?.quote_proposal ||
      'Hello! We have prepared your official website project quotation from FINEX WEB.'
  );
  const [tplPayment, setTplPayment] = useState(
    settings.whatsapp_templates?.payment_reminder ||
      'Hello! This is a gentle reminder regarding the outstanding project balance for FINEX WEB.'
  );
  const [tplMaintenance, setTplMaintenance] = useState(
    settings.whatsapp_templates?.maintenance_reminder ||
      'Hello! Your monthly website maintenance and server SLA renewal is upcoming.'
  );

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // Data & GitHub publishing states
  const [githubUser, setGithubUser] = useState('YOUR_USERNAME');
  const [githubRepo, setGithubRepo] = useState('YOUR_REPO_NAME');
  const [gitTab, setGitTab] = useState<'initial' | 'push_changes'>('initial');
  const [commitMessage, setCommitMessage] = useState('feat: complete FINEX WEB agency operating system');
  const [changeMessage, setChangeMessage] = useState('update: push latest agency updates');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings({
      agency_name: agencyName,
      tagline,
      phone,
      email,
      address,
      currency,
      currency_symbol: currencySymbol,
      bank_details: {
        bank_name: bankName,
        account_name: accountName,
        account_number: accountNumber,
        ifsc,
        upi_id: upiId,
      },
      whatsapp_templates: {
        lead_greeting: tplGreeting,
        quote_proposal: tplQuote,
        payment_reminder: tplPayment,
        maintenance_reminder: tplMaintenance,
      },
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConfirmResetData = () => {
    db.resetToInitialData();
    setShowResetConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 4000);
  };

  const handleExportBackup = () => {
    try {
      const json = db.exportFullBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finex_agency_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupSuccess('Full agency database exported and downloaded as JSON.');
      setTimeout(() => setBackupSuccess(null), 4000);
    } catch (err: any) {
      setBackupError(err?.message || 'Failed to export backup.');
      setTimeout(() => setBackupError(null), 4000);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = db.importFullBackup(content);
      if (res.success) {
        setBackupSuccess(res.message);
        setTimeout(() => setBackupSuccess(null), 5000);
      } else {
        setBackupError(res.message);
        setTimeout(() => setBackupError(null), 5000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const hasSupabase = isSupabaseConfigured();
  const credentials = getSupabaseCredentials();

  // Database counts for overview
  const clientsCount = db.getClients().length;
  const leadsCount = db.getLeads().length;
  const projectsCount = db.getProjects().length;
  const paymentsCount = db.getPayments().length;
  const teamCount = db.getTeamMembers().length;
  const quotesCount = db.getQuotes().length;

  // Exact initial code requested by user
  const gitCommandsInitial = `# 1. Initialize git
git init

# 2. Stage all project files (.gitignore protects secrets automatically)
git add .

# 3. Create your first commit
git commit -m "${commitMessage || 'feat: complete FINEX WEB agency operating system'}"

# 4. Set main as the default branch
git branch -M main

# 5. Link to your GitHub repository (replace with your GitHub username and repo)
git remote add origin https://github.com/${githubUser || 'YOUR_USERNAME'}/${githubRepo || 'YOUR_REPO_NAME'}.git

# 6. Push to GitHub
git push -u origin main`;

  // Code to push subsequent changes
  const gitCommandsChanges = `# 1. Check status of modified files
git status

# 2. Stage all changes
git add .

# 3. Commit your changes
git commit -m "${changeMessage || 'update: push latest agency updates'}"

# 4. Push updates to GitHub
git push origin main`;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Agency Configuration & Settings</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Manage data persistence, full database backup/export, GitHub publishing, and agency identity.
          </p>
        </div>

        {/* Section Navigation Switcher */}
        <div className="flex items-center gap-1 bg-[#121316] p-1 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setActiveSection('data')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSection === 'data'
                ? 'bg-[#E52D27] text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Data Access & GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('supabase')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSection === 'supabase'
                ? 'bg-[#E52D27] text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Cloud</span>
            {hasSupabase && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('general')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSection === 'general'
                ? 'bg-[#E52D27] text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Agency & Bank Details</span>
          </button>
        </div>
      </div>

      {/* SECTION: DATA ACCESS & GITHUB PUBLISHING */}
      {activeSection === 'data' && (
        <div className="space-y-6">
          {/* Notifications */}
          {backupSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 rounded text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{backupSuccess}</span>
            </div>
          )}

          {backupError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-rose-300 rounded text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{backupError}</span>
            </div>
          )}

          {resetDone && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 text-amber-300 rounded text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Database reset to clean factory demo data.</span>
            </div>
          )}

          {/* 1. HOW TO ACCESS YOUR DATA */}
          <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#E52D27]/10 border border-[#E52D27]/30 flex items-center justify-center text-[#E52D27]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    How to Access Your FINEX WEB Data
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Your agency records are dual-managed: local persistent storage + optional Supabase cloud PostgreSQL.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[11px] font-semibold border ${
                hasSupabase 
                  ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-400' 
                  : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${hasSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}></span>
                {hasSupabase ? 'SUPABASE CLOUD SYNCED' : 'BROWSER OFFLINE CACHE'}
              </span>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <div className="p-2.5 bg-[#18191c] border border-white/[0.06] rounded text-center">
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-sky-400" />
                  <span>Clients</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-0.5">{clientsCount}</div>
              </div>
              <div className="p-2.5 bg-[#18191c] border border-white/[0.06] rounded text-center">
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                  <FileText className="w-3 h-3 text-amber-400" />
                  <span>Leads</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-0.5">{leadsCount}</div>
              </div>
              <div className="p-2.5 bg-[#18191c] border border-white/[0.06] rounded text-center">
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                  <Briefcase className="w-3 h-3 text-emerald-400" />
                  <span>Projects</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-0.5">{projectsCount}</div>
              </div>
              <div className="p-2.5 bg-[#18191c] border border-white/[0.06] rounded text-center">
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                  <DollarSign className="w-3 h-3 text-indigo-400" />
                  <span>Invoices</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-0.5">{paymentsCount}</div>
              </div>
              <div className="p-2.5 bg-[#18191c] border border-white/[0.06] rounded text-center">
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                  <Layers className="w-3 h-3 text-pink-400" />
                  <span>Quotes</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-0.5">{quotesCount}</div>
              </div>
              <div className="p-2.5 bg-[#18191c] border border-white/[0.06] rounded text-center">
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400" />
                  <span>Team</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-0.5">{teamCount}</div>
              </div>
            </div>

            {/* 3 Channels of Data Access */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 bg-[#18191c] border border-white/[0.06] rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <FileJson className="w-4 h-4 text-emerald-400" />
                  <span>1. Full JSON Backup</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Export all 22 database tables into a portable JSON file. Download and inspect anytime, or use it to restore on any computer.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full h-8 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="p-3.5 bg-[#18191c] border border-white/[0.06] rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Database className="w-4 h-4 text-sky-400" />
                  <span>2. Cloud Supabase Tables</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  When connected, your data lives in live PostgreSQL tables. View, edit, filter, or export CSVs directly inside the Supabase dashboard.
                </p>
                <a
                  href={credentials.url ? `${credentials.url.replace(/\/$/, '')}/project/default/editor` : 'https://supabase.com/dashboard'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-8 px-3 rounded bg-[#202226] hover:bg-[#2a2d33] border border-white/10 text-zinc-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Open Supabase Table Editor</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </div>

              <div className="p-3.5 bg-[#18191c] border border-white/[0.06] rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>3. Restore / Import Backup</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Upload a previously saved JSON backup to completely restore all clients, projects, invoices, and settings.
                </p>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    onChange={handleImportBackup}
                    className="hidden"
                    id="import-backup-file"
                  />
                  <label
                    htmlFor="import-backup-file"
                    className="w-full h-8 px-3 rounded bg-[#202226] hover:bg-[#2a2d33] border border-white/10 text-zinc-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload & Restore Backup</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Direct LocalStorage Access Note */}
            <div className="p-3 bg-[#16171a] border border-white/[0.06] rounded text-[11px] text-zinc-400 flex items-start gap-2">
              <Terminal className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-200">Direct Browser Inspection: </span>
                Press <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-white/10 rounded text-[10px] text-zinc-300 font-mono">F12</kbd> (or right click &gt; Inspect) &gt; <span className="text-zinc-200">Application</span> &gt; <span className="text-zinc-200">Local Storage</span> &gt; key <code className="text-[#E52D27] font-mono">finex_db_state_v1</code>. All JSON state is stored there in real time.
              </div>
            </div>
          </div>

          {/* 2. HOW TO PUBLISH ON GITHUB */}
          <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-zinc-800 border border-white/10 flex items-center justify-center text-white">
                  <Github className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    How to Publish FINEX WEB on GitHub
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Step-by-step commands to push this entire codebase to your GitHub account repository.
                  </p>
                </div>
              </div>

              <a
                href="https://github.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E52D27] hover:bg-[#c92520] text-white text-xs font-semibold shadow transition-colors self-start sm:self-auto"
              >
                <span>Create New GitHub Repo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Config inputs for quick command personalization */}
            <div className="p-3 bg-[#18191c] border border-white/[0.06] rounded-lg space-y-3">
              <div className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Personalize Your GitHub Push Commands:</span>
                <button
                  type="button"
                  onClick={() => {
                    setGithubUser('YOUR_USERNAME');
                    setGithubRepo('YOUR_REPO_NAME');
                  }}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Reset placeholders
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">GitHub Username / Organization</label>
                  <input
                    type="text"
                    value={githubUser}
                    onChange={(e) => setGithubUser(e.target.value.trim())}
                    placeholder="YOUR_USERNAME"
                    className="w-full h-8 px-2.5 bg-[#121316] border border-white/10 rounded text-white font-mono text-xs focus:border-[#E52D27] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Repository Name</label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value.trim())}
                    placeholder="YOUR_REPO_NAME"
                    className="w-full h-8 px-2.5 bg-[#121316] border border-white/10 rounded text-white font-mono text-xs focus:border-[#E52D27] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    {gitTab === 'initial' ? 'Initial Commit Message' : 'Change Update Message'}
                  </label>
                  <input
                    type="text"
                    value={gitTab === 'initial' ? commitMessage : changeMessage}
                    onChange={(e) =>
                      gitTab === 'initial'
                        ? setCommitMessage(e.target.value)
                        : setChangeMessage(e.target.value)
                    }
                    className="w-full h-8 px-2.5 bg-[#121316] border border-white/10 rounded text-white font-mono text-xs focus:border-[#E52D27] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Git Command Tabs */}
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1">
              <button
                type="button"
                onClick={() => setGitTab('initial')}
                className={`px-3 py-1.5 rounded-t text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  gitTab === 'initial'
                    ? 'bg-[#E52D27] text-white shadow'
                    : 'text-zinc-400 hover:text-white bg-[#18191c]'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>1. Initial Repository Setup & Push</span>
              </button>

              <button
                type="button"
                onClick={() => setGitTab('push_changes')}
                className={`px-3 py-1.5 rounded-t text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  gitTab === 'push_changes'
                    ? 'bg-[#E52D27] text-white shadow'
                    : 'text-zinc-400 hover:text-white bg-[#18191c]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>2. Push Future Changes / Updates</span>
              </button>
            </div>

            {/* Terminal Commands Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#E52D27]" />
                  {gitTab === 'initial' ? 'Run Initial Push in Terminal:' : 'Run Push Changes in Terminal:'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      gitTab === 'initial' ? gitCommandsInitial : gitCommandsChanges,
                      gitTab === 'initial' ? 'all-git' : 'changes-git'
                    )
                  }
                  className="px-3 py-1 rounded bg-[#E52D27] hover:bg-[#c92520] text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
                >
                  {copiedId === 'all-git' || copiedId === 'changes-git' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {copiedId === 'all-git' || copiedId === 'changes-git'
                      ? 'Copied Commands!'
                      : 'Copy Entire Code'}
                  </span>
                </button>
              </div>

              {gitTab === 'initial' ? (
                <div className="p-4 bg-[#090a0c] border border-white/10 rounded-lg font-mono text-xs text-zinc-200 overflow-x-auto space-y-2 selection:bg-[#E52D27]/40 leading-relaxed">
                  <div>
                    <span className="text-zinc-500"># 1. Initialize git</span>
                    <div className="text-emerald-400 font-semibold">git init</div>
                  </div>
                  <div>
                    <span className="text-zinc-500"># 2. Stage all project files (.gitignore protects secrets automatically)</span>
                    <div className="text-emerald-400 font-semibold">git add .</div>
                  </div>
                  <div>
                    <span className="text-zinc-500"># 3. Create your first commit</span>
                    <div className="text-emerald-400 font-semibold">git commit -m &quot;{commitMessage || 'feat: complete FINEX WEB agency operating system'}&quot;</div>
                  </div>
                  <div>
                    <span className="text-zinc-500"># 4. Set main as the default branch</span>
                    <div className="text-emerald-400 font-semibold">git branch -M main</div>
                  </div>
                  <div>
                    <span className="text-zinc-500"># 5. Link to your GitHub repository (replace with your GitHub username and repo)</span>
                    <div className="text-sky-300 font-semibold">git remote add origin https://github.com/{githubUser || 'YOUR_USERNAME'}/{githubRepo || 'YOUR_REPO_NAME'}.git</div>
                  </div>
                  <div>
                    <span className="text-zinc-500"># 6. Push to GitHub</span>
                    <div className="text-amber-400 font-semibold">git push -u origin main</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#090a0c] border border-white/10 rounded-lg font-mono text-xs text-zinc-200 overflow-x-auto space-y-2 selection:bg-[#E52D27]/40 leading-relaxed">
                  <div>
                    <span className="text-zinc-500"># 1. Check status of modified files</span>
                    <div className="text-emerald-400 font-semibold">git status</div>
                  </div>
                  <div>
                    <span className="text-zinc-500"># 2. Stage all changes</span>
                    <div className="text-emerald-400 font-semibold">git add .</div>
                  </div>
                  <div>
                    <span className="text-zinc-500"># 3. Commit your changes</span>
                    <div className="text-emerald-400 font-semibold">git commit -m &quot;{changeMessage || 'update: push latest agency updates'}&quot;</div>
                  </div>
                  <div>
                    <span className="text-zinc-500"># 4. Push updates to GitHub</span>
                    <div className="text-amber-400 font-semibold">git push origin main</div>
                  </div>
                </div>
              )}
            </div>

            {/* Checklist & Safety Confirmation */}
            <div className="p-3.5 bg-[#18191c] border border-white/[0.06] rounded-lg space-y-2 text-xs">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Publishing Safety & Best Practices Checklist:</span>
              </div>
              <ul className="space-y-1.5 text-zinc-400 text-[11px] list-disc list-inside">
                <li><span className="text-zinc-200 font-medium">Secrets Safe:</span> <code className="text-[#E52D27] font-mono">.gitignore</code> already ignores <code className="font-mono">.env</code> and <code className="font-mono">node_modules/</code>. Your private keys will never be committed.</li>
                <li><span className="text-zinc-200 font-medium">Public vs Private:</span> On GitHub, you can set the repository to <strong>Private</strong> if this is strictly for your agency team.</li>
                <li><span className="text-zinc-200 font-medium">One-Click Deploy:</span> Once on GitHub, you can link it directly to <strong>Vercel</strong>, <strong>Netlify</strong>, or <strong>Cloudflare Pages</strong> for automated live hosting with zero config.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* View 1: Supabase Manager */}
      {activeSection === 'supabase' && <SupabaseManager />}

      {/* View 2: Agency & Bank Details */}
      {activeSection === 'general' && (
        <form onSubmit={handleSaveAll} className="space-y-6 text-xs">
          {saveSuccess && (
            <div className="px-3 py-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Agency identity and commercial remittance settings saved successfully.</span>
            </div>
          )}

          {/* Section 1: Agency Brand & Profile */}
          <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <Building2 className="w-4 h-4 text-[#E52D27]" />
              <h3 className="text-sm font-bold text-white">Agency Identity & Contact</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 mb-1">Agency Name</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full h-8 px-2.5 bg-[#18191c] border border-white/10 rounded text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">Tagline / Mission</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full h-8 px-2.5 bg-[#18191c] border border-white/10 rounded text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-300 mb-1">Official Support Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-8 px-2.5 bg-[#18191c] border border-white/10 rounded text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">Administrative Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-8 px-2.5 bg-[#18191c] border border-white/10 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">Currency Code & Symbol</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-16 h-8 px-2 bg-[#18191c] border border-white/10 rounded text-white font-mono"
                  />
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-12 h-8 px-2 bg-[#18191c] border border-white/10 rounded text-white text-center font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1">Office Registered Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-8 px-2.5 bg-[#18191c] border border-white/10 rounded text-white"
              />
            </div>
          </div>

          {/* Section 2: Bank Remittance & Invoicing details */}
          <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Commercial Bank Remittance Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-8 px-2.5 bg-[#18191c] border border-white/10 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full h-8 px-2.5 bg-[#18191c] border border-white/10 rounded text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-zinc-300 mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full h-8 px-2.5 bg-[#18191c] border border-white/10 rounded text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full h-8 px-2.5 bg-[#18191c] border border-white/10 rounded text-white font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">Official UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full h-8 px-2.5 bg-[#18191c] border border-white/10 rounded text-white font-mono text-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: WhatsApp Automation Templates */}
          <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Client WhatsApp Message Templates</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-zinc-300 mb-1">Lead Initial Greeting</label>
                <textarea
                  rows={2}
                  value={tplGreeting}
                  onChange={(e) => setTplGreeting(e.target.value)}
                  className="w-full p-2 bg-[#18191c] border border-white/10 rounded text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Quote Proposal Dispatch</label>
                <textarea
                  rows={2}
                  value={tplQuote}
                  onChange={(e) => setTplQuote(e.target.value)}
                  className="w-full p-2 bg-[#18191c] border border-white/10 rounded text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Payment Balance Reminder</label>
                <textarea
                  rows={2}
                  value={tplPayment}
                  onChange={(e) => setTplPayment(e.target.value)}
                  className="w-full p-2 bg-[#18191c] border border-white/10 rounded text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Monthly Maintenance Renewal Notice</label>
                <textarea
                  rows={2}
                  value={tplMaintenance}
                  onChange={(e) => setTplMaintenance(e.target.value)}
                  className="w-full p-2 bg-[#18191c] border border-white/10 rounded text-white font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Submit & Reset */}
          <div className="flex items-center justify-between pt-2">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 hover:bg-rose-900/40 rounded text-xs transition-colors"
              >
                Reset to Factory Seed Data
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetData}
                  className="px-3.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow transition-colors"
                >
                  Confirm Reset Demo Data
                </button>
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2 rounded bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save All Agency Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

