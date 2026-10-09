import React, { useState, useEffect } from 'react';
import { checkAdminStatus, browseDirectory } from '../services/wipeApi';

export default function LocalPathExplorer({ selectedPath, onSelectPath }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [manualInput, setManualInput] = useState(selectedPath || '');
  const [showBrowser, setShowBrowser] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAdminStatus()
      .then(res => {
        setIsAdmin(res.isAdmin);
        setAdminMessage(res.message);
      })
      .catch(() => {});
  }, []);

  const handleManualApply = () => {
    if (manualInput.trim()) {
      onSelectPath(manualInput.trim());
    }
  };

  const loadDirectory = async (dirPath) => {
    setLoading(true);
    setError('');
    try {
      const res = await browseDirectory(dirPath);
      setCurrentPath(res.currentPath);
      setParentPath(res.parentPath);
      setItems(res.items || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBrowser = () => {
    setShowBrowser(true);
    if (!currentPath) {
      loadDirectory('');
    }
  };

  return (
    <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-cyan-400 terminal-font flex items-center gap-2">
            <span>💻</span> SELECT LOCAL PC FILE FOR PERMANENT DESTRUCTION
          </h3>
          <p className="text-xs text-slate-400">
            Enter the exact file path on your computer (e.g. <code>D:\photo.jpg</code>) or browse local directories.
          </p>
        </div>

        {/* Admin Privilege Status Badge */}
        <div className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 border ${
          isAdmin 
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600' 
            : 'bg-amber-950/60 text-amber-300 border-amber-600'
        }`}>
          <span>{isAdmin ? '🛡️ Administrator Access: ACTIVE' : '⚠️ Standard Privileges'}</span>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs text-amber-200/90 flex items-start gap-2">
          <span>💡</span>
          <div>
            <strong>Need to delete system-protected files?</strong> If Windows blocks access to certain directories, run the backend using <code>run-admin.bat</code> (Right click -> Run as Administrator) for elevated physical disk write access.
          </div>
        </div>
      )}

      {/* Direct Path Input Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => {
            setManualInput(e.target.value);
            onSelectPath(e.target.value);
          }}
          placeholder="Enter full path e.g. D:\photo.jpg or C:\Users\Username\Documents\secret.pdf"
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
        />
        <button
          type="button"
          onClick={handleOpenBrowser}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
        >
          <span>📂</span> {showBrowser ? 'Hide Browser' : 'Browse PC'}
        </button>
      </div>

      {selectedPath && (
        <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-xs font-mono text-cyan-300 flex items-center justify-between">
          <span>Target Selected: <strong className="text-white">{selectedPath}</strong></span>
          <span className="text-emerald-400 font-bold">✓ Ready for Sanitization</span>
        </div>
      )}

      {/* Visual PC Directory Explorer */}
      {showBrowser && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-mono">Location: <strong className="text-cyan-300">{currentPath || 'Drive Selection (Root)'}</strong></span>
            {parentPath && (
              <button
                type="button"
                onClick={() => loadDirectory(parentPath)}
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>⬆️</span> Up to Parent Folder
              </button>
            )}
          </div>

          {error && <div className="text-xs text-rose-400 font-mono">{error}</div>}

          {loading ? (
            <div className="text-xs text-slate-500 py-6 text-center font-mono">Reading directory contents...</div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-1 font-mono text-xs pr-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.isDirectory) {
                      loadDirectory(item.path);
                    } else {
                      setManualInput(item.path);
                      onSelectPath(item.path);
                    }
                  }}
                  className={`p-2 rounded cursor-pointer flex items-center justify-between transition ${
                    item.isDirectory 
                      ? 'text-cyan-300 hover:bg-slate-900' 
                      : selectedPath === item.path
                      ? 'bg-cyan-950 text-white border border-cyan-500'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{item.isDrive ? '💽' : item.isDirectory ? '📁' : '📄'}</span>
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {item.isDirectory ? 'Folder' : 'Click to Select'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
