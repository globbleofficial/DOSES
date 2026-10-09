import React, { useEffect, useState } from 'react';
import { getStats } from '../services/certApi';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="p-6 text-slate-400">Loading audit statistics...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-cyan-400 terminal-font">Enterprise Sanitization Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Total Drives / Media Sanitized</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.totalDrivesAndFilesWiped}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Blockchain Certificates Anchored</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{stats.certificatesIssued}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Audit Compliance</div>
          <div className="text-sm font-bold text-emerald-400 mt-1">{stats.securityCompliance}</div>
        </div>
      </div>
    </div>
  );
}
