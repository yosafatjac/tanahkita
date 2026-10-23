import React from "react";
import Link from "next/link";
import { MOCK_CLAIMS } from "@/data/mockClaims";
import RingkasanArsip from "@/components/RingkasanArsip";
import EksplorasiKlaim from "@/components/EksplorasiKlaim";

export default function HomePage() {
  const totalLuas = MOCK_CLAIMS.reduce((acc, curr) => acc + curr.luasHektar, 0);
  const totalVerified = MOCK_CLAIMS.filter((c) => c.status === "TERVERIFIKASI_ADAT").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-br from-amber-950 via-amber-900 to-stone-900 text-white rounded-2xl p-6 sm:p-10 mb-8 shadow-lg border border-amber-800/40">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-800/60 border border-amber-600/40 text-amber-200 text-xs px-3 py-1 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Sistem Pendokumentasian Ulayat Papua (Timika & Mimika)
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4 text-white">
            Dokumentasikan Batas Adat, <br className="hidden sm:inline" />
            Kunci Integritas Bukti dengan Kriptografi
          </h1>
          <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed mb-6">
            Batas adat lisan rawan sengketa dan rentan manipulasi sepihak. TanahKita mengabadikan
            sidik jari digital (SHA-256) surat adat, foto patok, dan persetujuan tetua adat dalam
            riwayat rantai yang tak dapat diubah diam-diam.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/daftar"
              className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              + Catat Klaim Tanah Adat
            </Link>
            <Link
              href="/verifikasi"
              className="px-4 py-2.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-amber-300 border border-amber-600/50 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 flex items-center space-x-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Uji Hash Dokumen</span>
            </Link>
            <a
              href="#daftar-klaim"
              className="px-4 py-2.5 rounded-lg bg-amber-900/60 hover:bg-amber-900 text-amber-200 border border-amber-700/60 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Jelajahi Bukti Terdaftar ↓
            </a>
          </div>
        </div>
      </section>

      {/* 2. Kartu Statistik Ringkas */}
      <section aria-labelledby="judul-statistik" className="mb-8">
        <h2 id="judul-statistik" className="sr-only">Statistik Ringkasan Klaim</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs text-stone-500 font-medium block">Total Klaim Terdaftar</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              {MOCK_CLAIMS.length} <span className="text-xs font-normal text-stone-400">Klaim Marga</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Tersebar di 4 distrik Kabupaten Mimika</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs text-stone-500 font-medium block">Total Luas Ulayat Terdata</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">
              {totalLuas.toFixed(1)} <span className="text-xs font-normal text-stone-400">Hektar</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Dokumen patok terkunci kriptografi</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs text-stone-500 font-medium block">Tervalidasi Tetua Adat</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1">
              {totalVerified} <span className="text-xs font-normal text-stone-400">dari {MOCK_CLAIMS.length} Klaim</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Memiliki jejak bukti kesepakatan sah</p>
          </div>
        </div>
      </section>

      {/* 3. Baris Navigasi Fitur Tambahan (Edukasi & Portal Uji) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Uji Integritas Dokumen Adat (Web Crypto)
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              Unggah berkas untuk menghitung live SHA-256 dan memverifikasi keaslian terhadap register adat.
            </p>
          </div>
          <Link
            href="/verifikasi"
            className="ml-4 px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 flex-shrink-0 transition-colors"
          >
            Buka Portal →
          </Link>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Landasan Hukum & Kriptografi
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Pelajari hak ulayat Papua, penegasan non-BPN, dan matriks Hash vs Enkripsi vs Encoding.
            </p>
          </div>
          <Link
            href="/edukasi"
            className="ml-4 px-3 py-1.5 rounded-lg bg-amber-900 text-white text-xs font-semibold hover:bg-amber-950 flex-shrink-0 transition-colors"
          >
            Baca Panduan →
          </Link>
        </div>
      </div>

      {/* 4. Server Component Ringkasan Arsip Terbaru (Bagian 4 Langkah 4) */}
      <RingkasanArsip />

      {/* 5. Client Component Eksplorasi & Pencarian Klaim */}
      <EksplorasiKlaim />
    </div>
  );
}
