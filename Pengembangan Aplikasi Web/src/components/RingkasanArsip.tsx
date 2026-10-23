import React from "react";
import Link from "next/link";
import { MOCK_KATALOG } from "@/data/mockKatalog";

// Server Component (tanpa "use client"): dijalankan di server dan tidak dikirim ke bundle JS browser.
export default function RingkasanArsip() {
  const tigaTerbaru = MOCK_KATALOG.slice(0, 3);

  return (
    <section
      aria-labelledby="judul-terbaru"
      className="mb-10 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 id="judul-terbaru" className="text-lg font-bold text-stone-900">
            Ringkasan Arsip Katalog Terbaru (Server Component)
          </h2>
          <p className="text-xs text-stone-500">
            Diambil langsung di server dari sumber data berpelindung <code className="font-mono text-amber-900">server-only</code> tanpa menambah ukuran bundel JavaScript klien.
          </p>
        </div>
        <Link
          href="/katalog"
          className="text-xs font-semibold text-amber-900 hover:text-amber-700 underline whitespace-nowrap"
        >
          Buka Portal Katalog [id] →
        </Link>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tigaTerbaru.map((it) => (
          <li
            key={it.id}
            className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                  {it.kodeArsip}
                </span>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {it.statusVerifikasi}
                </span>
              </div>
              <p className="font-bold text-sm text-stone-900">{it.kategori}</p>
              <p className="text-xs text-stone-600 mt-0.5">
                Distrik {it.distrik} • {it.luasHektar} Ha
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
              <span>Tgl Catat: {it.tanggalPencatatan}</span>
              <span className="font-mono text-stone-700">{it.jumlahDokumen} berkas</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
