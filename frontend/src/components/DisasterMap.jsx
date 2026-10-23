import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Users, Phone, Filter } from 'lucide-react';

function createCustomIcon(status) {
  const isCritical = status === 'CRITICAL';
  const isWarning = status === 'WARNING';
  const bgClass = isCritical
    ? 'bg-rose-500 border-rose-300'
    : isWarning
    ? 'bg-amber-500 border-amber-300'
    : 'bg-emerald-500 border-emerald-300';

  const pulseClass = isCritical ? 'pulsing-pin-critical' : '';

  return L.divIcon({
    className: 'custom-disaster-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-7 h-7 rounded-full ${bgClass} ${pulseClass} border-2 flex items-center justify-center text-white shadow-xl cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

function MapUpdater({ shelters }) {
  const map = useMap();
  useEffect(() => {
    const valid = (shelters || []).filter(
      (s) => s.coordinates && typeof s.coordinates.lat === 'number' && typeof s.coordinates.lng === 'number'
    );
    if (valid.length === 1) {
      map.flyTo([valid[0].coordinates.lat, valid[0].coordinates.lng], 14, { duration: 1 });
    } else if (valid.length > 1) {
      const bounds = L.latLngBounds(valid.map((s) => [s.coordinates.lat, s.coordinates.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [shelters, map]);
  return null;
}

export default function DisasterMap({ shelters, activeFilter, onSelectShelter }) {
  const defaultCenter = [21.195, 81.300]; // Durg/Bhilai coordinate center

  return (
    <div className="relative isolate z-0 w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-dark-900">
      
      {/* Map Tactical Overlay Header */}
      <div className="absolute top-3 left-3 z-10 bg-dark-900/95 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg shadow-lg flex items-center space-x-2">
        <MapPin className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono font-semibold text-slate-200">
          Tactical Disaster Geospatial View
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
          {shelters?.length || 0} Shelters Visible
        </span>
        {activeFilter && activeFilter !== 'ALL' && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filtered: {activeFilter}
          </span>
        )}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 right-3 z-10 bg-dark-900/95 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg shadow-lg text-[11px] font-mono space-y-1 pointer-events-none">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="text-slate-300">Contradiction / Critical</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-300">Pending Verification</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-300">Supplies Verified Stable</span>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-tiles"
        />

        <MapUpdater shelters={shelters} />

        {shelters?.map((shelter) => {
          const lat = shelter.coordinates?.lat ?? 21.195;
          const lng = shelter.coordinates?.lng ?? 81.300;
          return (
            <Marker
              key={shelter._id || shelter.name}
              position={[lat, lng]}
              icon={createCustomIcon(shelter.status)}
              eventHandlers={{
                click: () => onSelectShelter && onSelectShelter(shelter),
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 text-slate-200 min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-sm text-cyan-400 leading-tight">
                      {shelter.name}
                    </h4>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        shelter.status === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : shelter.status === 'WARNING'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {shelter.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono">
                    {shelter.zone}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
                    <div className="flex items-center space-x-1 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{shelter.currentHeadcount} / {shelter.capacity}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[10px]">{shelter.phone}</span>
                    </div>
                  </div>

                  {shelter.activeNeedsSummary && shelter.activeNeedsSummary.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                        Critical Needs:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {shelter.activeNeedsSummary.map((need, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {need}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
