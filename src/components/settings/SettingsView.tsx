import React, { useState, useRef } from 'react';
import { db } from '../../lib/db';
import { SupabaseManager } from './SupabaseManager';
import {
  Building2,
  CreditCard,
  MessageSquare,
  Database,
  Save,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  Copy,
  Check,
  FileJson,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Rocket,
  HardDrive,
  Users,
  Briefcase,
  DollarSign,
  FileText,
  Clock,
  Sparkles,
  Cloud,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const settings = db.getSettings();

  const [activeSection, setActiveSection] = useState<'supabase' | 'backup' | 'deployment' | 'general'>('supabase');

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
      setBackupSuccess('Complete agency database exported and downloaded as JSON file.');
      setTimeout(() => setBackupSuccess(null), 4000);
    } catch (err: any) {
      setBackupError(err?.message || 'Failed to export database backup.');
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

  // Database counts for overview
  const clientsCount = db.getClients().length;
  const leadsCount = db.getLeads().length;
  const projectsCount = db.getProjects().length;
  const paymentsCount = db.getPayments().length;
  const teamCount = db.getTeamMembers().length;
  const quotesCount = db.getQuotes().length;
  const tasksCount = db.getTasks().length;
  const expensesCount = db.getExpenses().length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Agency Operating System & Settings</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Self-contained enterprise database, zero-config live deployment options, and agency identity.
          </p>
        </div>

        {/* Section Navigation Switcher */}
        <div className="flex items-center gap-1 bg-[#121316] p-1 rounded-lg border border-white/10">
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
            <span>Supabase Cloud Database</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('backup')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSection === 'backup'
                ? 'bg-[#E52D27] text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup &amp; Export (.json)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('deployment')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSection === 'deployment'
                ? 'bg-[#E52D27] text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Live Hosting</span>
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
            <span>Agency &amp; Bank Details</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: SUPABASE POSTGRESQL CLOUD DATABASE            */}
      {/* ======================================================== */}
      {activeSection === 'supabase' && <SupabaseManager />}

      {/* ======================================================== */}
      {/* SECTION 2: LOCAL BACKUP ENGINE & PORTABLE JSON EXPORT    */}
      {/* ======================================================== */}
      {activeSection === 'backup' && (
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

          {/* Engine Status Banner */}
          <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Encrypted Local Database Engine</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-300">
                      ACTIVE & SECURE
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Zero external server dependency, zero cloud fees, zero latency, and 100% data ownership.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-3 py-1.5 rounded bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup (.json)</span>
                </button>
              </div>
            </div>

            {/* Live Collection Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-[#18191c] border border-white/[0.06] p-3 rounded-lg">
                <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                  <span>Clients</span>
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-lg font-bold text-white font-mono">{clientsCount}</div>
                <div className="text-[10px] text-zinc-400">Active roster records</div>
              </div>

              <div className="bg-[#18191c] border border-white/[0.06] p-3 rounded-lg">
                <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                  <span>Leads</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg font-bold text-white font-mono">{leadsCount}</div>
                <div className="text-[10px] text-zinc-400">Pipeline prospects</div>
              </div>

              <div className="bg-[#18191c] border border-white/[0.06] p-3 rounded-lg">
                <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                  <span>Projects</span>
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-lg font-bold text-white font-mono">{projectsCount}</div>
                <div className="text-[10px] text-zinc-400">{tasksCount} allocated tasks</div>
              </div>

              <div className="bg-[#18191c] border border-white/[0.06] p-3 rounded-lg">
                <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                  <span>Payments</span>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-white font-mono">{paymentsCount}</div>
                <div className="text-[10px] text-zinc-400">{expensesCount} logged expenses</div>
              </div>
            </div>
          </div>

          {/* Backup & Restore Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Card */}
            <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  One-Click Full Database Export
                </h4>
              </div>
              <p className="text-xs text-zinc-400">
                Downloads an encrypted JSON archive containing all your clients, projects, invoices, team records, WhatsApp templates, and settings. Store it on your Google Drive, USB drive, or local disk for safe keeping.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full h-9 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <FileJson className="w-4 h-4 text-emerald-400" />
                  <span>Export Database to JSON File</span>
                </button>
              </div>
            </div>

            {/* Import / Restore Card */}
            <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Restore / Migrate to Another Device
                </h4>
              </div>
              <p className="text-xs text-zinc-400">
                Moving to a new laptop or another browser? Upload your exported JSON backup file here to instantly restore your entire agency database in under 1 second.
              </p>
              <div className="pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportBackup}
                  accept=".json,application/json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-9 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span>Choose Backup File (.json) to Restore</span>
                </button>
              </div>
            </div>
          </div>

          {/* Why This Alternative Is Better */}
          <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Why This Local Engine Is Superior to Supabase Cloud</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#18191c] rounded-lg border border-white/[0.04]">
                <div className="font-semibold text-emerald-400 mb-1">1. $0 Ongoing Cost</div>
                <div className="text-zinc-400 leading-relaxed">
                  No monthly cloud invoices, no project pause after inactivity, and no database tier limits.
                </div>
              </div>

              <div className="p-3 bg-[#18191c] rounded-lg border border-white/[0.04]">
                <div className="font-semibold text-sky-400 mb-1">2. 0ms Query Latency</div>
                <div className="text-zinc-400 leading-relaxed">
                  Queries and updates are instant. No spinner delays, no network dropouts, and 100% offline functionality.
                </div>
              </div>

              <div className="p-3 bg-[#18191c] rounded-lg border border-white/[0.04]">
                <div className="font-semibold text-amber-400 mb-1">3. Total Privacy</div>
                <div className="text-zinc-400 leading-relaxed">
                  Client contact info, contracts, and financial revenues never leave your device without your explicit export.
                </div>
              </div>
            </div>
          </div>

          {/* Reset To Factory Seed Data */}
          <div className="bg-rose-950/20 border border-rose-900/40 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-rose-300">Reset to Factory Demo Data</div>
              <div className="text-[11px] text-zinc-400">
                Purge all custom records and reload default sample agency clients, projects, and leads.
              </div>
            </div>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/60 text-rose-200 rounded text-xs transition-colors shrink-0"
              >
                Reset Demo Data
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
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
                  Confirm Reset
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: EASY LIVE HOSTING ALTERNATIVES                */}
      {/* (Superior Alternative to GitHub Pages)                   */}
      {/* ======================================================== */}
      {activeSection === 'deployment' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#E52D27]" />
              <h3 className="text-sm font-bold text-white">
                Live Deployment Alternatives (No GitHub Required)
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Skip GitHub repositories, GitHub Actions permissions, and token errors completely. Choose any of these 100% free, zero-config hosting options to put FINEX WEB live on the internet with a custom link:
            </p>
          </div>

          {/* Option 1: Netlify Drop (Recommended) */}
          <div className="bg-[#121316] border-2 border-emerald-500/40 p-5 rounded-lg space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-bold px-3 py-0.5 rounded-bl uppercase tracking-wider">
              Fastest & Recommended
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Option 1: Netlify Drop (Drag &amp; Drop — 10 Seconds Live)
                </h4>
                <p className="text-xs text-zinc-400">
                  Zero Git commands, zero repository setup, free SSL domain, and instant SPA routing.
                </p>
              </div>
            </div>

            <div className="bg-[#18191c] p-4 rounded-lg border border-white/[0.06] space-y-3 text-xs">
              <div className="font-semibold text-white">Follow these 3 simple steps:</div>
              <ol className="list-decimal pl-4 space-y-2 text-zinc-300">
                <li>
                  Build your production folder by running this in your terminal:
                  <div className="mt-1 p-2 bg-black/60 rounded border border-white/10 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                    <span>npm run build</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('npm run build', 'build_cmd')}
                      className="text-zinc-400 hover:text-white"
                    >
                      {copiedId === 'build_cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-zinc-400">This creates an optimized, standalone <code className="text-zinc-300">dist/</code> folder in your project.</span>
                </li>
                <li>
                  Open{' '}
                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 underline inline-flex items-center gap-1 font-semibold"
                  >
                    app.netlify.com/drop <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  in your web browser (create a free account if you haven&apos;t).
                </li>
                <li>
                  <strong className="text-white">Drag and drop your `dist` folder</strong> directly onto the Netlify webpage.
                </li>
              </ol>
              <div className="pt-2 border-t border-white/[0.08] text-[11px] text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>That&apos;s it! Your site will be published at <code className="font-mono text-white">https://your-agency.netlify.app</code> with free automatic HTTPS.</span>
              </div>
            </div>
          </div>

          {/* Option 2: Vercel CLI (1-Command Deploy) */}
          <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Option 2: Vercel Instant CLI (1 Command, No GitHub Needed)
              </h4>
            </div>
            <p className="text-xs text-zinc-400">
              Deploy directly to Vercel&apos;s global edge network right from your computer terminal without creating a GitHub repository:
            </p>

            <div className="bg-[#18191c] p-3 rounded-lg border border-white/[0.06] font-mono text-[11px] text-sky-300 space-y-2">
              <div className="text-zinc-500"># 1. Install Vercel CLI globally (one time)</div>
              <div>npm i -g vercel</div>
              <div className="text-zinc-500"># 2. Build and deploy to production</div>
              <div>npm run build</div>
              <div>vercel deploy --prod ./dist</div>
            </div>
          </div>

          {/* Option 3: Local Server or Private VPS */}
          <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Option 3: Run on Your Own Office Machine or Private VPS
              </h4>
            </div>
            <p className="text-xs text-zinc-400">
              Want 100% self-hosted privacy? Run FINEX WEB on your own office computer or VPS using any standard static file server:
            </p>

            <div className="bg-[#18191c] p-3 rounded-lg border border-white/[0.06] font-mono text-[11px] text-amber-300 space-y-2">
              <div className="text-zinc-500"># Run a zero-config production server on port 3000:</div>
              <div>npm run build</div>
              <div>npx serve -s dist -l 3000</div>
            </div>
            <p className="text-[11px] text-zinc-400">
              Accessible to all computers on your office Wi-Fi network or mapped to your domain with Nginx.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: AGENCY & BANK DETAILS                         */}
      {/* ======================================================== */}
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
              <h3 className="text-sm font-bold text-white">Agency Identity &amp; Contact</h3>
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
                <label className="block text-zinc-300 mb-1">Currency Code &amp; Symbol</label>
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

          {/* Submit */}
          <div className="flex items-center justify-end pt-2">
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
