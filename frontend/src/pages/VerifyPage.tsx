import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  Layers,
  MapPin,
  Calendar,
  Box,
  ExternalLink,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import { samplePropertyCardData } from '../data/mockData';

export const VerifyPage: React.FC = () => {
  const { ulpin } = useParams<{ ulpin: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState({
    ulpin: ulpin || "IN-TN-CHN-P0428-B01-F07-U02",
    verified: true,
    building: "Meridian Heights",
    floor: "Floor 7",
    unit: "Unit 02",
    elevation: "+21.0m → +24.2m",
    owner: "Karthik R",
    timestamp: "07 October 2026, 20:12:45 IST",
    hash: "SHA256: 8f4b239e9a117b9c3f4e22a890d7c491295ba5e6381290bb341fa"
  });

  useEffect(() => {
    if (ulpin) {
      api.getByUlpin(ulpin).then((res) => {
        if (res?.property) {
          setRecord({
            ulpin: res.property.ulpin_3d,
            verified: res.property.validation_status === 'VALIDATED',
            building: res.building?.name || "Meridian Heights",
            floor: `Floor ${res.floor?.floor_number || 7}`,
            unit: `Unit ${res.property.unit_number}`,
            elevation: `+${res.property.elevation_min_m}m → +${res.property.elevation_max_m}m`,
            owner: res.property.owner_name || "Karthik R",
            timestamp: "07 October 2026, 20:12:45 IST",
            hash: `SHA256: ${res.property.qr_token || '8f4b239e9a117b9c3f4e22a890d7c491295ba5e'}`
          });
        }
      }).catch(() => {});
    }
  }, [ulpin]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-blue-600">
      <div className="w-full max-w-lg glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-300">
        {/* Verification Status Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/80 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mt-2">
            Volumetric Cadastre Verified
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Official Spatial Verification
          </h1>
          <p className="text-xs text-slate-400 max-w-sm">
            Government of India • Department of Land Resources (DoLR) Prototype 3D Cadastral Index.
          </p>
        </div>

        {/* 3D ULPIN Box */}
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-blue-900/60 text-center space-y-1">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
            Verified Prototype 3D ULPIN
          </span>
          <div className="font-mono text-base sm:text-lg font-black text-blue-200 break-all">
            {record.ulpin}
          </div>
        </div>

        {/* Spatial Attributes Breakdown */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 divide-y divide-slate-800 text-xs">
          <div className="p-3 flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Building Container</span>
            </span>
            <span className="font-semibold text-slate-200">{record.building}</span>
          </div>

          <div className="p-3 flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vertical Stratum</span>
            </span>
            <span className="font-semibold text-slate-200">{record.floor} • {record.unit}</span>
          </div>

          <div className="p-3 flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vertical Elevation Range</span>
            </span>
            <span className="font-mono font-bold text-cyan-300">{record.elevation}</span>
          </div>

          <div className="p-3 flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Registered Title Holder</span>
            </span>
            <span className="font-semibold text-slate-200">{record.owner}</span>
          </div>

          <div className="p-3 flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Verification Timestamp</span>
            </span>
            <span className="text-[11px] text-slate-300 font-mono">{record.timestamp}</span>
          </div>
        </div>

        {/* Cryptographic Hash */}
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-500 font-mono break-all text-center">
          {record.hash}
        </div>

        {/* Action Button: Return to 3D View */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/viewer3d')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow transition"
          >
            <Box className="w-4 h-4" />
            <span>Open in 3D Viewer</span>
          </button>
          <button
            onClick={() => navigate(`/passport/${encodeURIComponent(record.ulpin)}`)}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            Passport Card
          </button>
        </div>

        <p className="text-[10px] text-slate-500 text-center italic">
          Synthetic demonstration record. Demonstrates vertical property identification model.
        </p>
      </div>
    </div>
  );
};
