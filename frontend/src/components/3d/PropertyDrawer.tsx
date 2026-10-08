import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Building2,
  Layers,
  Home,
  Ruler,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Property, Floor, Building } from '../../types';

interface PropertyDrawerProps {
  floor: Floor | null;
  building: Building | null;
  selectedProperty: Property | null;
  allFloorProperties: Property[];
  onSelectProperty: (property: Property) => void;
  onClose: () => void;
}

export const PropertyDrawer: React.FC<PropertyDrawerProps> = ({
  floor,
  building,
  selectedProperty,
  allFloorProperties,
  onSelectProperty,
  onClose
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // If no property explicitly selected, pick first in floor or U02 if Floor 7
  const currentProperty = selectedProperty || (
    allFloorProperties.find(p => p.unit_number === 'U02') || allFloorProperties[0]
  );

  const copyUlpin = () => {
    if (currentProperty?.ulpin_3d) {
      navigator.clipboard.writeText(currentProperty.ulpin_3d);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!floor || !building) return null;

  const rights = currentProperty?.rights_metadata
    ? (() => {
        try {
          return JSON.parse(currentProperty.rights_metadata);
        } catch {
          return {};
        }
      })()
    : {};

  const isWarning = currentProperty?.validation_status === 'WARNING';

  return (
    <div className="absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] glass-panel z-30 rounded-xl shadow-2xl flex flex-col border border-slate-700/60 overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
              {building.name}
            </h3>
            <p className="text-xs text-slate-400">
              Floor {floor.floor_code} ({floor.floor_type})
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Unit Selector Strip (on this floor) */}
      {allFloorProperties.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-medium text-slate-400 shrink-0">Units:</span>
          {allFloorProperties.map((p) => {
            const isSelected = currentProperty?.id === p.id;
            const hasIssue = p.validation_status === 'WARNING';
            return (
              <button
                key={p.id}
                onClick={() => onSelectProperty(p)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition flex items-center gap-1 shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : hasIssue
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50 hover:bg-amber-900/60'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {p.unit_number}
                {hasIssue && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Prototype 3D ULPIN Banner */}
        <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-600/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
              Prototype 3D ULPIN
            </span>
            <button
              onClick={copyUlpin}
              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-200 transition"
              title="Copy 3D ULPIN"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <div className="font-mono text-sm font-semibold text-blue-100 break-all bg-slate-950/80 px-2.5 py-1.5 rounded border border-blue-900/50">
            {currentProperty?.ulpin_3d || `IN-TN-CHN-P0428-${building.id}-${floor.floor_code}-U01`}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Volumetric cadastral identity registered under DoLR 3D standard format.
          </p>
        </div>

        {/* Validation Warning Alert (if any) */}
        {isWarning && (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-600/50 flex items-start gap-2.5 text-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Topology Warning Detected</p>
              <p className="text-[11px] text-amber-200/90 mt-0.5">
                Horizontal partition envelope overlaps neighbor unit by 2.3%. Boundary verification pending.
              </p>
            </div>
          </div>
        )}

        {/* Core Spatial Metric Cards */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Elevation Range</span>
            </div>
            <div className="font-mono font-semibold text-slate-200">
              +{currentProperty?.elevation_min_m ?? floor.elevation_min_m}m → +{currentProperty?.elevation_max_m ?? floor.elevation_max_m}m
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Vertical Span: {floor.height_m}m
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 mb-1">
              <Ruler className="w-3.5 h-3.5 text-emerald-400" />
              <span>Carpet Area</span>
            </div>
            <div className="font-mono font-semibold text-slate-200">
              {currentProperty?.area_sqft || floor.total_area_sqft} sq.ft
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              ~{currentProperty?.area_sqm || Math.round(floor.total_area_sqft * 0.0929)} sq.m
            </div>
          </div>
        </div>

        {/* Property Attributes Table */}
        <div className="rounded-lg bg-slate-900/60 border border-slate-800 divide-y divide-slate-800 text-xs">
          <div className="p-2.5 flex justify-between items-center">
            <span className="text-slate-400">Title Owner</span>
            <span className="font-medium text-slate-200">
              {currentProperty?.owner_name || 'Synthetic Owner'}
            </span>
          </div>
          <div className="p-2.5 flex justify-between items-center">
            <span className="text-slate-400">Ownership Form</span>
            <span className="font-medium text-slate-200">
              {currentProperty?.ownership_type || 'Private Freehold'}
            </span>
          </div>
          <div className="p-2.5 flex justify-between items-center">
            <span className="text-slate-400">Usage Category</span>
            <span className="font-medium text-slate-200">
              {currentProperty?.usage_type || floor.floor_type}
            </span>
          </div>
          <div className="p-2.5 flex justify-between items-center">
            <span className="text-slate-400">Classification</span>
            <span className="font-medium text-slate-200">
              {currentProperty?.property_sub_type || 'Residential Apartment'}
            </span>
          </div>
          <div className="p-2.5 flex justify-between items-center">
            <span className="text-slate-400">Topology Health</span>
            <div className="flex items-center gap-1.5">
              {isWarning ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium text-amber-400">Warning (88.0%)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium text-emerald-400">
                    Validated ({currentProperty?.validation_confidence ?? 96.4}%)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Volumetric Property Rights Section */}
        <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Volumetric Property Rights</span>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Residential Stratum Ownership</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Dedicated Basement Parking Access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Undivided Common Area Share</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-slate-500 font-bold">✗</span>
              <span>Air Rights Above Roof (Reserved by State/RWA)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="text-amber-400 font-medium">Restrictions:</span> No structural modifications to shear walls permitted without DoLR engineering permit.
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2">
        <button
          onClick={() => {
            if (currentProperty?.ulpin_3d) {
              navigate(`/passport/${encodeURIComponent(currentProperty.ulpin_3d)}`);
            }
          }}
          className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow transition"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Open Digital Passport</span>
        </button>
        <button
          onClick={() => {
            if (currentProperty?.ulpin_3d) {
              navigate(`/verify/${encodeURIComponent(currentProperty.ulpin_3d)}`);
            }
          }}
          className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1 border border-slate-700 transition"
          title="Verify Public QR Page"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Verify QR</span>
        </button>
      </div>
    </div>
  );
};
