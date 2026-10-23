import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_KATALOG, cariItem } from "@/data/mockKatalog";
import HashViewer from "@/components/HashViewer";
import ResiModal from "@/components/ResiModal";

interface KatalogDetailPageProps {
  params: Promise<{ id: string }>;
}

// id yang dirender saat build (SSG); nilai params selalu string
export function generateStaticParams() {
  return MOCK_KATALOG.map((item) => ({ id: item.id }));
}

export default async function KatalogDetailPage({ params }: KatalogDetailPageProps) {
  // Mengambil parameter dinamis 'id' sesuai standar Next.js 15/16 (Promise params)
  const { id } = await params;

  // Validasi format id: wajib pola ktl-xxx atau angka bulat positif
  if (!/^(ktl-\d{3}|[1-9]\d*)$/i.test(id)) {
    notFound();
  }

  // Mencari data di dalam mock koleksi berdasarkan ID parameter dinamis
  const item = cariItem(id);

  // Jika ID tidak ditemukan, otomatis alihkan ke app/katalog/[id]/not-found.tsx
  if (!item) {
    notFound();
  }


  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
              Katalog Wilayah
            </Link>
          </li>
          <li>/</li>
          <li className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
            {item.id}
          </li>
        </ol>
      </nav>

      {/* Info Callout Demonstrasi Modul 4 App Router */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <div>
            <strong className="font-semibold text-amber-900">Rute Dinamis Berhasil Di-render:</strong>
            <span className="ml-1 text-stone-700">
              Parameter dinamis <code className="bg-amber-100 text-amber-900 font-mono px-1.5 py-0.5 rounded font-bold">[id] = &quot;{id}&quot;</code> berhasil diekstrak melalui <code className="font-mono text-stone-800">await params</code> di Server Component.
            </span>
          </div>
        </div>
        <Link
          href="/katalog"
          className="text-amber-900 hover:text-amber-700 underline font-semibold whitespace-nowrap text-xs"
        >
          ← Kembali ke Daftar Katalog
        </Link>
      </div>

      {/* Main Detail Card */}
      <article className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 mb-8">
        {/* Top Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100/70 border border-amber-300 px-2.5 py-1 rounded">
                ID: {item.id}
              </span>
              <span className="font-mono text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded">
                {item.kodeArsip}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  item.statusVerifikasi === "Terverifikasi Adat"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : item.statusVerifikasi === "Dalam Verifikasi"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-stone-100 text-stone-700 border border-stone-300"
                }`}
              >
                {item.statusVerifikasi}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {item.nama}
            </h1>
            <p className="text-sm text-stone-600 mt-1 mb-4">
              Kategori: <strong className="text-amber-900">{item.kategori}</strong> • Pengelola Adat:{" "}
              <strong className="text-stone-800">{item.margaPengelola}</strong>
            </p>

            {/* Tombol Aksi Alat Bantu Target ID (Resi / Checkout Adat Sesuai Modul 4) */}
            <ResiModal item={item} />
          </div>

          <div className="text-left sm:text-right bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
            <span className="text-xs text-stone-500 block">Luas Wilayah Ulayat:</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">
              {item.luasHektar} <span className="text-sm font-semibold text-stone-500">Hektar</span>
            </span>
            <span className="text-[11px] text-stone-500 block mt-1">
              Tanggal Catat: {new Date(item.tanggalPencatatan).toLocaleDateString("id-ID", { dateStyle: "long" })}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-stone-100 text-xs">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="text-stone-400 font-semibold block uppercase tracking-wider mb-1">
              Lokasi Distrik & Kampung
            </span>
            <p className="text-sm font-bold text-stone-800">{item.distrik}</p>
            <p className="text-stone-600">{item.kampung}, Kabupaten Mimika</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="text-stone-400 font-semibold block uppercase tracking-wider mb-1">
              Titik Koordinat Patok Utama
            </span>
            <p className="text-sm font-mono font-bold text-amber-900">{item.titikKoordinat}</p>
            <p className="text-stone-500">Penetapan GPS Adat</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="text-stone-400 font-semibold block uppercase tracking-wider mb-1">
              Kelengkapan Bukti Berkas
            </span>
            <p className="text-sm font-bold text-stone-800">{item.jumlahDokumen} Dokumen Tersimpan</p>
            <p className="text-emerald-700 font-semibold">Tersidik Jari Kriptografis</p>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="py-6 border-b border-stone-100">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
            Deskripsi Penguasaan & Nilai Adat
          </h2>
          <p className="text-sm text-stone-700 leading-relaxed">
            {item.deskripsi}
          </p>
        </div>

        {/* Batas Alam 4 Penjuru */}
        <div className="py-6 border-b border-stone-100">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
            Batas Alam 4 Penjuru Mata Angin
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
              <span className="font-bold text-amber-900 block mb-1">↑ Batas Utara:</span>
              <p className="text-stone-700">{item.patokBatas.utara}</p>
            </div>
            <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
              <span className="font-bold text-amber-900 block mb-1">↓ Batas Selatan:</span>
              <p className="text-stone-700">{item.patokBatas.selatan}</p>
            </div>
            <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
              <span className="font-bold text-amber-900 block mb-1">→ Batas Timur:</span>
              <p className="text-stone-700">{item.patokBatas.timur}</p>
            </div>
            <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
              <span className="font-bold text-amber-900 block mb-1">← Batas Barat:</span>
              <p className="text-stone-700">{item.patokBatas.barat}</p>
            </div>
          </div>
        </div>

        {/* Hash Fingerprint */}
        <div className="pt-6">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
            Sidik Jari Kriptografis Berkas Arsip (SHA-256)
          </h2>
          <HashViewer hash={item.hashArsip} label={`Digest Arsip ${item.kodeArsip}`} compact={false} />
        </div>
      </article>

      {/* Navigasi Penutup Aman (Tanpa Akses Mengintip Tanah Lain) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-stone-200 text-xs">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold border border-stone-300 transition-colors"
        >
          🔒 Kunci Kembali & Keluar dari Berkas Ini
        </Link>

        <span className="text-[11px] text-stone-500 italic">
          *Akses privat: Data marga lain tidak dapat diintip tanpa nomor ID resmi.
        </span>
      </div>
    </div>
  );
}
