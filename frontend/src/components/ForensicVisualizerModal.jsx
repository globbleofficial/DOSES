import React, { useState } from 'react';

export default function ForensicVisualizerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [phase, setPhase] = useState(0);

  const steps = [
    {
      title: "File Present (Normal State)",
      subtitle: "D:\\photo.jpg is active on disk. MFT record #4102 allocated. Raw JPEG magic headers present.",
      mftStatus: "0x01 (IN USE)",
      entropy: "7.42 bits/byte",
      clusterColor: "bg-blue-500",
      hexSnippet: "00000000  FF D8 FF E0 00 10 4A 46  49 46 00 01 01 01 00 60  |......JFIF.....`|\n00000010  00 60 00 00 FF DB 00 43  00 08 06 06 07 06 05 08  |.`.....C........|",
      terminal: "$ ls -l D:\\photo.jpg\n-rw-r--r-- 1 operator 32768 Oct 9 21:00 photo.jpg\n-> JPEG image data, JFIF standard 1.01 (96x96 px)"
    },
    {
      title: "Normal Delete (Recycle Bin Empty)",
      subtitle: "Shift+Delete flips MFT flag from 0x01 to 0x00. Zero sectors overwritten. Data remains 100% on disk!",
      mftStatus: "0x00 (UNALLOCATED)",
      entropy: "7.42 bits/byte",
      clusterColor: "bg-amber-500",
      hexSnippet: "00000000  FF D8 FF E0 00 10 4A 46  49 46 00 01 01 01 00 60  |......JFIF.....`|\n00000010  00 60 00 00 FF DB 00 43  00 08 06 06 07 06 05 08  |.`.....C........|",
      terminal: "[User Action] Empty Recycle Bin executed.\n[VULNERABILITY] MFT entry marked free, but physical clusters are untouched!"
    },
    {
      title: "Hacker / Forensic Carving",
      subtitle: "Attacker runs PhotoRec / Autopsy. Scans unallocated sectors, finds FF D8 FF E0 header, carves photo!",
      mftStatus: "CARVED VIA HEURISTICS",
      entropy: "7.42 bits/byte",
      clusterColor: "bg-rose-500",
      hexSnippet: "00000000  FF D8 FF E0 00 10 4A 46  49 46 00 01 01 01 00 60  |......JFIF.....`|\n-> MATCH DETECTED AT LBA 209040: EXTRACTING PHOTO",
      terminal: "# photorec /dev/sdb search\n[+] Match: Sector 209040 'FF D8 FF E0'\n[+] Reconstructed: recup_dir.1/f0209040.jpg (32 KB)\n[ALERT] 100% Bit-Identical Image Recovered in 1.4s!"
    },
    {
      title: "DOSES Military Purge",
      subtitle: "DOSES executes multi-pass overwrite (0x00 -> 0xFF -> Quantum Entropy) + hardware write-barrier flush.",
      mftStatus: "PURGED & ZEROED",
      entropy: "7.99998 bits/byte",
      clusterColor: "bg-emerald-500",
      hexSnippet: "00000000  9A 3F B2 81 4C 18 E9 7D  0A F2 C5 63 99 1D 8A 44  |.?..L..}...c...D|\n00000010  1E 7B A0 45 8F 33 C9 22  5B 90 E1 88 47 D3 A9 01  |.{.E.3.\"[...G...|",
      terminal: "[DOSES Purge] Pass 1 (0x00) -> Pass 2 (0xFF) -> Pass 3 (Quantum Entropy)\n[Flush] Hardware cache committed to silicon.\n# photorec /dev/sdb search\n-> 0 Files Carved. No signatures found. Shannon Entropy: 7.99998. Recovery: IMPOSSIBLE!"
    }
  ];

  const current = steps[phase];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-cyan-400 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div>
            <h3 className="text-base font-bold text-cyan-400 terminal-font flex items-center gap-2">
              <span>🔬</span> INTERACTIVE FORENSIC RECOVERY VS DOSES PURGE SIMULATOR
            </h3>
            <p className="text-xs text-slate-400">Step-by-step physical sector demonstration of D:\photo.jpg</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <div className="grid grid-cols-4 gap-2 p-4 bg-slate-950/60 border-b border-slate-800">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setPhase(idx)}
              className={`p-2.5 rounded-lg text-left border transition ${
                phase === idx ? 'bg-cyan-950 border-cyan-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-mono font-bold text-cyan-400">STEP 0{idx + 1}</div>
              <div className="text-xs font-semibold truncate">{s.title}</div>
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <h4 className="font-bold text-white text-sm mb-1">{current.title}</h4>
            <p className="text-xs text-slate-300">{current.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-400 font-mono">PHYSICAL CLUSTER TOPOGRAPHY</span>
                <span className="text-[11px] font-mono text-cyan-300">{current.mftStatus}</span>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {Array.from({ length: 32 }).map((_, i) => {
                  const isTargetCluster = i >= 10 && i <= 17;
                  return (
                    <div
                      key={i}
                      className={`h-7 rounded transition-all duration-300 flex items-center justify-center text-[10px] font-mono ${
                        isTargetCluster ? current.clusterColor : 'bg-slate-800/40'
                      }`}
                    >
                      {isTargetCluster ? 'DATA' : ''}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 text-[11px] text-slate-400 font-mono">
                Entropy: <strong className="text-white">{current.entropy}</strong> | Sectors 209040 - 209071
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-xs font-bold text-slate-400 font-mono mb-2">RAW HARDWARE HEX DUMP (LBA 209040)</span>
              <pre className="flex-1 bg-black p-3 rounded font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                {current.hexSnippet}
              </pre>
            </div>
          </div>

          <div className="bg-black p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
            <div className="text-slate-500 mb-1">// FORENSIC CARVING / KERNEL TERMINAL</div>
            <pre className="whitespace-pre-wrap">{current.terminal}</pre>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold">
            Close Simulation
          </button>
        </div>
      </div>
    </div>
  );
}
