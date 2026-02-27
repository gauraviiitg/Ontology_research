import React, { useState, useCallback, useMemo } from 'react';
import { 
  Upload, 
  Play, 
  Download, 
  Edit3, 
  History, 
  Settings2, 
  Database,
  RefreshCw,
  FileJson,
  Share2,
  Trash2,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GraphCanvas } from './components/GraphCanvas';
import { DocumentReader } from './components/DocumentReader';
import { Timeline } from './components/Timeline';
import { ChatInterface } from './components/ChatInterface';
import { CardView } from './components/CardView';
import { GraphData, Node, Edge, Chunk } from './types';
import { cn } from './lib/utils';

const MOCK_DOC = `The Solar System consists of the Sun and the objects that orbit it.
The Sun is a G-type main-sequence star that contains 99.86% of the system's mass.
Eight planets orbit the Sun, including Earth, Mars, and Jupiter.
Jupiter is the largest planet and has a Great Red Spot.
Mars is often called the Red Planet because of iron oxide on its surface.
Earth is the only known planet to support life.
The Moon is Earth's only natural satellite.
Saturn is famous for its prominent ring system.
Uranus and Neptune are known as ice giants.
Pluto was reclassified as a dwarf planet in 2006.`;

export default function App() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeChunkId, setActiveChunkId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [view, setView] = useState<'graph' | 'chat' | 'cards'>('graph');

  const handleChunkProcessed = useCallback((chunk: Chunk) => {
    // Simple mock extraction logic
    const text = chunk.text.toLowerCase();
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const affectedNodes: string[] = [];
    const affectedEdges: string[] = [];

    const entities = [
      'Sun', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 
      'Moon', 'Planets', 'Solar System', 'Star', 'Great Red Spot', 'Ice Giants', 'Dwarf Planet'
    ];

    entities.forEach(entity => {
      if (text.includes(entity.toLowerCase())) {
        const nodeId = entity.replace(/\s+/g, '_').toLowerCase();
        if (!graphData.nodes.find(n => n.id === nodeId) && !newNodes.find(n => n.id === nodeId)) {
          newNodes.push({ id: nodeId, label: entity, type: 'entity', chunkId: chunk.id });
        }
        affectedNodes.push(nodeId);
      }
    });

    // Simple relationship extraction
    if (text.includes('orbit') || text.includes('consists of')) {
      const source = affectedNodes[0];
      const target = affectedNodes[1];
      if (source && target) {
        const edgeId = `${source}-${target}`;
        if (!graphData.edges.find(e => e.id === edgeId) && !newEdges.find(e => e.id === edgeId)) {
          newEdges.push({ id: edgeId, source, target, label: 'orbits', chunkId: chunk.id });
        }
        affectedEdges.push(edgeId);
      }
    }

    setGraphData(prev => ({
      nodes: [...prev.nodes, ...newNodes],
      edges: [...prev.edges, ...newEdges]
    }));

    setChunks(prev => [...prev, { ...chunk, affectedNodes, affectedEdges }]);
    setActiveChunkId(chunk.id);
  }, [graphData]);

  const deleteNode = useCallback((nodeId: string) => {
    setGraphData(prev => ({
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => {
        const sourceId = typeof e.source === 'string' ? (e.source as string) : (e.source as Node).id;
        const targetId = typeof e.target === 'string' ? (e.target as string) : (e.target as Node).id;
        return sourceId !== nodeId && targetId !== nodeId;
      })
    }));
    
    // Also update chunks to remove references to deleted node
    setChunks(prev => prev.map(c => ({
      ...c,
      affectedNodes: c.affectedNodes.filter(id => id !== nodeId),
      affectedEdges: c.affectedEdges.filter(id => !id.includes(nodeId))
    })));
  }, []);

  const startDemo = () => {
    setGraphData({ nodes: [], edges: [] });
    setChunks([]);
    setInputText(MOCK_DOC);
    setIsProcessing(true);
    setActiveChunkId(null);
  };

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ graphData, chunks }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "knowledge_graph.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const graphContext = useMemo(() => {
    return graphData.edges.map(e => {
      const source = typeof e.source === 'string' ? e.source : e.source.label;
      const target = typeof e.target === 'string' ? e.target : e.target.label;
      return `${source} ${e.label} ${target}`;
    }).join('\n');
  }, [graphData]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-50"><script id="witness-data" src="" data-witness-endpoint="https://api.4100.euce1.witness.ai" data-witness-client="WitnessAI" data-witness-mode="observe" data-attachments-disabled="false" data-witness-app="aistudio.google.com"></script><script type="module" src="https://cdn.witness.ai/witnesslib/generic.min.js?id=2abe2ae0-1633-418d-8fcf-a96e55d36d9d" defer></script>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">GraphMind</h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Knowledge Extraction Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setView('graph')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2",
                view === 'graph' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Database className="w-3.5 h-3.5" />
              Graph
            </button>
            <button 
              onClick={() => setView('cards')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2",
                view === 'cards' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Cards
            </button>
            <button 
              onClick={() => setView('chat')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2",
                view === 'chat' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Share2 className="w-3.5 h-3.5" />
              AI
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2" />

          <button 
            onClick={startDemo}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md shadow-blue-100"
          >
            <Play className="w-4 h-4 fill-current" />
            Mock Demo
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left Column: Input & Reader */}
        <div className="w-1/4 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Input Source</h3>
              <Settings2 className="w-4 h-4 text-slate-300" />
            </div>
            
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-600">Upload Document</p>
                <p className="text-[10px] text-slate-400">PDF, TXT, or DOCX up to 10MB</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
                Manual Edit
              </button>
              <button className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <DocumentReader 
              text={inputText} 
              isProcessing={isProcessing}
              onChunkProcessed={handleChunkProcessed}
              onComplete={() => setIsProcessing(false)}
            />
          </div>
        </div>

        {/* Center Column: Graph/Chat/Cards */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex-1 min-h-0 relative">
            <AnimatePresence mode="wait">
              {view === 'graph' ? (
                <motion.div 
                  key="graph"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="w-full h-full"
                >
                  <GraphCanvas 
                    data={graphData} 
                    highlightedChunkId={activeChunkId}
                    onDeleteNode={deleteNode}
                  />
                </motion.div>
              ) : view === 'cards' ? (
                <motion.div 
                  key="cards"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full h-full"
                >
                  <CardView 
                    data={graphData} 
                    onSelectNode={(nodeId) => {
                      const node = graphData.nodes.find(n => n.id === nodeId);
                      if (node?.chunkId) setActiveChunkId(node.chunkId);
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full h-full"
                >
                  <ChatInterface context={graphContext} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button 
                onClick={downloadJSON}
                className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 text-slate-600 transition-all group"
                title="Download Graph Data"
              >
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 text-slate-600 transition-all group">
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              </button>
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 text-slate-600 transition-all group">
                <FileJson className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-around">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nodes</p>
              <p className="text-xl font-black text-slate-800">{graphData.nodes.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Edges</p>
              <p className="text-xl font-black text-slate-800">{graphData.edges.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chunks</p>
              <p className="text-xl font-black text-slate-800">{chunks.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence</p>
              <p className="text-xl font-black text-emerald-500">94%</p>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="w-1/4 flex flex-col gap-6">
          <div className="flex-1 min-h-0">
            <Timeline 
              chunks={chunks} 
              activeChunkId={activeChunkId}
              onChunkClick={(id) => setActiveChunkId(id)}
            />
          </div>
          
          <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Quick Tip</span>
              </div>
              <h4 className="font-bold mb-2">Traceability</h4>
              <p className="text-xs opacity-90 leading-relaxed">
                Click any chunk in the timeline to see which nodes and edges were extracted from that specific sentence.
              </p>
            </div>
            <Zap className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-125 transition-transform duration-700" />
          </div>
        </div>
      </main>
    </div>
  );
}
