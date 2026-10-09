import React, { useState } from 'react';

export default function BookIndexAnalogyVisualizer() {
  const [mode, setMode] = useState('NORMAL'); // 'NORMAL' or 'DOSES'
  const [step, setStep] = useState(0); // 0: Original, 1: Deleted, 2: Recovered / Purged

  const reset = (newMode) => {
    setMode(newMode);
    setStep(0);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 glow-cyan my-6">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded font-mono font-bold">
            EDUCATIONAL & VIVA DEMONSTRATION
          </span>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <span>📖</span> THE BOOK INDEX VS PHYSICAL MEMORY SECTOR ANALOGY
          </h3>
          <p className="text-xs text-slate-400">
            Compare why normal Shift+Delete is an illusion vs how DOSES physically destroys data.
          </p>
        </div>

        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => reset('NORMAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === 'NORMAL' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ⚠️ Normal Deletion (Shift + Del)
          </button>
          <button
            onClick={() => reset('DOSES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === 'DOSES' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ⚡ DOSES Physical Overwrite
          </button>
        </div>
      </div>

      {/* Interactive Step Trigger */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs text-slate-400 font-mono">SIMULATION CONTROLS:</span>
        <button
          onClick={() => setStep(0)}
          className={`px-3 py-1 rounded text-xs font-semibold ${step === 0 ? 'bg-slate-700 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
        >
          1. File Saved on PC
        </button>
        <button
          onClick={() => setStep(1)}
          className={`px-3 py-1 rounded text-xs font-semibold ${step === 1 ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
        >
          {mode === 'NORMAL' ? '2. User Presses Shift+Delete' : '2. DOSES Overwrites Physical Sectors'}
        </button>
        <button
          onClick={() => setStep(2)}
          className={`px-3 py-1 rounded text-xs font-semibold ${step === 2 ? (mode === 'NORMAL' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white') : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
        >
          {mode === 'NORMAL' ? '3. Hacker Runs Data Recovery' : '3. Recovery Attempt Fails (0% Trace)'}
        </button>
      </div>

      {/* The Two Halves: Index vs Physical Storage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: The Index (MFT Table of Contents) */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 font-mono">PART 1: FILE SYSTEM "INDEX" (MFT / INODE)</span>
              <span className="text-[11px] font-mono text-cyan-400">Like Book's Index Page</span>
            </div>

            <div className="bg-[#030712] border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-2">
              <div className="text-slate-500">// Directory Index Record #4102</div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>Entry:</span>
                <span className={step > 0 && mode === 'NORMAL' ? 'line-through text-rose-400' : step > 0 && mode === 'DOSES' ? 'text-slate-600' : 'text-emerald-400'}>
                  {step > 0 && mode === 'DOSES' ? '[ENTRY ZEROED & UNLINKED]' : 'D:\\photo.jpg'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>Physical Pointer:</span>
                <span className="text-cyan-300">Cluster 104520 - 104527</span>
              </div>
              <div className="flex justify-between">
                <span>Allocated Flag:</span>
                <span className={step === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {step === 0 ? '0x01 (IN USE)' : '0x00 (FREE / AVAILABLE)'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-900/60 rounded-lg text-xs text-slate-300">
            {step === 0 && '📌 The book index points directly to Chapter 4 (Sector 104520).'}
            {step === 1 && mode === 'NORMAL' && (
              <span className="text-amber-300">
                ⚠️ <strong>Only the index name was erased!</strong> Windows simply removed the line from the table of contents. The actual chapter (data) was never touched.
              </span>
            )}
            {step === 1 && mode === 'DOSES' && (
              <span className="text-cyan-300">
                ⚡ DOSES locks the handle, keeps pointer temporarily while it scrubs the physical sectors below, and only removes the index record AFTER hardware confirmation.
              </span>
            )}
            {step === 2 && mode === 'NORMAL' && (
              <span className="text-rose-400">
                🚨 <strong>Hacker Exploitation:</strong> The hacker tool opens the raw drive, ignores the missing index, and reads the raw sectors directly!
              </span>
            )}
            {step === 2 && mode === 'DOSES' && (
              <span className="text-emerald-400">
                ✅ <strong>Zero-Trace Achieved:</strong> Both index record and physical raw sectors are permanently eradicated.
              </span>
            )}
          </div>
        </div>

        {/* Right: The Physical Storage (Disk Sectors / Platter / Flash) */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 font-mono">PART 2: PHYSICAL STORAGE (FLASH CELLS / PLATTERS)</span>
              <span className="text-[11px] font-mono text-cyan-400">Like Book's Actual Pages</span>
            </div>

            <div className="bg-[#030712] border border-slate-800 rounded-lg p-4 font-mono text-xs">
              <div className="text-slate-500 mb-2">// Raw Sector Memory Dump (Offset 104520)</div>
              
              {mode === 'NORMAL' ? (
                <div className="space-y-1 text-cyan-300">
                  <div className="text-amber-400 font-bold">FF D8 FF E0 00 10 4A 46 49 46 [JPEG HEADER]</div>
                  <div className="text-slate-400">00 01 01 01 00 60 00 60 00 00 FF DB 00 43</div>
                  <div className="text-slate-400">08 06 06 07 06 05 08 07 07 07 09 09 08 0A</div>
                  <div className="text-amber-400 font-bold">... RAW PHOTO DATA 100% INTACT ...</div>
                </div>
              ) : step === 0 ? (
                <div className="space-y-1 text-cyan-300">
                  <div className="text-blue-400 font-bold">FF D8 FF E0 00 10 4A 46 49 46 [JPEG HEADER]</div>
                  <div className="text-slate-400">00 01 01 01 00 60 00 60 00 00 FF DB 00 43</div>
                  <div className="text-slate-400">... Photo payload on flash silicon ...</div>
                </div>
              ) : step === 1 ? (
                <div className="space-y-1 text-purple-300 animate-pulse">
                  <div className="text-emerald-400 font-bold">[PASS 1]: 00 00 00 00 00 00 00 00 (ZERO-FILL)</div>
                  <div className="text-sky-400 font-bold">[PASS 2]: FF FF FF FF FF FF FF FF (BIT INVERSION)</div>
                  <div className="text-pink-400 font-bold">[PASS 3]: 9A 3F B2 81 4C 18 E9 7D (QUANTUM NOISE)</div>
                  <div className="text-emerald-300">[FLUSH]: Hardware cache committed to silicon.</div>
                </div>
              ) : (
                <div className="space-y-1 text-emerald-400">
                  <div>9A 3F B2 81 4C 18 E9 7D 0A F2 C5 63 99 1D</div>
                  <div>1E 7B A0 45 8F 33 C9 22 5B 90 E1 88 47 D3</div>
                  <div className="font-bold text-emerald-300">[ENTROPY: 7.99998 bits/byte - 100% WHITE NOISE]</div>
                  <div className="text-slate-500">[STATUS]: Photo destroyed. Zero remnants.</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-900/60 rounded-lg text-xs">
            {mode === 'NORMAL' ? (
              <span className="text-rose-400 font-medium">
                ❌ <strong>Forensic Result:</strong> PhotoRec scans sectors 104520-104527, finds the <code>FF D8 FF E0</code> signature, and recovers the full photo in seconds.
              </span>
            ) : step === 2 ? (
              <span className="text-emerald-400 font-medium">
                ✅ <strong>Forensic Result:</strong> PhotoRec scans sectors 104520-104527 $\to$ <strong>0 files carved</strong>. No headers found. Data is physically gone forever.
              </span>
            ) : (
              <span className="text-cyan-300">
                ⚡ DOSES writes multi-pass cryptographic patterns directly over the memory cells before releasing the cluster.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
