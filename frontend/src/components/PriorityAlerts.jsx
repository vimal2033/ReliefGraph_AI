import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, Truck, Check, HelpCircle, Search, Filter, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PriorityAlerts({
  alerts,
  activeFilter,
  onSelectFilter,
  onSelectAlert,
  onResolveAlert,
  onRedispatchAlert,
  resolvingId,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter alerts according to activeFilter & search query
  const filteredAlerts = alerts.filter((alert) => {
    // 1. Filter by Status/Category
    if (activeFilter === 'UNRESOLVED') {
      if (alert.status !== 'ACTIVE_UNRESOLVED') return false;
    } else if (activeFilter === 'UNVERIFIED') {
      if (alert.conflictType !== 'DELIVERY_CONTRADICTION' && alert.status !== 'ACTIVE_UNRESOLVED') return false;
    } else if (activeFilter === 'RESOLVED') {
      if (alert.status !== 'VERIFIED_RESOLVED' && alert.status !== 'RE_DISPATCHED') return false;
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = alert.shelterName?.toLowerCase().includes(q);
      const matchTitle = alert.title?.toLowerCase().includes(q);
      const matchCategory = alert.resourceCategory?.toLowerCase().includes(q);
      return matchName || matchTitle || matchCategory;
    }

    return true;
  });

  return (
    <div className="bg-dark-800 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700/60 mb-3 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Priority Contradiction Alerts
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono">
                {filteredAlerts.length}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Unresolved gaps & contradictory delivery logs flagged by Gemini
            </p>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center space-x-1 text-[10px] font-mono">
          <button
            onClick={() => onSelectFilter('UNRESOLVED')}
            className={`px-2 py-1 rounded transition-colors ${
              activeFilter === 'UNRESOLVED'
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Unresolved
          </button>
          <button
            onClick={() => onSelectFilter('UNVERIFIED')}
            className={`px-2 py-1 rounded transition-colors ${
              activeFilter === 'UNVERIFIED'
                ? 'bg-blue-500 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Unverified
          </button>
          <button
            onClick={() => onSelectFilter('RESOLVED')}
            className={`px-2 py-1 rounded transition-colors ${
              activeFilter === 'RESOLVED'
                ? 'bg-emerald-500 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => onSelectFilter('ALL')}
            className={`px-2 py-1 rounded transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by shelter, resource (e.g. Riverside, Water)..."
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Alerts Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-mono space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
            <p>No alerts matching current filter: "{activeFilter}".</p>
            <button
              onClick={() => {
                onSelectFilter('ALL');
                setSearchQuery('');
              }}
              className="text-cyan-400 underline hover:text-cyan-300 text-xs"
            >
              Reset to view all records
            </button>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isResolved = alert.status === 'VERIFIED_RESOLVED' || alert.status === 'RE_DISPATCHED';

            return (
              <div
                key={alert._id}
                className={`bg-slate-900/90 border ${
                  isResolved
                    ? 'border-emerald-800/40 hover:border-emerald-500/50'
                    : 'border-rose-900/40 hover:border-rose-500/50'
                } rounded-xl p-3.5 transition-all shadow-md group`}
              >
                {/* Alert Title & Badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className={`text-sm font-semibold ${isResolved ? 'text-emerald-300' : 'text-slate-100'} group-hover:text-cyan-400 transition-colors`}>
                      {alert.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {alert.shelterName}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        isResolved
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                      } font-semibold uppercase tracking-wider`}>
                        {alert.conflictType?.replaceAll('_', ' ') || 'DEFICIT'}
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                    isResolved ? 'bg-emerald-700 text-white' : 'bg-rose-600 text-white'
                  } tracking-wide shrink-0`}>
                    {isResolved ? 'RESOLVED' : 'CRITICAL'}
                  </span>
                </div>

                {/* Gemini AI Explanation Snippet */}
                <div className="my-2.5 p-2.5 rounded-lg bg-dark-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <div className="flex items-center space-x-1.5 text-cyan-400 text-[11px] font-mono font-semibold mb-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Gemini Reasoning Audit:</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {alert.aiExplanation}
                  </p>
                </div>

                {/* Timeline Teaser */}
                {alert.evidenceTimeline && alert.evidenceTimeline.length > 0 && (
                  <div className="space-y-1 mb-3 bg-slate-950/50 p-2 rounded border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Timeline Sequence:
                    </span>
                    {alert.evidenceTimeline.slice(-3).map((item, idx) => (
                      <div key={idx} className="flex items-start text-[11px] text-slate-400 space-x-1.5 font-mono">
                        <span className="text-cyan-400 shrink-0">[{item.formattedTime}]</span>
                        <span className="text-slate-200 line-clamp-1 italic">"{item.quote}"</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <button
                    onClick={() => onSelectAlert(alert)}
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-medium hover:underline text-[11px]"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>View Evidence Timeline</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  {!isResolved && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onRedispatchAlert(alert._id)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-all shadow-sm active:scale-95"
                        title="Send priority replacement dispatch"
                      >
                        <Truck className="w-3 h-3" />
                        <span>Re-dispatch</span>
                      </button>

                      <button
                        onClick={() => onResolveAlert(alert._id)}
                        disabled={resolvingId === alert._id}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-all shadow-sm active:scale-95"
                        title="Mark conflict as verified and resolved"
                      >
                        <Check className="w-3 h-3" />
                        <span>Resolve</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
