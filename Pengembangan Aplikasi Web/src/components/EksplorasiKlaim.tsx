"use client";

import React, { useState } from "react";
import { MOCK_CLAIMS } from "@/data/mockClaims";
import ClaimCard from "@/components/ClaimCard";

export default function EksplorasiKlaim() {
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

  return (
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
            <label htmlFor="search-input" className="sr-only">
              Cari berdasarkan marga atau distrik
            </label>
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filter Status */}
          <div>
            <label htmlFor="status-filter" className="sr-only">
              Filter Berdasarkan Status
            </label>
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

      {/* Grid Kartu Klaim Responsif */}
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-base font-bold text-stone-800">Tidak ada klaim yang cocok</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Tidak ditemukan data klaim tanah adat dengan kata kunci &quot;{searchTerm}&quot;. Coba periksa ejaan atau ubah filter status.
          </p>
          <button
            type="button"
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
  );
}
