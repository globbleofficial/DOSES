import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('operator@doses.io');
  const [password, setPassword] = useState('password123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen cyber-grid flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-cyan-500/40 rounded-2xl p-8 glow-cyan">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-3xl mx-auto mb-3">
            ⚡
          </div>
          <h2 className="text-2xl font-black text-cyan-400 terminal-font tracking-wider">DOSES</h2>
          <p className="text-xs text-slate-400 mt-1">Data Overwrite & Sanitization Enterprise System</p>
          <div className="mt-3 inline-block text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2.5 py-0.5 rounded font-mono">
            MAJOR PROJECT CONSOLE // ACCREDITED
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Operator / Evaluator Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition text-sm terminal-font tracking-wide mt-2"
          >
            ACCESS DOSES PLATFORM
          </button>
        </form>
      </div>
    </div>
  );
}
