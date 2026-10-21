import { create } from 'zustand';
import { Point, Viewport } from '@/types/canvas';
import { computeZoomToCursor, MAX_ZOOM, MIN_ZOOM } from '@/hooks/useCanvasTransform';

interface CanvasStoreState {
  viewport: Viewport;
  isSpacePressed: boolean;
  isPanning: boolean;
  setPan: (pan: Point) => void;
  panBy: (delta: Point) => void;
  zoomAtCursor: (cursor: Point, zoomDeltaFactor: number) => void;
  setViewport: (viewport: Viewport) => void;
  setSpacePressed: (pressed: boolean) => void;
  setIsPanning: (panning: boolean) => void;
  resetViewport: () => void;
}

export const useCanvasStore = create<CanvasStoreState>((set, get) => ({
  viewport: {
    pan: { x: 120, y: 110 },
    zoom: 0.95,
  },
  isSpacePressed: false,
  isPanning: false,

  setPan: (pan) =>
    set((state) => ({
      viewport: { ...state.viewport, pan },
    })),

  panBy: (delta) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        pan: {
          x: state.viewport.pan.x + delta.x,
          y: state.viewport.pan.y + delta.y,
        },
      },
    })),

  zoomAtCursor: (cursor, zoomDeltaFactor) => {
    const current = get().viewport;
    const nextZoom = current.zoom * zoomDeltaFactor;
    const updated = computeZoomToCursor(cursor, current, nextZoom);
    set({ viewport: updated });
  },

  setViewport: (viewport) =>
    set({
      viewport: {
        pan: viewport.pan,
        zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, viewport.zoom)),
      },
    }),

  setSpacePressed: (isSpacePressed) => set({ isSpacePressed }),
  setIsPanning: (isPanning) => set({ isPanning }),

  resetViewport: () =>
    set({
      viewport: { pan: { x: 120, y: 110 }, zoom: 1 },
    }),
}));
