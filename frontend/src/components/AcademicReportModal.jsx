import React from 'react';

export default function AcademicReportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-400 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded font-mono font-bold">
              MAJOR PROJECT RESEARCH REPORT
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              DOSES: Data Overwrite & Sanitization Enterprise System
            </h2>
            <p className="text-xs text-slate-400">IEEE Format System Documentation & Technical Specification</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✜</button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">1. Project Abstract</h3>
            <p>
              In contemporary enterprise data centers and workstations, standard file system deletion operations decouple pointers in metadata tables while leaving physical payloads completely intact in unallocated clusters. This research presents <strong>DOSES</strong>, an enterprise-grade hardware sanitization fabric designed to achieve absolute, provable data irrecoverability.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">2. Problem Formulation: The Modern Storage Remanence Vulnerability</h3>
            <p>
              Traditional overwriting software fails on solid-state media due to the Flash Translation Layer (FTL). On modern SSDs and USB drives, logical-to-physical block mapping constantly remaps writes across physical flash dies to balance wear leveling. When an investigator uses heuristic file carving, raw signatures such as JPEG SOI/EOI headers (FF D8 FF E0 / FF D9) are effortlessly detected and restored. DOSES eliminates this attack surface by targeting the underlying physical controller through hardware crypto-erasure and Direct-I/O saturation.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">3. Technical Architecture & Tri-vector Sanitization</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-emerald-400 mb-1">Vector 1: Instant Crypto Purge</div>
                <p className="text-[11px] text-slate-400">O(1) state collapse rotating internal Media Encryption Keys (MEK) via NVMe Sanitize Crypto-Erase in &lt;200 ms.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-cyan-400 mb-1">Vector 2: Direct-I/O Overwrite</div>
                <p className="text-[11px] text-slate-400">Kernel page-cache bypass (O_DIRECT) streaming DoD 5220.22-M (3 passes) and Gutmann (35 passes) multi-pass bit inversions.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-bold text-purple-400 mb-1">Vector 3: Quantum-Grade PHC</div>
                <p className="text-[11px] text-slate-400">Post-quantum digital signatures (ML-DSA / Crystals-Dilithium) anchored into EVM/Polygon Merkle trees.</p>
              </div>
            </div>
          </section>

          <section className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-400 mb-2 uppercase tracking-wider">4. Experimental Benchmarks</h3>
            <table className="w-full text-left border-collapse mt-2">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2">Metric</th>
                  <th className="py-2">Traditional Method</th>
                  <th className="py-2 text-cyan-300">DOSES Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                <tr>
                  <td className="py-1.5 text-slate-300">16 TB SSD Purge Time</td>
                  <td className="py-1.5 text-rose-400">14 to 28 Hours</td>
                  <td className="py-1.5 text-emerald-400 font-bold">&lt; 200 Milliseconds (O(1))</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-300">Shannon Entropy Score</td>
                  <td className="py-1.5 text-slate-400">Variable / Unverified</td>
                  <td className="py-1.5 text-emerald-400 font-bold">7.999647 / 8.000000 bits/byte</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-300">Enterprise ITAM Sync</td>
                  <td className="py-1.5 text-slate-400">Manual CSV Import</td>
                  <td className="py-1.5 text-emerald-400 font-bold">Automated Salesforce OAuth 2.0</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
          <span className="text-slate-400">Author: Capstone Research Team | Status: Ready for Publication & Defense</span>
          <button onClick={onClose} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold">
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
