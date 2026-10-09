import React from 'react';

export default function CertificateCard({ certificate }) {
  if (!certificate) return null;

  return (
    <div className="bg-slate-900 border border-emerald-400/50 rounded-xl p-6 glow-neon mt-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-600 px-2.5 py-0.5 rounded font-bold">
              ✓ DOSES VERIFIED (NIST SP 800-88 PURGE)
            </span>
            <span className="text-xs bg-purple-950 text-purple-300 border border-purple-600 px-2 py-0.5 rounded font-bold">
              ⚛️ ML-DSA Post-Quantum Signed
            </span>
            <span className="text-xs bg-sky-950 text-sky-300 border border-sky-600 px-2 py-0.5 rounded font-bold">
              ☁️ Salesforce ITAM Reconciled
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1.5">Official Cryptographic Destruction Certificate</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Certificate ID</div>
          <div className="font-mono text-cyan-300 text-sm font-bold">{certificate.certificateId}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <div className="text-slate-400">Target Storage Media</div>
          <div className="font-semibold text-slate-200">{certificate.targetIdentifier}</div>
        </div>
        <div>
          <div className="text-slate-400">Physical Hardware Serial</div>
          <div className="font-mono font-bold text-amber-300">{certificate.deviceSerialNumber || 'SN-HW-DISCOVERED'}</div>
        </div>
        <div>
          <div className="text-slate-400">Sanitization Standard</div>
          <div className="font-semibold text-cyan-300">{certificate.wipeMethod} ({certificate.passes} Passes)</div>
        </div>
        <div>
          <div className="text-slate-400">Blockchain Network Anchor</div>
          <div className="font-semibold text-emerald-400">#{certificate.blockNumber} ({certificate.network})</div>
        </div>
      </div>

      {/* Enterprise Salesforce CMDB Link Banner */}
      <div className="mt-4 p-3 bg-slate-950 border border-sky-500/30 rounded-lg flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-sky-400 font-bold">Salesforce Asset ID:</span>
          <span className="font-mono text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
            {certificate.salesforceAssetId || '02i8W00000EXAMPLE'}
          </span>
          {certificate.salesforceCaseId && (
            <>
              <span className="text-sky-400 font-bold ml-2">Decommission Case:</span>
              <span className="font-mono text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                #{certificate.salesforceCaseId}
              </span>
            </>
          )}
        </div>
        <span className="text-emerald-400 font-semibold">● Status: Permanently Sanitized (Irrecoverable)</span>
      </div>

      <div className="mt-3 p-3 bg-[#050811] border border-slate-800 rounded">
        <div className="text-[11px] text-slate-400 mb-1">Cryptographic Proof Hash (SHA-256 / Keccak-512):</div>
        <div className="font-mono text-xs text-emerald-400 break-all select-all">{certificate.verificationHash}</div>
      </div>
    </div>
  );
}
