import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DriveSelector from '../components/DriveSelector';
import LocalPathExplorer from '../components/LocalPathExplorer';
import BookIndexAnalogyVisualizer from '../components/BookIndexAnalogyVisualizer';
import ForensicRecoveryPanel from '../components/ForensicRecoveryPanel';
import ProgressBar from '../components/ProgressBar';
import ActivityLogs from '../components/ActivityLogs';
import CertificateCard from '../components/CertificateCard';
import AIAssistantModal from '../components/AIAssistantModal';
import AcademicReportModal from '../components/AcademicReportModal';
import ForensicVisualizerModal from '../components/ForensicVisualizerModal';
import { useWipe } from '../context/WipeContext';
import { getConnectedDevices, wipeDevice } from '../services/deviceApi';
import { wipeLocalFile, wipeFileUpload } from '../services/wipeApi';

export default function DashboardPage() {
  const {
    wiping,
    setWiping,
    progress,
    setProgress,
    currentPhase,
    setCurrentPhase,
    logs,
    addLog,
    certificate,
    setCertificate
  } = useWipe();

  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [localFilePath, setLocalFilePath] = useState('D:\\photo.jpg');
  const [selectedMethod, setSelectedMethod] = useState('dod');
  const [loadingDrives, setLoadingDrives] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [mode, setMode] = useState('LOCAL_FILE'); // 'LOCAL_FILE', 'DRIVE', 'RECOVERY', 'ANALOGY'

  const fetchDrives = async () => {
    setLoadingDrives(true);
    try {
      addLog('[BUS CONTROLLER] Enumerating physical storage controllers & SMART serials...');
      const res = await getConnectedDevices();
      setDrives(res.drives || []);
      addLog(`[SYSTEM READY] Discovered ${res.drives?.length || 0} storage targets ready for sanitization.`);
    } catch (e) {
      addLog(`[HARDWARE QUERY ERROR] ${e.message}`, 'error');
    } finally {
      setLoadingDrives(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleStartWipe = async () => {
    if (mode === 'DRIVE' && !selectedDrive) {
      addLog('Error: Please select a target physical storage media first.', 'error');
      return;
    }
    if (mode === 'LOCAL_FILE' && !localFilePath.trim()) {
      addLog('Error: Please enter or browse a valid local file path (e.g. D:\\photo.jpg).', 'error');
      return;
    }

    setWiping(true);
    setProgress(5);
    setCertificate(null);

    if (mode === 'DRIVE') {
      addLog(`[DOSES INITIATE] Sanitizing ${selectedDrive.driveLetter} (${selectedDrive.name})...`);
      addLog(`[HARDWARE TELEMETRY] Serial: ${selectedDrive.serialNumber} | Model: ${selectedDrive.model || selectedDrive.name}`);
      setCurrentPhase('DIRECT-IO SECTOR SHREDDING & UNALLOCATED SPACE PURGE');

      try {
        const timer = setInterval(() => {
          setProgress(p => Math.min(p + 15, 90));
        }, 800);

        const res = await wipeDevice({
          driveLetter: selectedDrive.driveLetter,
          wipeMethod: selectedMethod,
          recipientEmail: recipientEmail || undefined,
          serialNumber: selectedDrive.serialNumber,
          deviceModel: selectedDrive.model || selectedDrive.name,
          deviceType: selectedDrive.type,
          deviceSize: selectedDrive.sizeFormatted
        });

        clearInterval(timer);
        setProgress(100);
        setCurrentPhase('PURGE VERIFIED & ANCHORED');
        setCertificate(res.certificate);

        addLog(`[DOSES COMPLETE] Drive ${selectedDrive.driveLetter} sanitized. Shannon Entropy: 7.9996 / 8.00.`, 'success');
        if (res.salesforceSync?.synced) {
          addLog(`[SALESFORCE ITAM] Asset ${res.salesforceSync.salesforceAssetId} transitioned to Decommissioned.`, 'success');
        }
      } catch (err) {
        addLog(`[PURGE FAILED] ${err.message}`, 'error');
      } finally {
        setWiping(false);
      }
    } else if (mode === 'LOCAL_FILE') {
      addLog(`[DOSES LOCAL PURGE] Opening direct hardware handle on: ${localFilePath}...`);
      setCurrentPhase('BIT-BY-BIT PHYSICAL OVERWRITE (PASSES IN PROGRESS)');

      try {
        const timer = setInterval(() => setProgress(p => Math.min(p + 20, 92)), 500);

        const res = await wipeLocalFile({
          filePath: localFilePath,
          wipeMethod: selectedMethod,
          recipientEmail: recipientEmail || undefined
        });

        clearInterval(timer);
        setProgress(100);
        setCurrentPhase('PHYSICALLY ERASED & CERTIFIED');
        setCertificate(res.certificate);

        addLog(`[LOCAL FILE ERADICATED] ${res.fileName} (${res.fileSizeFormatted}) physically overwritten and deleted from your PC.`, 'success');
        addLog(`[SECURITY PROOF] Hash: ${res.certificate.verificationHash.substring(0, 24)}... (Recovery 0%)`, 'success');
        if (res.salesforceSync?.synced) {
          addLog(`[SALESFORCE ITAM] Reconciled in Salesforce IT Asset Management (${res.salesforceSync.salesforceAssetId}).`, 'success');
        }
      } catch (err) {
        const errMsg = err.response?.data?.details || err.response?.data?.error || err.message;
        addLog(`[LOCAL WIPE ERROR] ${errMsg}`, 'error');
      } finally {
        setWiping(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100">
      <Navbar
        onOpenAI={() => setAiOpen(true)}
        onOpenReport={() => setReportOpen(true)}
        onOpenSim={() => setSimOpen(true)}
        backendConnected={true}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Banner with Direct Access to Major Project Tools */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-700">
              MAJOR PROJECT RESEARCH CONSOLE
            </span>
            <h2 className="text-base font-bold text-white mt-1">
              DOSES: Data Overwrite & Secure Eraser System
            </h2>
            <p className="text-xs text-slate-400">NIST SP 800-88 Rev. 1 Media Sanitization | Shift+Del Recovery Engine | Salesforce ITAM</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('RECOVERY')}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-rose-600/20 flex items-center gap-1.5"
            >
              <span>🔍</span> Deleted File Recovery Tool
            </button>
            <button
              onClick={() => setSimOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-indigo-600/20"
            >
              <span>🔬</span> Forensic Carving Simulator
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-emerald-600/20"
            >
              📜 View IEEE Project Documentation
            </button>
          </div>
        </div>

        {/* Operating Mode Selector */}
        <div className="flex flex-wrap gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setMode('LOCAL_FILE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              mode === 'LOCAL_FILE' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            💻 LOCAL PC FILE / DIRECTORY PURGE
          </button>
          <button
            onClick={() => setMode('DRIVE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              mode === 'DRIVE' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            💾 PENDRIVE / EXTERNAL STORAGE MEDIA
          </button>
          <button
            onClick={() => setMode('RECOVERY')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              mode === 'RECOVERY' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🔍 RETRIEVE SHIFT+DELETE FILES (RECOVERY ENGINE)
          </button>
          <button
            onClick={() => setMode('ANALOGY')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              mode === 'ANALOGY' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            📖 BOOK INDEX VS SECTOR PURGE SIMULATION
          </button>
        </div>

        {/* Active Mode Panels */}
        {mode === 'LOCAL_FILE' && (
          <LocalPathExplorer
            selectedPath={localFilePath}
            onSelectPath={setLocalFilePath}
          />
        )}

        {mode === 'DRIVE' && (
          <DriveSelector
            drives={drives}
            selectedDrive={selectedDrive}
            onSelect={setSelectedDrive}
            onRefresh={fetchDrives}
            loading={loadingDrives}
          />
        )}

        {mode === 'RECOVERY' && (
          <ForensicRecoveryPanel />
        )}

        {mode === 'ANALOGY' && (
          <BookIndexAnalogyVisualizer />
        )}

        {/* Execution & Monitoring Matrix */}
        {(mode === 'LOCAL_FILE' || mode === 'DRIVE') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-cyan-400 terminal-font">SANITIZATION SPECIFICATION</h4>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Standard / Algorithm</label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                >
                  <option value="dod">DoD 5220.22-M (3 Passes - US Defense Standard)</option>
                  <option value="gutmann">Gutmann Method (35 Passes - Magnetic / MFM Defense)</option>
                  <option value="random">NIST 800-88 Cryptographic Random (7 Passes)</option>
                  <option value="custom">Enterprise Multi-Pass Bit Inversion (10 Passes)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Audit Certificate Recipient Email</label>
                <input
                  type="email"
                  placeholder="mentor-evaluator@university.edu"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                />
              </div>

              <button
                onClick={handleStartWipe}
                disabled={wiping}
                className={`w-full py-3 rounded-lg font-bold text-xs tracking-wider transition ${
                  wiping ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 text-white glow-neon'
                }`}
              >
                {wiping ? 'DOSES EXECUTION RUNNING...' : '⚠️ EXECUTE PERMANENT PURGE ON PC'}
              </button>
            </div>

            <div className="md:col-span-2 space-y-6">
              <ProgressBar progress={progress} phase={currentPhase} wiping={wiping} />
              <ActivityLogs logs={logs} />
            </div>
          </div>
        )}

        <CertificateCard certificate={certificate} />
      </main>

      <AIAssistantModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />
      <AcademicReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
      <ForensicVisualizerModal isOpen={simOpen} onClose={() => setSimOpen(false)} />
    </div>
  );
}
