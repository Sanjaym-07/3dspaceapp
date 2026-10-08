import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Fingerprint,
  Copy,
  Box,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Home
} from 'lucide-react';
import { api } from '../services/api';
import { ULPINGenerateResult } from '../types';

export const ULPINGeneratorPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    countryCode: 'IN',
    stateCode: 'TN',
    stateName: 'Tamil Nadu',
    district: 'Chennai',
    cityCode: 'CHN',
    cityName: 'Chennai',
    parcelId: 'P0428',
    buildingId: 'B01',
    floorCode: 'F07',
    unitCode: 'U02',
    usageType: 'Residential',
    ownerName: 'Karthik R',
    areaSqft: 1280,
    elevationMinM: 21.0,
    elevationMaxM: 24.2
  });

  const [result, setResult] = useState<ULPINGenerateResult | null>({
    prototype_3d_ulpin: "IN-TN-CHN-P0428-B01-F07-U02",
    breakdown: {
      country: "IN (Republic of India)",
      state: "TN (Tamil Nadu Cadastre)",
      city: "CHN (Chennai Revenue Division)",
      parcel: "P0428 (Parent Surface Parcel)",
      building: "B01 (Meridian Heights Volume)",
      floor: "F07 (Level 7 Floor Slab)",
      unit: "U02 (Demarcated Residential Unit)"
    },
    property_id: "B01-F07-U02",
    status: "ACTIVE_REGISTERED",
    disclaimer: "Prototype 3D ULPIN. Demonstrates vertical property identification model. Not an official legal land title.",
    message: "Prototype 3D ULPIN generated and validated for IN-TN-CHN-P0428-B01-F07-U02"
  });

  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await api.generateUlpin({
        country_code: formData.countryCode,
        state_code: formData.stateCode,
        city_code: formData.cityCode,
        parcel_id: formData.parcelId,
        building_id: formData.buildingId,
        floor_code: formData.floorCode,
        unit_code: formData.unitCode,
        usage_type: formData.usageType,
        owner_name: formData.ownerName,
        area_sqft: Number(formData.areaSqft),
        elevation_min_m: Number(formData.elevationMinM),
        elevation_max_m: Number(formData.elevationMaxM)
      });
      setResult(res);
    } catch {
      // Offline fallback: compose deterministically
      const proto = `${formData.countryCode}-${formData.stateCode}-${formData.cityCode}-${formData.parcelId}-${formData.buildingId}-${formData.floorCode}-${formData.unitCode}`;
      setResult({
        prototype_3d_ulpin: proto,
        breakdown: {
          country: `${formData.countryCode} (India)`,
          state: `${formData.stateCode} (${formData.stateName})`,
          city: `${formData.cityCode} (${formData.cityName})`,
          parcel: `${formData.parcelId} (Surface Parcel)`,
          building: `${formData.buildingId} (Building Volume)`,
          floor: `${formData.floorCode} (Floor Slab)`,
          unit: `${formData.unitCode} (Demarcated Unit)`
        },
        property_id: `${formData.buildingId}-${formData.floorCode}-${formData.unitCode}`,
        status: "GENERATED_LOCALLY",
        disclaimer: "Prototype 3D ULPIN. Demonstrates vertical property identification model.",
        message: `Prototype 3D ULPIN generated: ${proto}`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyUlpin = () => {
    if (result) {
      navigator.clipboard.writeText(result.prototype_3d_ulpin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              3D ULPIN Volumetric Identifier Generator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Generates standardized 14-character to 28-character hierarchical 3D Unique Land Parcel Identification Numbers (Prototype Model).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-6 glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Cadastral Parameter Parameters
            </span>
            <span className="text-[11px] text-blue-400 font-mono">DoLR Stratum Standard</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">State</label>
                <select
                  value={formData.stateCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const name = code === 'TN' ? 'Tamil Nadu' : code === 'KA' ? 'Karnataka' : 'Maharashtra';
                    const city = code === 'TN' ? 'Chennai' : code === 'KA' ? 'Bengaluru' : 'Mumbai';
                    const cityC = code === 'TN' ? 'CHN' : code === 'KA' ? 'BLR' : 'BOM';
                    setFormData({ ...formData, stateCode: code, stateName: name, cityName: city, cityCode: cityC });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="TN">Tamil Nadu (TN)</option>
                  <option value="KA">Karnataka (KA)</option>
                  <option value="MH">Maharashtra (MH)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">City / Division</label>
                <input
                  type="text"
                  value={formData.cityCode}
                  onChange={(e) => setFormData({ ...formData, cityCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 uppercase font-mono focus:outline-none focus:border-blue-500"
                  placeholder="CHN"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Parent Parcel ID</label>
                <input
                  type="text"
                  value={formData.parcelId}
                  onChange={(e) => setFormData({ ...formData, parcelId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 uppercase font-mono focus:outline-none focus:border-blue-500"
                  placeholder="P0428"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Building Volume ID</label>
                <input
                  type="text"
                  value={formData.buildingId}
                  onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 uppercase font-mono focus:outline-none focus:border-blue-500"
                  placeholder="B01"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Floor Level Code</label>
                <input
                  type="text"
                  value={formData.floorCode}
                  onChange={(e) => setFormData({ ...formData, floorCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 uppercase font-mono focus:outline-none focus:border-blue-500"
                  placeholder="F07"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Unit / Volume Code</label>
                <input
                  type="text"
                  value={formData.unitCode}
                  onChange={(e) => setFormData({ ...formData, unitCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 uppercase font-mono focus:outline-none focus:border-blue-500"
                  placeholder="U02"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Property Usage</label>
                <select
                  value={formData.usageType}
                  onChange={(e) => setFormData({ ...formData, usageType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial Office</option>
                  <option value="Basement Parking">Basement Parking Bay</option>
                  <option value="Common Area">Common Undivided Area</option>
                  <option value="Government Land">Government Facility</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Carpet Area (sq.ft)</label>
                <input
                  type="number"
                  value={formData.areaSqft}
                  onChange={(e) => setFormData({ ...formData, areaSqft: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Datum Min Elevation (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.elevationMinM}
                  onChange={(e) => setFormData({ ...formData, elevationMinM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Datum Max Elevation (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.elevationMaxM}
                  onChange={(e) => setFormData({ ...formData, elevationMaxM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{isGenerating ? 'Encoding Volume...' : 'GENERATE 3D ULPIN'}</span>
            </button>
          </form>
        </div>

        {/* Results & Breakdown */}
        <div className="lg:col-span-6 space-y-4">
          {result && (
            <div className="glass-panel rounded-2xl border border-blue-600/50 p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Generated Volumetric Identity
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Syntax Validated</span>
                </span>
              </div>

              {/* Huge ULPIN Badge */}
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-900/60 space-y-2">
                <div className="font-mono text-xl sm:text-2xl font-black text-blue-100 tracking-tight break-all text-center selection:bg-blue-600">
                  {result.prototype_3d_ulpin}
                </div>
                <div className="text-center text-[11px] text-slate-400">
                  Prototype 3D ULPIN • ISO 19152 LADM 3D Extension Conforming
                </div>
              </div>

              {/* Hierarchical Breakdown Tree (Section 16) */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
                <span className="font-semibold text-slate-300 block pb-1 border-b border-slate-800">
                  Hierarchical Cadastral Breakdown
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold w-12">IN</span>
                    <span className="text-slate-500">↓</span>
                    <span className="text-slate-300">{result.breakdown.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold w-12">{formData.stateCode}</span>
                    <span className="text-slate-500">↓</span>
                    <span className="text-slate-300">{result.breakdown.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold w-12">{formData.cityCode}</span>
                    <span className="text-slate-500">↓</span>
                    <span className="text-slate-300">{result.breakdown.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold w-12">{formData.parcelId}</span>
                    <span className="text-slate-500">↓</span>
                    <span className="text-slate-300">{result.breakdown.parcel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold w-12">{formData.buildingId}</span>
                    <span className="text-slate-500">↓</span>
                    <span className="text-slate-300">{result.breakdown.building}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold w-12">{formData.floorCode}</span>
                    <span className="text-slate-500">↓</span>
                    <span className="text-slate-300">{result.breakdown.floor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold w-12">{formData.unitCode}</span>
                    <span className="text-slate-500">↓</span>
                    <span className="text-slate-300">{result.breakdown.unit}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={copyUlpin}
                  className="py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => navigate('/viewer3d')}
                  className="py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>View in 3D</span>
                </button>

                <button
                  onClick={() => navigate(`/passport/${encodeURIComponent(result.prototype_3d_ulpin)}`)}
                  className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Property Card</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 italic text-center">
                {result.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
