'use client';

import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';

export const GridBackground: React.FC = () => {
  const minorPatternRef = useRef<SVGPatternElement>(null);
  const majorPatternRef = useRef<SVGPatternElement>(null);
  const minorDotRef = useRef<SVGCircleElement>(null);
  const majorDotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const updateGridTransform = (pan: { x: number; y: number }, zoom: number) => {
      const baseSpacing = 28;
      const scaledMinor = baseSpacing * zoom;
      const scaledMajor = baseSpacing * 5 * zoom;

      if (minorPatternRef.current) {
        minorPatternRef.current.setAttribute('x', `${pan.x % scaledMinor}`);
        minorPatternRef.current.setAttribute('y', `${pan.y % scaledMinor}`);
        minorPatternRef.current.setAttribute('width', `${scaledMinor}`);
        minorPatternRef.current.setAttribute('height', `${scaledMinor}`);
      }

      if (majorPatternRef.current) {
        majorPatternRef.current.setAttribute('x', `${pan.x % scaledMajor}`);
        majorPatternRef.current.setAttribute('y', `${pan.y % scaledMajor}`);
        majorPatternRef.current.setAttribute('width', `${scaledMajor}`);
        majorPatternRef.current.setAttribute('height', `${scaledMajor}`);
      }

      if (minorDotRef.current) {
        minorDotRef.current.setAttribute('r', `${Math.max(0.7, Math.min(1.6, 1.1 * zoom))}`);
      }

      if (majorDotRef.current) {
        majorDotRef.current.setAttribute('r', `${Math.max(1.2, Math.min(2.6, 1.8 * zoom))}`);
      }
    };

    const initial = useCanvasStore.getState().viewport;
    updateGridTransform(initial.pan, initial.zoom);

    return useCanvasStore.subscribe((state) => {
      updateGridTransform(state.viewport.pan, state.viewport.zoom);
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-[#07080c]">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: 'radial-gradient(circle at 50% 15%, rgba(79, 70, 229, 0.12) 0%, rgba(14, 165, 233, 0.04) 35%, transparent 70%)',
        }}
      />
      <svg className="h-full w-full">
        <defs>
          <pattern ref={minorPatternRef} id="nexus-minor-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle ref={minorDotRef} cx="1.5" cy="1.5" r="1.1" className="fill-white/[0.11]" />
          </pattern>
          <pattern ref={majorPatternRef} id="nexus-major-grid" width="140" height="140" patternUnits="userSpaceOnUse">
            <circle ref={majorDotRef} cx="1.5" cy="1.5" r="1.8" className="fill-indigo-400/25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nexus-minor-grid)" />
        <rect width="100%" height="100%" fill="url(#nexus-major-grid)" />
      </svg>
    </div>
  );
};
