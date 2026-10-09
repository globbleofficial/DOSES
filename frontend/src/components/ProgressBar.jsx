import React from 'react';

export default function ProgressBar({ progress, phase, wiping }) {
  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-slate-300 terminal-font">
          STATUS: {wiping ? (phase || 'PURGING DISK SECTORS') : 'READY FOR SANITIZATION'}
        </span>
        <span className="text-sm font-mono font-bold text-cyan-400">{progress}%</span>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
        <div
          className="h-3 bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
