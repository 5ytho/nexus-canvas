import { useCallback } from 'react';
import { Point, Viewport } from '@/types/canvas';

export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 2.5;

export function screenToCanvas(screenPoint: Point, viewport: Viewport): Point {
  return {
    x: (screenPoint.x - viewport.pan.x) / viewport.zoom,
    y: (screenPoint.y - viewport.pan.y) / viewport.zoom,
  };
}

export function canvasToScreen(canvasPoint: Point, viewport: Viewport): Point {
  return {
    x: canvasPoint.x * viewport.zoom + viewport.pan.x,
    y: canvasPoint.y * viewport.zoom + viewport.pan.y,
  };
}

export function computeZoomToCursor(
  cursor: Point,
  viewport: Viewport,
  nextZoomUnclamped: number
): Viewport {
  const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoomUnclamped));
  const oldZoom = viewport.zoom;

  const newPanX = cursor.x - (cursor.x - viewport.pan.x) * (newZoom / oldZoom);
  const newPanY = cursor.y - (cursor.y - viewport.pan.y) * (newZoom / oldZoom);

  return {
    pan: { x: newPanX, y: newPanY },
    zoom: newZoom,
  };
}

export function useCanvasTransform() {
  const toCanvas = useCallback(
    (screenPoint: Point, viewport: Viewport) => screenToCanvas(screenPoint, viewport),
    []
  );

  const toScreen = useCallback(
    (canvasPoint: Point, viewport: Viewport) => canvasToScreen(canvasPoint, viewport),
    []
  );

  return { screenToCanvas: toCanvas, canvasToScreen: toScreen, computeZoomToCursor };
}
