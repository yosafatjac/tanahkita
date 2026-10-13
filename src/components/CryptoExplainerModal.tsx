"use client";

import React, { useState } from "react";

interface CryptoExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CryptoExplainerModal({
  isOpen,
  onClose,
}: CryptoExplainerModalProps) {
  const [activeTab, setActiveTab] = useState<"sha256" | "csprng" | "ledger">("sha256");

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-amber-700/60 rounded-lg text-amber-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-stone-100">
                Cara Kerja Kriptografi TanahKita
              </h2>
              <p className="text-xs text-stone-400">
                Prinsip Kriptografi Standar untuk Integritas Bukti Tanah Adat Mimika
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup jendela modal"
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 space-x-2">
          <button
            onClick={() => setActiveTab("sha256")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "sha256"
                ? "border-amber-800 text-amber-900"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            1. SHA-256 (Sidik Jari)
          </button>
          <button
            onClick={() => setActiveTab("csprng")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "csprng"
                ? "border-amber-800 text-amber-900"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            2. CSPRNG (Token Tetua)
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "ledger"
                ? "border-amber-800 text-amber-900"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            3. Rantai Audit (Hash Chain)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-stone-800 text-sm leading-relaxed space-y-4">
          {activeTab === "sha256" && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-950">
                <p className="font-semibold mb-1">Kenapa Dokumen Adat Tidak Boleh Diubah?</p>
                <p className="text-xs">
                  Buku kesepakatan adat dan foto patok batu rawan disunting atau diganti tanggalnya oleh oknum mafia tanah.
                  Dengan <strong>SHA-256</strong>, setiap berkas memiliki sidik jari sepanjang 64 karakter heksadesimal yang unik.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-stone-900">Efek Avalanche (Longsor Kriptografi):</h3>
                <p className="text-xs text-stone-600">
                  Perubahan 1 huruf atau 1 pixel saja pada surat adat akan menghasilkan hash yang berubah total lebih dari 50%:
                </p>
                <div className="bg-stone-900 text-stone-100 p-3 rounded-lg font-mono text-xs space-y-1">
                  <div>
                    <span className="text-stone-400">Input A:</span> &quot;Batas Kali Kopi Marga Magal&quot;
                  </div>
                  <div className="text-amber-400 break-all">
                    → c74f4bfa85a75cfddaaee94c25...
                  </div>
                  <div className="pt-1">
                    <span className="text-stone-400">Input B:</span> &quot;Batas Kali Kopi Marga Maga<strong className="text-red-400 underline">k</strong>&quot;
                  </div>
                  <div className="text-emerald-400 break-all">
                    → 4df869a0397cc961b7b7c25e40...
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-3 text-xs text-stone-600">
                <span className="font-semibold text-stone-800">Catatan Akademik:</span> Hashing bersifat satu arah (one-way function), berbeda dari enkripsi yang bisa didekripsi dengan kunci, dan bukan sekadar encoding (seperti Base64) yang tidak memiliki jaminan keamanan.
              </div>
            </div>
          )}

          {activeTab === "csprng" && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950">
                <p className="font-semibold mb-1">Pembangkit Token Tetua Adat (CSPRNG)</p>
                <p className="text-xs">
                  Untuk memverifikasi klaim di balai musyawarah, tetua adat diberikan token verifikasi dan OTP satu kali pakai.
                  Token ini di-generate menggunakan modul standar <code>secrets</code> Python / <code>crypto.getRandomValues</code> di browser (CSPRNG).
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-stone-900">Mengapa Bukan <code>random()</code> Biasa?</h3>
                <p className="text-xs text-stone-600">
                  Fungsi <code>Math.random()</code> atau <code>random.randint()</code> menggunakan algoritma pseudo-random terprediksi (Mersenne Twister). Penyerang dapat menebak token berikutnya jika mengetahui seed.
                  CSPRNG memanfaatkan entropi perangkat keras sistem operasi sehingga secara statistik mustahil diprediksi penyerang.
                </p>
              </div>

              <div className="bg-stone-100 rounded-lg p-3 text-xs font-mono space-y-1 text-stone-800">
                <div><strong>Token Verifikasi (256-bit):</strong></div>
                <div className="text-emerald-700 break-all">
                  9f83a21b45c08e7d23f46a8190ce512b4e78a9c012d34e56f7a8b9c0d1e2f3a4
                </div>
                <div className="text-stone-500 text-[11px] pt-1">
                  Ruang pencarian: 2^256 kombinasi ≈ 10^77 kemungkinan (kebal brute-force).
                </div>
              </div>
            </div>
          )}

          {activeTab === "ledger" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-950">
                <p className="font-semibold mb-1">Rantai Audit Bersambung (Tamper-Evident Ledger)</p>
                <p className="text-xs">
                  Setiap aksi pencatatan (pendaftaran awal, verifikasi tetua, persetujuan saksi batas) diikat dengan blok sebelumnya:
                  <br />
                  <code>Hash Sekarang = SHA-256(Data Aksi + Previous Hash + Timestamp)</code>
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-stone-900">Kekuatan Anti-Manipulasi:</h3>
                <p className="text-xs text-stone-600">
                  Jika oknum menyusup ke database dan mengubah data peristiwa 2 tahun lalu, seluruh hash rantai berikutnya akan langsung menjadi tidak valid dan sistem membunyikan tanda bahaya (*broken chain alert*).
                </p>
              </div>

              <div className="p-3 bg-stone-900 text-stone-100 rounded-lg text-xs font-mono">
                <div>Blok 0 (Genesis): <span className="text-stone-400">0000000000000000...</span></div>
                <div className="pl-4">↓</div>
                <div>Blok 1 (Pengajuan): <span className="text-amber-400">prev: 0000... | curr: a89c...</span></div>
                <div className="pl-4">↓</div>
                <div>Blok 2 (Verifikasi Adat): <span className="text-emerald-400">prev: a89c... | curr: f3b1...</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-amber-800 text-white text-sm font-semibold hover:bg-amber-900 transition-colors shadow-sm"
          >
            Tutup Penjelasan
          </button>
        </div>
      </div>
    </div>
  );
}
