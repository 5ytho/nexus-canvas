import { InfiniteCanvas } from '@/components/canvas/InfiniteCanvas';

export default function NexusCanvasPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#07080d] text-slate-100 antialiased">
      <InfiniteCanvas />
    </main>
  );
}
