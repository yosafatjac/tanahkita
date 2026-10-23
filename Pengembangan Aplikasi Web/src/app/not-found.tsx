import React from "react";
import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-200 text-amber-900 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full uppercase tracking-wider">
        Galat 404 — Halaman Tidak Ditemukan
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-4 tracking-tight">
        Alamat Rute Belum Terdaftar
      </h1>

      <p className="text-sm text-stone-600 mt-2 leading-relaxed">
        Halaman atau rute yang Anda tuju tidak ditemukan di sistem TanahKita. Silakan periksa kembali tautan Anda atau kembali ke halaman beranda.
      </p>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          ← Beranda
        </Link>
        <Link
          href="/katalog"
          className="px-5 py-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs border border-stone-200 transition-colors"
        >
          Lihat Katalog Demo [id]
        </Link>
      </div>
    </div>
  );
}
