'use client';

import React from 'react';
import { GripHorizontal, X } from 'lucide-react';
import { CanvasNode } from '@/types/canvas';
import { useNodeStore } from '@/store/useNodeStore';
import { useDrag } from '@/hooks/useDrag';

interface BaseNodeProps {
  node: CanvasNode;
  title: string;
  badgeText?: string;
  accentColor?: 'indigo' | 'emerald';
  headerActions?: React.ReactNode;
  hasInputPort?: boolean;
  hasOutputPort?: boolean;
  children: React.ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  node,
  title,
  badgeText,
  accentColor = 'indigo',
  headerActions,
  hasInputPort = false,
  hasOutputPort = false,
  children,
}) => {
  const updateNodePosition = useNodeStore((s) => s.updateNodePosition);
  const selectNode = useNodeStore((s) => s.selectNode);
  const removeNode = useNodeStore((s) => s.removeNode);

  const { handlePointerDown } = useDrag({
    onDragStart: () => selectNode(node.id),
    onDrag: (nextPos) => updateNodePosition(node.id, nextPos),
  });

  const ringStyles = node.selected
    ? accentColor === 'indigo'
      ? 'border-indigo-400/60 shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_25px_70px_-15px_rgba(79,70,229,0.35)]'
      : 'border-emerald-400/60 shadow-[0_0_0_1px_rgba(52,211,153,0.35),0_25px_70px_-15px_rgba(16,185,129,0.3)]'
    : 'border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.75)] hover:border-white/20';

  return (
    <div
      style={{
        transform: `translate3d(${node.position.x}px, ${node.position.y}px, 0)`,
        width: `${node.dimensions.x}px`,
        height: `${node.dimensions.y}px`,
        zIndex: node.zIndex || 1,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
      className={`group/node absolute top-0 left-0 flex flex-col rounded-2xl border bg-[#0d0f17]/95 backdrop-blur-2xl transition-shadow duration-150 ${ringStyles}`}
    >
      {hasInputPort && (
        <div className="pointer-events-none absolute top-1/2 -left-2 z-20 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-400/60 bg-[#090a10] shadow-[0_0_10px_rgba(16,185,129,0.6)]">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
      )}

      {hasOutputPort && (
        <div className="pointer-events-none absolute top-1/2 -right-2 z-20 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border border-indigo-400/60 bg-[#090a10] shadow-[0_0_10px_rgba(99,102,241,0.6)]">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
        </div>
      )}

      <div
        onPointerDown={(e) => handlePointerDown(e, node.position)}
        className="flex cursor-grab items-center justify-between border-b border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5 select-none active:cursor-grabbing rounded-t-2xl"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <GripHorizontal className="h-4 w-4 shrink-0 text-slate-500 group-hover/node:text-slate-300" />
          <span className="truncate text-xs font-semibold tracking-tight text-slate-100">
            {title}
          </span>
          {badgeText && (
            <span
              className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium ${
                accentColor === 'indigo'
                  ? 'border border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                  : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
          {headerActions}
          <button
            onClick={() => removeNode(node.id)}
            title="Remove Node"
            className="rounded-lg p-1 text-slate-500 transition hover:bg-white/10 hover:text-rose-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-b-2xl">{children}</div>
    </div>
  );
};
