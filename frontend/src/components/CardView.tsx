import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Box, ArrowRight, Info, Home, List, Search, X } from 'lucide-react';
import { GraphData, Node, Edge } from '../types';
import { cn } from '../lib/utils';

interface CardViewProps {
  data: GraphData;
  onSelectNode?: (nodeId: string) => void;
}

export const CardView: React.FC<CardViewProps> = ({ data, onSelectNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');

  const rootNodes = useMemo(() => {
    const targetIds = new Set(data.edges.map(e => 
      typeof e.target === 'string' ? e.target : e.target.id
    ));
    return data.nodes.filter(n => !targetIds.has(n.id));
  }, [data]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedNodeId && data.nodes.length > 0) {
      if (rootNodes.length > 0) {
        setSelectedNodeId(rootNodes[0].id);
      } else {
        setSelectedNodeId(data.nodes[0].id);
      }
    }
  }, [data.nodes, rootNodes, selectedNodeId]);

  const selectedNode = useMemo(() => 
    data.nodes.find(n => n.id === selectedNodeId), 
    [data.nodes, selectedNodeId]
  );

  const filteredEntities = useMemo(() => {
    if (!menuSearch) return data.nodes;
    return data.nodes.filter(n => n.label.toLowerCase().includes(menuSearch.toLowerCase()));
  }, [data.nodes, menuSearch]);

  const relationships = useMemo(() => {
    if (!selectedNodeId) return { parents: [], children: [] };

    const parents: { node: Node; edge: Edge }[] = [];
    const children: { node: Node; edge: Edge }[] = [];

    data.edges.forEach(edge => {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;

      if (targetId === selectedNodeId) {
        const sourceNode = data.nodes.find(n => n.id === sourceId);
        if (sourceNode) parents.push({ node: sourceNode, edge });
      } else if (sourceId === selectedNodeId) {
        const targetNode = data.nodes.find(n => n.id === targetId);
        if (targetNode) children.push({ node: targetNode, edge });
      }
    });

    return { parents, children };
  }, [data, selectedNodeId]);

  const handleNodeSelect = (id: string) => {
    setSelectedNodeId(id);
    setIsMenuOpen(false);
    onSelectNode?.(id);
  };

  if (data.nodes.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-400">
        <Box className="w-12 h-12 opacity-20 mb-4" />
        <p>No data to display in Card View</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      {/* Top Bar for Navigation */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleNodeSelect(rootNodes[0]?.id || data.nodes[0].id)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Root
          </button>
          <div className="h-4 w-px bg-slate-200" />
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                isMenuOpen ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              )}
            >
              <List className="w-3.5 h-3.5" />
              Entities
              <ChevronRight className={cn("w-3 h-3 transition-transform", isMenuOpen && "rotate-90")} />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="Filter entities..."
                          value={menuSearch}
                          onChange={(e) => setMenuSearch(e.target.value)}
                          className="w-full pl-7 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1">
                      {filteredEntities.map(node => (
                        <button
                          key={node.id}
                          onClick={() => handleNodeSelect(node.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-[11px] transition-all flex items-center justify-between",
                            selectedNodeId === node.id ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {node.label}
                          {selectedNodeId === node.id && <div className="w-1 h-1 rounded-full bg-blue-600" />}
                        </button>
                      ))}
                      {filteredEntities.length === 0 && (
                        <div className="p-4 text-center text-[10px] text-slate-400 italic">No entities found</div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active:</span>
          <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
            {selectedNode?.label || 'None'}
          </span>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {data.nodes.length} Total
          </span>
        </div>
      </div>

      {/* Main Content: Card Explorer */}
      <div className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedNode ? (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Parents Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <ChevronLeft className="w-3 h-3" />
                  Influenced By / Parents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relationships.parents.length > 0 ? (
                    relationships.parents.map(({ node, edge }) => (
                      <div 
                        key={node.id}
                        onClick={() => handleNodeSelect(node.id)}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                            {edge.label}
                          </span>
                          <Box className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                        </div>
                        <p className="font-bold text-slate-800">{node.label}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-8 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs italic">
                      This is a root entity (no parents)
                    </div>
                  )}
                </div>
              </div>

              {/* Current Node Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-5 rounded-full" />
                <div className="relative bg-white p-8 rounded-2xl border-2 border-blue-500 shadow-xl shadow-blue-100">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded uppercase tracking-widest">
                          Active Entity
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {selectedNode.id}</span>
                      </div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedNode.label}</h2>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <Box className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                      <p className="text-sm font-bold text-slate-700">{selectedNode.type}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Source Chunk</p>
                      <p className="text-sm font-bold text-slate-700">{selectedNode.chunkId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Children Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  Influences / Children
                  <ChevronRight className="w-3 h-3" />
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relationships.children.length > 0 ? (
                    relationships.children.map(({ node, edge }) => (
                      <div 
                        key={node.id}
                        onClick={() => handleNodeSelect(node.id)}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-slate-800">{node.label}</p>
                          <Box className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                            {edge.label}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-8 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs italic">
                      No child relationships found
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Info className="w-12 h-12 opacity-20 mb-4" />
              <p>Select an entity to explore its relationships</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
