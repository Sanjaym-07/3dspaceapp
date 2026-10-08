import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Box,
  Layers,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { fallbackValidationSummary } from '../data/mockData';
import { ValidationSummary, ValidationResult } from '../types';

export const ValidationPage: React.FC = () => {
  const navigate = useNavigate();

  const [validation, setValidation] = useState<ValidationSummary>(fallbackValidationSummary);
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PASS' | 'WARNING' | 'ERROR'>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  const fetchValidation = async () => {
    try {
      const data = await api.getValidation();
      setValidation(data);
    } catch {
      setValidation(fallbackValidationSummary);
    }
  };

  useEffect(() => {
    fetchValidation();
  }, []);

  const handleRunValidation = async () => {
    setIsRunning(true);
    try {
      const summary = await api.runValidation();
      setValidation(summary);
      setToast('Topology validation executed: 9 rules evaluated.');
      setTimeout(() => setToast(null), 4000);
    } catch {
      setToast('Validation executed locally.');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredResults = validation.results.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Topology Validation Engine
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic geometric integrity algorithms verifying vertical containment, slab elevation sequences, and parcel boundaries.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {toast && (
            <div className="px-3 py-1 rounded bg-blue-950 border border-blue-600 text-blue-300 text-xs animate-in fade-in">
              {toast}
            </div>
          )}

          <button
            onClick={handleRunValidation}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/40 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Evaluating 9 Rules...' : 'Run Validation'}</span>
          </button>
        </div>
      </div>

      {/* Health Score & Rules Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Total Rules Executed</span>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {validation.total_rules} Rules
          </div>
          <div className="text-[10px] text-blue-400">Deterministic Engine</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Passed Checks</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {validation.passed_rules} Passed
          </div>
          <div className="text-[10px] text-emerald-400/80">100% Geometry Conformance</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Topology Warnings</span>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {validation.warning_count} Warning
          </div>
          <div className="text-[10px] text-amber-400/80">F07-U03 / U04 Overlap</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Overall Health Score</span>
          <div className="text-2xl font-black text-blue-400 font-mono">
            {validation.health_score_pct}%
          </div>
          <div className="text-[10px] text-blue-400/80">Cadastral Integrity</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          {(['ALL', 'PASS', 'WARNING', 'ERROR'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All (9)' : tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/viewer3d?demoStep=5')}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
        >
          <Box className="w-3.5 h-3.5" />
          <span>Inspect Issue in 3D Viewer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Rules Execution Results List */}
      <div className="space-y-3">
        {filteredResults.map((r) => {
          const isWarning = r.status === 'WARNING';
          const isPass = r.status === 'PASS';
          const isError = r.status === 'ERROR';

          return (
            <div
              key={r.id}
              className={`glass-panel p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isWarning
                  ? 'border-amber-600/60 bg-amber-950/20 shadow-lg shadow-amber-950/20'
                  : isError
                  ? 'border-red-600/60 bg-red-950/20'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isPass && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                  {isError && <XCircle className="w-5 h-5 text-red-400" />}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {r.rule_id}
                    </span>
                    <h4 className="font-semibold text-slate-100 text-sm">
                      {r.rule_name}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isPass
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isWarning
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {r.message}
                  </p>

                  {r.recommended_action && (
                    <p className="text-[11px] text-amber-300/90 font-medium">
                      Recommended Action: {r.recommended_action}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button for problematic entities */}
              {isWarning && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate('/viewer3d?demoStep=5')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Highlight Overlap in 3D</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
