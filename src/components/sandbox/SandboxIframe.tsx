'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getSandboxHtml } from './sandbox-template';
import { SandboxInboundMessage, SandboxOutboundMessage } from '@/types/canvas';

interface SandboxIframeProps {
  code: string;
  isStreaming: boolean;
  onCompileError?: (err: string | null) => void;
}

export const SandboxIframe: React.FC<SandboxIframeProps> = ({
  code,
  isStreaming,
  onCompileError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const srcDoc = useMemo(() => getSandboxHtml(), []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<SandboxInboundMessage>) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'SANDBOX_READY') {
        setIsReady(true);
      } else if (data.type === 'COMPILE_SUCCESS') {
        onCompileError?.(null);
      } else if (data.type === 'COMPILE_ERROR') {
        if (!isStreaming) {
          onCompileError?.(data.error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isStreaming, onCompileError]);

  useEffect(() => {
    if (!isReady || !iframeRef.current?.contentWindow || !code.trim()) return;

    const message: SandboxOutboundMessage = {
      type: 'COMPILE_CODE',
      code,
      isStreaming,
    };

    iframeRef.current.contentWindow.postMessage(message, '*');
  }, [code, isReady, isStreaming]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-b-2xl bg-[#07080d]">
      <iframe
        ref={iframeRef}
        title="Nexus Isolated Component Sandbox"
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="h-full w-full border-0 bg-transparent"
      />
    </div>
  );
};
