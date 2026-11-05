import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ambilItem } from "@/lib/data";
import { hapusItem } from "@/app/katalog/actions";
import { hapusUlasan } from "@/app/katalog/ulasan-actions";
import FormUlasan from "@/components/FormUlasan";
import FormUbahItem from "@/components/FormUbahItem";

interface DetailItemProps {
  params: Promise<{ id: string }>;
}

export default async function DetailItem({ params }: DetailItemProps) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  // Skenario 6: ID bukan bilangan bulat positif memicu 404 Not Found
  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  // Mengambil data item beserta seluruh ulasannya dari PostgreSQL via Prisma Client
  const item = await ambilItem(id);

  // Skenario 6: ID tidak ada di tabel Item memicu 404 Not Found
  if (!item) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
            <Link href="/katalog" className="hover:text-amber-800 underline">
              Katalog
            </Link>
          </li>
          <li>/</li>
          <li className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
            Item #{item.id}
          </li>
        </ol>
      </nav>

      {/* Main Header Item */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
            {item.kategori}
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              item.tersedia
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-stone-200 text-stone-700 border border-stone-300"
            }`}
          >
            {item.tersedia ? "Tersedia / Terbuka" : "Arsip Terbatas"}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3">
          {item.judul}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600 border-y border-stone-100 py-4 my-4">
          <div>
            <span className="font-semibold text-stone-800">Distrik Wilayah:</span> {item.distrik}
          </div>
          <div>
            <span className="font-semibold text-stone-800">Luas Wilayah:</span> {item.luasHektar} Hektar
          </div>
          <div>
            <span className="font-semibold text-stone-800">Waktu Pencatatan:</span>{" "}
            {item.dibuatPada ? new Date(item.dibuatPada).toLocaleString("id-ID") : "-"}
          </div>
          <div>
            <span className="font-semibold text-stone-800">Basis Data:</span> PostgreSQL 18 (Prisma ORM 7)
          </div>
        </div>

        <p className="text-sm text-stone-700 leading-relaxed">{item.deskripsi}</p>

        {/* Formulir Ubah Deskripsi / Status (CRUD Update) */}
        <FormUbahItem
          id={item.id}
          deskripsiAwal={item.deskripsi}
          tersediaAwal={item.tersedia}
        />

        {/* Tombol Hapus Item (Transaksi Atomik prisma.$transaction) */}
        <form action={hapusItem.bind(null, item.id)} className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-red-700 hover:bg-red-800 px-4 py-2 text-xs font-semibold text-white transition shadow-sm"
          >
            Hapus Item & Kesaksian (Transaksi)
          </button>
        </form>
      </div>

      {/* Bagian Ulasan (Entitas Anak N) */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-stone-900 mb-4">
          Ulasan & Kesaksian Saksi Batas Adat ({item.ulasan?.length || 0})
        </h2>

        {item.ulasan && item.ulasan.length > 0 ? (
          <ul className="space-y-3 mb-6">
            {item.ulasan.map((u: { id: number; nama: string; nilai: number; komentar: string }) => (
              <li
                key={u.id}
                className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-stone-900">{u.nama}</span>
                    <span className="text-amber-600 font-semibold text-xs">★ {u.nilai}/5</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{u.komentar}</p>
                </div>

                <form action={hapusUlasan.bind(null, u.id, item.id)}>
                  <button
                    type="submit"
                    className="text-xs text-red-700 hover:text-red-900 underline font-medium"
                  >
                    Hapus ulasan
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-stone-500 italic mb-6">
            Belum ada ulasan atau kesaksian saksi batas untuk wilayah ulayat ini.
          </p>
        )}

        {/* Form Tambah Ulasan */}
        <FormUlasan itemId={item.id} />
      </div>
    </div>
  );
}
