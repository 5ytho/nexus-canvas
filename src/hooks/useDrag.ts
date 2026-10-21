import { useCallback, useRef } from 'react';
import { Point } from '@/types/canvas';
import { useCanvasStore } from '@/store/useCanvasStore';

interface UseDragOptions {
  onDrag: (nextPosition: Point) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function useDrag({ onDrag, onDragStart, onDragEnd }: UseDragOptions) {
  const dragOriginRef = useRef<{
    startMouse: Point;
    startNodePos: Point;
  } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, currentNodePos: Point) => {
      if (e.button !== 0 || useCanvasStore.getState().isSpacePressed) return;
      e.stopPropagation();

      onDragStart?.();
      dragOriginRef.current = {
        startMouse: { x: e.clientX, y: e.clientY },
        startNodePos: { ...currentNodePos },
      };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!dragOriginRef.current) return;
        const zoom = useCanvasStore.getState().viewport.zoom;
        const dx = (moveEvent.clientX - dragOriginRef.current.startMouse.x) / zoom;
        const dy = (moveEvent.clientY - dragOriginRef.current.startMouse.y) / zoom;

        onDrag({
          x: Math.round(dragOriginRef.current.startNodePos.x + dx),
          y: Math.round(dragOriginRef.current.startNodePos.y + dy),
        });
      };

      const handlePointerUp = () => {
        dragOriginRef.current = null;
        onDragEnd?.();
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [onDrag, onDragStart, onDragEnd]
  );

  return { handlePointerDown };
}
