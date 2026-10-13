"use client";

import React, { useState } from "react";

interface HashViewerProps {
  hash: string;
  label?: string;
  compact?: boolean;
}

export default function HashViewer({ hash, label = "Sidik Jari SHA-256", compact = true }: HashViewerProps) {
  const [copied, setCopied] = useState(false);

  const displayHash = compact && hash.length > 20
    ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
    : hash;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback jika clipboard API dibatasi
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-1 text-xs font-mono">
      {label && <span className="text-stone-500 font-sans font-medium text-[11px]">{label}</span>}
      <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800/80 px-2.5 py-1.5 rounded border border-stone-200 dark:border-stone-700">
        <code className="text-amber-900 dark:text-amber-200 select-all font-semibold" title={hash}>
          {displayHash}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="ml-auto text-xs px-2 py-0.5 rounded bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-100 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500"
          aria-label={`Salin nilai hash ${hash}`}
        >
          {copied ? "✓ Tersalin!" : "Salin"}
        </button>
      </div>
    </div>
  );
}
