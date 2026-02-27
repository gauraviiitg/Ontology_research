import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Clock, Activity, Search, X } from 'lucide-react';
import { Chunk } from '../types';

interface TimelineProps {
  chunks: Chunk[];
  activeChunkId: string | null;
  onChunkClick: (chunkId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ chunks, activeChunkId, onChunkClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChunks = useMemo(() => {
    if (!searchQuery) return chunks;
    return chunks.filter(c => 
      c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.affectedNodes.some(n => n.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.affectedEdges.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [chunks, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Evolution Timeline</span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative border-l-2 border-slate-100 ml-2 space-y-6 pb-4">
          {filteredChunks.map((chunk, idx) => (
            <motion.div
              key={chunk.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative pl-6 group cursor-pointer"
              onClick={() => onChunkClick(chunk.id)}
            >
              <div className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 transition-all ${
                activeChunkId === chunk.id 
                  ? 'bg-blue-500 border-blue-200 scale-125 shadow-lg shadow-blue-200' 
                  : 'bg-white border-slate-200 group-hover:border-blue-300'
              }`} />
              
              <div className={`p-3 rounded-lg border transition-all ${
                activeChunkId === chunk.id
                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100'
                  : 'bg-slate-50 border-slate-100 group-hover:bg-white group-hover:border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(chunk.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-500">
                      +{chunk.affectedNodes.length + chunk.affectedEdges.length} updates
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 italic">"{chunk.text}"</p>
                
                {activeChunkId === chunk.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-2 pt-2 border-t border-blue-100 space-y-1"
                  >
                    <div className="flex flex-wrap gap-1">
                      {chunk.affectedNodes.map(nodeId => (
                        <span key={nodeId} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded uppercase font-bold">
                          Node: {nodeId}
                        </span>
                      ))}
                      {chunk.affectedEdges.map(edgeId => (
                        <span key={edgeId} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] rounded uppercase font-bold">
                          Edge: {edgeId}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
          {filteredChunks.length === 0 && (
            <div className="pl-6 text-slate-400 text-xs italic py-12">
              {searchQuery ? 'No matching events found' : 'Waiting for processing to start...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
