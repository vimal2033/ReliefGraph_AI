import React from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldAlert, Clock, Sparkles, CheckCircle2, Truck } from 'lucide-react';

export default function EvidenceTimelineModal({ alert, onClose, onResolve, onRedispatch }) {
  if (!alert) return null;

  const isResolved = alert.status === 'VERIFIED_RESOLVED' || alert.status === 'RE_DISPATCHED';

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-dark-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative z-[100000]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700/80 bg-slate-900/90 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${isResolved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  {alert.title}
                </h2>
                {isResolved && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase font-semibold">
                    Resolved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Shelter: {alert.shelterName} • Category: {alert.resourceCategory}
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

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* AI Explanation Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-dark-900 to-blue-950/40 border border-cyan-800/50 shadow-inner">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Gemini Causal Reasoning Summary:</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {alert.aiExplanation}
            </p>
          </div>

          {/* Evidence Chronological Timeline */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Chronological Audit Trail (Supporting Evidence)
            </h3>

            {(!alert.evidenceTimeline || alert.evidenceTimeline.length === 0) ? (
              <p className="text-xs text-slate-500 italic font-mono">
                No recorded logs found in the chronological timeline.
              </p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                {alert.evidenceTimeline.map((item, idx) => {
                  const isDispatch = item.badge?.includes('Dispatch') || item.source?.includes('DISPATCH');
                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline bullet dot */}
                      <div
                        className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 bg-dark-800 flex items-center justify-center ${
                          isDispatch ? 'border-blue-500 text-blue-400' : 'border-rose-500 text-rose-400'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${isDispatch ? 'bg-blue-400' : 'bg-rose-400'}`} />
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-mono text-cyan-400 font-bold">
                            {item.formattedTime}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                              isDispatch
                                ? 'bg-blue-950 text-blue-300 border-blue-800/60'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {item.source || item.badge}
                          </span>
                        </div>

                        <blockquote className="text-sm text-slate-200 italic border-l-2 border-slate-700 pl-2.5 my-1 font-sans">
                          "{item.quote}"
                        </blockquote>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>

          {isResolved ? (
            <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Crisis Case Resolved</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onRedispatch(alert._id);
                  onClose();
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Authorize Re-dispatch</span>
              </button>

              <button
                onClick={() => {
                  onResolve(alert._id);
                  onClose();
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark As Verified & Resolved</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
