import React from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Phone, Droplets, Utensils, HeartPulse, Baby, PlusCircle } from 'lucide-react';

export default function ShelterDetailDrawer({ shelter, onClose, onOpenReportForShelter }) {
  if (!shelter) return null;

  const isCritical = shelter.status === 'CRITICAL';
  const isWarning = shelter.status === 'WARNING';

  // Stock health defaults if not present
  const stock = shelter.stockHealth || {
    water: isCritical ? 15 : 75,
    food: isWarning ? 35 : 70,
    medical: isCritical ? 20 : 80,
    babyCare: isCritical ? 10 : 65,
  };

  const capacity = shelter.capacity || 250;
  const currentHeadcount = shelter.currentHeadcount || 0;
  const occupancyPercent = Math.min(100, Math.max(0, Math.round((currentHeadcount / capacity) * 100)));

  const getMeterColor = (val) => {
    if (val < 25) return { bg: 'bg-rose-500', text: 'text-rose-400', label: 'CRITICAL DEFICIT' };
    if (val < 60) return { bg: 'bg-amber-500', text: 'text-amber-400', label: 'LOW STOCK' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'STABLE BUFFER' };
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] isolate flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Background click to dismiss */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full sm:w-[420px] h-full bg-dark-900 border-l border-slate-700/80 shadow-2xl flex flex-col relative z-[100000] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                  isCritical
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : isWarning
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {shelter.status || 'ACTIVE'} SECTOR
              </span>
              <span className="text-xs font-mono text-slate-400">
                {shelter.zone}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-100 mt-1 leading-snug">
              {shelter.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 font-sans">
          
          {/* Occupancy Card */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                Live Occupancy / Capacity
              </span>
              <span className="text-cyan-400 font-bold">
                {currentHeadcount} / {capacity} ({occupancyPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  occupancyPercent > 85 ? 'bg-rose-500' : occupancyPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {Math.max(0, capacity - currentHeadcount)} bed slots available before overflow.
            </p>
          </div>

          {/* Real-time Resource Stock Meters */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>On-Ground Stock Health:</span>
              <span className="text-[10px] text-cyan-400">Live Telemetry</span>
            </h3>

            <div className="space-y-3">
              {/* Drinking Water */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    <span>Drinking Water Reserves</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${getMeterColor(stock.water).text}`}>
                    {stock.water}% • {getMeterColor(stock.water).label}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${getMeterColor(stock.water).bg} rounded-full transition-all`}
                    style={{ width: `${stock.water}%` }}
                  />
                </div>
              </div>

              {/* Cooked Food / Rations */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Utensils className="w-4 h-4 text-amber-400" />
                    <span>Food Packets & Rations</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${getMeterColor(stock.food).text}`}>
                    {stock.food}% • {getMeterColor(stock.food).label}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${getMeterColor(stock.food).bg} rounded-full transition-all`}
                    style={{ width: `${stock.food}%` }}
                  />
                </div>
              </div>

              {/* Emergency Medical */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <HeartPulse className="w-4 h-4 text-rose-400" />
                    <span>Medical Kits / Medications</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${getMeterColor(stock.medical).text}`}>
                    {stock.medical}% • {getMeterColor(stock.medical).label}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${getMeterColor(stock.medical).bg} rounded-full transition-all`}
                    style={{ width: `${stock.medical}%` }}
                  />
                </div>
              </div>

              {/* Infant & Baby Care */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Baby className="w-4 h-4 text-purple-400" />
                    <span>Infant Milk & Baby Supplies</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${getMeterColor(stock.babyCare).text}`}>
                    {stock.babyCare}% • {getMeterColor(stock.babyCare).label}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${getMeterColor(stock.babyCare).bg} rounded-full transition-all`}
                    style={{ width: `${stock.babyCare}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Needs Summary */}
          {shelter.activeNeedsSummary && shelter.activeNeedsSummary.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Active Critical Requirements:
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {shelter.activeNeedsSummary.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono px-2.5 py-1 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800/80"
                  >
                    ⚠ {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* On-Site Contact Person */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              On-Ground Station Contact:
            </span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">{shelter.contactPerson || 'Station Manager'}</span>
              <a
                href={`tel:${shelter.phone || '+91-98765-43210'}`}
                className="flex items-center space-x-1 font-mono text-cyan-400 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{shelter.phone || '+91-98765-43210'}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>

          <button
            onClick={() => {
              onOpenReportForShelter(shelter);
              onClose();
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit Report for this Shelter</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
