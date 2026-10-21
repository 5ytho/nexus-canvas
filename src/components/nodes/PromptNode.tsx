// src/components/nodes/PromptNode.tsx
'use client';

import React, { useCallback } from 'react';
import { Sparkles, Loader2, Cpu, Wand2 } from 'lucide-react';
import { CanvasNode, ComponentNodeData, ModelOption, PromptNodeData } from '@/types/canvas';
import { BaseNode } from './BaseNode';
import { useNodeStore } from '@/store/useNodeStore';

const QUICK_PRESETS = [
  'Pomodoro Focus Timer with circular progress & task list',
  'Crypto Orderbook & Live Swap Calculator Card',
  'AI Audio Synthesizer Pad with animated equalizer bars',
];

export const PromptNode: React.FC<{ node: CanvasNode<PromptNodeData> }> = ({ node }) => {
  const updateNodeData = useNodeStore((s) => s.updateNodeData);
  const spawnComponentNodeFromPrompt = useNodeStore((s) => s.spawnComponentNodeFromPrompt);
  const setEdgeAnimated = useNodeStore((s) => s.setEdgeAnimated);

  const promptValue = node?.data?.prompt ?? '';
  const modelValue = node?.data?.model ?? 'claude-3-7-sonnet';
  const isGenerating = Boolean(node?.data?.isGenerating);

  const triggerGeneration = useCallback(async () => {
    const promptText = promptValue.trim();
    if (!promptText || isGenerating) return;

    updateNodeData<PromptNodeData>(node.id, { isGenerating: true, lastError: null });
    const targetNodeId = spawnComponentNodeFromPrompt(node.id, promptText);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          model: modelValue,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Generation failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedCode = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedCode += chunk;

        updateNodeData<ComponentNodeData>(targetNodeId, {
          code: accumulatedCode,
          status: 'streaming',
        });
      }

      updateNodeData<ComponentNodeData>(targetNodeId, {
        status: 'ready',
      });
    } catch (err: any) {
      updateNodeData<PromptNodeData>(node.id, {
        lastError: err?.message || 'Failed to stream component',
      });
      updateNodeData<ComponentNodeData>(targetNodeId, {
        status: 'error',
        compileError: err?.message || 'Stream interrupted',
      });
    } finally {
      updateNodeData<PromptNodeData>(node.id, { isGenerating: false });
      setEdgeAnimated(node.id, targetNodeId, false);
    }
  }, [
    node.id,
    promptValue,
    modelValue,
    isGenerating,
    updateNodeData,
    spawnComponentNodeFromPrompt,
    setEdgeAnimated,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      triggerGeneration();
    }
  };

  if (!node || !node.data) return null;

  return (
    <BaseNode
      node={node}
      title="Prompt Synthesizer"
      badgeText="Generator"
      accentColor="indigo"
      hasOutputPort
    >
      <div className="flex h-full flex-col justify-between p-3.5">
        <div className="flex flex-1 flex-col gap-2">
          <textarea
            value={promptValue}
            onChange={(e) =>
              updateNodeData<PromptNodeData>(node.id, { prompt: e.target.value })
            }
            onKeyDown={handleKeyDown}
            placeholder="Describe an interactive React component to stream into a live sandbox..."
            className="w-full flex-1 resize-none rounded-xl border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-slate-100 placeholder-slate-500 focus:border-indigo-500/60 focus:outline-none"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <Wand2 className="h-3 w-3 shrink-0 text-indigo-400" />
            {QUICK_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  updateNodeData<PromptNodeData>(node.id, { prompt: preset })
                }
                className="shrink-0 rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 text-[10px] text-slate-400 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-200"
              >
                {preset.split(' ').slice(0, 3).join(' ')}…
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <select
              value={modelValue}
              onChange={(e) =>
                updateNodeData<PromptNodeData>(node.id, {
                  model: e.target.value as ModelOption,
                })
              }
              className="bg-transparent font-mono text-[11px] text-slate-200 focus:outline-none"
            >
              <option value="claude-3-7-sonnet" className="bg-[#0d0f17]">
                Claude 3.7 Sonnet
              </option>
              <option value="gpt-4o" className="bg-[#0d0f17]">
                GPT-4o Spatial
              </option>
              <option value="llama-3.3-70b-versatile" className="bg-[#0d0f17]">
                Llama 3.3 70B (Groq)
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={triggerGeneration}
            disabled={isGenerating || !promptValue.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-40 active:scale-95"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Streaming AST...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </BaseNode>
  );
};