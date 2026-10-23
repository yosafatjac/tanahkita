"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import CryptoExplainerModal from "@/components/CryptoExplainerModal";
import TautanNav, { type Tautan } from "@/components/TautanNav";

const TAUTAN_UTAMA: Tautan[] = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog [id]" },
  { href: "/tentang", label: "Tentang" },
  { href: "/verifikasi", label: "Uji Hash" },
  { href: "/edukasi", label: "Hukum & Kripto" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cryptoModalOpen, setCryptoModalOpen] = useState(false);

  return (
    <>
      <header className="bg-amber-950 text-amber-50 sticky top-0 z-40 shadow-md border-b border-amber-900/50">
        {/* Tautan Lewati ke Konten Utama (Aksesibilitas Keyboard) */}
        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-3 focus:bg-amber-800 focus:text-white focus:rounded focus:outline focus:outline-2 focus:outline-amber-300 font-medium"
        >
          Lewati ke Konten Utama
        </a>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Identitas */}
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex items-center space-x-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-md p-1"
                aria-label="TanahKita Beranda"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold shadow-inner">
                  {/* Ikon Gunung/Tanah Adat */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-amber-200"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                    <path d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg tracking-tight text-white leading-tight">
                    TanahKita
                  </span>
                  <span className="text-[10px] text-amber-300 font-medium tracking-wider uppercase">
                    Bukti Hak Adat Papua • Mimika
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigasi Desktop */}
            <nav
              aria-label="Navigasi Utama"
              className="hidden md:flex items-center space-x-1 lg:space-x-2"
            >
              <Suspense fallback={null}>
                <TautanNav tautan={TAUTAN_UTAMA} />
              </Suspense>

              {/* Tombol Edukasi Kripto Modal */}
              <button
                type="button"
                onClick={() => setCryptoModalOpen(true)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-stone-900/80 text-amber-300 border border-amber-800/60 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400 flex items-center space-x-1.5 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Cara Kerja Kripto</span>
              </button>

              <Link
                href="/daftar"
                className="ml-2 px-3.5 py-2 rounded-md text-sm font-semibold bg-amber-800 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors shadow-sm"
              >
                + Daftarkan Klaim
              </Link>
            </nav>

            {/* Tombol Menu Mobile */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setCryptoModalOpen(true)}
                className="p-1.5 rounded-md text-xs font-medium bg-stone-900 text-amber-300 border border-amber-800/60"
                aria-label="Lihat Penjelasan Kripto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-amber-200 hover:text-white hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Panel Menu Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-amber-900 bg-amber-950 px-4 pt-2 pb-4 space-y-2">
            <Suspense fallback={null}>
              <TautanNav
                tautan={TAUTAN_UTAMA}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </Suspense>
            <div className="pt-2">
              <Link
                href="/daftar"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-md text-base font-semibold bg-amber-800 text-white hover:bg-amber-700 shadow-sm"
              >
                + Daftarkan Klaim Baru
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Modal Edukasi Kripto Global */}
      <CryptoExplainerModal
        isOpen={cryptoModalOpen}
        onClose={() => setCryptoModalOpen(false)}
      />
    </>
  );
}
