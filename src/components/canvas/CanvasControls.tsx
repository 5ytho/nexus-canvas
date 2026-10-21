// src/components/canvas/CanvasControls.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Trash2,
  Command,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useNodeStore } from '@/store/useNodeStore';
import { screenToCanvas } from '@/hooks/useCanvasTransform';
import { CanvasNode } from '@/types/canvas';

export const CanvasControls: React.FC = () => {
  const [zoomPercent, setZoomPercent] = useState(95);
  const [coords, setCoords] = useState({ x: 120, y: 110 });
  const nodes = useNodeStore((s) => s.nodes);
  const addPromptNode = useNodeStore((s) => s.addPromptNode);
  const selectNode = useNodeStore((s) => s.selectNode);
  const autoLayoutNodes = useNodeStore((s) => s.autoLayoutNodes);
  const deleteSelectedNodes = useNodeStore((s) => s.deleteSelectedNodes);

  useEffect(() => {
    const sync = () => {
      const { viewport } = useCanvasStore.getState();
      setZoomPercent(Math.round(viewport.zoom * 100));
      setCoords({
        x: Math.round(-viewport.pan.x / viewport.zoom),
        y: Math.round(-viewport.pan.y / viewport.zoom),
      });
    };
    sync();
    return useCanvasStore.subscribe(sync);
  }, []);

  const handleAddPromptAtCenter = () => {
    const { viewport } = useCanvasStore.getState();
    const centerScreen = {
      x: window.innerWidth / 2 - 190,
      y: window.innerHeight / 2 - 140,
    };
    const canvasPoint = screenToCanvas(centerScreen, viewport);
    addPromptNode({
      x: Math.round(canvasPoint.x + (Math.random() * 40 - 20)),
      y: Math.round(canvasPoint.y + (Math.random() * 40 - 20)),
    });
  };

  const focusOnNode = (node: CanvasNode) => {
    selectNode(node.id);
    const zoom = 1;
    const panX = window.innerWidth / 2 - (node.position.x + node.dimensions.x / 2) * zoom;
    const panY = window.innerHeight / 2 - (node.position.y + node.dimensions.y / 2) * zoom;
    useCanvasStore.getState().setViewport({ pan: { x: panX, y: panY }, zoom });
  };

  const handleFitView = () => {
    if (nodes.length === 0) {
      useCanvasStore.getState().resetViewport();
      return;
    }
    const minX = Math.min(...nodes.map((n) => n.position.x));
    const minY = Math.min(...nodes.map((n) => n.position.y));
    const maxX = Math.max(...nodes.map((n) => n.position.x + n.dimensions.x));
    const maxY = Math.max(...nodes.map((n) => n.position.y + n.dimensions.y));

    const contentW = maxX - minX + 180;
    const contentH = maxY - minY + 180;
    const zoom = Math.min(
      1.1,
      Math.max(0.35, Math.min(window.innerWidth / contentW, window.innerHeight / contentH))
    );

    const panX = (window.innerWidth - (maxX + minX) * zoom) / 2;
    const panY = (window.innerHeight - (maxY + minY) * zoom) / 2;

    useCanvasStore.getState().setViewport({ pan: { x: panX, y: panY }, zoom });
  };

  return (
    <div onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
      {/* Top Left Brand & Telemetry Pill */}
      <div className="pointer-events-auto fixed top-5 left-5 z-50 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d0f17]/85 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 shadow-md shadow-indigo-500/30">
          <Sparkles className="h-4 w-4 text-white"/>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-white">Nexus Canvas</span>
            <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-indigo-300">
              v2.5 Free Runtime
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>
              X:{coords.x} Y:{coords.y}
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {nodes.length} Nodes
            </span>
          </div>
        </div>
      </div>

      {/* Top Right Shortcut Hint Bar */}
      <div className="pointer-events-none fixed top-5 right-5 z-50 hidden items-center gap-2 rounded-xl border border-white/10 bg-[#0d0f17]/80 px-3.5 py-2 text-xs text-slate-400 backdrop-blur-xl md:flex">
        <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
          Drag Canvas
        </span>
        <span>Pan</span>
        <span className="text-white/15">|</span>
        <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
          Double-Click
        </span>
        <span>New Node</span>
        <span className="text-white/15">|</span>
        <span className="flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
          <Command className="h-3 w-3"/> + Scroll
        </span>
        <span>Zoom</span>
      </div>

      {/* Bottom Center Control Dock */}
      <div className="pointer-events-auto fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0e1018]/90 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
        <button
          onClick={handleAddPromptAtCenter}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-95"
        >
          <Plus className="h-4 w-4"/>
          <span>New Prompt Node</span>
        </button>

        <div className="mx-1 h-5 w-[1px] bg-white/10" />

        <button
          onClick={() =>
            useCanvasStore
              .getState()
              .zoomAtCursor({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 0.85)
          }
          title="Zoom Out"
          className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <ZoomOut className="h-4 w-4"/>
        </button>

        <button
          onClick={() => useCanvasStore.getState().resetViewport()}
          title="Reset Camera to 100%"
          className="min-w-[54px] rounded-lg px-2 py-1 text-center font-mono text-xs font-medium text-slate-200 transition hover:bg-white/10"
        >
          {zoomPercent}%
        </button>

        <button
          onClick={() =>
            useCanvasStore
              .getState()
              .zoomAtCursor({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 1.15)
          }
          title="Zoom In"
          className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <ZoomIn className="h-4 w-4"/>
        </button>

        <button
          onClick={handleFitView}
          title="Fit All Nodes to Screen"
          className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="h-4 w-4"/>
        </button>

        <button
          onClick={() => {
            autoLayoutNodes();
            setTimeout(handleFitView, 50);
          }}
          title="Tidy & Auto-Align Nodes"
          className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-indigo-300"
        >
          <LayoutGrid className="h-4 w-4"/>
        </button>

        <div className="mx-1 h-5 w-[1px] bg-white/10" />

        <button
          onClick={deleteSelectedNodes}
          title="Delete Selected Node (Del)"
          className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-400"
        >
          <Trash2 className="h-4 w-4"/>
        </button>
      </div>

      {/* Bottom Right Interactive Spatial Radar */}
      <div className="pointer-events-auto fixed right-5 bottom-6 z-50 hidden h-28 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d14]/85 p-2 shadow-2xl backdrop-blur-xl lg:block">
        <div className="mb-1 flex items-center justify-between text-[10px] font-medium text-slate-400">
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3 text-indigo-400"/> Spatial Radar
          </span>
          <span className="font-mono text-[9px] text-slate-500">Click blip to jump</span>
        </div>
        <div className="relative h-20 w-full overflow-hidden rounded-lg border border-white/5 bg-black/50">
          {nodes.map((node) => {
            const left = Math.min(86, Math.max(4, (node.position.x + 300) / 20));
            const top = Math.min(78, Math.max(4, (node.position.y + 200) / 14));
            return (
              <button
                key={node.id}
                onClick={() => focusOnNode(node)}
                title={`Jump to ${node.type} node`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: node.type === 'prompt' ? '18px' : '24px',
                  height: node.type === 'prompt' ? '12px' : '16px',
                }}
                className={`absolute cursor-pointer rounded-[3px] transition-all hover:scale-125 ${
                  node.selected
                    ? 'border border-indigo-300 bg-indigo-500/70 shadow-[0_0_8px_rgba(99,102,241,0.9)]'
                    : node.type === 'prompt'
                    ? 'border border-amber-400/50 bg-amber-500/35'
                    : 'border border-emerald-400/50 bg-emerald-500/35'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};