import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Building2,
  Layers,
  Home,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { samplePropertyCardData } from '../data/mockData';

export const PropertyPassportPage: React.FC = () => {
  const { ulpin } = useParams<{ ulpin: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState({
    ...samplePropertyCardData,
    prototype_3d_ulpin: ulpin || samplePropertyCardData.prototype_3d_ulpin
  });

  useEffect(() => {
    if (ulpin) {
      api.getByUlpin(ulpin).then((res) => {
        if (res?.property) {
          setData({
            prototype_3d_ulpin: res.property.ulpin_3d,
            location: `${res.parcel?.city || 'Chennai'}, ${res.parcel?.state || 'Tamil Nadu'}`,
            building: res.building?.name || 'Meridian Heights',
            floor: String(res.floor?.floor_number || 7),
            unit: res.property.unit_number.replace('U', ''),
            area: `${res.property.area_sqft} sq.ft (${res.property.area_sqm} sq.m)`,
            vertical_range: `+${res.property.elevation_min_m}m → +${res.property.elevation_max_m}m`,
            property_type: res.property.property_sub_type || 'Residential Apartment',
            ownership: res.property.ownership_type || 'Private Freehold',
            owner_name: res.property.owner_name || 'Karthik R',
            validation: res.property.validation_status === 'VALIDATED' ? 'VERIFIED' : 'PENDING REVIEW',
            confidence: `${res.property.validation_confidence}%`,
            last_updated: res.property.registration_date || '07 October 2026'
          });
        }
      }).catch(() => {
        // keep fallback data
      });
    }
  }, [ulpin]);

  const handlePrint = () => {
    window.print();
  };

  const verificationUrl = `${window.location.origin}/verify/${encodeURIComponent(data.prototype_3d_ulpin)}`;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Controls (Hidden on Print) */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-slate-100">
            Digital Volumetric Property Passport
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/verify/${encodeURIComponent(data.prototype_3d_ulpin)}`)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Public QR View</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Passport Certificate Container */}
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl shadow-2xl p-8 relative overflow-hidden print:bg-white print:text-black print:border-black print:p-6">
        {/* Government Watermark / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-800 print:border-black">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-2xl shadow-lg print:bg-black">
              V
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">
                GOVERNMENT OF INDIA • DEPARTMENT OF LAND RESOURCES (DoLR)
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight print:text-black">
                PROPERTY PASSPORT
              </h1>
              <div className="text-xs text-blue-400 font-medium print:text-blue-800">
                Volumetric Stratum Cadastral Record • Prototype Specification
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-bold text-xs uppercase tracking-wider print:bg-transparent print:border-black print:text-black">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{data.validation}</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-1 print:text-black">
              Confidence Index: {data.confidence}
            </span>
          </div>
        </div>

        {/* Prototype 3D ULPIN Large Display */}
        <div className="my-6 p-4 rounded-xl bg-slate-950/80 border border-blue-600/50 flex flex-col sm:flex-row items-center justify-between gap-4 print:bg-gray-100 print:border-black">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block print:text-blue-900">
              Prototype 3D ULPIN
            </span>
            <div className="font-mono text-xl sm:text-2xl font-black text-blue-100 break-all print:text-black">
              {data.prototype_3d_ulpin}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="p-2 bg-white rounded-lg shadow shrink-0 flex flex-col items-center">
            {/* SVG Generative QR Code Representation */}
            <svg className="w-20 h-20" viewBox="0 0 29 29" fill="none">
              <rect width="29" height="29" fill="white" />
              {/* Corner Targets */}
              <rect x="2" y="2" width="7" height="7" fill="black" />
              <rect x="3" y="3" width="5" height="5" fill="white" />
              <rect x="4" y="4" width="3" height="3" fill="black" />

              <rect x="20" y="2" width="7" height="7" fill="black" />
              <rect x="21" y="3" width="5" height="5" fill="white" />
              <rect x="22" y="4" width="3" height="3" fill="black" />

              <rect x="2" y="20" width="7" height="7" fill="black" />
              <rect x="3" y="21" width="5" height="5" fill="white" />
              <rect x="4" y="22" width="3" height="3" fill="black" />

              {/* Data Dots Pattern */}
              <rect x="11" y="4" width="2" height="2" fill="black" />
              <rect x="15" y="4" width="2" height="2" fill="black" />
              <rect x="4" y="11" width="2" height="2" fill="black" />
              <rect x="8" y="11" width="2" height="2" fill="black" />
              <rect x="12" y="12" width="5" height="5" fill="black" />
              <rect x="20" y="12" width="2" height="2" fill="black" />
              <rect x="24" y="15" width="2" height="2" fill="black" />
              <rect x="11" y="20" width="2" height="2" fill="black" />
              <rect x="15" y="23" width="2" height="2" fill="black" />
              <rect x="21" y="22" width="4" height="4" fill="black" />
            </svg>
            <span className="text-[9px] text-slate-800 font-mono mt-1 font-semibold">
              SCAN TO VERIFY
            </span>
          </div>
        </div>

        {/* Spatial & Title Specifications Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2 print:border-gray-300">
            <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px] print:text-black">
              Location & Structural Container
            </span>
            <div className="space-y-1.5 text-slate-300 print:text-black">
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-gray-600">Jurisdiction / City:</span>
                <span className="font-semibold">{data.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-gray-600">Building Volume:</span>
                <span className="font-semibold">{data.building}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-gray-600">Floor Level:</span>
                <span className="font-semibold font-mono">{data.floor} (F0{data.floor})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-gray-600">Unit Demarcation:</span>
                <span className="font-semibold font-mono">Unit {data.unit} (East Wing)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2 print:border-gray-300">
            <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px] print:text-black">
              Volumetric Envelope & Area
            </span>
            <div className="space-y-1.5 text-slate-300 print:text-black">
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-gray-600">Vertical Range (Z-Datum):</span>
                <span className="font-mono font-bold text-cyan-400 print:text-blue-900">{data.vertical_range}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-gray-600">Surveyed Carpet Area:</span>
                <span className="font-semibold">{data.area}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-gray-600">Title Classification:</span>
                <span className="font-semibold">{data.property_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-gray-600">Ownership Form:</span>
                <span className="font-semibold">{data.ownership}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rights, Easements, and Legal Restrictions */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-2 print:border-gray-300">
          <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px] print:text-black">
            Registered Volumetric Property Rights & Easements
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 print:text-black">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Exclusive Stratum Freehold</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Dedicated Basement Bay (P-B1-14)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Undivided Common Area Share (2.1%)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 print:border-gray-300 text-[11px] text-slate-400 print:text-gray-600">
            <span className="font-semibold text-amber-400 print:text-black">Enforceability Restriction:</span> Structural modifications to vertical load-bearing columns and shear walls require municipal structural permit and cadastre amendment.
          </div>
        </div>

        {/* Signatures & Synthetic Disclaimer Footer (Section 38 & 39) */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 print:border-black print:text-black">
          <div>
            <p className="font-medium">Issuing Authority: Department of Land Resources (DoLR)</p>
            <p className="text-[11px] text-slate-500 print:text-gray-600">Survey Officer: Arun Kumar • Verified: {data.last_updated}</p>
          </div>
          <div className="text-[10px] text-slate-500 max-w-sm text-right print:text-left print:text-gray-600 italic">
            PROTOTYPE / SYNTHETIC DATA: This digital card demonstrates a structured 3D spatial identity model and does not constitute legal title or official Government of India land records.
          </div>
        </div>
      </div>
    </div>
  );
};
