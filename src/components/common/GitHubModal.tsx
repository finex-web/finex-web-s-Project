import React, { useState } from 'react';
import {
  X,
  Github,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  GitBranch,
  ShieldCheck,
  RefreshCw,
  Code,
  Upload,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'initial' | 'push_changes' | 'actions' | 'troubleshoot'>('troubleshoot');
  const [username, setUsername] = useState('YOUR_USERNAME');
  const [repoName, setRepoName] = useState('YOUR_REPO_NAME');
  const [commitMessage, setCommitMessage] = useState('feat: complete FINEX WEB agency operating system');
  const [updateCommitMessage, setUpdateCommitMessage] = useState('update: push latest agency updates');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Exact code requested by the user
  const initialCodeRaw = `# 1. Initialize git
git init

# 2. Stage all project files (.gitignore protects secrets automatically)
git add .

# 3. Create your first commit
git commit -m "${commitMessage || 'feat: complete FINEX WEB agency operating system'}"

# 4. Set main as the default branch
git branch -M main

# 5. Link to your GitHub repository (replace with your GitHub username and repo)
git remote add origin https://github.com/${username || 'YOUR_USERNAME'}/${repoName || 'YOUR_REPO_NAME'}.git

# 6. Push to GitHub
git push -u origin main`;

  // Push changes code
  const pushChangesCode = `# 1. Check status of modified files
git status

# 2. Stage all changes
git add .

# 3. Commit your changes
git commit -m "${updateCommitMessage || 'update: push latest agency updates'}"

# 4. Push updates to GitHub
git push origin main`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#111215] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#15171b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-white">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Push Code & Changes to GitHub
              </h2>
              <p className="text-[11px] text-zinc-400">
                Official terminal commands to publish and push updates for FINEX WEB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-white/10 transition-colors"
            >
              <span>Create New Repo</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 border-b border-white/[0.06] flex items-center gap-2 bg-[#121417]">
          <button
            type="button"
            onClick={() => setActiveTab('initial')}
            className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'initial'
                ? 'border-[#E52D27] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>1. Initial Setup & Push</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('push_changes')}
            className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'push_changes'
                ? 'border-[#E52D27] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>2. Push Future Changes / Updates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('actions')}
            className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'actions'
                ? 'border-[#E52D27] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>3. Actions Explained</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('troubleshoot')}
            className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'troubleshoot'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>4. Fix Failing Checks (9s / 10s)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Customization Inputs */}
          <div className="p-3.5 bg-[#17191d] border border-white/[0.06] rounded-lg space-y-3">
            <div className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Personalize Your Commands:</span>
              <button
                type="button"
                onClick={() => {
                  setUsername('YOUR_USERNAME');
                  setRepoName('YOUR_REPO_NAME');
                }}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Reset placeholders
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">GitHub Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  placeholder="YOUR_USERNAME"
                  className="w-full h-8 px-2.5 bg-[#101214] border border-white/10 rounded text-white font-mono text-xs focus:border-[#E52D27] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Repository Name</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value.trim())}
                  placeholder="YOUR_REPO_NAME"
                  className="w-full h-8 px-2.5 bg-[#101214] border border-white/10 rounded text-white font-mono text-xs focus:border-[#E52D27] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-zinc-400 mb-1">
                  {activeTab === 'initial' ? 'Initial Commit Message' : 'Change Update Message'}
                </label>
                <input
                  type="text"
                  value={activeTab === 'initial' ? commitMessage : updateCommitMessage}
                  onChange={(e) =>
                    activeTab === 'initial'
                      ? setCommitMessage(e.target.value)
                      : setUpdateCommitMessage(e.target.value)
                  }
                  className="w-full h-8 px-2.5 bg-[#101214] border border-white/10 rounded text-white font-mono text-xs focus:border-[#E52D27] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* TAB 1: INITIAL SETUP COMMANDS */}
          {activeTab === 'initial' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#E52D27]" />
                  Initial Push Commands:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(initialCodeRaw, 'init-all')}
                  className="px-3 py-1 rounded bg-[#E52D27] hover:bg-[#c92520] text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
                >
                  {copiedId === 'init-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'init-all' ? 'Copied Code!' : 'Copy Entire Code'}</span>
                </button>
              </div>

              <div className="relative group">
                <pre className="p-4 bg-[#090a0c] border border-white/10 rounded-lg font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed selection:bg-[#E52D27]/40">
                  <span className="text-zinc-500"># 1. Initialize git</span>{'\n'}
                  <span className="text-emerald-400 font-semibold">git init</span>{'\n\n'}
                  <span className="text-zinc-500"># 2. Stage all project files (.gitignore protects secrets automatically)</span>{'\n'}
                  <span className="text-emerald-400 font-semibold">git add .</span>{'\n\n'}
                  <span className="text-zinc-500"># 3. Create your first commit</span>{'\n'}
                  <span className="text-emerald-400 font-semibold">git commit -m &quot;{commitMessage || 'feat: complete FINEX WEB agency operating system'}&quot;</span>{'\n\n'}
                  <span className="text-zinc-500"># 4. Set main as the default branch</span>{'\n'}
                  <span className="text-emerald-400 font-semibold">git branch -M main</span>{'\n\n'}
                  <span className="text-zinc-500"># 5. Link to your GitHub repository (replace with your GitHub username and repo)</span>{'\n'}
                  <span className="text-sky-300 font-semibold">git remote add origin https://github.com/{username || 'YOUR_USERNAME'}/{repoName || 'YOUR_REPO_NAME'}.git</span>{'\n\n'}
                  <span className="text-zinc-500"># 6. Push to GitHub</span>{'\n'}
                  <span className="text-amber-400 font-semibold">git push -u origin main</span>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: PUSH CHANGES COMMANDS */}
          {activeTab === 'push_changes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#E52D27]" />
                  Push Future Changes Commands:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(pushChangesCode, 'push-all')}
                  className="px-3 py-1 rounded bg-[#E52D27] hover:bg-[#c92520] text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
                >
                  {copiedId === 'push-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'push-all' ? 'Copied Code!' : 'Copy Push Code'}</span>
                </button>
              </div>

              <div className="relative group">
                <pre className="p-4 bg-[#090a0c] border border-white/10 rounded-lg font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed selection:bg-[#E52D27]/40">
                  <span className="text-zinc-500"># 1. Check status of modified files</span>{'\n'}
                  <span className="text-emerald-400 font-semibold">git status</span>{'\n\n'}
                  <span className="text-zinc-500"># 2. Stage all changes</span>{'\n'}
                  <span className="text-emerald-400 font-semibold">git add .</span>{'\n\n'}
                  <span className="text-zinc-500"># 3. Commit your changes</span>{'\n'}
                  <span className="text-emerald-400 font-semibold">git commit -m &quot;{updateCommitMessage || 'update: push latest agency updates'}&quot;</span>{'\n\n'}
                  <span className="text-zinc-500"># 4. Push updates to GitHub</span>{'\n'}
                  <span className="text-amber-400 font-semibold">git push origin main</span>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB ACTIONS EXPLANATION & OPTIONS */}
          {activeTab === 'actions' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#17191d] border border-white/[0.08] rounded-lg space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#E52D27]" />
                  <span>Why is GitHub showing "Get started with GitHub Actions"?</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  GitHub automatically offers Actions for new repositories to set up CI/CD (Continuous Integration & Automated Deployment). You have 3 easy choices:
                </p>
              </div>

              {/* Option 1 */}
              <div className="p-3.5 bg-[#17191d] border border-white/[0.06] rounded-lg space-y-1.5">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span className="text-emerald-400">Choice 1: Just view your code (Skip Actions)</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">Easiest</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  If you just want to see your files, simply click the <strong className="text-white font-semibold">"Code"</strong> tab at the very top-left of the GitHub page. You don't have to configure any actions right now.
                </p>
              </div>

              {/* Option 2 */}
              <div className="p-3.5 bg-[#17191d] border border-emerald-800/40 bg-emerald-950/20 rounded-lg space-y-2">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span className="text-emerald-300">Choice 2: Push pre-configured CI & Deployment workflows</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-[10px] text-emerald-300 font-mono">Recommended</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  We have already created the official <code className="text-emerald-400 font-mono">.github/workflows/ci.yml</code> and <code className="text-emerald-400 font-mono">deploy-pages.yml</code> files for you! Run this in your terminal to push them:
                </p>
                <div className="relative group">
                  <pre className="p-3 bg-[#090a0c] border border-white/10 rounded font-mono text-[11px] text-zinc-200 overflow-x-auto leading-relaxed">
                    <span className="text-emerald-400 font-semibold">git add .</span>{'\n'}
                    <span className="text-emerald-400 font-semibold">git commit -m &quot;ci: add GitHub Actions build & deploy workflows&quot;</span>{'\n'}
                    <span className="text-amber-400 font-semibold">git push origin main</span>
                  </pre>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        'git add .\ngit commit -m "ci: add GitHub Actions build & deploy workflows"\ngit push origin main',
                        'actions-push'
                      )
                    }
                    className="absolute right-2 top-2 px-2.5 py-1 rounded bg-[#E52D27] hover:bg-[#c92520] text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copiedId === 'actions-push' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'actions-push' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Option 3 */}
              <div className="p-3.5 bg-[#17191d] border border-white/[0.06] rounded-lg space-y-1.5">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span className="text-sky-400">Choice 3: Free Live Hosting via GitHub Pages</span>
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-[10px] text-sky-400 font-mono">Free Hosting</span>
                </div>
                <ol className="text-[11px] text-zinc-400 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>In your GitHub repo, click <strong className="text-white">Settings</strong> (gear icon).</li>
                  <li>Click <strong className="text-white">Pages</strong> on the left sidebar.</li>
                  <li>Under <em>Build and deployment</em> &gt; <em>Source</em>, select <strong className="text-white font-mono">GitHub Actions</strong>.</li>
                  <li>Every push to <code className="font-mono text-zinc-300">main</code> will automatically build and publish your website!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: FIX FAILING CHECKS (CI & PAGES) */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-amber-950/30 border border-amber-800/40 rounded-lg space-y-2">
                <div className="font-bold text-amber-300 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Why Did The 2 Checks Fail After 9-10s?</span>
                </div>
                <div className="text-[11px] text-zinc-300 space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-white">1. CI &amp; Build Verification (Failing after 9s):</strong> GitHub Actions runner failed during <code className="text-amber-300 font-mono">npm install</code> because <code className="text-amber-300 font-mono">package-lock.json</code> was missing and <code className="text-amber-300 font-mono">cache: &apos;npm&apos;</code> threw an error, alongside an upstream peer dependency flag with Vite 8.
                  </p>
                  <p>
                    <strong className="text-white">2. Deploy to GitHub Pages (Failing after 10s):</strong> In addition to the install step above, GitHub Pages by default expects a branch unless you toggle its source to <em>&quot;GitHub Actions&quot;</em> in your repository Settings.
                  </p>
                </div>
              </div>

              {/* Step 1: Push the fix */}
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Step 1: Push The Applied Fix (Ready To Copy)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-[10px] text-emerald-300 font-mono">1-Click Fix</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  We have already fixed the workflows, generated a clean <code className="text-emerald-400 font-mono">package-lock.json</code>, and added <code className="text-emerald-400 font-mono">.npmrc</code>. Run these 3 commands in your terminal:
                </p>

                <div className="relative group">
                  <pre className="p-3.5 bg-[#090a0c] border border-white/10 rounded font-mono text-[11px] text-zinc-200 overflow-x-auto leading-relaxed">
                    <span className="text-zinc-500"># 1. Stage all fixed files (package-lock.json, .npmrc, updated workflows)</span>{'\n'}
                    <span className="text-emerald-400 font-semibold">git add .</span>{'\n\n'}
                    <span className="text-zinc-500"># 2. Commit the fix</span>{'\n'}
                    <span className="text-emerald-400 font-semibold">git commit -m &quot;fix: resolve github actions ci build &amp; pages deployment&quot;</span>{'\n\n'}
                    <span className="text-zinc-500"># 3. Push to GitHub (this triggers new green builds!)</span>{'\n'}
                    <span className="text-amber-400 font-semibold">git push origin main</span>
                  </pre>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        'git add .\ngit commit -m "fix: resolve github actions ci build & pages deployment"\ngit push origin main',
                        'fix-checks-copy'
                      )
                    }
                    className="absolute right-2 top-2 px-2.5 py-1 rounded bg-[#E52D27] hover:bg-[#c92520] text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copiedId === 'fix-checks-copy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'fix-checks-copy' ? 'Copied!' : 'Copy Commands'}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Enable GitHub Pages in Repo Settings */}
              <div className="p-3.5 bg-[#17191d] border border-white/[0.08] rounded-lg space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>Step 2: Enable GitHub Actions for Pages in Repository Settings</span>
                </div>
                <ol className="text-[11px] text-zinc-300 space-y-1.5 list-decimal list-inside leading-relaxed pl-1">
                  <li>Go to your GitHub repository in your browser.</li>
                  <li>Click <strong className="text-white">Settings</strong> (gear icon on the top tab bar).</li>
                  <li>In the left sidebar, click <strong className="text-white">Pages</strong>.</li>
                  <li>Under <strong className="text-white">Build and deployment &rarr; Source</strong>, click the dropdown and choose <strong className="text-emerald-400 font-mono">GitHub Actions</strong>.</li>
                  <li>That&apos;s it! The Pages workflow will now build and publish your site with a green checkmark!</li>
                </ol>
              </div>
            </div>
          )}

          {/* Security & .gitignore Verification */}
          <div className="p-3 bg-[#17191d] border border-white/[0.06] rounded-lg text-xs space-y-1.5">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safety Guarantee:</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Your <code className="text-[#E52D27] font-mono">.gitignore</code> file is already configured to automatically prevent committing <code className="text-zinc-300 font-mono">.env</code> files, API tokens, and <code className="text-zinc-300 font-mono">node_modules/</code>.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/[0.08] flex items-center justify-between bg-[#15171b]">
          <span className="text-[11px] text-zinc-500 font-mono">FINEX WEB / GitHub Assistant</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
