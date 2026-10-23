import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import PriorityAlerts from './components/PriorityAlerts';
import DisasterMap from './components/DisasterMap';
import ReliefKnowledgeGraph from './components/ReliefKnowledgeGraph';
import EvidenceTimelineModal from './components/EvidenceTimelineModal';
import IngestionModal from './components/IngestionModal';
import SmartRerouteModal from './components/SmartRerouteModal';
import ShelterDetailDrawer from './components/ShelterDetailDrawer';
import { api } from './services/api';
import { MapPin, Share2, Radio } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [reports, setReports] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  
  // Interactive Filtering state
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'UNRESOLVED' | 'UNVERIFIED' | 'RESOLVED'
  const [selectedShelterName, setSelectedShelterName] = useState(null);

  const [activeTab, setActiveTab] = useState('MAP'); // 'MAP' or 'GRAPH'
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  // Smart Re-routing & Shelter Tactical Drawer
  const [reroutePlan, setReroutePlan] = useState(null);
  const [isSubmittingReroute, setIsSubmittingReroute] = useState(false);
  const [selectedShelterForDrawer, setSelectedShelterForDrawer] = useState(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      const [sData, aData, shData, gData, rData] = await Promise.all([
        api.getStats(),
        api.getAlerts(),
        api.getShelters(),
        api.getGraph(),
        api.getReports(25),
      ]);
      setStats(sData);
      setAlerts(Array.isArray(aData) ? aData : []);
      setShelters(Array.isArray(shData) ? shData : []);
      setGraphData(gData || { nodes: [], edges: [] });
      setReports(Array.isArray(rData) ? rData : []);
    } catch (err) {
      console.warn('Dashboard data fetch warning:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter handler
  const handleSelectFilter = (filterKey) => {
    setActiveFilter((prev) => (prev === filterKey && filterKey !== 'ALL' ? 'ALL' : filterKey));
    setSelectedShelterName(null);
  };

  // Filtered Shelters for the Geospatial Map
  const filteredShelters = useMemo(() => {
    let result = shelters;
    if (activeFilter === 'UNRESOLVED') {
      result = shelters.filter((s) => s.status === 'CRITICAL');
    } else if (activeFilter === 'UNVERIFIED') {
      result = shelters.filter((s) => s.status === 'WARNING');
    } else if (activeFilter === 'RESOLVED') {
      result = shelters.filter((s) => s.status === 'STABLE');
    }

    if (selectedShelterName) {
      result = result.filter((s) => s.name === selectedShelterName);
    }

    return result.length > 0 ? result : shelters;
  }, [shelters, activeFilter, selectedShelterName]);

  // Keep open drawer synced with live shelter telemetry
  const activeDrawerShelter = useMemo(() => {
    if (!selectedShelterForDrawer) return null;
    return shelters.find((s) => String(s._id) === String(selectedShelterForDrawer._id)) || selectedShelterForDrawer;
  }, [shelters, selectedShelterForDrawer]);

  // Filtered Telemetry Feed
  const filteredReports = useMemo(() => {
    const list = Array.isArray(reports) ? reports : [];
    if (activeFilter === 'UNRESOLVED') {
      return list.filter((r) => r.extracted?.urgency === 'CRITICAL' || r.extracted?.urgency === 'HIGH');
    }
    if (activeFilter === 'UNVERIFIED') {
      return list.filter((r) => r.extracted?.isDispatch || r.source === 'DISPATCHER');
    }
    if (activeFilter === 'RESOLVED') {
      return list.filter((r) => r.status === 'VERIFIED');
    }
    return list;
  }, [reports, activeFilter]);

  // Filtered Graph Data
  const filteredGraphData = useMemo(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) return graphData;
    if (activeFilter === 'ALL') return graphData;

    if (activeFilter === 'UNRESOLVED') {
      const criticalShelterIds = shelters
        .filter((s) => s.status === 'CRITICAL')
        .map((s) => `shelter_${s._id}`);
      
      const filteredNodes = graphData.nodes.filter(
        (n) => criticalShelterIds.includes(n.id) || n.group === 'need'
      );
      return { nodes: filteredNodes, edges: graphData.edges };
    }

    if (activeFilter === 'UNVERIFIED') {
      const filteredNodes = graphData.nodes.filter(
        (n) => n.group === 'dispatch' || n.group === 'shelter'
      );
      return { nodes: filteredNodes, edges: graphData.edges };
    }

    return graphData;
  }, [graphData, shelters, activeFilter]);

  // Actions
  const handleResolveAlert = async (alertId) => {
    setResolvingId(alertId);
    try {
      await api.resolveAlert(alertId);
      await loadDashboardData();
    } catch (err) {
      console.error('Resolve alert error:', err);
    } finally {
      setResolvingId(null);
    }
  };

  // Triggers Gemini Smart Re-routing Advisor Modal
  const handleOpenRerouteAdvisor = async (alertId) => {
    try {
      const plan = await api.getReroutePlan(alertId);
      setReroutePlan(plan);
    } catch (err) {
      console.error('Error fetching reroute plan:', err);
    }
  };

  const handleExecuteReroute = async (plan) => {
    setIsSubmittingReroute(true);
    try {
      await api.executeReroute(plan.alertId, {
        sourceName: plan.recommendedOption.sourceName,
        vehicle: plan.recommendedOption.vehicle,
        notes: plan.aiJustification,
        quantity: plan.quantityNeeded,
      });
      setReroutePlan(null);
      await loadDashboardData();
    } catch (err) {
      console.error('Execute reroute error:', err);
    } finally {
      setIsSubmittingReroute(false);
    }
  };

  const handleStandardRedispatch = async (alertId) => {
    setIsSubmittingReroute(true);
    try {
      await api.redispatchAlert(alertId);
      setReroutePlan(null);
      await loadDashboardData();
    } catch (err) {
      console.error('Redispatch alert error:', err);
    } finally {
      setIsSubmittingReroute(false);
    }
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      await api.runSimulation();
      await loadDashboardData();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSubmitReport = async (payload) => {
    setIsSubmitting(true);
    try {
      await api.submitReport(payload);
      setIsIngestOpen(false);
      await loadDashboardData();
    } catch (err) {
      console.error('Report submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenIngest={() => setIsIngestOpen(true)}
        onRunSimulation={handleRunSimulation}
        isSimulating={isSimulating}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col">
        
        {/* Top 4 KPI Metric Cards with Interactive Filter Selection */}
        <StatsOverview
          stats={stats}
          activeFilter={activeFilter}
          onSelectFilter={handleSelectFilter}
        />

        {/* Selected Shelter Filter Notification */}
        {selectedShelterName && (
          <div className="mb-3 flex items-center justify-between p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800 text-xs font-mono">
            <span className="text-cyan-300">
              Focused on Shelter: <strong>{selectedShelterName}</strong>
            </span>
            <button
              onClick={() => setSelectedShelterName(null)}
              className="text-slate-400 hover:text-white underline text-[11px]"
            >
              Show all shelters
            </button>
          </div>
        )}

        {/* Main 2-Column Tactical Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[550px]">
          
          {/* Left Column: Priority Alerts & Recent Feed (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="flex-1 min-h-[420px]">
              <PriorityAlerts
                alerts={alerts}
                activeFilter={activeFilter}
                onSelectFilter={handleSelectFilter}
                onSelectAlert={(a) => setSelectedAlert(a)}
                onResolveAlert={handleResolveAlert}
                onRedispatchAlert={handleOpenRerouteAdvisor}
                resolvingId={resolvingId}
              />
            </div>

            {/* Live Message Ticker / Feed */}
            <div className="bg-dark-800 border border-slate-800 rounded-xl p-3 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 pb-1.5 border-b border-slate-700/60">
                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-wider">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Live Field Telemetry Feed
                </span>
                <span className="text-[10px]">
                  {filteredReports.length} {activeFilter !== 'ALL' ? `(${activeFilter})` : 'recent'}
                </span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {filteredReports.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-2 text-center">
                    No field reports matching current filter.
                  </p>
                ) : (
                  filteredReports.map((r, idx) => (
                    <div key={r._id || `report_${idx}`} className="text-[11px] p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between mb-0.5 text-[10px] text-slate-400 font-mono">
                        <span className="text-cyan-400 font-semibold">{r.senderName}</span>
                        <span>{r.formattedTime}</span>
                      </div>
                      <p className="text-slate-300 italic line-clamp-1">"{r.rawText}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Visualizer View (Map or Knowledge Graph) (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-dark-800 border border-slate-800 rounded-xl p-4 shadow-xl">
            
            {/* Tab Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('MAP')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    activeTab === 'MAP'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Geospatial Map</span>
                </button>

                <button
                  onClick={() => setActiveTab('GRAPH')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    activeTab === 'GRAPH'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Knowledge Graph</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                {activeTab === 'MAP'
                  ? `${filteredShelters.length} Shelters displayed • Click pin for tactical drawer`
                  : 'Relational Graph Nodes & Edges'}
              </span>
            </div>

            {/* View Render */}
            <div className="flex-1 w-full min-h-[460px]">
              {activeTab === 'MAP' ? (
                <DisasterMap
                  shelters={filteredShelters}
                  activeFilter={activeFilter}
                  onSelectShelter={(shelter) => {
                    setSelectedShelterName(shelter.name);
                    setSelectedShelterForDrawer(shelter);
                  }}
                />
              ) : (
                <ReliefKnowledgeGraph
                  graphData={filteredGraphData}
                  onRefresh={loadDashboardData}
                />
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Footer / Team Credits */}
      <footer className="border-t border-slate-800/80 bg-dark-900 py-3 mt-4 text-center text-xs text-slate-500 font-mono">
        Google Gemini Hackathon 2026 • Track: Society & Well-being • Team Cipher (BIT Durg: Vimal Mishra, Ritu Mishra, Abhishek Dewangan, Vandana Sahu, Manish Kumar)
      </footer>

      {/* Modals & Drawers */}
      <EvidenceTimelineModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onResolve={handleResolveAlert}
        onRedispatch={handleOpenRerouteAdvisor}
      />

      {isIngestOpen && (
        <IngestionModal
          onClose={() => setIsIngestOpen(false)}
          onSubmit={handleSubmitReport}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Gemini Smart Logistics Re-routing Advisor Modal */}
      {reroutePlan && (
        <SmartRerouteModal
          plan={reroutePlan}
          onClose={() => setReroutePlan(null)}
          onExecuteReroute={handleExecuteReroute}
          onStandardRedispatch={handleStandardRedispatch}
          isSubmitting={isSubmittingReroute}
        />
      )}

      {/* Shelter Tactical Drill-Down Drawer */}
      {activeDrawerShelter && (
        <ShelterDetailDrawer
          shelter={activeDrawerShelter}
          onClose={() => setSelectedShelterForDrawer(null)}
          onOpenReportForShelter={() => {
            setSelectedShelterForDrawer(null);
            setIsIngestOpen(true);
          }}
        />
      )}
    </div>
  );
}
