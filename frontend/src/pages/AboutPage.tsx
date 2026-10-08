import React from 'react';
import {
  Info,
  ShieldCheck,
  Building2,
  Box,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              About VERTICAD & Cadastral Methodology
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Technical architecture, ISO 19152 LADM 3D conformance, and Smart India Hackathon 2026 specifications.
            </p>
          </div>
        </div>
      </div>

      {/* Problem Statement Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
              Smart India Hackathon 2026
            </span>
            <h3 className="text-base font-bold text-slate-100">
              Problem Statement PS26011: 3D ULPIN Generation & Vertical Property Mapping
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded bg-blue-950 border border-blue-800 text-blue-300 text-xs font-mono font-semibold">
            PS26011
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <span className="text-slate-400">Nodal Ministry</span>
            <p className="font-bold text-slate-200">Ministry of Rural Development</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <span className="text-slate-400">Department</span>
            <p className="font-bold text-slate-200">Department of Land Resources (DoLR)</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Conventional land records represent property primarily as 2D flat parcels. In urban centers, a single surface parcel encapsulates vertical stratification: multi-storey apartment buildings, commercial workspaces, basement parking decks, and underground utility corridors. VERTICAD extends cadastral identity into the third dimension, guaranteeing topological separation and unique volumetric identification.
        </p>
      </div>

      {/* Prototype 3D ULPIN Encoding Specification */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Prototype 3D ULPIN Identifier Model</span>
        </h3>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-900/60 font-mono text-center text-sm font-bold text-blue-200">
          IN-TN-CHN-P0428-B01-F07-U02
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="font-mono text-blue-400 font-bold block">IN-TN-CHN</span>
            <span className="text-slate-400 text-[11px]">Nation & State Division</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="font-mono text-blue-400 font-bold block">P0428</span>
            <span className="text-slate-400 text-[11px]">Parent Surface Parcel</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="font-mono text-blue-400 font-bold block">B01-F07</span>
            <span className="text-slate-400 text-[11px]">Building & Floor Slab</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <span className="font-mono text-blue-400 font-bold block">U02</span>
            <span className="text-slate-400 text-[11px]">Demarcated Unit Volume</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/50 text-xs text-amber-200 space-y-1">
          <p className="font-bold text-amber-300">Methodology & Research Disclaimer</p>
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            This identifier structure represents a research and demonstration prototype designed for Smart India Hackathon 2026. It is not claimed to be the official Government of India production ULPIN standard. It demonstrates how a structured vertical property identity model operates mathematically and topologically.
          </p>
        </div>
      </div>

      {/* 9 Topology Rules Specification */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="font-bold text-slate-100 text-sm">
          9 Deterministic Topology Validation Invariants
        </h3>
        <p className="text-xs text-slate-400">
          The validation engine executes 9 deterministic mathematical proofs to ensure cadastral validity:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
          <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-emerald-400 font-bold">1.</span>
            <span>z_min &lt; z_max positive height check</span>
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-emerald-400 font-bold">2.</span>
            <span>Floor elevation monotonic ordering</span>
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-emerald-400 font-bold">3.</span>
            <span>Co-floor unit boundary separation</span>
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-emerald-400 font-bold">4.</span>
            <span>Unit-to-floor vertical containment</span>
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-emerald-400 font-bold">5.</span>
            <span>Floor-to-building height containment</span>
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-emerald-400 font-bold">6.</span>
            <span>Sub-surface asset depth invariance (&lt; 0.0m)</span>
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-emerald-400 font-bold">7.</span>
            <span>Building footprint in parcel perimeter</span>
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-emerald-400 font-bold">8.</span>
            <span>3D ULPIN global uniqueness index</span>
          </li>
          <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 sm:col-span-2">
            <span className="text-emerald-400 font-bold">9.</span>
            <span>Cadastral volumetric metadata completeness check</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
