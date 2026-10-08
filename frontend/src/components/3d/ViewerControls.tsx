import React from 'react';
import {
  Layers,
  Eye,
  RotateCcw,
  Maximize2,
  Building2,
  Sliders,
  Compass,
  ArrowUpDown
} from 'lucide-react';
import { Building } from '../../types';

interface ViewerControlsProps {
  buildings: Building[];
  selectedBuilding: Building | null;
  explodeFactor: number;
  isUndergroundMode: boolean;
  isolatedFloorCode: string | null;
  onSelectBuilding: (b: Building) => void;
  onSetExplodeFactor: (factor: number) => void;
  onToggleUnderground: () => void;
  onSetIsolatedFloor: (code: string | null) => void;
  onResetView: () => void;
  onSetCameraPreset: (preset: 'iso' | 'front' | 'underground' | 'top') => void;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  buildings,
  selectedBuilding,
  explodeFactor,
  isUndergroundMode,
  isolatedFloorCode,
  onSelectBuilding,
  onSetExplodeFactor,
  onToggleUnderground,
  onSetIsolatedFloor,
  onResetView,
  onSetCameraPreset
}) => {
  const isExploded = explodeFactor > 0.05;

  return (
    <>
      {/* Top Floating Bar: Building Selector & Camera Presets */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        {/* Building Selector */}
        <div className="glass-panel rounded-lg p-1 flex items-center gap-1 border border-slate-700/60 shadow-lg">
          {buildings.map((b) => {
            const isSelected = selectedBuilding?.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => onSelectBuilding(b)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{b.name}</span>
              </button>
            );
          })}
        </div>

        {/* Underground Mode Toggle */}
        <button
          onClick={onToggleUnderground}
          className={`glass-panel px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition shadow-lg ${
            isUndergroundMode
              ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-900/50'
              : 'text-slate-200 hover:text-white hover:bg-slate-800/80 border-slate-700/60'
          }`}
          title="Toggle Subterranean Utilities & Metro Corridor"
        >
          <div className={`w-2 h-2 rounded-full ${isUndergroundMode ? 'bg-cyan-300 animate-ping' : 'bg-slate-500'}`} />
          <span>Underground Infrastructure</span>
        </button>

        {/* Explode Building Toggle & Slider */}
        <div className="glass-panel rounded-lg p-1 flex items-center gap-2 border border-slate-700/60 shadow-lg">
          <button
            onClick={() => onSetExplodeFactor(isExploded ? 0 : 0.8)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 ${
              isExploded
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-200 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{isExploded ? 'Collapse Building' : 'Explode Building'}</span>
          </button>

          {isExploded && (
            <div className="flex items-center gap-2 px-2">
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={explodeFactor}
                onChange={(e) => onSetExplodeFactor(parseFloat(e.target.value))}
                className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] font-mono text-slate-300 w-8">
                {Math.round(explodeFactor * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Reset View Button */}
        <button
          onClick={onResetView}
          className="glass-panel p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition shadow-lg"
          title="Reset Camera & Selection"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Left Vertical Strip: Floor Filter Selector */}
      <div className="absolute left-4 top-20 bottom-16 z-20 flex flex-col justify-center pointer-events-none">
        <div className="glass-panel p-1.5 rounded-xl border border-slate-700/60 shadow-xl pointer-events-auto flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
          <div className="px-1 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center border-b border-slate-800">
            Floors
          </div>

          {/* Quick Groups */}
          <button
            onClick={() => onSetIsolatedFloor('ALL')}
            className={`px-2 py-1 rounded text-[11px] font-medium text-left transition ${
              isolatedFloorCode === 'ALL' || isolatedFloorCode === null
                ? 'bg-blue-600/40 text-blue-200 font-bold border border-blue-500/40'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onSetIsolatedFloor('ABOVE')}
            className={`px-2 py-1 rounded text-[11px] font-medium text-left transition ${
              isolatedFloorCode === 'ABOVE'
                ? 'bg-blue-600/40 text-blue-200 font-bold border border-blue-500/40'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Above
          </button>
          <button
            onClick={() => onSetIsolatedFloor('BASEMENT')}
            className={`px-2 py-1 rounded text-[11px] font-medium text-left transition ${
              isolatedFloorCode === 'BASEMENT'
                ? 'bg-blue-600/40 text-blue-200 font-bold border border-blue-500/40'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Base
          </button>

          <div className="my-1 border-t border-slate-800"></div>

          {/* Discrete Floor Codes */}
          {[
            'F12', 'F11', 'F10', 'F09', 'F08', 'F07', 'F06', 'F05', 'F04', 'F03', 'F02', 'F01', 'G', 'B01', 'B02'
          ].map((code) => {
            const isSelected = isolatedFloorCode === code;
            const isHighlightedF7 = code === 'F07';
            return (
              <button
                key={code}
                onClick={() => onSetIsolatedFloor(isSelected ? null : code)}
                className={`px-2 py-1 rounded text-[11px] font-mono text-center transition flex items-center justify-between gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : isHighlightedF7
                    ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{code}</span>
                {isHighlightedF7 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Flagged Unit"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Bar: Quick Camera Angles */}
      <div className="absolute bottom-4 left-4 z-20 glass-panel rounded-lg p-1 flex items-center gap-1 border border-slate-700/60 shadow-lg text-xs">
        <span className="px-2 text-[11px] text-slate-400 font-medium">Camera:</span>
        <button
          onClick={() => onSetCameraPreset('iso')}
          className="px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          Isometric
        </button>
        <button
          onClick={() => onSetCameraPreset('front')}
          className="px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          Elevation
        </button>
        <button
          onClick={() => onSetCameraPreset('top')}
          className="px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          Bird's Eye
        </button>
        <button
          onClick={() => onSetCameraPreset('underground')}
          className="px-2.5 py-1 rounded text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/40 transition"
        >
          Sub-Surface
        </button>
      </div>
    </>
  );
};
