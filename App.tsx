import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowProvider,
  Node,
} from 'reactflow';
import { VideoNode, WebNode, TextNode } from './components/nodes/SourceNodes';
import { GoogleDriveNode } from './components/nodes/GoogleDriveNode';
import { NoteNode } from './components/nodes/NoteNode';
import { ChatNode } from './components/nodes/ChatNode';
import { Sidebar } from './components/Sidebar';
import { AuthScreen } from './components/AuthScreen';
import { ConnectionTest } from './components/ConnectionTest';
import { NodeType, Project, User } from './types';
import { Plus, Youtube, Globe, Type, Sparkles, Trash2, HardDrive, StickyNote } from 'lucide-react';

const nodeTypes = {
  video: VideoNode,
  web: WebNode,
  text: TextNode,
  chat: ChatNode,
  drive: GoogleDriveNode,
  note: NoteNode,
};

const DEFAULT_PROJECT_ID = 'default-project';

const createDefaultProject = (): Project => ({
  id: DEFAULT_PROJECT_ID,
  name: 'My First Workflow',
  updatedAt: Date.now(),
  nodes: [
    {
      id: '1',
      type: 'text',
      position: { x: 100, y: 100 },
      data: { title: 'Project Context', text: 'We are building a marketing campaign for the new AI tool...' },
      style: { width: 350, height: 300 },
    },
    {
      id: '2',
      type: 'chat',
      position: { x: 600, y: 200 },
      data: { systemPrompt: 'Marketing Expert', userInput: '', messages: [], status: 'idle' },
      style: { width: 500, height: 600 },
    },
  ],
  edges: []
});

interface FlowProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onSave: (nodes: Node[], edges: Edge[]) => void;
}

