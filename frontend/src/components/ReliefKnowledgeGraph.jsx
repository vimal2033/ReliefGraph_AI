import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { Share2, RefreshCw, Layers } from 'lucide-react';

export default function ReliefKnowledgeGraph({ graphData, onRefresh }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Default sample nodes & edges if empty
    let nodes = graphData?.nodes?.length ? graphData.nodes : [
      { id: 's1', label: 'Riverside Primary School', shape: 'box', color: '#EF4444', font: { color: '#fff', size: 13, bold: true } },
      { id: 's2', label: 'Central Hospital Shelter', shape: 'box', color: '#EF4444', font: { color: '#fff', size: 13, bold: true } },
      { id: 's3', label: 'St. Jude Community Hall', shape: 'box', color: '#F59E0B', font: { color: '#fff', size: 13, bold: true } },
      { id: 'n1', label: 'WATER NEED\n(150 people)', shape: 'diamond', color: '#DC2626', font: { color: '#fff', size: 11 } },
      { id: 'n2', label: 'INSULIN NEED\n(50 vials)', shape: 'diamond', color: '#DC2626', font: { color: '#fff', size: 11 } },
      { id: 'd1', label: 'Van 04\n(20 water cans)', shape: 'dot', size: 16, color: '#3B82F6', font: { color: '#fff', size: 10 } },
      { id: 'd2', label: 'Motorbike 02\n(10 vials)', shape: 'dot', size: 16, color: '#3B82F6', font: { color: '#fff', size: 10 } },
    ];

    let edges = graphData?.edges?.length ? graphData.edges : [
      { from: 's1', to: 'n1', label: 'NEEDS', color: { color: '#94A3B8' }, arrows: 'to' },
      { from: 's2', to: 'n2', label: 'NEEDS', color: { color: '#94A3B8' }, arrows: 'to' },
      { from: 'd1', to: 's1', label: 'DISPATCHED_TO', color: { color: '#3B82F6' }, arrows: 'to' },
      { from: 'd2', to: 's2', label: 'DISPATCHED_TO', color: { color: '#3B82F6' }, arrows: 'to' },
      { from: 'd1', to: 'n1', label: 'CONFLICTS_WITH', color: { color: '#EF4444' }, dashes: true, width: 3 },
      { from: 'd2', to: 'n2', label: 'DEFICIT_MISMATCH', color: { color: '#EF4444' }, dashes: true, width: 3 },
    ];

    const options = {
      nodes: {
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        width: 1.5,
        shadow: true,
        smooth: {
          type: 'continuous',
        },
        font: {
          color: '#94A3B8',
          size: 10,
          face: 'JetBrains Mono',
          background: '#0B0F17',
        },
      },
      physics: {
        stabilization: true,
        barnesHut: {
          gravitationalConstant: -3000,
          springConstant: 0.04,
          springLength: 120,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        zoomView: true,
      },
      layout: {
        randomSeed: 42,
      },
    };

    networkRef.current = new Network(containerRef.current, { nodes, edges }, options);

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [graphData]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-dark-900 flex flex-col">
      {/* Knowledge Graph Header Overlay */}
      <div className="absolute top-3 left-3 z-10 bg-dark-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg shadow-lg flex items-center space-x-2">
        <Share2 className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono font-semibold text-slate-200">
          Relief Knowledge Graph (Semantic Edges)
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg bg-dark-900/90 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors shadow-lg"
          title="Recalculate Knowledge Graph"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Graph Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-10 bg-dark-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg shadow-lg text-[10px] font-mono space-y-1">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
          <span className="text-slate-300">Shelter Hub</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rotate-45 bg-orange-500"></span>
          <span className="text-slate-300">Resource Need</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-slate-300">Supply Dispatch</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 border-t-2 border-dashed border-rose-500"></span>
          <span className="text-rose-400 font-bold">CONFLICTS_WITH</span>
        </div>
      </div>

      {/* Vis-network Container */}
      <div ref={containerRef} className="w-full h-full flex-1" />
    </div>
  );
}
