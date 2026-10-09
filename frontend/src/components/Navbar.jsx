import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenAI, onOpenReport, onOpenSim, backendConnected }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-cyan-500/30 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-slate-900/90">
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400 flex items-center justify-center font-bold text-cyan-400 text-xl shadow-lg shadow-cyan-500/20">
          ⚡
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-cyan-400 tracking-wider terminal-font">
              DOSES
            </h1>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded font-mono font-bold tracking-wide">
              ENTERPRISE PLATFORM
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Data Overwrite & Sanitization Enterprise System (NIST SP 800-88 & ML-DSA)</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 text-xs">
        {/* Real-time telemetry indicators */}
        <div className="hidden lg:flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded">
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-slate-300 font-mono">Engine: Online</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-sky-900/60 px-2.5 py-1 rounded">
            <span className="text-sky-400 font-bold">☁️ Salesforce:</span>
            <span className="text-sky-300 font-mono">ITAM Synced</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-purple-900/60 px-2.5 py-1 rounded">
            <span className="text-purple-400 font-bold">⛓️ Polygon:</span>
            <span className="text-purple-300 font-mono">Anchor v3</span>
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={onOpenSim}
          className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-400/40 rounded text-xs font-semibold transition flex items-center gap-1.5"
        >
          <span>🔬</span> Forensic Simulator
        </button>

        <button
          onClick={onOpenReport}
          className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-400/40 rounded text-xs font-semibold transition flex items-center gap-1.5"
        >
          <span>📜</span> Major Project Report
        </button>

        <button
          onClick={onOpenAI}
          className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-400/40 rounded text-xs font-semibold transition flex items-center gap-1.5"
        >
          <span>🤖</span> AI Advisor
        </button>

        {user && (
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-700">
            <span className="text-xs text-slate-300 font-medium">{user.name}</span>
            <button
              onClick={logout}
              className="text-xs text-rose-400 hover:text-rose-300 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
