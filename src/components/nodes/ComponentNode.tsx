// src/components/nodes/ComponentNode.tsx
'use client';

import React, { useState } from 'react';
import { Eye, Code2, Copy, Check, Radio, AlertTriangle } from 'lucide-react';
import { CanvasNode, ComponentNodeData } from '@/types/canvas';
import { BaseNode } from './BaseNode';
import { SandboxIframe } from '@/components/sandbox/SandboxIframe';
import { useNodeStore } from '@/store/useNodeStore';

export const ComponentNode: React.FC<{ node: CanvasNode<ComponentNodeData> }> = ({ node }) => {
  const updateNodeData = useNodeStore((s) => s.updateNodeData);
  const [copied, setCopied] = useState(false);

  if (!node || !node.data) return null;

  const code = node.data.code ?? '';
  const activeTab = node.data.activeTab ?? 'preview';
  const status = node.data.status ?? 'ready';
  const compileError = node.data.compileError ?? null;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const headerControls = (
    <div className="flex items-center gap-1">
      <div className="flex items-center rounded-lg border border-white/10 bg-black/50 p-0.5">
        <button
          type="button"
          onClick={() => updateNodeData<ComponentNodeData>(node.id, { activeTab: 'preview' })}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition ${
            activeTab === 'preview'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="h-3 w-3" />
          <span>Preview</span>
        </button>
        <button
          type="button"
          onClick={() => updateNodeData<ComponentNodeData>(node.id, { activeTab: 'code' })}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition ${
            activeTab === 'code'
              ? 'bg-indigo-500/20 text-indigo-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="h-3 w-3" />
          <span>Code</span>
        </button>
      </div>

      <button
        type="button"
        onClick={handleCopyCode}
        title="Copy JSX Source"
        className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );

  return (
    <BaseNode
      node={node}
      title={node.data.title || 'Component Sandbox'}
      badgeText={status === 'streaming' ? 'STREAMING' : 'SANDBOX'}
      accentColor="emerald"
      headerActions={headerControls}
      hasInputPort
    >
      <div className="relative flex h-full w-full flex-col">
        {status === 'streaming' && (
          <div className="flex items-center justify-between border-b border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[11px] text-indigo-300">
            <span className="flex items-center gap-1.5 font-mono">
              <Radio className="h-3 w-3 animate-pulse text-indigo-400" />
              Compiling token stream inside isolated iframe...
            </span>
            <span className="font-mono text-[10px] opacity-75">{code.length} chars</span>
          </div>
        )}

        {compileError && status !== 'streaming' && (
          <div className="flex items-center gap-2 border-b border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span className="truncate font-mono">{compileError}</span>
          </div>
        )}

        <div className="relative flex-1 overflow-hidden">
          <div className={`h-full w-full ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
            <SandboxIframe
              code={code}
              isStreaming={status === 'streaming'}
              onCompileError={(err) =>
                updateNodeData<ComponentNodeData>(node.id, { compileError: err })
              }
            />
          </div>

          {activeTab === 'code' && (
            <pre className="h-full w-full overflow-auto bg-[#06070b] p-4 font-mono text-xs leading-relaxed text-indigo-200 select-text">
              <code>{code || '// Waiting for token stream...'}</code>
            </pre>
          )}
        </div>
      </div>
    </BaseNode>
  );
};