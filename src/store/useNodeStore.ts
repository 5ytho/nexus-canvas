// src/store/useNodeStore.ts
import { create } from 'zustand';
import { CanvasEdge, CanvasNode, ComponentNodeData, PromptNodeData, Point } from '@/types/canvas';

const INITIAL_DEMO_CODE = [
  'function App() {',
  '  const [activeMetric, setActiveMetric] = React.useState("throughput");',
  '  const [deploymentCount, setDeploymentCount] = React.useState(142);',
  '',
  '  const metrics = {',
  '    throughput: { label: "Token Velocity", value: "1,420 tok/s", delta: "+18.4%", bars: [42, 58, 49, 72, 65, 88, 96, 84, 100] },',
  '    latency: { label: "TTFT Latency", value: "84 ms", delta: "-12.1%", bars: [85, 78, 70, 62, 55, 49, 44, 41, 38] },',
  '    nodes: { label: "Active Sandboxes", value: "24 Live", delta: "+4 New", bars: [25, 34, 48, 52, 61, 74, 79, 88, 94] }',
  '  };',
  '',
  '  const current = metrics[activeMetric];',
  '',
  '  return (',
  '    <div className="min-h-screen bg-[#07080d] text-slate-100 p-5 font-sans select-none">',
  '      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-5 shadow-2xl">',
  '        <div className="flex items-center justify-between mb-5">',
  '          <div>',
  '            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">',
  '              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />',
  '              Runtime Telemetry',
  '            </span>',
  '            <h2 className="text-lg font-semibold tracking-tight text-white mt-2">Nexus Spatial Compute</h2>',
  '          </div>',
  '          <button',
  '            onClick={() => setDeploymentCount((c) => c + 1)}',
  '            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 transition active:scale-95"',
  '          >',
  '            Deploy Build #{deploymentCount}',
  '          </button>',
  '        </div>',
  '',
  '        <div className="grid grid-cols-3 gap-2 mb-5">',
  '          {Object.entries(metrics).map(([key, item]) => (',
  '            <button',
  '              key={key}',
  '              onClick={() => setActiveMetric(key)}',
  '              className={"text-left p-3 rounded-xl border transition-all " + (activeMetric === key ? "bg-indigo-500/15 border-indigo-400/40 shadow-inner" : "bg-white/[0.02] border-white/5 hover:border-white/15")}',
  '            >',
  '              <div className="text-[11px] text-slate-400">{item.label}</div>',
  '              <div className="text-base font-bold text-white mt-0.5">{item.value}</div>',
  '              <div className="text-[10px] font-medium text-emerald-400 mt-1">{item.delta}</div>',
  '            </button>',
  '          ))}',
  '        </div>',
  '',
  '        <div className="rounded-xl bg-black/40 border border-white/5 p-4">',
  '          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">',
  '            <span>Real-time Stream Distribution</span>',
  '            <span className="font-mono text-indigo-300">{current.value}</span>',
  '          </div>',
  '          <div className="h-28 flex items-end gap-2">',
  '            {current.bars.map((height, idx) => (',
  '              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">',
  '                <div',
  '                  style={{ height: height + "%" }}',
  '                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-600/60 via-indigo-400 to-cyan-300 transition-all duration-500 group-hover:brightness-125"',
  '                />',
  '              </div>',
  '            ))}',
  '          </div>',
  '        </div>',
  '      </div>',
  '    </div>',
  '  );',
  '}',
].join('\n');

interface NodeStoreState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  maxZIndex: number;
  addPromptNode: (position: Point) => string;
  spawnComponentNodeFromPrompt: (promptNodeId: string, title: string) => string;
  updateNodePosition: (id: string, position: Point) => void;
  updateNodeDimensions: (id: string, dimensions: Point) => void;
  updateNodeData: <T>(id: string, partialData: Partial<T>) => void;
  selectNode: (id: string | null) => void;
  deleteSelectedNodes: () => void;
  removeNode: (id: string) => void;
  autoLayoutNodes: () => void;
  setEdgeAnimated: (sourceId: string, targetId: string, animated: boolean) => void;
}

