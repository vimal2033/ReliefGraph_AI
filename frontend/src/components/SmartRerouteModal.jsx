import React from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Truck, Clock, ShieldAlert, CheckCircle2, ArrowRight, Zap, AlertTriangle } from 'lucide-react';

export default function SmartRerouteModal({
  plan,
  onClose,
  onExecuteReroute,
  onStandardRedispatch,
  isSubmitting,
}) {
  if (!plan) return null;

  const defaultOpt = plan.defaultOption;
  const aiOpt = plan.recommendedOption;

  return createPortal(
    <div className="fixed inset-0 z-[99999] isolate flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-dark-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative z-[100000]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700/80 bg-slate-900/90 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100">
                  Gemini Smart Logistics Re-routing Advisor
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase font-semibold">
                  AI Decision Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Surplus → Deficit Dynamic Optimization for {plan.destinationShelter}
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Target Crisis Info Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="text-slate-300">
                Destination: <strong className="text-white">{plan.destinationShelter}</strong>
              </span>
            </div>
            <span className="font-mono text-cyan-400 font-semibold">
              Emergency Deficit: {plan.quantityNeeded} {plan.unit} of {plan.resourceCategory}
            </span>
          </div>

          {/* AI Reasoning Summary Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-dark-900 to-blue-950/40 border border-cyan-800/50">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold mb-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Causal Optimization Strategy:</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {plan.aiJustification}
            </p>
          </div>

          {/* Logistics Option Comparison */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Comparative Transit Scenarios:
            </h3>

            {/* Option A: Default Central Depot (Sub-optimal) */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  Option A: Standard Warehouse Dispatch (Default)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {defaultOpt.distance} • {defaultOpt.formattedEta}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-1">
                Source: <span className="text-slate-200">{defaultOpt.sourceName}</span> via {defaultOpt.vehicle}
              </p>
              <div className="flex items-center space-x-1.5 text-amber-400 text-[11px] font-mono">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{defaultOpt.routeStatus}</span>
              </div>
            </div>

            {/* Option B: AI Recommended Surplus Re-route (Optimal) */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border-2 border-emerald-500/60 text-xs text-slate-200 relative shadow-lg shadow-emerald-950/30">
              {/* Star Badge */}
              <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-black" />
                Gemini Recommended (Save 138 Mins)
              </div>

              <div className="flex items-center justify-between mb-2 pt-1">
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Option B: Dynamic Surplus Re-route
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/80">
                  {aiOpt.distance} • {aiOpt.formattedEta} ETA
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 my-2 py-2 border-y border-slate-800 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block">Surplus Hub:</span>
                  <strong className="text-slate-100">{aiOpt.sourceName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Escort Vehicle:</span>
                  <strong className="text-slate-100">{aiOpt.vehicle}</strong>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-emerald-300 text-[11px] font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{aiOpt.routeStatus}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onStandardRedispatch(plan.alertId)}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700"
            >
              Standard Depot Dispatch
            </button>

            <button
              onClick={() => onExecuteReroute(plan)}
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isSubmitting ? 'Authorizing Re-route...' : 'Approve & Execute AI Re-route'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
