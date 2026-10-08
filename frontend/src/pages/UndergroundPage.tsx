import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  Box,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Droplet,
  Zap,
  Activity,
  Compass,
  Train
} from 'lucide-react';
import { api } from '../services/api';
import { fallbackUndergroundAssets } from '../data/mockData';
import { UndergroundAsset } from '../types';

export const UndergroundPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<UndergroundAsset[]>(fallbackUndergroundAssets);
  const [selectedAsset, setSelectedAsset] = useState<UndergroundAsset | null>(fallbackUndergroundAssets[0]);

  useEffect(() => {
    api.getUndergroundAssets().then((data) => {
      if (data && data.length) setAssets(data);
    }).catch(() => {});
  }, []);

  const getAssetIcon = (type: string) => {
    if (type.includes('Water')) return <Droplet className="w-4 h-4 text-cyan-400" />;
    if (type.includes('Power') || type.includes('Electrical')) return <Zap className="w-4 h-4 text-amber-400" />;
    if (type.includes('Metro')) return <Train className="w-4 h-4 text-purple-400" />;
    return <Network className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Subterranean Infrastructure & Utility Corridors
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Volumetric cadastral mapping of sub-surface pipelines, electrical distribution banks, storm trunks, and transit corridors.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/viewer3d?demoStep=9')}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition"
        >
          <Box className="w-4 h-4" />
          <span>Launch 3D Underground Mode</span>
        </button>
      </div>

      {/* Corridor Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Total Subsurface Assets</span>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {assets.length} Corridors
          </div>
          <div className="text-[10px] text-cyan-400">Registered Utilities</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Maximum Monitored Depth</span>
          <div className="text-2xl font-black text-purple-400 font-mono">
            -14.0 meters
          </div>
          <div className="text-[10px] text-purple-400/80">Metro Transit Corridor</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Managing Authorities</span>
          <div className="text-2xl font-black text-blue-400 font-mono">
            5 Agencies
          </div>
          <div className="text-[10px] text-blue-400/80">CMWSSB, TANGEDCO, GCC, CMRL, BSNL</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Easement Conflicts</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            0 Conflicts
          </div>
          <div className="text-[10px] text-emerald-400/80">Topology Clear Buffer</div>
        </div>
      </div>

      {/* Assets Grid & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Assets List */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Registered Subterranean Assets
          </h3>

          <div className="space-y-2.5">
            {assets.map((a) => {
              const isSelected = selectedAsset?.id === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAsset(a)}
                  className={`glass-panel p-4 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-cyan-500/80 bg-cyan-950/20 shadow-lg shadow-cyan-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      {getAssetIcon(a.asset_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-300">
                          {a.id}
                        </span>
                        <h4 className="font-semibold text-slate-100 text-sm">
                          {a.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {a.owning_authority}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-cyan-400 text-sm">
                      {a.depth_m}m
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase">
                      ✓ {a.conflict_status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Asset Inspection Card */}
        <div className="lg:col-span-5">
          {selectedAsset && (
            <div className="glass-panel rounded-2xl border border-cyan-500/50 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Volumetric Easement Profile
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  {selectedAsset.id}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-100 text-base">
                  {selectedAsset.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Category: {selectedAsset.asset_type}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900/80 border border-slate-800 divide-y divide-slate-800 text-xs">
                <div className="p-3 flex justify-between">
                  <span className="text-slate-400">Absolute Depth Datum:</span>
                  <span className="font-mono font-bold text-cyan-400">{selectedAsset.depth_m} meters</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-400">Vertical Diameter / Span:</span>
                  <span className="font-mono font-semibold">{selectedAsset.vertical_span_m} meters</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-400">Statutory Authority:</span>
                  <span className="font-semibold text-slate-200 text-right">{selectedAsset.owning_authority}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-400">Operational Status:</span>
                  <span className="font-semibold text-emerald-400">● {selectedAsset.status}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-400">Clearance Buffer Status:</span>
                  <span className="font-semibold text-emerald-400">✓ Validated</span>
                </div>
              </div>

              {selectedAsset.conflict_details && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-semibold text-slate-400 text-[10px] uppercase block">
                    Cadastral Footing Clearance
                  </span>
                  <p>{selectedAsset.conflict_details}</p>
                </div>
              )}

              <button
                onClick={() => navigate('/viewer3d?demoStep=10')}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow transition"
              >
                <Box className="w-4 h-4" />
                <span>Locate Subsurface Pipeline in 3D</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