export const useNodeStore = create<NodeStoreState>((set, get) => ({
  maxZIndex: 10,
  nodes: [
    {
      id: 'prompt-initial',
      type: 'prompt',
      position: { x: 80, y: 120 },
      dimensions: { x: 380, y: 310 },
      selected: false,
      zIndex: 2,
      data: {
        prompt:
          'Pomodoro Focus Timer with circular progress & task list',
        model: 'claude-3-7-sonnet',
        isGenerating: false,
      } satisfies PromptNodeData,
    },
    {
      id: 'component-initial',
      type: 'component',
      position: { x: 540, y: 70 },
      dimensions: { x: 480, y: 460 },
      selected: true,
      zIndex: 3,
      data: {
        title: 'AI Cluster Telemetry',
        code: INITIAL_DEMO_CODE,
        status: 'ready',
        activeTab: 'preview',
        compileError: null,
        sourcePromptId: 'prompt-initial',
      } satisfies ComponentNodeData,
    },
  ],
  edges: [
    {
      id: 'edge-initial',
      sourceId: 'prompt-initial',
      targetId: 'component-initial',
      animated: false,
    },
  ],

  addPromptNode: (position) => {
    const id = `prompt-${Date.now()}`;
    const nextZ = get().maxZIndex + 1;
    const newNode: CanvasNode<PromptNodeData> = {
      id,
      type: 'prompt',
      position,
      dimensions: { x: 380, y: 310 },
      selected: true,
      zIndex: nextZ,
      data: {
        prompt: '',
        model: 'claude-3-7-sonnet',
        isGenerating: false,
      },
    };

    set((state) => ({
      maxZIndex: nextZ,
      nodes: [...state.nodes.map((n) => ({ ...n, selected: false })), newNode],
    }));
    return id;
  },

  spawnComponentNodeFromPrompt: (promptNodeId, title) => {
    const state = get();
    const sourceNode = state.nodes.find((n) => n.id === promptNodeId);
    const basePos = sourceNode ? sourceNode.position : { x: 200, y: 200 };
    const existingChildren = state.edges.filter((e) => e.sourceId === promptNodeId).length;
    const targetId = `comp-${Date.now()}`;
    const nextZ = state.maxZIndex + 1;

    const newComponentNode: CanvasNode<ComponentNodeData> = {
      id: targetId,
      type: 'component',
      position: {
        x: basePos.x + 460,
        y: basePos.y + existingChildren * 70 - 30,
      },
      dimensions: { x: 480, y: 460 },
      selected: true,
      zIndex: nextZ,
      data: {
        title: title.slice(0, 34) || 'Generated Component',
        code: '',
        status: 'streaming',
        activeTab: 'preview',
        compileError: null,
        sourcePromptId: promptNodeId,
      },
    };

    const newEdge: CanvasEdge = {
      id: `edge-${promptNodeId}-${targetId}`,
      sourceId: promptNodeId,
      targetId,
      animated: true,
    };

    set((prev) => ({
      maxZIndex: nextZ,
      nodes: [...prev.nodes.map((n) => ({ ...n, selected: false })), newComponentNode],
      edges: [...prev.edges, newEdge],
    }));

    return targetId;
  },

  updateNodePosition: (id, position) =>
    set((state) => ({
      nodes: state.nodes.map((node) => (node.id === id ? { ...node, position } : node)),
    })),

  updateNodeDimensions: (id, dimensions) =>
    set((state) => ({
      nodes: state.nodes.map((node) => (node.id === id ? { ...node, dimensions } : node)),
    })),

  updateNodeData: (id, partialData) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...partialData } } : node
      ),
    })),

  selectNode: (id) =>
    set((state) => {
      if (!id) {
        return { nodes: state.nodes.map((n) => ({ ...n, selected: false })) };
      }
      const nextZ = state.maxZIndex + 1;
      return {
        maxZIndex: nextZ,
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, selected: true, zIndex: nextZ } : { ...n, selected: false }
        ),
      };
    }),

  deleteSelectedNodes: () =>
    set((state) => {
      const selectedIds = new Set(state.nodes.filter((n) => n.selected).map((n) => n.id));
      if (selectedIds.size === 0) return state;
      return {
        nodes: state.nodes.filter((n) => !selectedIds.has(n.id)),
        edges: state.edges.filter(
          (e) => !selectedIds.has(e.sourceId) && !selectedIds.has(e.targetId)
        ),
      };
    }),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.sourceId !== id && e.targetId !== id),
    })),

  autoLayoutNodes: () =>
    set((state) => {
      const prompts = state.nodes.filter((n) => n.type === 'prompt');
      const components = state.nodes.filter((n) => n.type === 'component');
      const updated: CanvasNode[] = [];

      prompts.forEach((p, idx) => {
        updated.push({ ...p, position: { x: 80, y: 100 + idx * 360 } });
      });
      components.forEach((c, idx) => {
        updated.push({ ...c, position: { x: 560, y: 70 + idx * 500 } });
      });

      return { nodes: updated };
    }),

  setEdgeAnimated: (sourceId, targetId, animated) =>
    set((state) => ({
      edges: state.edges.map((e) =>
        e.sourceId === sourceId && e.targetId === targetId ? { ...e, animated } : e
      ),
    })),
}));