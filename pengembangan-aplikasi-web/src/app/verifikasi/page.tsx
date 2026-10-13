"use client";

import React, { useState } from "react";
import Link from "next/link";
import { mockClaims } from "@/data/mockClaims";
import { sha256File, sha256Text, compareHashes } from "@/lib/crypto";

export default function VerifikasiPage() {
  const [file, setFile] = useState<File | null>(null);
  const [computedFileHash, setComputedFileHash] = useState<string>("");
  const [isHashing, setIsHashing] = useState<boolean>(false);

  // Manual hash lookup
  const [searchHash, setSearchHash] = useState<string>("");
  const [foundClaim, setFoundClaim] = useState<typeof mockClaims[0] | null>(null);
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);

  // Elder OTP simulation
  const [elderOtp, setElderOtp] = useState<string>("");
  const [otpStatus, setOtpStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsHashing(true);

    try {
      const hash = await sha256File(selectedFile);
      setComputedFileHash(hash);
    } catch (err) {
      console.error(err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleSearchHash = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAttempted(true);

    const cleanInput = searchHash.trim().toLowerCase();
    if (!cleanInput) {
      setFoundClaim(null);
      return;
    }

    const matched = mockClaims.find(
      (c) =>
        c.nomorRegistrasi.toLowerCase().includes(cleanInput) ||
        c.dokumenBukti.some((doc) => doc.sha256.toLowerCase().includes(cleanInput)) ||
        c.auditChain.some(
          (block) =>
            block.currentHash.toLowerCase().includes(cleanInput) ||
            block.evidenceHash.toLowerCase().includes(cleanInput)
        )
    );

    setFoundClaim(matched || null);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Valid sample OTPs
    if (elderOtp.trim() === "741852" || elderOtp.trim() === "982314") {
      setOtpStatus("valid");
    } else {
      setOtpStatus("invalid");
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-stone-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div>
          <nav className="text-xs text-stone-500 mb-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Beranda</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-800 font-medium">Portal Uji Integritas Kripto</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Portal Verifikasi Bukti Digital & Keabsahan Hash
          </h1>
          <p className="mt-2 text-stone-600 text-sm max-w-3xl">
            Uji keaslian berkas tanah adat secara independen menggunakan algoritma <strong>SHA-256</strong> langsung di peramban Anda.
            Tidak ada dokumen yang dikirimkan ke server luar demi privasi hak ulayat.
          </p>
        </div>

        {/* Grid 2 Kolom Uji */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Box 1: Uji Live Hashing Berkas */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="p-2.5 bg-amber-100 text-amber-900 rounded-xl">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">1. Uji Berkas Dokumen (Live Web Crypto)</h2>
                  <p className="text-xs text-stone-500">Pilih berkas surat kesepakatan adat atau foto patok batu</p>
                </div>
              </div>

              <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-amber-700 bg-stone-50/50 transition-all">
                <input
                  type="file"
                  id="portal-file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="portal-file"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <svg className="w-10 h-10 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-amber-950 bg-amber-200/80 px-3.5 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
                    {file ? file.name : "Pilih Dokumen dari Komputer / Ponsel"}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {file ? `Ukuran: ${(file.size / 1024).toFixed(1)} KB` : "Didukung format PDF, PNG, JPG (Dihitung seketika)"}
                  </span>
                </label>
              </div>

              {isHashing ? (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl flex items-center space-x-2 text-xs text-amber-900 border border-amber-200">
                  <span className="inline-block w-4 h-4 border-2 border-amber-900 border-t-transparent rounded-full animate-spin"></span>
                  <span>Menghitung sidik jari SHA-256...</span>
                </div>
              ) : computedFileHash ? (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-700">Sidik Jari SHA-256 Berkas:</span>
                    <span className="text-emerald-700 font-medium">✓ Dihitung Lokal</span>
                  </div>
                  <div className="p-3 bg-stone-900 text-stone-100 rounded-xl font-mono text-[11px] break-all border border-stone-800">
                    {computedFileHash}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-normal">
                    Jika ada 1 huruf atau byte yang diubah di berkas ini, nilai hash 64-karakter di atas akan berubah total.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 text-[11px] text-stone-500">
              Standar: FIPS 180-4 SHA-256 • RFC 6234 • Bebas Kolisi Praktis
            </div>
          </div>

          {/* Box 2: Cocokkan Hash ke Catatan Register Adat */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">2. Pencarian Hash di Register Adat</h2>
                  <p className="text-xs text-stone-500">Masukkan nilai hash (lengkap atau potongan) untuk mencari klaim terkait</p>
                </div>
              </div>

              <form onSubmit={handleSearchHash} className="space-y-3">
                <div>
                  <label htmlFor="search-hash-input" className="block text-xs font-semibold text-stone-700 mb-1">
                    Hash SHA-256 / Potongan Karakter:
                  </label>
                  <input
                    id="search-hash-input"
                    type="text"
                    value={searchHash}
                    onChange={(e) => setSearchHash(e.target.value)}
                    placeholder="Contoh: c74f4bfa atau a89cf301..."
                    className="w-full text-xs font-mono p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition-colors"
                  >
                    Cek di Buku Besar Adat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchHash("c74f4bfa85a75cfddaaee94c2598321040375a0048e43485efca3743c72b2203");
                    }}
                    className="py-2 px-3 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200 transition-colors"
                  >
                    Gunakan Sampel Magal
                  </button>
                </div>
              </form>

              {searchAttempted && (
                <div className="mt-5">
                  {foundClaim ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>DITEMUKAN DI REGISTER TANAHKITA:</span>
                      </div>
                      <p className="text-sm font-bold text-stone-900">{foundClaim.marga}</p>
                      <div className="text-xs text-stone-600 space-y-0.5">
                        <p><strong>Nomor Registrasi:</strong> {foundClaim.nomorRegistrasi}</p>
                        <p><strong>Kepala Marga / Kuasa Adat:</strong> {foundClaim.kepalaMarga}</p>
                        <p><strong>Lokasi:</strong> Distrik {foundClaim.distrik}, {foundClaim.kampung}</p>
                        <p><strong>Luas Wilayah:</strong> {foundClaim.luasHektar} Hektar</p>
                        <p><strong>Status:</strong> {foundClaim.status}</p>
                      </div>
                      <div className="pt-2">
                        <Link
                          href={`/klaim/${foundClaim.id}`}
                          className="inline-block text-xs font-bold text-emerald-900 bg-emerald-200/80 px-3 py-1.5 rounded-lg hover:bg-emerald-300 transition-colors"
                        >
                          Buka Detail Klaim & Rantai Audit →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-100 border border-stone-300 rounded-xl text-xs text-stone-600">
                      <p className="font-semibold text-stone-800">Hash Tidak Ditemukan</p>
                      <p className="mt-1">
                        Tidak ada catatan register atau blok rantai audit yang cocok dengan string di atas. Pastikan karakter hash sesuai.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 text-[11px] text-stone-500">
              Terintegrasi dengan 4 Register Wilayah Adat Mimika
            </div>
          </div>
        </div>

        {/* Box 3: Simulator Otorisasi Tetua Adat (CSPRNG OTP) */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-3 mb-2">
              <span className="p-2 bg-stone-800 text-amber-300 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </span>
              <h2 className="text-lg font-bold text-stone-900">
                3. Verifikasi Otorisasi Tetua Adat (CSPRNG Token / OTP)
              </h2>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Pada musyawarah batas adat, tetua marga yang tidak menggunakan smartphone diberikan token angka 6-digit yang dibangkitkan dari algoritma <strong>CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)</strong> via SMS satelit / radio komunitas.
            </p>

            <form onSubmit={handleVerifyOtp} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <input
                type="text"
                maxLength={6}
                value={elderOtp}
                onChange={(e) => {
                  setElderOtp(e.target.value);
                  setOtpStatus("idle");
                }}
                placeholder="Masukkan 6-digit OTP (Coba: 741852)"
                className="font-mono text-sm tracking-widest px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700 w-full sm:w-72"
              />
              <button
                type="submit"
                className="py-2.5 px-5 rounded-lg bg-amber-900 text-white text-xs font-semibold hover:bg-amber-950 transition-colors"
              >
                Validasi Token Musyawarah
              </button>
            </form>

            {otpStatus === "valid" && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-950 flex items-center space-x-2">
                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Token Sah!</strong> Terverifikasi sebagai mandat Tetua Adat Suku Amungme (Wilayah Tembagapura). Musyawarah diakui.</span>
              </div>
            )}

            {otpStatus === "invalid" && (
              <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-950 flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Token tidak terdaftar atau telah kedaluwarsa. Gunakan token sampel <code>741852</code> atau <code>982314</code>.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
