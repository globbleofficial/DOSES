import React, { useState } from 'react';

export default function AIAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your SecureWipe Cyber Compliance AI. Ask me about DoD 5220.22-M, Gutmann 35-pass wiping, NIST 800-88, or SSD flash wear leveling.' }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      let reply = 'Our platform enforces multi-pass bit inversion and unallocated sector saturation to ensure zero residual magnetic or NAND charge.';
      if (input.toLowerCase().includes('dod')) {
        reply = 'DoD 5220.22-M executes 3 passes: Pass 1 writes binary zeros (0x00), Pass 2 writes binary ones (0xFF), and Pass 3 writes cryptographically secure pseudo-random bytes, followed by a hardware sync flush.';
      } else if (input.toLowerCase().includes('gutmann')) {
        reply = 'Peter Gutmann method runs 35 passes specifically designed to counter magnetic force microscopy (MFM) by targeting drive encoding transitions like MFM, RLL (1,7), and (2,7).';
      }
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-cyan-400 rounded-xl w-full max-w-xl flex flex-col h-[460px] overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-cyan-400 terminal-font">Cyber Security AI Assistant</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg text-xs max-w-xs ${m.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about data destruction standards..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
          <button onClick={handleSend} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
