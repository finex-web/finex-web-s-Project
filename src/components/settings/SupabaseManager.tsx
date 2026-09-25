import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Key,
  Globe,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Zap,
  Terminal,
  FileCode,
  BookOpen,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  isSupabaseConfigured,
  resetSupabaseClient,
  removePastSupabaseHistory,
  testSupabaseConnection,
  sanitizeSupabaseUrl,
  isValidSupabaseUrl,
  isValidSupabaseKey,
  SUPABASE_MIGRATION_SQL,
  SUPABASE_WIPE_SQL,
  SUPABASE_TRUNCATE_SQL,
} from '../../lib/supabase';
import { db } from '../../lib/db';

export const SupabaseManager: React.FC = () => {
  const credentials = getSupabaseCredentials();
  const [url, setUrl] = useState(credentials.url);
  const [anonKey, setAnonKey] = useState(credentials.anonKey);
  const [showKey, setShowKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());

  // Testing & Save states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showConfirmPurge, setShowConfirmPurge] = useState(false);

  // SQL Tabs
  const [activeTab, setActiveTab] = useState<'migration' | 'wipe' | 'truncate' | 'guide'>('guide');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleTest = async () => {
    setFormError(null);
    setTesting(true);
    setTestResult(null);
    try {
      const sanitized = sanitizeSupabaseUrl(url);
      if (sanitized !== url) setUrl(sanitized);

      const res = await testSupabaseConnection(sanitized, anonKey);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e?.message || 'Connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveAndConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setTestResult(null);

    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      setFormError('Please provide both your Supabase Project URL and Public Anon API Key.');
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

    setUrl(cleanUrl);
    resetSupabaseClient(cleanUrl, cleanKey);
    setIsConfigured(true);
    setSaveSuccess(true);
    db.logActivity('Database Connected', 'Supabase PostgreSQL', `Linked Supabase project: ${cleanUrl}`);
    setTimeout(() => setSaveSuccess(false), 5000);
  };

  const handleConfirmRemovePastHistory = () => {
    removePastSupabaseHistory();
    db.resetToInitialData();
    setUrl('');
    setAnonKey('');
    setIsConfigured(false);
    setTestResult(null);
    setFormError(null);
    setShowConfirmPurge(false);
    setPurgeSuccess(true);
    db.logActivity('Database Reset', 'Supabase Disconnected', 'Cleared past Supabase credentials and reset local state.');
    setTimeout(() => setPurgeSuccess(false), 5000);
  };

  const handleCopy = (text: string, tabId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  return (
    <div className="bg-[#121316] border border-white/[0.08] p-5 rounded-lg space-y-6">
      {/* Title & Connection Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#E52D27]/10 border border-[#E52D27]/30 flex items-center justify-center text-[#E52D27]">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Supabase PostgreSQL Database Engine
              {isConfigured ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-mono text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  CONNECTED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 font-mono text-[10px]">
                  DISCONNECTED (OFFLINE CACHE)
                </span>
              )}
            </h3>
            <p className="text-[11px] text-zinc-400">
              Private agency persistence engine with Row Level Security (RLS) and automatic real-time synchronization.
            </p>
          </div>
        </div>

        {/* Supabase external link */}
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18191c] hover:bg-[#202226] border border-white/10 text-[11px] text-zinc-300 hover:text-white transition-colors"
        >
          <span>Open Supabase Console</span>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </a>
      </div>

      {/* Alerts */}
      {formError && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-rose-300 rounded text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 rounded text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Supabase credentials saved and active. All agency records will now synchronize with your Supabase PostgreSQL cloud database.</span>
        </div>
      )}

      {purgeSuccess && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/60 text-amber-300 rounded text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Past Supabase credentials, auth tokens, and session history have been completely removed. FINEX WEB is reset.</span>
        </div>
      )}

      {/* Confirmation Card for Removing Supabase History */}
      {showConfirmPurge && (
        <div className="p-4 bg-rose-950/60 border border-rose-600/80 rounded-lg text-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5 text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-rose-100">Confirm Removal of Past Supabase History & Disconnect</div>
              <p className="mt-1 text-rose-200/90 leading-relaxed">
                This action will delete all stored Supabase project URLs, Anon API keys, and cached auth session tokens from your browser storage. It will disconnect FINEX WEB from Supabase and return the app to offline cache mode.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-rose-900/50">
            <button
              type="button"
              onClick={() => setShowConfirmPurge(false)}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemovePastHistory}
              className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Yes, Disconnect & Clear All History</span>
            </button>
          </div>
        </div>
      )}

      {testResult && (
        <div
          className={`p-3 rounded text-xs flex items-start gap-2 border ${
            testResult.success
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-semibold">{testResult.success ? 'Supabase Connection Test Successful' : 'Supabase Connection Test Failed'}</div>
            <div className="text-[11px] mt-0.5 opacity-90">{testResult.message}</div>
          </div>
        </div>
      )}

      {/* Supabase Credentials Inputs */}
      <form onSubmit={handleSaveAndConnect} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-300 text-xs font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                Supabase Project URL
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Project Settings &gt; API</span>
            </label>
            <input
              type="text"
              placeholder="https://your-project-id.supabase.co"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (formError) setFormError(null);
              }}
              className="w-full h-8 px-2.5 bg-[#18191c] border border-white/10 rounded text-white font-mono text-xs focus:border-[#E52D27] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-zinc-300 text-xs font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Supabase Anon Public API Key
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">anon public (safe for client)</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => {
                  setAnonKey(e.target.value);
                  if (formError) setFormError(null);
                }}
                className="w-full h-8 pl-2.5 pr-8 bg-[#18191c] border border-white/10 rounded text-white font-mono text-xs focus:border-[#E52D27] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-300"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !url.trim() || !anonKey.trim()}
              className="h-8 px-3 rounded bg-[#1e2024] hover:bg-[#282a30] text-zinc-200 border border-white/10 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="submit"
              className="h-8 px-4 rounded bg-[#E52D27] hover:bg-[#c92520] text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save & Connect Supabase</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmPurge(true)}
            className="h-8 px-3 rounded bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Wipe past Supabase credentials, tokens, and cached history from this application"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Remove Past Supabase History & Disconnect</span>
          </button>
        </div>
      </form>

      {/* Tabs for SQL scripts & Full Step Guide */}
      <div className="pt-4 border-t border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-[#18191c] p-1 rounded-md border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'guide'
                  ? 'bg-[#E52D27] text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Full Step Setup Guide</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('migration')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'migration'
                  ? 'bg-[#E52D27] text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>1. Schema Migration (Create All 22 Tables)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wipe')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'wipe'
                  ? 'bg-rose-900 text-white shadow'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>2. Wipe Past History (Drop All Tables)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('truncate')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'truncate'
                  ? 'bg-amber-800 text-white shadow'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>3. Truncate Data (Purge Rows Only)</span>
            </button>
          </div>

          {activeTab !== 'guide' && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'migration') handleCopy(SUPABASE_MIGRATION_SQL, 'migration');
                if (activeTab === 'wipe') handleCopy(SUPABASE_WIPE_SQL, 'wipe');
                if (activeTab === 'truncate') handleCopy(SUPABASE_TRUNCATE_SQL, 'truncate');
              }}
              className="px-3 py-1 rounded bg-[#1e2024] hover:bg-[#282a30] text-zinc-200 border border-white/10 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedTab === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy SQL Script</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Tab 1: Full Step Setup Guide */}
        {activeTab === 'guide' && (
          <div className="bg-[#18191c] border border-white/[0.06] rounded-lg p-5 space-y-5 text-xs text-zinc-300">
            <div className="pb-3 border-b border-white/[0.06]">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E52D27]" />
                Complete Walkthrough: Connecting & Managing Supabase for FINEX WEB
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Follow these precise steps to provision your Supabase PostgreSQL database, create your master admin account, and purge past history whenever needed.
              </p>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E52D27] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs">Create Free Supabase Project</div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Log in to{' '}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline"
                    >
                      supabase.com/dashboard
                    </a>
                    , click <strong>"New Project"</strong>, set the name to <code className="text-zinc-200 bg-black/40 px-1 py-0.5 rounded">FINEX WEB</code>, enter a strong database password, and select your preferred region (e.g. Mumbai / Singapore / US).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E52D27] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs">Execute Database Migration Script</div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    In your Supabase project dashboard, navigate to <strong>SQL Editor</strong> (terminal icon on left sidebar). Click <strong>"New query"</strong>. Switch to the <strong>"1. Schema Migration"</strong> tab above, click <strong>"Copy SQL Script"</strong>, paste it into the Supabase SQL Editor, and click <strong>"Run"</strong> (green button). This creates all 22 tables, foreign keys, indexes, RLS policies, and the user auth trigger.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E52D27] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs">Create Master Admin User in Supabase Auth</div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Go to <strong>Authentication</strong> &gt; <strong>Users</strong> in Supabase dashboard. Click <strong>"Add user"</strong> &gt; <strong>"Create user"</strong>. Enter:
                  </p>
                  <div className="bg-[#121316] p-2.5 rounded border border-white/5 font-mono text-[11px] space-y-1 text-zinc-300">
                    <div>Email: <strong className="text-white">finexxweb@gmail.com</strong></div>
                    <div>Password: <span className="text-zinc-400">(Your chosen secure password)</span></div>
                    <div>Auto Confirm User: <span className="text-emerald-400 font-semibold">Yes (Checked)</span></div>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    The automatic trigger created in Step 2 immediately writes an administrative profile record into <code className="text-zinc-300">public.profiles</code> with role <code className="text-zinc-300">OWNER / ADMIN</code>.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E52D27] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs">Copy API URL & Anon Key</div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    In Supabase, go to <strong>Project Settings</strong> (gear icon bottom left) &gt; <strong>API</strong>. Copy:
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-0.5 ml-1">
                    <li><strong>Project URL</strong> (e.g. <code className="text-zinc-300">https://xyzcompany.supabase.co</code>)</li>
                    <li><strong>Project API Keys</strong> &gt; <code className="text-zinc-300">anon</code> / <code className="text-zinc-300">public</code> key (starts with <code className="text-zinc-300">eyJ...</code>)</li>
                  </ul>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E52D27] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  5
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs">Connect in FINEX WEB Operating System</div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Paste the Project URL and Anon Key into the inputs above and click <strong>"Test Connection"</strong>. Once verified, click <strong>"Save & Connect Supabase"</strong>. The status badge will switch to <span className="text-emerald-400 font-semibold">CONNECTED</span>.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  6
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs">How to Remove Past Supabase History</div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Whenever you need to remove past Supabase data or reset from scratch:
                  </p>
                  <div className="space-y-2 mt-1">
                    <div className="bg-[#121316] p-2.5 rounded border border-rose-900/30 text-[11px]">
                      <strong className="text-rose-400 block mb-0.5">To Wipe the Supabase Database:</strong>
                      Go to the <strong>"2. Wipe Past History"</strong> tab above, copy the script, and run it in Supabase SQL Editor. It completely drops all 22 tables and past history.
                    </div>
                    <div className="bg-[#121316] p-2.5 rounded border border-rose-900/30 text-[11px]">
                      <strong className="text-rose-400 block mb-0.5">To Disconnect & Clear App Storage:</strong>
                      Click the red <strong>"Remove Past Supabase History & Disconnect"</strong> button above. This wipes stored keys, auth tokens, and resets your local app session.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Migration SQL */}
        {activeTab === 'migration' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
              <span>Full SQL Schema (22 Tables, Primary/Foreign Keys, Timestamps, Indexes & RLS):</span>
              <span className="font-mono text-zinc-500">PostgreSQL (Supabase compatible)</span>
            </div>
            <pre className="p-3 bg-[#0a0b0c] border border-white/10 rounded-lg text-[11px] text-zinc-300 font-mono overflow-x-auto max-h-96 leading-relaxed selection:bg-[#E52D27]/30">
              <code>{SUPABASE_MIGRATION_SQL}</code>
            </pre>
          </div>
        )}

        {/* Tab 3: Wipe History SQL */}
        {activeTab === 'wipe' && (
          <div className="space-y-2">
            <div className="p-3 rounded bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Destructive Action: Wipes All Supabase Database Tables & History</span>
                <span className="text-[11px] opacity-90">
                  Run this script in Supabase SQL Editor when you want to remove all past test records, past schemas, and tables. Afterward, you can re-run the Migration script to start fresh.
                </span>
              </div>
            </div>
            <pre className="p-3 bg-[#0a0b0c] border border-white/10 rounded-lg text-[11px] text-rose-300 font-mono overflow-x-auto max-h-72 leading-relaxed">
              <code>{SUPABASE_WIPE_SQL}</code>
            </pre>
          </div>
        )}

        {/* Tab 4: Truncate SQL */}
        {activeTab === 'truncate' && (
          <div className="space-y-2">
            <div className="p-3 rounded bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Purge Data Records Only (Retains Tables & Column Structure)</span>
                <span className="text-[11px] opacity-90">
                  Run this in Supabase SQL Editor to delete every row across all 22 tables without dropping tables or altering constraints.
                </span>
              </div>
            </div>
            <pre className="p-3 bg-[#0a0b0c] border border-white/10 rounded-lg text-[11px] text-amber-300 font-mono overflow-x-auto max-h-72 leading-relaxed">
              <code>{SUPABASE_TRUNCATE_SQL}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
