// src/components/canvas/InfiniteCanvas.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useNodeStore } from '@/store/useNodeStore';
import { screenToCanvas } from '@/hooks/useCanvasTransform';
import { GridBackground } from './GridBackground';
import { CanvasControls } from './CanvasControls';
import { PromptNode } from '@/components/nodes/PromptNode';
import { ComponentNode } from '@/components/nodes/ComponentNode';

export const InfiniteCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformLayerRef = useRef<HTMLDivElement>(null);

  const nodes = useNodeStore((s) => s.nodes);
  const edges = useNodeStore((s) => s.edges);
  const selectNode = useNodeStore((s) => s.selectNode);
  const addPromptNode = useNodeStore((s) => s.addPromptNode);
  const deleteSelectedNodes = useNodeStore((s) => s.deleteSelectedNodes);

  const isSpacePressed = useCanvasStore((s) => s.isSpacePressed);
  const isPanning = useCanvasStore((s) => s.isPanning);

  // 1. 60 FPS Transient DOM updates
  useEffect(() => {
    const applyTransform = (pan: { x: number; y: number }, zoom: number) => {
      if (!transformLayerRef.current) return;
      transformLayerRef.current.style.transform = `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`;
    };

    const initial = useCanvasStore.getState().viewport;
    applyTransform(initial.pan, initial.zoom);

    return useCanvasStore.subscribe((state) => {
      applyTransform(state.viewport.pan, state.viewport.zoom);
    });
  }, []);

  // 2. Wheel Panning & Cursor-Centered Zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const store = useCanvasStore.getState();

      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = Math.exp(-e.deltaY * 0.0025);
        store.zoomAtCursor({ x: e.clientX, y: e.clientY }, zoomFactor);
      } else {
        store.panBy({ x: -e.deltaX, y: -e.deltaY });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // 3. Keyboard Shortcuts (Space, Delete/Backspace)
  useEffect(() => {
    const isTypingInInput = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return (
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTypingInInput(e.target)) {
        e.preventDefault();
        useCanvasStore.getState().setSpacePressed(true);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !isTypingInInput(e.target)) {
        deleteSelectedNodes();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        useCanvasStore.getState().setSpacePressed(false);
        useCanvasStore.getState().setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [deleteSelectedNodes]);

  // 4. Click & Drag Anywhere on Empty Canvas to Pan + Deselect
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;

    selectNode(null);
    useCanvasStore.getState().setIsPanning(true);

    let lastX = e.clientX;
    let lastY = e.clientY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - lastX;
      const dy = moveEvent.clientY - lastY;
      lastX = moveEvent.clientX;
      lastY = moveEvent.clientY;
      useCanvasStore.getState().panBy({ x: dx, y: dy });
    };

    const handlePointerUp = () => {
      useCanvasStore.getState().setIsPanning(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // 5. Double-Click Anywhere on Empty Canvas to Spawn a Prompt Node at Cursor
  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current) return;
    const { viewport } = useCanvasStore.getState();
    const canvasCoords = screenToCanvas({ x: e.clientX, y: e.clientY }, viewport);
    addPromptNode({
      x: Math.round(canvasCoords.x - 190),
      y: Math.round(canvasCoords.y - 40),
    });
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handleCanvasPointerDown}
      onDoubleClick={handleCanvasDoubleClick}
      className={`relative h-screen w-screen overflow-hidden select-none ${
        isPanning ? 'cursor-grabbing' : isSpacePressed ? 'cursor-grab' : 'cursor-grab'
      }`}
    >
      <GridBackground />
      <CanvasControls />

      <div
        ref={transformLayerRef}
        style={{ transformOrigin: '0 0', willChange: 'transform' }}
        className="pointer-events-none absolute top-0 left-0 h-full w-full"
      >
        <svg className="pointer-events-none visible absolute top-0 left-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {edges.map((edge) => {
            const source = nodes.find((n) => n.id === edge.sourceId);
            const target = nodes.find((n) => n.id === edge.targetId);
            if (!source || !target) return null;

            const startX = source.position.x + source.dimensions.x;
            const startY = source.position.y + source.dimensions.y / 2;
            const endX = target.position.x;
            const endY = target.position.y + target.dimensions.y / 2;
            const deltaX = Math.max(80, Math.abs(endX - startX) * 0.5);
            const pathData = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

            return (
              <g key={edge.id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke="url(#edge-gradient)"
                  strokeWidth={edge.animated ? 6 : 4}
                  strokeOpacity={0.2}
                />
                <path
                  d={pathData}
                  fill="none"
                  stroke="url(#edge-gradient)"
                  strokeWidth={2}
                  strokeDasharray={edge.animated ? '6 6' : undefined}
                />
              </g>
            );
          })}
        </svg>

        <div className="pointer-events-auto">
          {nodes.map((node) =>
            node.type === 'prompt' ? (
              <PromptNode key={node.id} node={node} />
            ) : (
              <ComponentNode key={node.id} node={node} />
            )
          )}
        </div>
      </div>
    </div>
  );
};