"use client";

import React, { useState } from "react";
import type { KatalogItem } from "@/types/katalog";

interface ResiModalProps {
  item: KatalogItem;
}

export default function ResiModal({ item }: ResiModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Tombol Alat Bantu / Aksi Target ID Sesuai Arahan Asisten Praktikum */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <svg className="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>📄 Terbitkan Resi / Bukti Registrasi ID: {item.id}</span>
      </button>

      {/* Modal Dialog Pop-up Resi */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden flex flex-col">
            {/* Header Resi */}
            <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white p-5 flex items-center justify-between border-b border-amber-800/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600/80 flex items-center justify-center text-amber-200 font-bold text-xs">
                  TK
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white leading-tight">
                    Resi Bukti Pencatatan Adat
                  </h3>
                  <span className="text-[10px] text-amber-300 font-mono">
                    TARGET ID RESMI: {item.id}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
                aria-label="Tutup Resi"
              >
                ✕
              </button>
            </div>

            {/* Isi Badan Resi Resmi */}
            <div className="p-6 space-y-4 text-xs text-stone-700 bg-[#fdfcfb]">
              <div className="border-2 border-dashed border-amber-800/30 p-4 rounded-xl bg-amber-50/40 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-amber-200/60">
                  <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">
                    Identitas Nomor Registrasi (ID):
                  </span>
                  <span className="font-mono font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded text-xs">
                    {item.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Kode Buku Besar:</span>
                    <strong className="text-stone-900 font-mono">{item.kodeArsip}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Status Validasi:</span>
                    <span className="text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                      {item.statusVerifikasi}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Nama Kawasan:</span>
                    <strong className="text-stone-800">{item.nama}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Marga Pemangku:</span>
                    <strong className="text-stone-800">{item.margaPengelola}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Lokasi Administratif:</span>
                    <span className="text-stone-700">{item.distrik}, {item.kampung}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Luas Penguasaan:</span>
                    <strong className="text-amber-900">{item.luasHektar} Hektar</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/60">
                  <span className="text-stone-400 block text-[10px]">Segel Kriptografis (SHA-256 Digest):</span>
                  <code className="block bg-stone-100 text-stone-800 p-2 rounded text-[10px] font-mono break-all border border-stone-200 mt-1 select-all">
                    {item.hashArsip}
                  </code>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 italic text-center">
                *Tanda bukti digital ini sah sebagai resi pendokumentasian ulayat adat Mimika.
              </p>
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-200 transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-900 hover:bg-amber-800 text-white transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>🖨️ Cetak Resi ID Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
