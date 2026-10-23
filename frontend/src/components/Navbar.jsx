import React from 'react';
import { Activity, Radio, PlusCircle, Play, ShieldAlert, Cpu } from 'lucide-react';

export default function Navbar({ onOpenIngest, onRunSimulation, isSimulating }) {
  return (
    <header className="border-b border-slate-800 bg-dark-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Team Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                ReliefGraph AI
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 uppercase tracking-widest">
                Gemini 2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Team Cipher • BIT Durg • Ruverse Techfest
            </p>
          </div>
        </div>

        {/* Status Pills & Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Real-time reasoning badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Reasoning:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Active
            </span>
          </div>

          {/* 1-Click Simulation Button */}
          <button
            onClick={onRunSimulation}
            disabled={isSimulating}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all border ${
              isSimulating
                ? 'bg-amber-950/60 text-amber-300 border-amber-700/60 cursor-wait'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-transparent shadow-lg shadow-orange-600/20'
            }`}
            title="Load 35+ realistic flood disaster reports and trigger conflict reasoning"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating Flood...' : 'Run Simulation'}</span>
          </button>

          {/* Submit New Report Modal Trigger */}
          <button
            onClick={onOpenIngest}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Report</span>
          </button>
        </div>

      </div>
    </header>
  );
}
