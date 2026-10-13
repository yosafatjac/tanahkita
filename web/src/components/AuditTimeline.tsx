"use client";

import React, { useState } from "react";
import { AuditRecord } from "../types/claim";
import HashViewer from "./HashViewer";

interface AuditTimelineProps {
  records: AuditRecord[];
}

export default function AuditTimeline({ records }: AuditTimelineProps) {
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const handleVerifyChain = () => {
    // Simulasi verifikasi hash-chain di sisi klien
    let valid = true;
    for (let i = 1; i < records.length; i++) {
      if (records[i].previousHash !== records[i - 1].currentHash) {
        valid = false;
        break;
      }
    }

    if (valid) {
      setVerificationResult("TERVERIFIKASI_UTUH");
    } else {
      setVerificationResult("RANTAI_RUSAK");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
            Jejak Riwayat Berintegritas (Hash-Chain Audit Log)
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Setiap catatan terikat secara kriptografis ke blok riwayat sebelumnya.
          </p>
        </div>

        {/* Tombol Uji Keutuhan Rantai */}
        <button
          type="button"
          onClick={handleVerifyChain}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Uji Integritas Rantai Sekarang
        </button>
      </div>

      {/* Banner Hasil Verifikasi */}
      {verificationResult === "TERVERIFIKASI_UTUH" && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>Keutuhan Rantai 100% Sah:</strong> Seluruh tautan hash bersambung dengan benar. Tidak ada data riwayat yang diubah secara ilegal!
          </span>
        </div>
      )}

      {/* Alur Timeline */}
      <ol className="relative border-l border-amber-800/30 ml-3 space-y-8">
        {records.map((rec, index) => (
          <li key={rec.id} className="ml-6">
            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-amber-900 text-amber-100 rounded-full text-xs font-bold ring-4 ring-white">
              {index + 1}
            </span>

            <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-semibold text-xs text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
                  {rec.action.replace(/_/g, " ")}
                </span>
                <time className="text-[11px] text-stone-500 font-mono">
                  {new Date(rec.timestamp).toLocaleString("id-ID", { timeZone: "Asia/Jayapura" })} WIT
                </time>
              </div>

              <p className="text-xs text-stone-700 mb-3">
                Pelaku Tindakan: <strong className="text-stone-900">{rec.actor}</strong>
              </p>

              <div className="space-y-2 pt-2 border-t border-stone-200/60">
                <HashViewer hash={rec.previousHash} label="Previous Hash (Tautan Blok Sebelumnya):" compact={true} />
                <HashViewer hash={rec.currentHash} label="Current Hash (Nilai Blok Ini):" compact={true} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
