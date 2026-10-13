"use client";

import React, { useState } from "react";
import { sha256File, compareHashes } from "@/lib/crypto";

interface VerifyProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetClaimId?: string;
  expectedHash?: string;
  documentTitle?: string;
}

export default function VerifyProofModal({
  isOpen,
  onClose,
  targetClaimId,
  expectedHash = "",
  documentTitle = "Dokumen Bukti Adat",
}: VerifyProofModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [calculatedHash, setCalculatedHash] = useState<string>("");
  const [targetExpectedHash, setTargetExpectedHash] = useState<string>(expectedHash);
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<"match" | "mismatch" | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsHashing(true);
    setVerificationResult(null);

    try {
      const hash = await sha256File(selectedFile);
      setCalculatedHash(hash);

      if (targetExpectedHash.trim()) {
        const isMatch = compareHashes(hash, targetExpectedHash);
        setVerificationResult(isMatch ? "match" : "mismatch");
      }
    } catch (err) {
      console.error("Gagal menghitung hash berkas:", err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleCompareManual = () => {
    if (!calculatedHash || !targetExpectedHash) return;
    const isMatch = compareHashes(calculatedHash, targetExpectedHash);
    setVerificationResult(isMatch ? "match" : "mismatch");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-emerald-700/60 rounded-lg text-emerald-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <div>
              <h2 id="verify-modal-title" className="text-lg font-bold text-stone-100">
                Uji Integritas Dokumen Adat (Live SHA-256)
              </h2>
              <p className="text-xs text-stone-400">
                {targetClaimId ? `Klaim: ${targetClaimId} • ${documentTitle}` : "Pengecekan Sidik Jari Kriptografis Mandiri"}
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

        {/* Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* File input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Pilih Berkas yang Ingin Diverifikasi:
            </label>
            <div className="border-2 border-dashed border-stone-300 rounded-xl p-5 text-center hover:border-amber-700 hover:bg-amber-50/30 transition-all">
              <input
                type="file"
                id="file-verify"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-verify"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-xs font-medium text-amber-900 bg-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">
                  {file ? file.name : "Klik untuk Pilih Dokumen / Foto Patok"}
                </span>
                <span className="text-[11px] text-stone-500">
                  {file ? `Ukuran: ${(file.size / 1024).toFixed(1)} KB` : "PDF, JPG, PNG dihitung langsung di peramban Anda (privat)"}
                </span>
              </label>
            </div>
          </div>

          {/* Expected Hash input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Hash Referensi Register (Expected SHA-256):
            </label>
            <input
              type="text"
              value={targetExpectedHash}
              onChange={(e) => {
                setTargetExpectedHash(e.target.value);
                setVerificationResult(null);
              }}
              placeholder="Masukkan 64 karakter hash SHA-256 dari buku register adat..."
              className="w-full text-xs font-mono p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
          </div>

          {/* Calculated Hash display */}
          {isHashing ? (
            <div className="flex items-center space-x-2 text-xs text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <span className="inline-block w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></span>
              <span>Menghitung sidik jari SHA-256 via Web Crypto API...</span>
            </div>
          ) : calculatedHash ? (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-stone-700">Hasil Hitung Hash Berkas:</span>
              <div className="p-2.5 bg-stone-900 text-stone-200 rounded-lg font-mono text-[11px] break-all border border-stone-800">
                {calculatedHash}
              </div>
            </div>
          ) : null}

          {/* Verification Result Box */}
          {verificationResult === "match" && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start space-x-3 text-emerald-950">
              <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                  STATUS: TERVERIFIKASI UTUH & ASLI (100% MATCH)
                </p>
                <p className="text-xs mt-0.5 text-emerald-800">
                  Sidik jari dokumen identik sempurna dengan catatan register adat. Dokumen ini tidak pernah disunting atau dimanipulasi sejak pertama kali didaftarkan.
                </p>
              </div>
            </div>
          )}

          {verificationResult === "mismatch" && (
            <div className="p-4 bg-red-50 border border-red-300 rounded-xl flex items-start space-x-3 text-red-950">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-red-900">
                  STATUS: PERINGATAN! SIDIK JARI TIDAK COCOK
                </p>
                <p className="text-xs mt-0.5 text-red-800">
                  Hash berkas berbeda dengan register. Berkas ini kemungkinan telah disunting, dipotong, disimpan ulang dengan kompresi berbeda, atau merupakan dokumen palsu.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3 flex items-center justify-between">
          <button
            onClick={handleCompareManual}
            disabled={!calculatedHash || !targetExpectedHash}
            className="px-4 py-2 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Bandingkan Ulang
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-300 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
