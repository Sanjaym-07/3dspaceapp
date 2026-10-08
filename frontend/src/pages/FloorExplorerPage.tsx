import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Layers,
  Box,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { fallbackBuildings } from '../data/mockData';
import { Building, Floor, Property } from '../types';

export const FloorExplorerPage: React.FC = () => {
  const navigate = useNavigate();

  const [buildings, setBuildings] = useState<Building[]>(fallbackBuildings);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('B01');
  const [floors, setFloors] = useState<Floor[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    api.getBuildings().then(setBuildings).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      api.getBuildingFloors(selectedBuildingId).then(setFloors).catch(() => {});
      api.getProperties({ building_id: selectedBuildingId }).then(setProperties).catch(() => {});
    }
  }, [selectedBuildingId]);

  const activeBuilding = buildings.find(b => b.id === selectedBuildingId) || buildings[0];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Floor Stratum & Unit Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hierarchical vertical decomposition of structural towers from subterranean parking levels to rooftop penthouses.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/viewer3d')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow transition"
        >
          <Box className="w-4 h-4" />
          <span>Inspect Building in 3D</span>
        </button>
      </div>

      {/* Building Selector Strip */}
      <div className="flex items-center gap-2">
        {buildings.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBuildingId(b.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              selectedBuildingId === b.id
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/30'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{b.name} ({b.id})</span>
          </button>
        ))}
      </div>

      {/* Building Info Card */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Total Elevation Height</span>
          <span className="font-mono font-bold text-slate-100 text-sm">{activeBuilding.height_m} meters</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Vertical Floors</span>
          <span className="font-mono font-bold text-cyan-400 text-sm">
            {activeBuilding.total_floors} Levels + {activeBuilding.basement_floors} Basements
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Demarcated Units</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">{activeBuilding.total_units} Strata Volumes</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Structure Type</span>
          <span className="font-semibold text-slate-200">{activeBuilding.structure_type}</span>
        </div>
      </div>

      {/* Vertical Floor Stack List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Stratified Floor Envelopes (Top to Sub-Surface)
        </h3>

        <div className="space-y-2">
          {floors.slice().reverse().map((fl) => {
            const floorUnits = properties.filter(p => p.floor_id === fl.id);
            const isWarning = fl.validation_status === 'WARNING';

            return (
              <div
                key={fl.id}
                className={`glass-panel p-3.5 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isWarning ? 'border-amber-600/60 bg-amber-950/20' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${
                    fl.floor_number < 0
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : isWarning
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-blue-950/80 text-blue-300 border-blue-800'
                  }`}>
                    {fl.floor_code}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-100 text-sm">
                        Floor {fl.floor_code} • {fl.floor_type}
                      </h4>
                      {isWarning ? (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          1 Warning
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          Validated
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono text-cyan-300">
                        Elevation: +{fl.elevation_min_m}m → +{fl.elevation_max_m}m (Height: {fl.height_m}m)
                      </span>
                      <span>•</span>
                      <span>{fl.total_area_sqft} sq.ft</span>
                    </div>
                  </div>
                </div>

                {/* Units on this Floor */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {floorUnits.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => navigate(`/passport/${encodeURIComponent(u.ulpin_3d)}`)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono border transition flex items-center gap-1 ${
                        u.validation_status === 'WARNING'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700/80 hover:bg-amber-900'
                          : 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800'
                      }`}
                      title={`${u.unit_name} (${u.owner_name})`}
                    >
                      <span>{u.unit_number}</span>
                      <FileText className="w-3 h-3 opacity-60" />
                    </button>
                  ))}

                  <button
                    onClick={() => navigate('/viewer3d')}
                    className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition ml-2"
                    title="Inspect Floor in 3D"
                  >
                    <Box className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
