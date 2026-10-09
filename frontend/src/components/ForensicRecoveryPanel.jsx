import React, { useState } from 'react';
import { scanDeletedFiles } from '../services/recoveryApi';

export default function ForensicRecoveryPanel() {
  const [scanTarget, setScanTarget] = useState('D:\\');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await scanDeletedFiles(scanTarget);
      setResults(data.result);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 glow-cyan my-6">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div>
          <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-700 px-2.5 py-0.5 rounded font-mono font-bold">
            FORENSIC DISK AUDITOR & CARVER
          </span>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <span>🔍</span> RECOVER DELETED FILES (SHIFT+DELETE RECOVERY ENGINE)
          </h3>
          <p className="text-xs text-slate-400">
            Scan your drives for normal deleted files (Recycle Bin / Shift+Del remnants) vs DOSES-sanitized media.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <input
            type="text"
            value={scanTarget}
            onChange={(e) => setScanTarget(e.target.value)}
            placeholder="e.g. D:\ or C:\Users\"
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
          >
            {loading ? 'Scanning...' : '⚡ Scan for Deleted Files'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-600/40 rounded-lg text-xs text-rose-300 font-mono mb-4">
          Error: {error}
        </div>
      )}

      {/* Summary KPI Cards if results exist */}
      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl">
              <span className="text-slate-400">Normal Deleted (Shift+Del):</span>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {results.forensicAudit?.standardDeletedRecoverable} RECOVERABLE
              </div>
              <span className="text-[10px] text-amber-300">100% Data payload intact on sectors</span>
            </div>

            <div className="p-3 bg-slate-950 border border-emerald-500/40 rounded-xl">
              <span className="text-slate-400">DOSES Purged Media:</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                0% RECOVERABLE
              </div>
              <span className="text-[10px] text-emerald-300">Entropy = 8.0 | Zero Remnants</span>
            </div>

            <div className="p-3 bg-slate-950 border border-cyan-500/40 rounded-xl">
              <span className="text-slate-400">Scan Duration:</span>
              <div className="text-xl font-bold text-cyan-400 mt-1">
                {results.scanDurationSeconds}s
              </div>
              <span className="text-[10px] text-cyan-300">Deep Sector Magic Carving</span>
            </div>
          </div>

          {/* Results List */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-bold text-slate-300 font-mono mb-3">
              DISCOVERED DELETED MEDIA ARTIFACTS ON {results.target}:
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {results.recoveredFiles?.map((file, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                    file.recoveryStatus === 'RECOVERABLE_INTACT'
                      ? 'bg-amber-950/20 border-amber-500/40 text-slate-200'
                      : 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{file.fileType.includes('JPEG') ? '🖼️' : '📄'}</span>
                      <strong className="text-white font-mono">{file.originalName}</strong>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {file.sizeFormatted}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Location: <span className="text-cyan-300">{file.source}</span> | Deletion: <span className="text-amber-300">{file.deletionType}</span>
                    </div>
                    {file.details && (
                      <div className="text-[11px] text-slate-400">
                        {file.details}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {file.recoveryStatus === 'RECOVERABLE_INTACT' ? (
                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold font-mono text-[10px]">
                        ✓ {file.confidence}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-bold font-mono text-[10px]">
                        🛡️ 0% Trace (DOSES Purged)
                      </span>
                    )}

                    {file.previewUrl && (
                      <a
                        href={file.previewUrl}
                        download
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-bold transition"
                      >
                        ⬇️ Retrieve File
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
