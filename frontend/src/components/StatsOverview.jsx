import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, MessageSquareText, Filter, X } from 'lucide-react';

export default function StatsOverview({ stats, activeFilter, onSelectFilter }) {
  const cards = [
    {
      filterKey: 'UNRESOLVED',
      title: 'Unresolved Needs',
      value: stats?.unresolvedNeeds ?? 4,
      subtitle: 'Require immediate attention',
      icon: AlertTriangle,
      color: 'from-rose-500/20 to-rose-950/30',
      activeBorder: 'border-rose-400 ring-2 ring-rose-500/80 shadow-rose-500/20',
      defaultBorder: 'border-rose-500/40 hover:border-rose-400',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      textColor: 'text-rose-400',
    },
    {
      filterKey: 'UNVERIFIED',
      title: 'Unverified Deliveries',
      value: stats?.unverifiedDeliveries ?? 3,
      subtitle: 'Awaiting ground confirmation',
      icon: Clock,
      color: 'from-blue-500/20 to-blue-950/30',
      activeBorder: 'border-blue-400 ring-2 ring-blue-500/80 shadow-blue-500/20',
      defaultBorder: 'border-blue-500/40 hover:border-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      filterKey: 'RESOLVED',
      title: 'Resolved / Verified',
      value: stats?.resolvedCount ?? 12,
      subtitle: 'Needs addressed & confirmed',
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-emerald-950/30',
      activeBorder: 'border-emerald-400 ring-2 ring-emerald-500/80 shadow-emerald-500/20',
      defaultBorder: 'border-emerald-500/40 hover:border-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      textColor: 'text-emerald-400',
    },
    {
      filterKey: 'ALL',
      title: 'Disaster Telemetry',
      value: stats?.totalReports ?? 18,
      subtitle: 'Cross-analyzed by Gemini AI',
      icon: MessageSquareText,
      color: 'from-cyan-500/20 to-cyan-950/30',
      activeBorder: 'border-cyan-400 ring-2 ring-cyan-500/80 shadow-cyan-500/20',
      defaultBorder: 'border-cyan-500/40 hover:border-cyan-400',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      textColor: 'text-cyan-400',
    },
  ];

  return (
    <div className="mb-6 space-y-2">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = activeFilter === card.filterKey;

          return (
            <button
              key={card.filterKey}
              onClick={() => onSelectFilter(card.filterKey)}
              className={`text-left relative overflow-hidden rounded-xl bg-gradient-to-br ${card.color} border ${
                isActive ? card.activeBorder : card.defaultBorder
              } p-4 backdrop-blur-sm shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:scale-98 cursor-pointer group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 tracking-wide uppercase group-hover:text-white transition-colors">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg border ${card.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline space-x-2">
                <span className={`text-3xl font-extrabold tracking-tight font-mono ${card.textColor}`}>
                  {card.value}
                </span>
                {isActive && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold uppercase tracking-wider animate-pulse">
                    Filter Active
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{card.subtitle}</span>
                <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isActive ? 'Click to reset' : 'Click to filter →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Filter Pill Bar */}
      {activeFilter && activeFilter !== 'ALL' && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-dark-800/90 border border-slate-700/80 text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Currently filtering view by:</span>
            <span className="font-bold text-cyan-400 uppercase tracking-wide">
              {activeFilter.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={() => onSelectFilter('ALL')}
            className="flex items-center space-x-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-[11px] transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}
    </div>
  );
}
