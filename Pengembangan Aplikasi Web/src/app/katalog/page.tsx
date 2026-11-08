import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ambilDaftarItem } from "@/lib/data";

export const metadata: Metadata = {
  title: "Katalog Wilayah Ulayat — TanahKita",
};

export default async function HalamanKatalog() {
  // connection() memastikan halaman selalu membaca data terbaru saat ada permintaan (Modul 6)
  await connection();
  const items = await ambilDaftarItem();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Nav */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-xs text-stone-500">
          <li>
            <Link href="/" className="hover:text-amber-800 underline">
              Beranda
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-stone-800">Katalog Wilayah Ulayat (PostgreSQL 18)</li>
        </ol>
      </nav>

      {/* Header Banner */}
      <section className="bg-gradient-to-br from-stone-950 via-amber-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 mb-8 border border-amber-900/60 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-900/60 border border-amber-600/40 text-amber-200 text-xs px-3.5 py-1 rounded-full mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              PostgreSQL 18 & Prisma ORM 7 • {items.length} Wilayah Ulayat Terdata
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Daftar Wilayah Ulayat Adat Mimika
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Seluruh rekaman hamparan tanah ulayat dan kesaksian batas alam tersimpan secara persisten pada basis data PostgreSQL 18.
            </p>
          </div>

          <Link
            href="/katalog/tambah"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-600 transition shadow-lg shrink-0"
          >
            + Daftarkan Ulayat Baru
          </Link>
        </div>
      </section>

      {/* Grid Daftar Item dari PostgreSQL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200">
                  {item.kategori}
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  #{item.id}
                </span>
              </div>

              <h2 className="text-lg font-bold text-stone-900 mb-2 line-clamp-1">
                {item.judul}
              </h2>

              <p className="text-xs text-stone-600 mb-4 line-clamp-2 leading-relaxed">
                {item.deskripsi}
              </p>

              <div className="text-xs text-stone-500 space-y-1 border-t border-stone-100 pt-3 mb-4">
                <div>
                  <span className="font-semibold text-stone-700">Distrik:</span> {item.distrik}
                </div>
                <div>
                  <span className="font-semibold text-stone-700">Luas:</span> {item.luasHektar} Ha
                </div>
                <div>
                  <span className="font-semibold text-stone-700">Ulasan Saksi:</span>{" "}
                  <span className="font-bold text-amber-800">
                    {item.ulasan?.length || 0} kesaksian
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/katalog/${item.id}`}
              className="w-full text-center py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition"
            >
              Buka Berkas & Kesaksian &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
