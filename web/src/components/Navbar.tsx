"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-amber-950 text-amber-50 sticky top-0 z-50 shadow-md border-b border-amber-900/50">
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
                  Bukti Adat Papua
                </span>
              </div>
            </Link>
          </div>

          {/* Navigasi Desktop */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden sm:flex items-center space-x-1 sm:space-x-2"
          >
            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-amber-900/60 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
            >
              Eksplorasi Klaim
            </Link>
            <Link
              href="/daftar"
              className="px-3 py-2 rounded-md text-sm font-medium bg-amber-800 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors shadow-sm"
            >
              + Daftarkan Klaim Baru
            </Link>
          </nav>

          {/* Tombol Menu Mobile */}
          <div className="sm:hidden">
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
        <nav
          aria-label="Navigasi Seluler"
          className="sm:hidden px-4 pt-2 pb-4 space-y-2 bg-amber-950 border-t border-amber-900"
        >
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-amber-100 hover:bg-amber-900 hover:text-white"
          >
            Eksplorasi Klaim
          </Link>
          <Link
            href="/daftar"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium bg-amber-800 text-white hover:bg-amber-700"
          >
            + Daftarkan Klaim Baru
          </Link>
        </nav>
      )}
    </header>
  );
}
