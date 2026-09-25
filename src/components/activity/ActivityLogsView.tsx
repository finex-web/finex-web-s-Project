import React, { useState } from 'react';
import { db } from '../../lib/db';
import { ActivityLog } from '../../types';
import { Search, History, Filter, User, Calendar, Clock, RefreshCw } from 'lucide-react';

export const ActivityLogsView: React.FC = () => {
  const logs = db.getActivityLogs();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  const filtered = logs.filter((log) => {
    const action = log.action || '';
    const details = log.details || log.description || '';
    const performedBy = log.performed_by || log.admin_name || '';
    const entityType = log.entity_type || log.related_record || '';

    const matchesSearch =
      action.toLowerCase().includes(search.toLowerCase()) ||
      details.toLowerCase().includes(search.toLowerCase()) ||
      performedBy.toLowerCase().includes(search.toLowerCase()) ||
      entityType.toLowerCase().includes(search.toLowerCase());

    const matchesEntity = entityFilter === 'ALL' || entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const entityTypes = Array.from(new Set(logs.map((l) => l.entity_type || l.related_record || 'General')));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Audit Trail & Activity Log</h2>
          <p className="text-xs text-zinc-400">
            Immutable operational journal documenting all client state changes, payments, and deliverables.
          </p>
        </div>

        <div className="text-xs font-mono text-zinc-500">
          Total Recorded Actions: <span className="text-white font-bold">{logs.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121316] border border-white/[0.08] p-3 rounded-lg flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by action, user, entity, details..."
            className="w-full h-8.5 pl-9 pr-3 bg-[#18191c] border border-white/10 rounded text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
        </div>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="h-8.5 px-2.5 bg-[#18191c] border border-white/10 rounded text-xs text-zinc-200 focus:outline-hidden font-mono"
        >
          <option value="ALL">All Entities ({logs.length})</option>
          {entityTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-[#121316] border border-white/[0.08] rounded-lg p-4">
        <div className="divide-y divide-white/[0.04]">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No matching activity events recorded.
            </div>
          ) : (
            filtered.map((log) => {
              const formattedTime = new Date(log.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              const formattedDate = new Date(log.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#E52D27] mt-1.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{log.action}</span>
                        <span className="px-1.5 py-0.2 bg-zinc-800 rounded font-mono text-[10px] text-zinc-400">
                          {log.entity_type || log.related_record || 'General'}
                        </span>
                      </div>
                      <p className="text-zinc-300 mt-0.5">{log.details || log.description}</p>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center gap-2">
                        <span>By: {log.performed_by || log.admin_name || 'Admin'}</span>
                        {(log.entity_id || log.related_record) && <span>· ID: {log.entity_id || log.related_record}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px] text-zinc-500 shrink-0">
                    <div>{formattedTime}</div>
                    <div className="text-[10px]">{formattedDate}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
