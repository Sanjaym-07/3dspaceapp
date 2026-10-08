import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Layers,
  LayoutDashboard,
  Box,
  Building,
  Home,
  ShieldAlert,
  Fingerprint,
  Upload,
  Bot,
  History,
  Info,
  Network,
  Globe2
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Welcome / Portal', icon: Globe2 },
  { path: '/dashboard', label: 'Command Dashboard', icon: LayoutDashboard },
  { path: '/viewer3d', label: '3D Cadastral Viewer', icon: Box, highlight: true },
  { path: '/properties', label: 'Property Explorer', icon: Home },
  { path: '/floors', label: 'Floor & Unit Matrix', icon: Building },
  { path: '/underground', label: 'Underground Assets', icon: Network },
  { path: '/validation', label: 'Topology Engine', icon: ShieldAlert, badge: '9 Rules' },
  { path: '/generator', label: '3D ULPIN Generator', icon: Fingerprint },
  { path: '/import', label: 'Spatial Data Import', icon: Upload },
  { path: '/assistant', label: 'AI Spatial Assistant (VERA)', icon: Bot },
  { path: '/audit', label: 'Cadastral Audit Log', icon: History },
  { path: '/about', label: 'About & Methodology', icon: Info },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-900/30 font-bold text-white tracking-wider text-base">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base">
                  VERTICAD
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 font-semibold border border-blue-800/60">
                  3D ULPIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight leading-none mt-0.5">
                DoLR • Ministry of Rural Development
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-950 font-semibold'
                      : item.highlight
                      ? 'text-cyan-300 hover:text-white hover:bg-slate-900/90 font-medium'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 opacity-80 group-hover:opacity-100 transition" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Cadastral Officer Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/30">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-700/30 text-blue-300 flex items-center justify-center font-bold text-xs border border-blue-600/40">
            AK
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">
              Arun Kumar
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              Cadastral Surveyor (DoLR)
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
