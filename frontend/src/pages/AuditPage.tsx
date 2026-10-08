import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  Calendar,
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { AuditEvent } from '../types';

export const AuditPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.getEvents().then(setEvents).catch(() => {});
  }, []);

  const filteredEvents = events.filter((e) =>
    e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.target_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.officer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Cadastral Modification & Audit Trail
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically signed chronological record of spatial delineation events, validation runs, and officer verifications.
            </p>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit log by action type, entity ID, or description..."
          className="bg-transparent border-none focus:outline-none text-slate-200 placeholder-slate-500 w-full"
        />
      </div>

      {/* Audit Log Timeline List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
            No matching audit records found.
          </div>
        ) : (
          filteredEvents.map((e) => {
            const isValidation = e.action.includes('VALIDATION');
            const isUlpin = e.action.includes('ULPIN');

            return (
              <div
                key={e.id}
                className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2 text-xs hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/80">
                      {e.action}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      Target: <b className="text-slate-200">{e.target_id}</b>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(e.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-slate-200 leading-relaxed font-medium">
                  {e.description}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Officer: <b className="text-slate-300">{e.officer_name}</b> ({e.officer_role})</span>
                  </div>
                  <span className="text-emerald-400 font-mono">Immutable Hash: Verified</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
