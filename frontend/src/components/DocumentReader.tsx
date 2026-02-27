import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Loader2, CheckCircle2, Search, X } from 'lucide-react';
import { Chunk } from '../types';

interface DocumentReaderProps {
  text: string;
  onChunkProcessed: (chunk: Chunk) => void;
  onComplete: () => void;
  isProcessing: boolean;
}

export const DocumentReader: React.FC<DocumentReaderProps> = ({ text, onChunkProcessed, onComplete, isProcessing }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (text) {
      setLines(text.split('\n').filter(l => l.trim().length > 0));
    }
  }, [text]);

  useEffect(() => {
    if (isProcessing && currentIndex < lines.length - 1) {
      const timer = setTimeout(() => {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        
        const line = lines[nextIndex];
        const chunk: Chunk = {
          id: `chunk-${nextIndex}`,
          text: line,
          timestamp: Date.now(),
          affectedNodes: [],
          affectedEdges: []
        };
        onChunkProcessed(chunk);

        if (nextIndex === lines.length - 1) {
          onComplete();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, currentIndex, lines]);

  useEffect(() => {
    if (scrollRef.current && !searchQuery) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, searchQuery]);

  const filteredLines = useMemo(() => {
    const processedLines = lines.slice(0, currentIndex + 1);
    if (!searchQuery) return processedLines.map((l, i) => ({ text: l, originalIndex: i }));
    return processedLines
      .map((l, i) => ({ text: l, originalIndex: i }))
      .filter(l => l.text.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [lines, currentIndex, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Document Stream</span>
          </div>
          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-600 text-xs font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing...
            </div>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search stream..."
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
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        <AnimatePresence initial={false}>
          {filteredLines.map(({ text: line, originalIndex: idx }) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-2 rounded border transition-colors ${
                idx === currentIndex 
                  ? 'bg-blue-50 border-blue-200 text-blue-900' 
                  : 'bg-slate-50 border-slate-100 text-slate-500'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="opacity-30 select-none">{(idx + 1).toString().padStart(3, '0')}</span>
                <p className="flex-1">{line}</p>
                {idx < currentIndex && <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-1 shrink-0" />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredLines.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
            <FileText className="w-8 h-8 opacity-20" />
            <p className="text-xs">{searchQuery ? 'No matches found' : 'No document loaded'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
