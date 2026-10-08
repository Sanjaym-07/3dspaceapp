import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  RefreshCw,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Database,
  Building2,
  Box
} from 'lucide-react';
import { api } from '../../services/api';

interface HeaderProps {
  onStartDemo: () => void;
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onStartDemo, onRefreshData }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toUpperCase();
    if (!q) return;

    // Route based on query format
    if (q.startsWith('IN-') || q.includes('-P') || q.includes('-B') || q.includes('-F')) {
      // Direct ULPIN or property
      navigate(`/passport/${encodeURIComponent(q)}`);
    } else if (q.startsWith('UG-') || q.includes('UTIL') || q.includes('SEW') || q.includes('METRO')) {
      navigate('/underground');
    } else if (q.startsWith('B0') || q.includes('MERIDIAN') || q.includes('GREEN') || q.includes('CIVIC')) {
      navigate('/viewer3d');
    } else if (q.startsWith('P') || q.includes('TN-') || q.includes('KA-')) {
      navigate('/dashboard');
    } else {
      // Default to properties table search
      navigate(`/properties?q=${encodeURIComponent(q)}`);
    }
  };

  const handleGenerateDemoCity = async () => {
    setIsResetting(true);
    try {
      await api.resetDemoCity();
      setToastMsg('Demo City regenerated with 3 parcels, 3 buildings & utilities!');
      setTimeout(() => setToastMsg(null), 4000);
      if (onRefreshData) onRefreshData();
    } catch {
      setToastMsg('Demo city reloaded from local state.');
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="h-14 bg-slate-950/90 border-b border-slate-800/80 px-4 flex items-center justify-between gap-4 select-none z-30">
      {/* Global Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by 3D ULPIN (e.g. IN-TN-CHN-P0428-B01-F07-U02), Parcel, Building, Asset ID..."
          className="w-full bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />
      </form>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Toast message if active */}
        {toastMsg && (
          <div className="px-3 py-1 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* Generate Demo City Button */}
        <button
          onClick={handleGenerateDemoCity}
          disabled={isResetting}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
          title="Reset and regenerate clean demonstration dataset"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
          <span>{isResetting ? 'Generating...' : 'Generate Demo City'}</span>
        </button>

        {/* START DEMO Button */}
        <button
          onClick={onStartDemo}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-950 transition transform hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span>START DEMO</span>
        </button>

        {/* System Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Spatial Cadastre Online</span>
        </div>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition relative"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-11 w-80 glass-panel rounded-xl border border-slate-700/80 shadow-2xl p-3 space-y-2 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-slate-200">Recent Cadastral Alerts</span>
                <span className="text-[10px] text-blue-400">1 Warning</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800/40 flex items-start gap-2 text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-300">Topology Conflict Flagged</p>
                    <p className="text-[11px] text-amber-200/80">
                      B01-F07-U03 overlaps U04 by 2.3% in Meridian Heights.
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-200">3D ULPIN Issued</p>
                    <p className="text-[11px] text-slate-400">
                      IN-TN-CHN-P0428-B01-F07-U02 validated and digitally stamped.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
