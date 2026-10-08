import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Home,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  X,
  Box,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { Property } from '../types';

export const PropertyExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [usageFilter, setUsageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Comparison modal state (Section 28)
  const [selectedForCompare, setSelectedForCompare] = useState<Property[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    api.getProperties().then(setProperties).catch(() => {});
  }, []);

  const filteredProperties = properties.filter((p) => {
    const matchSearch =
      p.ulpin_3d.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.unit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchUsage = usageFilter === 'ALL' || p.usage_type.toLowerCase() === usageFilter.toLowerCase();
    const matchStatus = statusFilter === 'ALL' || p.validation_status === statusFilter;

    return matchSearch && matchUsage && matchStatus;
  });

  const toggleCompare = (p: Property) => {
    if (selectedForCompare.find((item) => item.id === p.id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item.id !== p.id));
    } else {
      if (selectedForCompare.length < 2) {
        setSelectedForCompare([...selectedForCompare, p]);
      } else {
        setSelectedForCompare([selectedForCompare[1], p]);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Vertical Property Explorer & Registry
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Examine stratified property volumes, 3D ULPIN identities, titleholders, and spatial elevation ranges.
              </p>
            </div>
          </div>
        </div>

        {selectedForCompare.length > 0 && (
          <button
            onClick={() => setIsCompareOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition"
          >
            <Scale className="w-4 h-4" />
            <span>Compare Selected ({selectedForCompare.length}/2)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by 3D ULPIN, Unit Name, Title Owner..."
            className="bg-transparent border-none focus:outline-none text-slate-200 placeholder-slate-500 w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Usage:</span>
            <select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Usages</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Basement Parking">Basement Parking</option>
              <option value="Common Area">Common Area</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="VALIDATED">Validated</option>
              <option value="WARNING">Warning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="p-3 w-10">Compare</th>
                <th className="p-3">Prototype 3D ULPIN</th>
                <th className="p-3">Unit / Floor</th>
                <th className="p-3">Carpet Area</th>
                <th className="p-3">Vertical Elevation</th>
                <th className="p-3">Usage</th>
                <th className="p-3">Owner Name</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredProperties.slice(0, 35).map((p) => {
                const isWarning = p.validation_status === 'WARNING';
                const isSelected = selectedForCompare.some((item) => item.id === p.id);

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-900/60 transition ${
                      isWarning ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCompare(p)}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 font-mono font-medium text-blue-300">
                      {p.ulpin_3d}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-100">{p.unit_name}</span>
                      <span className="text-[10px] text-slate-500 block">{p.floor_id}</span>
                    </td>
                    <td className="p-3 font-mono">
                      {p.area_sqft} sq.ft
                    </td>
                    <td className="p-3 font-mono text-cyan-300">
                      +{p.elevation_min_m}m → +{p.elevation_max_m}m
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                        {p.usage_type}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-200">
                      {p.owner_name}
                    </td>
                    <td className="p-3">
                      {isWarning ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Warning</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Validated</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => navigate(`/passport/${encodeURIComponent(p.ulpin_3d)}`)}
                        className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                        title="View Property Passport"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate('/viewer3d')}
                        className="p-1.5 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white transition"
                        title="Inspect in 3D"
                      >
                        <Box className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Comparison Modal (Section 28) */}
      {isCompareOpen && selectedForCompare.length === 2 && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-3xl rounded-2xl border border-slate-700 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-100 text-base">
                  Volumetric Property Comparison Tool
                </h3>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              {selectedForCompare.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                  <div className="font-mono text-xs font-bold text-blue-400">
                    Property {idx + 1}: {item.id}
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm">{item.unit_name}</h4>
                  <div className="space-y-1.5 text-slate-300 divide-y divide-slate-800">
                    <div className="pt-1 flex justify-between">
                      <span className="text-slate-500">ULPIN:</span>
                      <span className="font-mono text-[11px] text-blue-200">{item.ulpin_3d}</span>
                    </div>
                    <div className="pt-1 flex justify-between">
                      <span className="text-slate-500">Elevation:</span>
                      <span className="font-mono text-cyan-300">+{item.elevation_min_m}m → +{item.elevation_max_m}m</span>
                    </div>
                    <div className="pt-1 flex justify-between">
                      <span className="text-slate-500">Carpet Area:</span>
                      <span className="font-semibold">{item.area_sqft} sq.ft</span>
                    </div>
                    <div className="pt-1 flex justify-between">
                      <span className="text-slate-500">Usage / Sub-type:</span>
                      <span>{item.usage_type} ({item.property_sub_type})</span>
                    </div>
                    <div className="pt-1 flex justify-between">
                      <span className="text-slate-500">Title Owner:</span>
                      <span className="font-medium text-slate-200">{item.owner_name}</span>
                    </div>
                    <div className="pt-1 flex justify-between">
                      <span className="text-slate-500">Validation:</span>
                      <span className={item.validation_status === 'VALIDATED' ? 'text-emerald-400' : 'text-amber-400'}>
                        {item.validation_status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsCompareOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
