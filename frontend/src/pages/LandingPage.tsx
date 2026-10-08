import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import {
  Box,
  Layers,
  Network,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Upload,
  Building2,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';

function MiniCityHero() {
  return (
    <Canvas camera={{ position: [25, 20, 25], fov: 45 }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[15, 25, 10]} intensity={1.5} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#38bdf8" />
      <OrbitControls autoRotate autoRotateSpeed={1.2} enableZoom={false} maxPolarAngle={Math.PI / 2.3} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[35, 35]} />
        <meshStandardMaterial color="#090e1a" roughness={0.8} />
      </mesh>
      <gridHelper args={[30, 20, '#38bdf8', '#1e293b']} position={[0, 0, 0]} />

      {/* Meridian Heights (B01) */}
      <group position={[-2, 0, -2]}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[0, 0.8 + i * 1.4, 0]}>
            <boxGeometry args={[6, 1.2, 5]} />
            <meshStandardMaterial
              color={i === 6 ? '#38bdf8' : '#1e3a8a'}
              emissive={i === 6 ? '#0284c7' : '#0f172a'}
              emissiveIntensity={i === 6 ? 0.8 : 0.2}
              transparent
              opacity={0.85}
            />
          </mesh>
        ))}
      </group>

      {/* Green Tower (B02) */}
      <group position={[8, 0, 4]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0, 0.7 + i * 1.3, 0]}>
            <boxGeometry args={[4.5, 1.1, 4]} />
            <meshStandardMaterial color="#065f46" emissive="#047857" emissiveIntensity={0.2} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>

      {/* Civic Plaza (B03) */}
      <group position={[-9, 0, 6]}>
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} position={[0, 0.6 + i * 1.2, 0]}>
            <boxGeometry args={[5, 1.0, 5]} />
            <meshStandardMaterial color="#581c87" emissive="#6b21a8" emissiveIntensity={0.2} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
    </Canvas>
  );
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col justify-between p-6 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-300">
      {/* Top Banner / Department Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-900/40">
            V
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 tracking-wide">
              GOVERNMENT OF INDIA • MINISTRY OF RURAL DEVELOPMENT
            </div>
            <div className="text-xs text-blue-400 font-medium">
              Department of Land Resources (DoLR) | Problem Statement PS26011 Prototype
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            Smart India Hackathon 2026
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-950/60 text-blue-300 border border-blue-800/60">
            3D ULPIN Spec v1.0
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Text & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 text-blue-300 text-xs font-semibold border border-blue-700/60">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Volumetric Property Cadastre & Spatial Intelligence</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight leading-none">
              VERTICAD
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold text-blue-400">
              3D ULPIN & Volumetric Property Intelligence Platform
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              "Transforming conventional 2D land records into spatially intelligent 3D property identities."
            </p>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            A single surface parcel encapsulates vertical strata: ground-level parcels, multi-storey apartment volumes, subterranean parking decks, and underground utility corridors. VERTICAD unifies these dimensions under an interoperable, topologically validated 3D spatial identity.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/viewer3d')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center gap-2 shadow-xl shadow-blue-900/40 transition group"
            >
              <Box className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
              <span>Explore 3D City</span>
              <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition"
            >
              <span>Command Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/import')}
              className="px-5 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-sm border border-slate-800 flex items-center gap-2 transition"
            >
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Import Spatial Data</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D Miniature City Canvas */}
        <div className="lg:col-span-5 h-[340px] sm:h-[400px] glass-panel rounded-2xl border border-slate-700/80 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-cyan-400">
            Interactive 3D Cadastral Engine
          </div>
          <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded bg-blue-900/40 border border-blue-700/50 text-[10px] text-blue-300">
            Rotate Orbit Active
          </div>
          <MiniCityHero />
          <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Chennai P0428 • Meridian Heights B01</span>
            <span className="text-blue-400 font-mono">12 Floors | 48 Units</span>
          </div>
        </div>
      </div>

      {/* 4 Feature Architecture Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {/* Card 1: 3D Parcels */}
        <div
          onClick={() => navigate('/viewer3d')}
          className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-blue-600/60 transition cursor-pointer group space-y-2.5"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
            <Box className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-slate-100 text-sm group-hover:text-blue-300 transition">
            3D Parcels
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Delineates 3D spatial volumes defined by spatial coordinates (X, Y) and vertical elevations [z_min, z_max].
          </p>
        </div>

        {/* Card 2: Vertical Properties */}
        <div
          onClick={() => navigate('/floors')}
          className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-emerald-600/60 transition cursor-pointer group space-y-2.5"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-slate-100 text-sm group-hover:text-emerald-300 transition">
            Vertical Properties
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Segment multi-storey buildings into discrete, registered floor slabs and individually titled apartment units.
          </p>
        </div>

        {/* Card 3: Underground Assets */}
        <div
          onClick={() => navigate('/underground')}
          className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-cyan-600/60 transition cursor-pointer group space-y-2.5"
        >
          <div className="w-9 h-9 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-105 transition-transform">
            <Network className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-slate-100 text-sm group-hover:text-cyan-300 transition">
            Underground Assets
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sub-surface utility corridors for water pipelines, high-voltage power conduits, and metro tunnels with depth datums.
          </p>
        </div>

        {/* Card 4: Topology Intelligence */}
        <div
          onClick={() => navigate('/validation')}
          className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-amber-600/60 transition cursor-pointer group space-y-2.5"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-slate-100 text-sm group-hover:text-amber-300 transition">
            Topology Intelligence
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            9 deterministic spatial validation rules catching vertical inversions, containment violations, and unit overlaps.
          </p>
        </div>
      </div>
    </div>
  );
};
