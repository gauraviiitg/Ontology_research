import * as d3 from 'd3';

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  chunkId?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Edge extends d3.SimulationLinkDatum<Node> {
  id: string;
  source: string | Node;
  target: string | Node;
  label: string;
  chunkId?: string;
}

export interface Chunk {
  id: string;
  text: string;
  timestamp: number;
  affectedNodes: string[];
  affectedEdges: string[];
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}
