# GraphMind: Document-to-Graph Intelligence

A comprehensive knowledge graph extraction and visualization platform that transforms unstructured documents into interactive knowledge graphs with real-time processing, multiple visualization modes, and AI-powered context integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Components](#components)
- [Text Extraction Agent](#text-extraction-agent)
- [Usage](#usage)
- [Development](#development)
- [Configuration](#configuration)
- [Future Enhancements](#future-enhancements)

## 🎯 Overview

GraphMind is an intelligent document processing system that extracts entities and relationships from text documents and visualizes them as interactive knowledge graphs. The platform provides:

- **Real-time Processing**: Line-by-line document analysis with live graph updates
- **Multiple Visualization Modes**: Graph view, Card view, and AI Chat interface
- **Traceability**: Complete timeline tracking of extraction events
- **Interactive Exploration**: Drag-and-drop graph manipulation and entity navigation
- **Document Intelligence**: Integration with Azure Document Intelligence for advanced text extraction

## ✨ Features

### Core Capabilities

- **Document Processing**
  - Upload and process PDF, TXT, and DOCX documents
  - Real-time text chunking and analysis
  - Searchable document stream viewer
  - Manual text input support

- **Knowledge Graph Extraction**
  - Automatic entity detection and extraction
  - Relationship identification between entities
  - Chunk-level traceability (track which text created which nodes/edges)
  - Graph data export (JSON format)

- **Visualization Modes**
  - **Graph View**: Interactive D3.js force-directed graph with zoom, pan, and drag
  - **Card View**: Hierarchical entity explorer showing parent-child relationships
  - **Chat View**: AI-powered interface for querying the knowledge graph (placeholder)

- **Timeline Tracking**
  - Chronological view of all extraction events
  - Click-to-highlight functionality
  - Search and filter capabilities
  - Visual indicators for active chunks

- **User Interface**
  - Modern, responsive design with Tailwind CSS
  - Smooth animations using Motion (Framer Motion)
  - Real-time statistics dashboard
  - Context menus and tooltips

### Advanced Features

- **Node Management**: Delete nodes with automatic edge cleanup
- **Chunk Highlighting**: Visual connection between source text and graph elements
- **Root Node Detection**: Automatic identification of root entities
- **Relationship Navigation**: Bidirectional exploration of entity connections
- **Export Functionality**: Download graph data as JSON

## 📁 Project Structure

```
Ontology_research/
├── frontend/                    # React + TypeScript frontend application
│   ├── src/
│   │   ├── App.tsx             # Main application component
│   │   ├── main.tsx            # Application entry point
│   │   ├── types.ts            # TypeScript type definitions
│   │   ├── index.css           # Global styles and Tailwind configuration
│   │   ├── components/         # React components
│   │   │   ├── GraphCanvas.tsx      # D3.js graph visualization
│   │   │   ├── DocumentReader.tsx   # Document stream viewer
│   │   │   ├── Timeline.tsx          # Extraction timeline component
│   │   │   ├── CardView.tsx          # Entity card explorer
│   │   │   └── ChatInterface.tsx     # AI chat interface (placeholder)
│   │   └── lib/
│   │       └── utils.ts        # Utility functions (cn helper)
│   ├── index.html              # HTML entry point
│   ├── package.json            # Node.js dependencies
│   ├── tsconfig.json           # TypeScript configuration
│   ├── vite.config.ts          # Vite build configuration
│   ├── metadata.json           # Application metadata
│   └── README.md               # Frontend-specific documentation
│
└── text_extraction.py          # Azure Document Intelligence agent
```

## 🛠 Technology Stack

### Frontend

- **Framework**: React 19.0.0 with TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS 4.1.14
- **Visualization**: D3.js 7.9.0
- **Animations**: Motion (Framer Motion) 12.23.24
- **Icons**: Lucide React 0.546.0
- **Markdown**: React Markdown 10.1.0
- **Utilities**: 
  - clsx & tailwind-merge (class name utilities)
  - dotenv (environment variables)

### Backend/Agent

- **Language**: Python 3.x
- **Service**: Azure Document Intelligence (Form Recognizer)
- **Libraries**: 
  - `azure.ai.formrecognizer` (Document Analysis Client)
  - `azure.core.credentials` (Azure Key Credential)

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Python 3.8+** (for text extraction agent)
- **Azure Account** with Document Intelligence service (for text extraction)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ontology_research
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure environment variables** (if using text extraction agent)
   ```bash
   # Create .env file in root directory
   AZURE_FORMRECOGNIZER_ENDPOINT=your_endpoint
   AZURE_FORMRECOGNIZER_KEY=your_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The application should be running

### Building for Production

```bash
cd frontend
npm run build
```

The production build will be in the `frontend/dist` directory.

## 🏗 Architecture

### Application Flow

1. **Document Input**
   - User uploads a document or provides text input
   - Document is processed line-by-line (chunked)

2. **Text Processing**
   - Each chunk is analyzed for entities and relationships
   - Simple pattern matching extracts entities (currently mock implementation)
   - Relationships are identified based on keywords (e.g., "orbit", "consists of")

3. **Graph Construction**
   - Entities become nodes in the knowledge graph
   - Relationships become edges connecting nodes
   - Each node/edge is linked to its source chunk for traceability

4. **Visualization**
   - Graph is rendered using D3.js force simulation
   - Real-time updates as new chunks are processed
   - Multiple view modes provide different perspectives

5. **Interaction**
   - Users can explore the graph interactively
   - Timeline shows extraction history
   - Card view enables hierarchical navigation

### Data Models

#### Node
```typescript
interface Node {
  id: string;           // Unique identifier
  label: string;        // Display name
  type: string;         // Entity type (e.g., "entity")
  chunkId?: string;     // Source chunk reference
  x?: number;          // X coordinate (D3 simulation)
  y?: number;          // Y coordinate (D3 simulation)
}
```

#### Edge
```typescript
interface Edge {
  id: string;           // Unique identifier
  source: string | Node; // Source node
  target: string | Node; // Target node
  label: string;        // Relationship type
  chunkId?: string;     // Source chunk reference
}
```

#### Chunk
```typescript
interface Chunk {
  id: string;            // Unique identifier
  text: string;         // Source text
  timestamp: number;    // Processing timestamp
  affectedNodes: string[]; // Nodes created from this chunk
  affectedEdges: string[]; // Edges created from this chunk
}
```

## 🧩 Components

### GraphCanvas

Interactive D3.js force-directed graph visualization.

**Features:**
- Force simulation with collision detection
- Zoom and pan controls
- Drag-and-drop node positioning
- Chunk-based highlighting
- Node context menu with deletion option
- Arrow markers for directed edges

**Props:**
- `data: GraphData` - Graph nodes and edges
- `highlightedChunkId?: string` - Active chunk for highlighting
- `onNodeClick?: (node: Node) => void` - Node click handler
- `onDeleteNode?: (nodeId: string) => void` - Node deletion handler

### DocumentReader

Real-time document stream viewer with chunk-by-chunk processing.

**Features:**
- Line-by-line text display
- Processing status indicators
- Search functionality
- Auto-scroll to active line
- Visual feedback for processed chunks

**Props:**
- `text: string` - Document text
- `onChunkProcessed: (chunk: Chunk) => void` - Chunk processing callback
- `onComplete: () => void` - Processing completion callback
- `isProcessing: boolean` - Processing state

### Timeline

Chronological timeline of extraction events.

**Features:**
- Visual timeline with event markers
- Click-to-highlight active chunk
- Search and filter capabilities
- Expandable event details
- Update count indicators

**Props:**
- `chunks: Chunk[]` - Array of processed chunks
- `activeChunkId: string | null` - Currently active chunk
- `onChunkClick: (chunkId: string) => void` - Chunk selection handler

### CardView

Hierarchical entity explorer with relationship navigation.

**Features:**
- Root node detection
- Parent-child relationship display
- Entity search and filtering
- Interactive card navigation
- Relationship type visualization

**Props:**
- `data: GraphData` - Graph data
- `onSelectNode?: (nodeId: string) => void` - Node selection handler

### ChatInterface

AI-powered chat interface for querying the knowledge graph (placeholder).

**Props:**
- `context: string` - Graph context for AI queries

## 🤖 Text Extraction Agent

The `text_extraction.py` file contains an Azure Document Intelligence agent for extracting text from documents.

### Capabilities

- **Document Types**: PDF, images (JPG, PNG), scanned documents
- **Extraction Features**:
  - Text extraction with page markers
  - Table detection and extraction
  - Layout analysis
  - Form field extraction
  - Key-value pair extraction

### Usage

```python
from text_extraction import process

# Process document from file bytes
result = process({
    'file_bytes': base64_encoded_bytes
})

# Or process from URL
result = process({
    'file_url': 'https://example.com/document.pdf'
})

# Result structure
{
    'result': 'extracted text with page markers',
    'metadata': {
        'pages': 10,
        'tables': 2,
        'tables_data': [...],
        'model': 'prebuilt-model'
    }
}
```

### Configuration

Requires Azure Document Intelligence credentials:
- `AZURE_FORMRECOGNIZER_ENDPOINT`
- `AZURE_FORMRECOGNIZER_KEY`

**Cost**: $0.001 per page (Azure pricing)

## 💻 Usage

### Basic Workflow

1. **Start the Application**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Load a Document**
   - Click "Upload Document" or use "Mock Demo" button
   - Or manually edit text in the input area

3. **Process Document**
   - Click "Mock Demo" to process the sample document
   - Watch the graph build in real-time
   - Observe the timeline as chunks are processed

4. **Explore the Graph**
   - **Graph View**: Drag nodes, zoom, pan, click nodes for details
   - **Card View**: Navigate entity relationships hierarchically
   - **Timeline**: Click events to highlight related graph elements

5. **Export Data**
   - Click the download button to export graph as JSON

### Mock Demo

The application includes a built-in mock demo with a sample document about the Solar System. Click the "Mock Demo" button to see the system in action.

### Current Limitations

- **Entity Extraction**: Currently uses simple pattern matching (mock implementation)
- **Relationship Extraction**: Basic keyword-based detection
- **Chat Interface**: Placeholder component (not fully implemented)
- **Document Upload**: UI ready but backend integration needed

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Type check with TypeScript
npm run clean    # Remove dist directory
```

### Code Structure

- **Components**: Modular React components in `src/components/`
- **Types**: Centralized TypeScript definitions in `src/types.ts`
- **Utils**: Helper functions in `src/lib/utils.ts`
- **Styles**: Global styles and Tailwind config in `src/index.css`

### Adding New Features

1. **New Component**: Create in `src/components/` and import in `App.tsx`
2. **New Type**: Add to `src/types.ts`
3. **New Utility**: Add to `src/lib/utils.ts`
4. **Styling**: Use Tailwind CSS classes or extend `index.css`

## ⚙️ Configuration

### Vite Configuration

Located in `frontend/vite.config.ts`:
- Development server on port 3000
- Host set to `0.0.0.0` for network access
- React plugin enabled

### TypeScript Configuration

Located in `frontend/tsconfig.json`:
- Strict type checking enabled
- React JSX support
- ES2020 target

### Tailwind Configuration

Using Tailwind CSS v4 with:
- Custom fonts (Inter, JetBrains Mono)
- Custom theme variables
- Markdown body styles

## 🔮 Future Enhancements

### Planned Features

- [ ] **Advanced NLP Integration**
  - Named Entity Recognition (NER) using spaCy or similar
  - Relationship extraction using transformer models
  - Coreference resolution

- [ ] **Backend API**
  - RESTful API for document processing
  - Graph persistence and retrieval
  - User authentication and project management

- [ ] **Enhanced Chat Interface**
  - Integration with Google Generative AI
  - Natural language queries on knowledge graph
  - Graph-based question answering

- [ ] **Document Upload**
  - File upload handling
  - Integration with text extraction agent
  - Support for multiple document formats

- [ ] **Graph Analytics**
  - Centrality metrics
  - Community detection
  - Graph statistics and insights

- [ ] **Export Options**
  - Export to various formats (RDF, Neo4j, GraphML)
  - Image export (PNG, SVG)
  - PDF report generation

- [ ] **Collaboration Features**
  - Real-time multi-user editing
  - Graph versioning
  - Comments and annotations

## 📝 License

[Specify your license here]

## 👥 Contributors

[Add contributor information]

## 🙏 Acknowledgments

- D3.js for powerful graph visualization
- Azure Document Intelligence for text extraction
- React and Vite for modern frontend development
- Tailwind CSS for beautiful, responsive design

---

**Note**: This is a research project focused on ontology extraction and knowledge graph visualization. The current implementation includes mock data processing for demonstration purposes. Production deployment would require integration with actual NLP services and backend infrastructure.

