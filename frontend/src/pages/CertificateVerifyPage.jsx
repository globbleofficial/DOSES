import React, { useState } from 'react';
import { verifyCertificate } from '../services/certApi';

export default function CertificateVerifyPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const res = await verifyCertificate(query.trim());
      setResult(res.certificate);
    } catch {
      setResult(null);
    }
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-white p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-cyan-400 terminal-font text-center">
        PUBLIC BLOCKCHAIN SANITIZATION AUDIT
      </h2>
      <p className="text-xs text-slate-400 text-center">
        Verify any SecureWipe Pro certificate using its Certificate ID or SHA-256 Destruction Hash.
      </p>

      <form onSubmit={handleVerify} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Certificate ID (SWP-...) or SHA-256 Hash"
          className="flex-1 bg-slate-900 border border-cyan-500/40 rounded px-4 py-2 text-xs"
        />
        <button className="px-5 py-2 bg-cyan-500 text-black font-bold rounded text-xs">Verify</button>
      </form>

      {searched && (
        result ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500 rounded-lg text-xs space-y-2">
            <div className="text-emerald-400 font-bold">✓ VERIFIED AUTHENTIC ON BLOCKCHAIN</div>
            <div><strong>Target:</strong> {result.targetIdentifier}</div>
            <div><strong>Wiped By:</strong> {result.userName}</div>
            <div><strong>Algorithm:</strong> {result.wipeMethod}</div>
            <div><strong>Block Number:</strong> #{result.blockNumber}</div>
            <div className="break-all font-mono text-slate-300"><strong>Hash:</strong> {result.verificationHash}</div>
          </div>
        ) : (
          <div className="p-4 bg-rose-950/40 border border-rose-500 rounded-lg text-xs text-rose-300">
            ✕ No record found for this identifier.
          </div>
        )
      )}
    </div>
  );
}
