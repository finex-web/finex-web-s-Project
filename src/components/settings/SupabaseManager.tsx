import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Trash2,
  Table,
  UploadCloud,
  DownloadCloud,
  FileCode2,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  resetSupabaseClient,
  removePastSupabaseHistory,
  testSupabaseConnection,
  SUPABASE_MIGRATION_SQL,
  SUPABASE_WIPE_SQL,
  SUPABASE_TRUNCATE_SQL,
  isValidSupabaseUrl,
  isValidSupabaseKey,
} from '../../lib/supabase';
import { db } from '../../lib/db';

export const SupabaseManager: React.FC = () => {
  const { url: initialUrl, anonKey: initialKey, isConfigured } = getSupabaseCredentials();

  const [projectUrl, setProjectUrl] = useState(initialUrl || '');
  const [anonKey, setAnonKey] = useState(initialKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);

  // Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // SQL Script Tabs
  const [activeTab, setActiveTab] = useState<'migration' | 'wipe' | 'truncate' | 'howtosee'>('howtosee');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const handleTest = async () => {
    setFormError(null);
    setTestResult(null);

    const cleanUrl = projectUrl.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      setFormError('Please enter both Supabase Project URL and Anon Public Key.');
      return;
    }

    if (!isValidSupabaseUrl(cleanUrl)) {
      setFormError('Invalid Project URL: Must start with https:// (e.g. https://xyzproject.supabase.co).');
      return;
    }

    if (!isValidSupabaseKey(cleanKey)) {
      setFormError('Invalid Anon Key: Please paste your complete anon public key from Supabase Project Settings > API.');
      return;
    }

    setIsTesting(true);
    const res = await testSupabaseConnection(cleanUrl, cleanKey);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = async () => {
    setFormError(null);
    const cleanUrl = projectUrl.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      setFormError('Please enter both Project URL and Anon Key.');
      return;
    }

    if (!isValidSupabaseUrl(cleanUrl)) {
      setFormError('Invalid Project URL: Must start with https:// (e.g. https://xyzproject.supabase.co).');
      return;
    }

    if (!isValidSupabaseKey(cleanKey)) {
      setFormError('Invalid Anon Key: Please paste your complete anon public key from Supabase Project Settings > API.');
      return;
    }

    resetSupabaseClient(cleanUrl, cleanKey);
    setSaveSuccess(true);
    db.logActivity('Database Connected', 'Supabase PostgreSQL', `Linked Supabase project: ${cleanUrl}`);

    // Trigger immediate pull from Supabase
    setIsSyncing(true);
    const res = await db.syncFromSupabase();
    setIsSyncing(false);
    setSyncStatus(res.message);

    setTimeout(() => {
      setSaveSuccess(false);
      setSyncStatus(null);
    }, 5000);
  };

  const handleDisconnect = () => {
    removePastSupabaseHistory();
    setProjectUrl('');
    setAnonKey('');
    setTestResult(null);
    setShowWipeConfirm(false);
    setWipeSuccess(true);
    db.logActivity('Database Disconnected', 'Supabase Disconnected', 'Cleared Supabase credentials and reset to local cache.');
    setTimeout(() => setWipeSuccess(false), 4000);
  };

  const handlePullFromSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    const res = await db.syncFromSupabase();
    setIsSyncing(false);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const handlePushToSupabase = async () => {
    setIsPushing(true);
    setSyncStatus(null);
    const res = await db.pushAllToSupabase();
    setIsPushing(false);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const handlePurgeAllDemoData = () => {
    db.purgeAllDemoData();
    setSyncStatus('All dummy demo clients, leads, projects, and records have been deleted!');
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const handleCopy = (sqlText: string, scriptId: string) => {
    navigator.clipboard.writeText(sqlText);
    setCopiedScript(scriptId);
    setTimeout(() => setCopiedScript(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Current Status */}
      <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isConfigured
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Supabase PostgreSQL Cloud Database</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    isConfigured
                      ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  {isConfigured ? 'CONNECTED & SYNCING' : 'NOT CONNECTED'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {isConfigured
                  ? `Active Cloud Database: ${initialUrl}`
                  : 'Connect your Supabase project to store clients, leads, projects, and invoices directly in PostgreSQL.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Open Supabase Console</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>
        </div>

        {/* Sync notifications */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 rounded text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Supabase credentials saved and active! Records are now syncing with your live cloud database.</span>
          </div>
        )}

        {syncStatus && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 rounded text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {wipeSuccess && (
          <div className="p-3 bg-zinc-900 border border-white/10 text-zinc-300 rounded text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>Supabase credentials and past cached history have been removed.</span>
          </div>
        )}

        {/* Quick Sync Action Buttons when Connected */}
        {isConfigured && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handlePullFromSupabase}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <DownloadCloud className={`w-3.5 h-3.5 text-sky-400 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Pull Live Data from Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={handlePushToSupabase}
              disabled={isPushing}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <UploadCloud className={`w-3.5 h-3.5 text-emerald-400 ${isPushing ? 'animate-bounce' : ''}`} />
              <span>{isPushing ? 'Pushing...' : 'Push Local Records to Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={handlePurgeAllDemoData}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Demo Data</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Card for Disconnecting Supabase */}
      {showWipeConfirm && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm text-rose-100">Confirm Disconnection of Supabase</div>
              <p className="text-xs text-rose-200/80 leading-relaxed">
                This will delete stored Supabase project URLs, Anon API keys, and cached auth session tokens from your browser.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-8">
            <button
              type="button"
              onClick={handleDisconnect}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded text-xs shadow transition-colors"
            >
              Yes, Disconnect
            </button>
            <button
              type="button"
              onClick={() => setShowWipeConfirm(false)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Credentials Inputs */}
      <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Supabase Credentials Configuration</span>
        </h4>

        {formError && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-rose-300 rounded text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {testResult && (
          <div
            className={`p-3 rounded text-xs flex items-center gap-2 border ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div className="font-semibold">{testResult.message}</div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full h-9 px-3 bg-[#18191c] border border-white/10 rounded text-white font-mono text-xs focus:border-[#E52D27] focus:outline-none"
            />
            <span className="text-[11px] text-zinc-400 mt-1 block">
              Found in Supabase: <strong>Project Settings &gt; API &gt; Project URL</strong>
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full h-9 px-3 bg-[#18191c] border border-white/10 rounded text-white font-mono text-xs focus:border-[#E52D27] focus:outline-none"
            />
            <span className="text-[11px] text-zinc-400 mt-1 block">
              Found in Supabase: <strong>Project Settings &gt; API &gt; Project API keys &gt; anon (public)</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing Connection...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-[#E52D27] hover:bg-[#c92520] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save &amp; Connect Supabase</span>
            </button>
          </div>

          {isConfigured && (
            <button
              type="button"
              onClick={() => setShowWipeConfirm(true)}
              className="px-3 py-1.5 text-zinc-400 hover:text-rose-400 text-xs transition-colors"
            >
              Disconnect Supabase
            </button>
          )}
        </div>
      </div>

      {/* Tabs: How to See Your Data vs SQL Scripts */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-lg overflow-hidden">
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center gap-1 bg-[#18191c] p-2 border-b border-white/[0.08]">
          <button
            type="button"
            onClick={() => setActiveTab('howtosee')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'howtosee'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>How to See Your Data in Supabase</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('migration')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'migration'
                ? 'bg-[#E52D27] text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>1. Schema Migration (Create Tables)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wipe')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'wipe'
                ? 'bg-rose-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>2. Wipe Tables SQL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('truncate')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'truncate'
                ? 'bg-amber-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>3. Truncate Data SQL</span>
          </button>
        </div>

        {/* Tab 1: How to See Your Data in Supabase (Exact Walkthrough) */}
        {activeTab === 'howtosee' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>Exact Guide: How to See and Edit Your CRM Data in Supabase</span>
                </h4>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Whenever you create a client, project, or invoice in FINEX WEB, it is saved directly to your Supabase tables.
                </p>
              </div>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs flex items-center gap-1 shrink-0"
              >
                <span>Go to Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#18191c] rounded-lg border border-white/[0.06] space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono">1</span>
                  <span>Open Table Editor</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Log in to <strong>supabase.com/dashboard</strong> and select your project. In the left-side navigation bar, click on the <strong>Table Editor</strong> icon (it looks like a grid or spreadsheet table).
                </p>
              </div>

              <div className="p-4 bg-[#18191c] rounded-lg border border-white/[0.06] space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono">2</span>
                  <span>Select Any Table from the List</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  On the left of the Table Editor, you will see all your agency tables:
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono text-[11px]">
                  <span className="text-emerald-400">• public.clients</span>
                  <span className="text-sky-400">• public.projects</span>
                  <span className="text-amber-400">• public.leads</span>
                  <span className="text-emerald-400">• public.payments</span>
                  <span className="text-indigo-400">• public.tasks</span>
                  <span className="text-rose-400">• public.expenses</span>
                  <span className="text-purple-400">• public.quotes</span>
                  <span className="text-zinc-300">• public.team_members</span>
                </div>
              </div>

              <div className="p-4 bg-[#18191c] rounded-lg border border-white/[0.06] space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono">3</span>
                  <span>View, Search, and Edit Live Rows</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Click on <strong>public.clients</strong> to see every client you entered in FINEX WEB. You can double-click any cell to edit details directly, use the search bar at the top, or click &quot;Filter&quot; to sort by status.
                </p>
              </div>

              <div className="p-4 bg-[#18191c] rounded-lg border border-white/[0.06] space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono">4</span>
                  <span>Export to CSV or Spreadsheet</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  At the top-right of any table in Supabase, click <strong>&quot;Export&quot;</strong> &gt; <strong>&quot;Download CSV&quot;</strong> to export your complete client list, revenue ledger, or project logs into Excel.
                </p>
              </div>
            </div>

            {/* Note about Table Creation */}
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Don&apos;t see the tables in Supabase Table Editor yet?</strong>
                <p className="text-amber-300/80 mt-0.5">
                  Click the <strong>&quot;1. Schema Migration (Create Tables)&quot;</strong> tab above, copy the SQL script, paste it into your Supabase <strong>SQL Editor</strong>, and click <strong>&quot;Run&quot;</strong>. This creates all 22 tables instantly!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Schema Migration */}
        {activeTab === 'migration' && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  PostgreSQL Table Creation Script (22 Tables)
                </h4>
                <p className="text-zinc-400 text-xs">
                  Run this in Supabase SQL Editor to create all tables, indexes, and Row Level Security policies.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(SUPABASE_MIGRATION_SQL, 'migration')}
                className="px-3 py-1.5 bg-[#E52D27] hover:bg-[#c92520] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
              >
                {copiedScript === 'migration' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript === 'migration' ? 'Copied to Clipboard!' : 'Copy Migration SQL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-black/60 rounded border border-white/10 text-[11px] font-mono text-emerald-400 max-h-72 overflow-y-auto">
              <code>{SUPABASE_MIGRATION_SQL}</code>
            </pre>
          </div>
        )}

        {/* Tab 3: Wipe Tables */}
        {activeTab === 'wipe' && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Wipe / Drop All Tables Script
                </h4>
                <p className="text-zinc-400 text-xs">
                  Destructive action: Completely drops all 22 FINEX WEB tables and past history from Supabase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(SUPABASE_WIPE_SQL, 'wipe')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
              >
                {copiedScript === 'wipe' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript === 'wipe' ? 'Copied to Clipboard!' : 'Copy Wipe SQL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-black/60 rounded border border-white/10 text-[11px] font-mono text-rose-400 max-h-72 overflow-y-auto">
              <code>{SUPABASE_WIPE_SQL}</code>
            </pre>
          </div>
        )}

        {/* Tab 4: Truncate Data */}
        {activeTab === 'truncate' && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Truncate Data Script (Keep Tables, Empty All Rows)
                </h4>
                <p className="text-zinc-400 text-xs">
                  Clears all rows from all tables in Supabase while preserving the schemas and column definitions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(SUPABASE_TRUNCATE_SQL, 'truncate')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
              >
                {copiedScript === 'truncate' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript === 'truncate' ? 'Copied to Clipboard!' : 'Copy Truncate SQL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-black/60 rounded border border-white/10 text-[11px] font-mono text-amber-400 max-h-72 overflow-y-auto">
              <code>{SUPABASE_TRUNCATE_SQL}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
