"use client"; // Error Boundary di Next.js App Router wajib berupa Client Component

import { useEffect } from "react";
import Link from "next/link";

export default function GalatItem({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Catat galat tak terduga (seperti P2025 saat item sudah dihapus di tab lain)
    console.error("Galat segmen /katalog/[id]:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto my-12 max-w-xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm"
    >
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-800">
        Error Boundary Segmen /katalog/[id]
      </span>
      <h2 className="mt-4 text-xl font-extrabold text-stone-900">
        Item gagal diproses
      </h2>
      <p className="mt-2 text-sm text-stone-600 leading-relaxed">
        Terjadi kesalahan tak terduga saat memproses arsip wilayah ulayat ini
        (misalnya data sudah dihapus dari sesi atau tab lain). Silakan muat ulang
        atau kembali ke daftar katalog.
      </p>
      <p className="mt-3 rounded-xl bg-stone-50 border border-stone-200 px-3 py-2 font-mono text-xs text-stone-700">
        Kode rujukan: {error.digest ?? "tidak ada"}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-amber-800 hover:bg-amber-900 px-4 py-2 text-xs font-semibold text-white transition shadow-xs"
        >
          Coba lagi
        </button>
        <Link
          href="/katalog"
          className="rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-700 transition"
        >
          ← Kembali ke Katalog Wilayah Ulayat
        </Link>
      </div>
    </div>
  );
}
