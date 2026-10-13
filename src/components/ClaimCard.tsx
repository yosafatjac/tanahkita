"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LandClaim } from "../types/claim";
import StatusBadge from "./StatusBadge";
import HashViewer from "./HashViewer";
import VerifyProofModal from "./VerifyProofModal";

interface ClaimCardProps {
  claim: LandClaim;
}

export default function ClaimCard({ claim }: ClaimCardProps) {
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const primaryEvidence = claim.dokumenBukti[0];

  return (
    <>
      <article className="bg-white rounded-xl shadow-sm border border-stone-200/80 hover:shadow-md hover:border-amber-700/40 transition-all p-5 flex flex-col justify-between">
        <div>
          {/* Baris Atas: Nomor Registrasi & Status Badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              {claim.nomorRegistrasi}
            </span>
            <StatusBadge status={claim.status} />
          </div>

          {/* Judul: Marga & Kepala Marga */}
          <h3 className="text-lg font-bold text-stone-900 leading-snug">
            {claim.marga}
          </h3>
          <p className="text-sm text-stone-600 mb-3">
            Atas nama: <span className="font-medium text-stone-800">{claim.kepalaMarga}</span>
          </p>

          {/* Informasi Spesifik Tanah */}
          <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 bg-amber-50/60 p-3 rounded-lg border border-amber-100 mb-4">
            <div>
              <span className="block text-stone-400 font-medium">Distrik / Kampung:</span>
              <span className="font-semibold text-stone-800">{claim.distrik}, {claim.kampung}</span>
            </div>
            <div>
              <span className="block text-stone-400 font-medium">Luas Wilayah:</span>
              <span className="font-semibold text-amber-900">{claim.luasHektar} Hektar</span>
            </div>
            <div className="col-span-2 mt-1 pt-1 border-t border-amber-200/40">
              <span className="block text-stone-400 font-medium">Peruntukan Lahan:</span>
              <span className="text-stone-700 italic">{claim.peruntukan}</span>
            </div>
          </div>

          {/* Sidik Jari Dokumen Utama */}
          {primaryEvidence && (
            <div className="mb-4">
              <HashViewer
                hash={primaryEvidence.sha256}
                label={`Bukti: ${primaryEvidence.namaFile}`}
                compact={true}
              />
            </div>
          )}
        </div>

        {/* Tombol Aksi */}
        <div className="pt-3 border-t border-stone-100 mt-2 flex items-center space-x-2">
          <Link
            href={`/klaim/${claim.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label={`Lihat detail dan jejak audit integritas ${claim.marga}`}
          >
            Detail & Rantai Audit
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <button
            type="button"
            onClick={() => setVerifyModalOpen(true)}
            className="py-2 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium border border-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400"
            title="Uji Hash Berkas Ini"
          >
            Uji Bukti
          </button>
        </div>
      </article>

      {/* Modal Verifikasi Berkas */}
      {primaryEvidence && (
        <VerifyProofModal
          isOpen={verifyModalOpen}
          onClose={() => setVerifyModalOpen(false)}
          targetClaimId={claim.nomorRegistrasi}
          expectedHash={primaryEvidence.sha256}
          documentTitle={primaryEvidence.namaFile}
        />
      )}
    </>
  );
}
