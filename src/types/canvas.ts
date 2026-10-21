export type Point = {
  x: number;
  y: number;
};

export type Viewport = {
  pan: Point;
  zoom: number;
};

export type NodeType = 'prompt' | 'component';
export type ModelOption = 'claude-3-7-sonnet' | 'gpt-4o' | 'llama-3.3-70b-versatile';

export interface PromptNodeData {
  prompt: string;
  model: ModelOption;
  isGenerating?: boolean;
  lastError?: string | null;
}

export interface ComponentNodeData {
  title: string;
  code: string;
  status: 'idle' | 'streaming' | 'ready' | 'error';
  activeTab: 'preview' | 'code';
  compileError?: string | null;
  sourcePromptId?: string;
}

export type CanvasNode<T = any> = {
  id: string;
  type: NodeType;
  position: Point;
  dimensions: Point;
  selected?: boolean;
  zIndex?: number;
  data: T;
};

export type CanvasEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  animated?: boolean;
};

export type SandboxOutboundMessage = {
  type: 'COMPILE_CODE';
  code: string;
  isStreaming: boolean;
};

export type SandboxInboundMessage =
  | { type: 'SANDBOX_READY' }
  | { type: 'COMPILE_SUCCESS'; height: number }
  | { type: 'COMPILE_ERROR'; error: string };
