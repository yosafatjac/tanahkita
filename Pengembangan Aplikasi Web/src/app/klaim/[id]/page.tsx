"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { MOCK_CLAIMS } from "../../../data/mockClaims";
import StatusBadge from "../../../components/StatusBadge";
import HashViewer from "../../../components/HashViewer";
import AuditTimeline from "../../../components/AuditTimeline";
import VerifyProofModal from "../../../components/VerifyProofModal";

interface ClaimDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClaimDetailPage({ params }: ClaimDetailPageProps) {
  const resolvedParams = use(params);
  const claimId = resolvedParams.id;

  const claim = MOCK_CLAIMS.find((c) => c.id === claimId) || MOCK_CLAIMS[0];
  const [selectedDoc, setSelectedDoc] = useState<{
    namaFile: string;
    sha256: string;
  } | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-xs text-stone-500">
          <li>
            <Link href="/" className="hover:text-amber-800 underline">
              Beranda
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/" className="hover:text-amber-800 underline">
              Daftar Klaim
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-stone-800 font-mono">{claim.nomorRegistrasi}</li>
        </ol>
      </nav>

      {/* Header Detail */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-stone-100 text-stone-700">
                {claim.nomorRegistrasi}
              </span>
              <StatusBadge status={claim.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {claim.marga}
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Kepala Marga / Kuasa Adat: <strong className="text-stone-800">{claim.kepalaMarga}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-stone-400 block">Luas Wilayah Ulayat:</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">
              {claim.luasHektar} <span className="text-sm font-semibold text-stone-500">Hektar</span>
            </span>
            <span className="text-[11px] text-stone-500 block mt-1">
              Diajukan pada: {new Date(claim.tanggalPengajuan).toLocaleDateString("id-ID", { dateStyle: "long" })}
            </span>
          </div>
        </div>

        {/* Grid Informasi Wilayah & Koordinat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
              Lokasi Administratif
            </span>
            <p className="text-sm font-bold text-stone-800">{claim.distrik}</p>
            <p className="text-xs text-stone-600">Kampung: {claim.kampung}, Mimika</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
              Titik Koordinat / Patok Utama
            </span>
            <p className="text-sm font-mono font-bold text-amber-900">{claim.titikKoordinat}</p>
            <p className="text-[11px] text-stone-500 mt-0.5">Tercatat pada berita acara adat</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-1">
              Peruntukan Lahan Ulayat
            </span>
            <p className="text-xs text-stone-800 font-medium leading-relaxed">{claim.peruntukan}</p>
          </div>
        </div>

        {/* Batas Wilayah 4 Penjuru Mata Angin */}
        <div className="mt-6 pt-6 border-t border-stone-100">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
            Batas Wilayah Adat Berdasarkan Musyawarah
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/60">
              <span className="font-bold text-amber-900 block mb-1">↑ Batas Utara:</span>
              <p className="text-stone-700">{claim.batasWilayah.utara}</p>
            </div>
            <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/60">
              <span className="font-bold text-amber-900 block mb-1">↓ Batas Selatan:</span>
              <p className="text-stone-700">{claim.batasWilayah.selatan}</p>
            </div>
            <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/60">
              <span className="font-bold text-amber-900 block mb-1">→ Batas Timur:</span>
              <p className="text-stone-700">{claim.batasWilayah.timur}</p>
            </div>
            <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/60">
              <span className="font-bold text-amber-900 block mb-1">← Batas Barat:</span>
              <p className="text-stone-700">{claim.batasWilayah.barat}</p>
            </div>
          </div>
        </div>

        {/* Catatan Musyawarah Tetua Adat */}
        {claim.catatanTetua && (
          <div className="mt-6 bg-stone-100 p-4 rounded-xl border-l-4 border-amber-800 text-xs text-stone-700">
            <strong className="block text-stone-900 mb-1">Catatan Verifikasi Tetua / Lembaga Adat:</strong>
            <p className="italic">{claim.catatanTetua}</p>
          </div>
        )}
      </div>

      {/* Dokumen Bukti Fisik & Sidik Jari SHA-256 */}
      <section aria-labelledby="judul-dokumen" className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm mb-8">
        <h2 id="judul-dokumen" className="text-lg font-bold text-stone-900 mb-1 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Dokumen Bukti Fisik yang Terkunci Kriptografis
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          Setiap berkas dihitung nilai ringkasan SHA-256. Jika berkas diubah 1 piksel atau 1 huruf,
          nilai hash akan berubah total dan sistem akan menolak keasliannya.
        </p>

        <div className="space-y-4">
          {claim.dokumenBukti.map((doc, idx) => (
            <div key={idx} className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold font-mono">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-stone-800">{doc.namaFile}</h3>
                    <span className="text-[11px] text-stone-500">{doc.tipeBerkas}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-300">
                    ✓ Sidik Jari Terkunci
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDoc(doc)}
                    className="text-xs bg-stone-200 hover:bg-stone-300 text-stone-800 px-2.5 py-0.5 rounded font-medium transition-colors"
                  >
                    Uji Keaslian
                  </button>
                </div>
              </div>

              <HashViewer hash={doc.sha256} label="Nilai SHA-256 Digest (FIPS 180-4):" compact={false} />
            </div>
          ))}
        </div>
      </section>

      {/* Rantai Riwayat Berintegritas (Hash-Chain Timeline) */}
      <section aria-labelledby="judul-rantai">
        <h2 id="judul-rantai" className="sr-only">Jejak Hash-Chain Audit</h2>
        <AuditTimeline records={claim.auditChain} />
      </section>

      {/* Tombol Aksi Bawah */}
      <div className="mt-8 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-amber-900 hover:text-amber-800"
        >
          ← Kembali ke Eksplorasi Klaim
        </Link>
        <Link
          href="/daftar"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold"
        >
          + Daftarkan Klaim Baru
        </Link>
      </div>

      {/* Modal Uji Dokumen */}
      {selectedDoc && (
        <VerifyProofModal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          targetClaimId={claim.nomorRegistrasi}
          expectedHash={selectedDoc.sha256}
          documentTitle={selectedDoc.namaFile}
        />
      )}
    </div>
  );
}
