import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MOCK_KATALOG } from "@/data/mockKatalog";
import FormAksesArsip from "@/components/FormAksesArsip";

export const metadata: Metadata = {
  title: "Katalog Berkas Ulayat — TanahKita",
};

export default function KatalogIndexPage() {
  const validIds = MOCK_KATALOG.map((item) => item.id);
  const totalTerverifikasi = MOCK_KATALOG.filter(
    (item) => item.statusVerifikasi === "Terverifikasi Adat"
  ).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      {/* Breadcrumb Nav */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-xs text-stone-500">
          <li>
            <Link href="/" className="hover:text-amber-800 underline">
              Beranda
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-stone-800">Portal Akses Berkas Adat (Rute Dinamis)</li>
        </ol>
      </nav>

      {/* Header Banner - Zero Knowledge / Kerahasiaan Penuh */}
      <section className="bg-gradient-to-br from-stone-950 via-amber-950 to-stone-900 text-white rounded-3xl p-6 sm:p-10 mb-8 border border-amber-900/60 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-600/30 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 bg-amber-900/60 border border-amber-600/40 text-amber-200 text-xs px-3.5 py-1 rounded-full mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Kerahasiaan Tertutup • {MOCK_KATALOG.length} Berkas Terdaftar ({totalTerverifikasi} Terverifikasi Adat)
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
          Portal Berkas Ulayat Terproteksi
        </h1>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl mx-auto">
          Sesuai norma hukum adat Papua, <strong>tidak ada daftar tanah orang lain yang ditampilkan atau direkomendasikan</strong>. Anda hanya dapat membuka berkas tanah ulayat milik marga Anda jika mengetahui <strong>Nomor Registrasi Kunci ID</strong> yang sah.
        </p>
      </section>

      {/* Form Input Akses Rahasia (Client Component) */}
      <FormAksesArsip validIds={validIds} />
    </div>
  );
}