const Flow: React.FC<FlowProps> = ({ initialNodes, initialEdges, onSave }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null);

  // Debounce save to parent
  useEffect(() => {
    const handler = setTimeout(() => {
      onSave(nodes, edges);
    }, 1000);

    return () => clearTimeout(handler);
  }, [nodes, edges, onSave]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#64748b', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const getId = () => `node_${Date.now()}`;

  const addNode = (type: NodeType) => {
    const id = getId();
    const position = reactFlowInstance
      ? reactFlowInstance.project({
          x: (reactFlowWrapper.current?.getBoundingClientRect().width || 500) / 2 - 150,
          y: (reactFlowWrapper.current?.getBoundingClientRect().height || 500) / 2 - 100,
        })
      : { x: 250, y: 250 };
    
    // Set default sizes based on node type
    let style = { width: 350, height: 400 };
    if (type === 'chat') {
      style = { width: 500, height: 600 };
    } else if (type === 'text') {
      style = { width: 350, height: 300 };
    } else if (type === 'drive') {
      style = { width: 350, height: 350 };
    } else if (type === 'note') {
      style = { width: 300, height: 300 };
    }

    const newNode: Node = {
      id,
      type,
      position,
      style,
      data: {
        label: `${type} Node`,
        ...(type === 'text' ? { text: '', title: 'New Note' } : {}),
        ...(type === 'note' ? { text: '', title: 'Sticky Note' } : {}),
        ...(type === 'chat' ? { systemPrompt: '', userInput: '', messages: [], status: 'idle' } : {}),
        ...(type === 'video' || type === 'web' || type === 'drive' ? { status: 'idle', url: '' } : {}),
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };
  
  const deleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedEdges = edges.filter(edge => edge.selected);
    
    if (selectedNodes.length > 0) {
      setNodes((nds) => nds.filter((n) => !n.selected));
    }
    if (selectedEdges.length > 0) {
      setEdges((eds) => eds.filter((e) => !e.selected));
    }
  }, [nodes, edges, setNodes, setEdges]);

  // Handle delete key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Only delete if not focused on input
        if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) return;
        deleteSelected();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected]);


  return (
    <div className="w-full h-full bg-background relative flex flex-1 overflow-hidden" ref={reactFlowWrapper}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 p-2 bg-surface/80 backdrop-blur border border-border rounded-xl shadow-xl">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-2">Add Node</div>
        <button onClick={() => addNode(NodeType.VIDEO)} className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors text-left group">
          <div className="p-1 bg-red-600 rounded group-hover:bg-red-500"><Youtube className="w-3 h-3 text-white" /></div>
          <span>Video Source</span>
        </button>
        <button onClick={() => addNode(NodeType.WEB)} className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors text-left group">
          <div className="p-1 bg-blue-600 rounded group-hover:bg-blue-500"><Globe className="w-3 h-3 text-white" /></div>
          <span>Web Source</span>
        </button>
        <button onClick={() => addNode(NodeType.DRIVE)} className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors text-left group">
          <div className="p-1 bg-green-600 rounded group-hover:bg-green-500"><HardDrive className="w-3 h-3 text-white" /></div>
          <span>Google Drive</span>
        </button>
        <button onClick={() => addNode(NodeType.TEXT)} className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors text-left group">
          <div className="p-1 bg-orange-500 rounded group-hover:bg-orange-400"><Type className="w-3 h-3 text-white" /></div>
          <span>Text Prompt</span>
        </button>
         <button onClick={() => addNode(NodeType.NOTE)} className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors text-left group">
          <div className="p-1 bg-yellow-500 rounded group-hover:bg-yellow-400"><StickyNote className="w-3 h-3 text-white" /></div>
          <span>Sticky Note</span>
        </button>
        <div className="h-px bg-slate-700 my-1"></div>
        <button onClick={() => addNode(NodeType.CHAT)} className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors text-left group">
          <div className="p-1 bg-accent rounded group-hover:bg-violet-400"><Sparkles className="w-3 h-3 text-white" /></div>
          <span>Gemini Chat</span>
        </button>
      </div>
      
      {/* Help / Delete Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
         <button onClick={deleteSelected} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 rounded-lg shadow-lg" title="Delete Selected (Del)">
            <Trash2 className="w-4 h-4" />
         </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        minZoom={0.2}
        maxZoom={2}
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls className="!bg-surface !border-border !fill-slate-400" />
        <MiniMap 
            className="!bg-surface !border-border" 
            maskColor="rgba(15, 23, 42, 0.6)"
            nodeColor={(n) => {
                if (n.type === 'video') return '#dc2626';
                if (n.type === 'web') return '#2563eb';
                if (n.type === 'drive') return '#16a34a';
                if (n.type === 'text') return '#f97316';
                if (n.type === 'note') return '#eab308';
                return '#8b5cf6';
            }}
        />
      </ReactFlow>
    </div>
  );
};

export default function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('constructor_user');
      return stored ? JSON.parse(stored) : null;
    } catch(e) { return null; }
  });

  // --- PROJECT STATE ---
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem('constructor_projects');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch(e) { console.error("Failed to load projects", e); }
    return [createDefaultProject()];
  });
  
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
     return localStorage.getItem('constructor_active_project') || DEFAULT_PROJECT_ID;
  });

  // Persist projects whenever they change
  useEffect(() => {
    localStorage.setItem('constructor_projects', JSON.stringify(projects));
  }, [projects]);

  // Persist active ID
  useEffect(() => {
    localStorage.setItem('constructor_active_project', activeProjectId);
  }, [activeProjectId]);

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem('constructor_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('constructor_user');
    }
  }, [user]);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const handleCreateProject = () => {
    const newProject: Project = {
      id: `project_${Date.now()}`,
      name: `Untitled Project ${projects.length + 1}`,
      nodes: [],
      edges: [],
      updatedAt: Date.now()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) return; // Prevent deleting last project

    const newProjects = projects.filter(p => p.id !== id);
    setProjects(newProjects);

    if (activeProjectId === id) {
      setActiveProjectId(newProjects[0].id);
    }
  };

  const handleRenameProject = (id: string, newName: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, name: newName, updatedAt: Date.now() };
      }
      return p;
    }));
  };

  const handleSaveFlow = useCallback((nodes: Node[], edges: Edge[]) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return { ...p, nodes, edges, updatedAt: Date.now() };
      }
      return p;
    }));
  }, [activeProjectId]);

  // Auth Handlers
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <ReactFlowProvider>
      <div className="flex w-screen h-screen bg-background text-slate-100 overflow-hidden">
        <Sidebar
          projects={projects}
          activeProjectId={activeProjectId}
          user={user}
          onSelectProject={setActiveProjectId}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onRenameProject={handleRenameProject}
          onLogout={handleLogout}
        />
        
        {/* We use key={activeProjectId} to force a re-mount of the Flow component when the project changes.
            This is the cleanest way to reset the internal ReactFlow state for a new graph. */}
        <Flow
          key={activeProjectId}
          initialNodes={activeProject.nodes}
          initialEdges={activeProject.edges}
          onSave={handleSaveFlow}
        />

        {/* Backend Connection Status */}
        <ConnectionTest />
      </div>
    </ReactFlowProvider>
  );
}