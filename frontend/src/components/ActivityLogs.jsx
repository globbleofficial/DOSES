import React from 'react';

export default function ActivityLogs({ logs }) {
  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-5">
      <h3 className="text-sm font-bold text-cyan-400 terminal-font mb-3 flex items-center gap-2">
        <span>📟</span> REAL-TIME SANITIZATION AUDIT LOGS
      </h3>

      <div className="bg-[#050811] border border-slate-800 rounded-lg p-3 h-52 overflow-y-auto space-y-1.5 terminal-font text-xs">
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-16">Audit log initialized. Awaiting user command...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-slate-500">[{log.time}]</span>
              <span className={log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
