import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Trash2, X } from 'lucide-react';
import { Node, Edge, GraphData } from '../types';

interface GraphCanvasProps {
  data: GraphData;
  highlightedChunkId?: string | null;
  onNodeClick?: (node: Node) => void;
  onDeleteNode?: (nodeId: string) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ data, highlightedChunkId, onNodeClick, onDeleteNode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force("link", d3.forceLink<Node, Edge>(data.edges).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#999")
      .style("stroke", "none");

    const link = g.append("g")
      .selectAll("line")
      .data(data.edges)
      .join("line")
      .attr("stroke", d => d.chunkId === highlightedChunkId ? "#3b82f6" : "#e5e7eb")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => d.chunkId === highlightedChunkId ? 3 : 1.5)
      .attr("marker-end", "url(#arrowhead)");

    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        onNodeClick?.(d);
      })
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    node.append("circle")
      .attr("r", 12)
      .attr("fill", d => d.chunkId === highlightedChunkId ? "#3b82f6" : "#fff")
      .attr("stroke", d => d.chunkId === highlightedChunkId ? "#2563eb" : "#3b82f6")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dx", 16)
      .attr("dy", 4)
      .text(d => d.label)
      .attr("font-size", "12px")
      .attr("font-family", "Inter, sans-serif")
      .attr("fill", "#1f2937")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
        .attr("y2", d => (d.target as Node).y!);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    svg.on("click", () => setSelectedNode(null));

    return () => {
      simulation.stop();
    };
  }, [data, highlightedChunkId]);

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden rounded-xl border border-slate-200 shadow-inner">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Node Context Menu / Info */}
      {selectedNode && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-xl w-64 animate-in fade-in slide-in-from-left-4 duration-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-800">{selectedNode.label}</h4>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{selectedNode.type}</p>
            </div>
            <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Source Chunk</p>
              <p className="text-[11px] text-slate-600 italic">"{selectedNode.chunkId || 'Manual'}"</p>
            </div>
            
            <button 
              onClick={() => {
                onDeleteNode?.(selectedNode.id);
                setSelectedNode(null);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Node
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 flex gap-2">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Active Chunk
        </div>
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600">
          <div className="w-2 h-2 rounded-full bg-slate-200" />
          Historical
        </div>
      </div>
    </div>
  );
};
