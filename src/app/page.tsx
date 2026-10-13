"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MOCK_CLAIMS } from "../data/mockClaims";
import ClaimCard from "../components/ClaimCard";
import { ClaimStatus } from "../types/claim";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredClaims = MOCK_CLAIMS.filter((c) => {
    const matchesSearch =
      c.marga.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.distrik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.kepalaMarga.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nomorRegistrasi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
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

      {/* 4. Panel Filter & Pencarian */}
      <section id="daftar-klaim" aria-labelledby="judul-eksplorasi" className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 id="judul-eksplorasi" className="text-xl sm:text-2xl font-bold text-stone-900">
              Daftar Bukti Penguasaan Tanah Adat
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Pencatatan terbuka untuk verifikasi integritas oleh masyarakat, tetua adat, dan pendamping.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Input Pencarian */}
            <div className="relative">
              <label htmlFor="search-input" className="sr-only">Cari berdasarkan marga atau distrik</label>
              <input
                id="search-input"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari marga, distrik, no reg..."
                className="w-full sm:w-64 pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <svg
                className="w-4 h-4 text-stone-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Status */}
            <div>
              <label htmlFor="status-filter" className="sr-only">Filter Berdasarkan Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="TERVERIFIKASI_ADAT">Terverifikasi Adat</option>
                <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
                <option value="DALAM_SENGKETA">Dalam Sengketa</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Grid Kartu Klaim Responsif (1 col mobile, 2 col tablet, 3 col desktop) */}
        {filteredClaims.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClaims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <svg
              className="w-12 h-12 text-stone-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-base font-bold text-stone-800">Tidak ada klaim yang cocok</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Tidak ditemukan data klaim tanah adat dengan kata kunci &quot;{searchTerm}&quot;. Coba periksa ejaan atau ubah filter status.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
              className="mt-4 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 rounded-md hover:bg-amber-200"
            >
              Reset Filter
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
