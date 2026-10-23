"use client";

import React from "react";

export default function ErrorKatalog({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  const handleRetry = retry ?? reset ?? (() => window.location.reload());

  return (
    <div
      role="alert"
      className="my-8 rounded-2xl border border-red-200 bg-red-50 p-6 sm:p-8 text-red-950 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700 font-bold">
          !
        </span>
        <h2 className="text-xl font-bold">Gagal memuat katalog wilayah ulayat</h2>
      </div>
      <p className="text-sm text-red-800 mb-2">
        <strong>Pesan Galat:</strong> {error.message}
      </p>
      {error.digest && (
        <p className="text-xs font-mono text-red-600 mb-4 bg-red-100/60 p-2 rounded-lg">
          Kode Digest: {error.digest}
        </p>
      )}
      <button
        type="button"
        onClick={() => handleRetry()}
        className="mt-2 inline-flex items-center rounded-xl bg-red-800 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-red-900 transition-colors"
      >
        Coba lagi
      </button>
    </div>
  );
}
