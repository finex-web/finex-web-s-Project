import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/db';
import { Search, X, Users, UserCheck, Briefcase, FileSpreadsheet, UserCog } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (view: string, id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = db.searchGlobal(query);
  const hasResults =
    results.clients.length > 0 ||
    results.leads.length > 0 ||
    results.projects.length > 0 ||
    results.team.length > 0 ||
    results.quotes.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex justify-center items-start">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#141518] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-white/[0.08]">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients, leads, projects, team, phone, quote ID, domain..."
            className="w-full h-13 bg-transparent px-3 text-sm text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {!query && (
            <div className="py-8 text-center text-xs text-zinc-500">
              Type keywords to search across all CRM tables and client records.
            </div>
          )}

          {query && !hasResults && (
            <div className="py-8 text-center text-xs text-zinc-400">
              No matching records found for "{query}".
            </div>
          )}

          {/* Clients */}
          {results.clients.length > 0 && (
            <div>
              <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase px-2 mb-1 flex items-center gap-1.5">
                <Users className="w-3 h-3" /> Clients ({results.clients.length})
              </div>
              <div className="space-y-1">
                {results.clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectResult('clients', c.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded bg-zinc-900/60 hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">{c.business_name}</div>
                      <div className="text-[11px] text-zinc-400">
                        {c.client_name} · {c.phone} · {c.city}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-[#E52D27] bg-[#E52D27]/10 px-1.5 py-0.5 rounded">
                      {c.client_code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Leads */}
          {results.leads.length > 0 && (
            <div>
              <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase px-2 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3 h-3" /> Leads ({results.leads.length})
              </div>
              <div className="space-y-1">
                {results.leads.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      onSelectResult('leads', l.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded bg-zinc-900/60 hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">{l.business_name}</div>
                      <div className="text-[11px] text-zinc-400">
                        {l.client_name} · {l.phone} · Status: {l.status}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded">
                      {l.lead_code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div>
              <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase px-2 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" /> Projects ({results.projects.length})
              </div>
              <div className="space-y-1">
                {results.projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectResult('projects', p.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded bg-zinc-900/60 hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">{p.business_name}</div>
                      <div className="text-[11px] text-zinc-400">
                        {p.plan} Plan · Stage: {p.status} · Progress: {p.progress}%
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-sky-400 bg-sky-950/40 px-1.5 py-0.5 rounded">
                      {p.project_code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          {results.team.length > 0 && (
            <div>
              <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase px-2 mb-1 flex items-center gap-1.5">
                <UserCog className="w-3 h-3" /> Team Members ({results.team.length})
              </div>
              <div className="space-y-1">
                {results.team.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onSelectResult('team', t.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded bg-zinc-900/60 hover:bg-white/[0.06] border border-white/[0.04] flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">{t.full_name}</div>
                      <div className="text-[11px] text-zinc-400">
                        {t.role} · {t.department} · {t.phone}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">
                      {t.employee_id}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#0d0e10] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-500">
          <span>Press ESC to dismiss</span>
          <span className="font-mono">FINEX Global Index</span>
        </div>
      </div>
    </div>
  );
};
