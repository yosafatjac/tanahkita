import React from "react";
import Link from "next/link";
import { MOCK_KATALOG } from "../../../data/mockKatalog";

export default function KatalogNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full uppercase tracking-wider">
        Galat 404 — Parameter Dinamis Tidak Sah
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-4 tracking-tight">
        Wilayah Adat Tidak Ditemukan
      </h1>

      <p className="text-sm text-stone-600 mt-2 leading-relaxed">
        ID katalog yang Anda minta tidak terdaftar di dalam sistem pencatatan wilayah adat TanahKita
        atau melanggar pola penomoran resmi.
      </p>

      {/* Suggested Valid IDs */}
      <div className="mt-8 bg-stone-50 border border-stone-200 rounded-xl p-5 text-left">
        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
          💡 Rekomendasi ID Katalog yang Sah:
        </span>
        <div className="flex flex-wrap gap-2">
          {MOCK_KATALOG.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href={`/katalog/${item.id}`}
              className="px-3 py-1 bg-white border border-stone-300 hover:border-amber-600 rounded-lg text-xs font-mono text-amber-900 font-semibold transition-colors shadow-sm"
            >
              /katalog/{item.id} ({item.nama})
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/katalog"
          className="px-5 py-2.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          ← Kembali ke Katalog Wilayah
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs border border-stone-200 transition-colors"
        >
          Beranda
        </Link>
      </div>
    </div>
  );
}
