import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Sparkles, MessageSquare } from 'lucide-react';

const PRESET_PROMPTS = [
  {
    label: '🚨 Riverside Water Crisis Follow-up',
    text: 'Still no water at Riverside Primary School shelter. 150 people are fainting from heat and dehydration!',
    source: 'SHELTER_MANAGER',
    sender: 'Rajesh Sharma',
  },
  {
    label: '🚚 Water Dispatch Log',
    text: 'Dispatched 30 drinking water cans to Riverside Primary School via Van 09.',
    source: 'DISPATCHER',
    sender: 'Central Logistics Base',
  },
  {
    label: '💊 Central Hospital Insulin Shortage',
    text: 'Need 50 vials of insulin at Central Hospital Shelter. Diabetic flood refugees are entering shock.',
    source: 'SHELTER_MANAGER',
    sender: 'Dr. Anita Verma',
  },
  {
    label: '🍼 St. Jude Infant Milk Need',
    text: 'Need 40 packets of infant milk formula and baby diapers at St. Jude Community Hall.',
    source: 'VOLUNTEER',
    sender: 'Sister Mary',
  },
];

export default function IngestionModal({ onClose, onSubmit, isSubmitting }) {
  const [text, setText] = useState('');
  const [source, setSource] = useState('VOLUNTEER');
  const [senderName, setSenderName] = useState('Field Volunteer');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ rawText: text.trim(), source, senderName: senderName.trim() });
  };

  const handleApplyPreset = (preset) => {
    setText(preset.text);
    setSource(preset.source);
    setSenderName(preset.sender);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-dark-800 border border-slate-700 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden relative z-[100000]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Ingest Natural Language Field Report
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Gemini will extract entities and cross-evaluate against supply records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Preset Quick Demos */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Quick-Test Presets (Click to load):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="text-left p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-600/60 text-xs text-slate-300 transition-all group"
                >
                  <span className="font-semibold block text-slate-200 group-hover:text-cyan-400 mb-1">
                    {p.label}
                  </span>
                  <span className="text-[11px] text-slate-400 line-clamp-1 italic">
                    "{p.text}"
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Report Source and Sender */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-mono text-slate-400 mb-1 block">Report Source:</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="VOLUNTEER">Field Volunteer</option>
                <option value="SHELTER_MANAGER">Shelter Manager</option>
                <option value="DISPATCHER">Supply Dispatcher (HQ)</option>
                <option value="OFFICIAL_LOG">Official NDRF / Govt Log</option>
                <option value="COMMUNITY">Affected Community</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 mb-1 block">Sender / Author:</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Pooja Verma / Van 04"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Natural Language Text Box */}
          <div>
            <label className="text-xs font-mono text-slate-400 mb-1 block">
              Natural Language Message (English / Hindi / Hinglish):
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. 50 cooked food packets needed at Riverside School shelter, water levels rising fast..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed resize-none shadow-inner"
              required
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Analyzing with Gemini...' : 'Analyze & Ingest'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
