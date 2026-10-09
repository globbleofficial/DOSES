import React from 'react';

export default function DriveSelector({ drives, selectedDrive, onSelect, onRefresh, loading }) {
  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-5 glow-cyan">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-cyan-400 terminal-font flex items-center gap-2">
            <span>💾</span> CONNECTED DRIVES & STORAGE MEDIA
          </h3>
          <p className="text-xs text-slate-400">
            Plug in your Pendrive / External HDD. Select device to initiate physical volume purge.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded text-xs transition"
        >
          {loading ? 'Scanning...' : '🔄 Scan Drives'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {drives.length === 0 ? (
          <div className="col-span-2 text-center py-6 text-slate-500 text-xs border border-dashed border-slate-700 rounded-lg">
            No removable drives detected. Insert USB/Pendrive and click "Scan Drives".
          </div>
        ) : (
          drives.map((d) => {
            const isSelected = selectedDrive?.id === d.id;
            return (
              <div
                key={d.id}
                onClick={() => d.isSafeToWipe && onSelect(d)}
                className={`p-3.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                  !d.isSafeToWipe
                    ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-800'
                    : isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400'
                    : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <span className="text-cyan-400">{d.driveLetter}</span> {d.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{d.type} ({d.fileSystem})</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {d.sizeFormatted}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Free: {d.freeSpaceFormatted || 'N/A'}</span>
                  {!d.isSafeToWipe ? (
                    <span className="text-rose-400 font-semibold text-[10px]">🔒 System Drive (Locked)</span>
                  ) : isSelected ? (
                    <span className="text-emerald-400 font-bold text-[10px]">✓ Selected for Sanitization</span>
                  ) : (
                    <span className="text-cyan-400 hover:underline text-[10px]">Click to Select</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
