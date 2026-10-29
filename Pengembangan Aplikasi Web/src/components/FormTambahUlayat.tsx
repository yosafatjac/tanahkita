"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { simpanUlayatAction } from "@/app/katalog/actions";
import { DISTRIK_MIMIKA, KATEGORI_ULAYAT, type FormActionState } from "@/schemas";

const initialState: FormActionState = {
  success: false,
};

export function FormTambahUlayat() {
  const [state, formAction, isPending] = useActionState(simpanUlayatAction, initialState);

  // Helper state untuk uji cepat di laboratorium
  const [formValues, setFormValues] = useState({
    nama: (state.fields?.nama as string) || "",
    kategori: (state.fields?.kategori as string) || "",
    distrik: (state.fields?.distrik as string) || "",
    kampung: (state.fields?.kampung as string) || "",
    margaPengelola: (state.fields?.margaPengelola as string) || "",
    luasHektar: (state.fields?.luasHektar as string) || "",
    deskripsi: (state.fields?.deskripsi as string) || "",
    titikKoordinat: (state.fields?.titikKoordinat as string) || "",
    persetujuanBatasAdat: Boolean(state.fields?.persetujuanBatasAdat),
  });

  const isiDataValid = () => {
    setFormValues({
      nama: "Hutan Keramat Kwamki Narama",
      kategori: "Hutan Adat" as const,
      distrik: "Kwamki Narama",
      kampung: "Kampung Harapan Adat",
      margaPengelola: "Marga Magal & Marga Beanal",
      luasHektar: "85.5",
      deskripsi: "Kawasan hutan keramat sakral konservasi mata air dan tempat musyawarah adat tahunan suku.",
      titikKoordinat: "4°27'15.2\"S 136°54'30.1\"E",
      persetujuanBatasAdat: true,
    });
  };

  const isiDataSalah = () => {
    setFormValues({
      nama: "A", // Terlalu pendek
      kategori: "" as const, // Kosong
      distrik: "" as const, // Kosong
      kampung: "", // Kosong
      margaPengelola: "",
      luasHektar: "-25", // Negatif
      deskripsi: "Pendek", // Kurang dari 10 karakter
      titikKoordinat: "",
      persetujuanBatasAdat: false, // Belum disepakati
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header Form */}
      <div className="bg-gradient-to-r from-amber-900 to-stone-900 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30 mb-2">
              Modul 5 — Form Validation & Server Actions
            </span>
            <h2 className="text-xl font-bold font-serif">Pendaftaran Wilayah Adat Baru</h2>
            <p className="text-xs text-amber-100/80 mt-1">
              Setiap isian diverifikasi oleh Skema Validasi Zod di backend sebelum dicatat ke arsip adat.
            </p>
          </div>

          {/* Tombol Pintas Pengujian Cepat */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isiDataSalah}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/20 text-rose-200 border border-rose-400/40 hover:bg-rose-500/30 transition-colors"
              title="Isi data salah untuk menguji pesan galat merah"
            >
              🧪 Uji Data Salah
            </button>
            <button
              type="button"
              onClick={isiDataValid}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 hover:bg-emerald-500/30 transition-colors"
              title="Isi data valid untuk menguji keberhasilan penyimpanan"
            >
              ✅ Uji Data Sah
            </button>
          </div>
        </div>
      </div>

      {/* Pesan Kesalahan Global (Bila ada) */}
      {state.message && (
        <div
          role="alert"
          className={`p-4 mx-6 mt-6 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
            state.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <span className="text-base flex-shrink-0">{state.success ? "✅" : "⚠️"}</span>
          <div>
            <p className="font-bold">{state.success ? "Pendaftaran Berhasil" : "Pemeriksaan Formulir Gagal"}</p>
            <p className="mt-0.5">{state.message}</p>
          </div>
        </div>
      )}

      {/* Formulir Utama */}
      <form action={formAction} className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Nama Ulayat */}
          <div className="md:col-span-2">
            <label htmlFor="nama" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Nama Wilayah Ulayat Adat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formValues.nama}
              onChange={(e) => setFormValues({ ...formValues, nama: e.target.value })}
              placeholder="Contoh: Kawasan Hutan Keramat Lembah Nemangkawi"
              aria-invalid={Boolean(state.fieldErrors?.nama)}
              aria-describedby={state.fieldErrors?.nama ? "error-nama" : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                state.fieldErrors?.nama
                  ? "border-rose-400 bg-rose-50/30 focus:ring-rose-500 focus:border-rose-500"
                  : "border-stone-300 bg-white focus:ring-amber-600 focus:border-amber-600"
              }`}
            />
            {state.fieldErrors?.nama && (
              <p id="error-nama" role="alert" className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <span>🔴</span> {state.fieldErrors.nama[0]}
              </p>
            )}
          </div>

          {/* 2. Kategori Ulayat */}
          <div>
            <label htmlFor="kategori" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Kategori Ulayat <span className="text-rose-500">*</span>
            </label>
            <select
              id="kategori"
              name="kategori"
              value={formValues.kategori}
              onChange={(e) => setFormValues({ ...formValues, kategori: e.target.value })}
              aria-invalid={Boolean(state.fieldErrors?.kategori)}
              aria-describedby={state.fieldErrors?.kategori ? "error-kategori" : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                state.fieldErrors?.kategori
                  ? "border-rose-400 bg-rose-50/30 focus:ring-rose-500 focus:border-rose-500"
                  : "border-stone-300 bg-white focus:ring-amber-600 focus:border-amber-600"
              }`}
            >
              <option value="">-- Pilih Kategori Wilayah --</option>
              {KATEGORI_ULAYAT.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
            {state.fieldErrors?.kategori && (
              <p id="error-kategori" role="alert" className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <span>🔴</span> {state.fieldErrors.kategori[0]}
              </p>
            )}
          </div>

          {/* 3. Distrik */}
          <div>
            <label htmlFor="distrik" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Distrik (Kabupaten Mimika) <span className="text-rose-500">*</span>
            </label>
            <select
              id="distrik"
              name="distrik"
              value={formValues.distrik}
              onChange={(e) => setFormValues({ ...formValues, distrik: e.target.value })}
              aria-invalid={Boolean(state.fieldErrors?.distrik)}
              aria-describedby={state.fieldErrors?.distrik ? "error-distrik" : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                state.fieldErrors?.distrik
                  ? "border-rose-400 bg-rose-50/30 focus:ring-rose-500 focus:border-rose-500"
                  : "border-stone-300 bg-white focus:ring-amber-600 focus:border-amber-600"
              }`}
            >
              <option value="">-- Pilih Distrik Resmi Mimika --</option>
              {DISTRIK_MIMIKA.map((dis) => (
                <option key={dis} value={dis}>
                  Distrik {dis}
                </option>
              ))}
            </select>
            {state.fieldErrors?.distrik && (
              <p id="error-distrik" role="alert" className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <span>🔴</span> {state.fieldErrors.distrik[0]}
              </p>
            )}
          </div>

          {/* 4. Kampung */}
          <div>
            <label htmlFor="kampung" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Kampung / Kelurahan Adat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="kampung"
              name="kampung"
              value={formValues.kampung}
              onChange={(e) => setFormValues({ ...formValues, kampung: e.target.value })}
              placeholder="Contoh: Kampung Utikini Baru"
              aria-invalid={Boolean(state.fieldErrors?.kampung)}
              aria-describedby={state.fieldErrors?.kampung ? "error-kampung" : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                state.fieldErrors?.kampung
                  ? "border-rose-400 bg-rose-50/30 focus:ring-rose-500 focus:border-rose-500"
                  : "border-stone-300 bg-white focus:ring-amber-600 focus:border-amber-600"
              }`}
            />
            {state.fieldErrors?.kampung && (
              <p id="error-kampung" role="alert" className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <span>🔴</span> {state.fieldErrors.kampung[0]}
              </p>
            )}
          </div>

          {/* 5. Marga Pengelola */}
          <div>
            <label htmlFor="margaPengelola" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Marga / Keret Pengelola Adat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="margaPengelola"
              name="margaPengelola"
              value={formValues.margaPengelola}
              onChange={(e) => setFormValues({ ...formValues, margaPengelola: e.target.value })}
              placeholder="Contoh: Marga Magal / Marga Omaleng"
              aria-invalid={Boolean(state.fieldErrors?.margaPengelola)}
              aria-describedby={state.fieldErrors?.margaPengelola ? "error-margaPengelola" : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                state.fieldErrors?.margaPengelola
                  ? "border-rose-400 bg-rose-50/30 focus:ring-rose-500 focus:border-rose-500"
                  : "border-stone-300 bg-white focus:ring-amber-600 focus:border-amber-600"
              }`}
            />
            {state.fieldErrors?.margaPengelola && (
              <p id="error-margaPengelola" role="alert" className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <span>🔴</span> {state.fieldErrors.margaPengelola[0]}
              </p>
            )}
          </div>

          {/* 6. Luas Hektar */}
          <div>
            <label htmlFor="luasHektar" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Luas Wilayah (Hektar) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="luasHektar"
              name="luasHektar"
              value={formValues.luasHektar}
              onChange={(e) => setFormValues({ ...formValues, luasHektar: e.target.value })}
              placeholder="Contoh: 42.5 (Angka positif)"
              aria-invalid={Boolean(state.fieldErrors?.luasHektar)}
              aria-describedby={state.fieldErrors?.luasHektar ? "error-luasHektar" : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                state.fieldErrors?.luasHektar
                  ? "border-rose-400 bg-rose-50/30 focus:ring-rose-500 focus:border-rose-500"
                  : "border-stone-300 bg-white focus:ring-amber-600 focus:border-amber-600"
              }`}
            />
            {state.fieldErrors?.luasHektar && (
              <p id="error-luasHektar" role="alert" className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <span>🔴</span> {state.fieldErrors.luasHektar[0]}
              </p>
            )}
          </div>

          {/* 7. Titik Koordinat */}
          <div>
            <label htmlFor="titikKoordinat" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Titik Koordinat / Acuan GPS <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="titikKoordinat"
              name="titikKoordinat"
              value={formValues.titikKoordinat}
              onChange={(e) => setFormValues({ ...formValues, titikKoordinat: e.target.value })}
              placeholder="Contoh: 4°25'12.4&quot;S 136°52'45.8&quot;E"
              aria-invalid={Boolean(state.fieldErrors?.titikKoordinat)}
              aria-describedby={state.fieldErrors?.titikKoordinat ? "error-titikKoordinat" : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                state.fieldErrors?.titikKoordinat
                  ? "border-rose-400 bg-rose-50/30 focus:ring-rose-500 focus:border-rose-500"
                  : "border-stone-300 bg-white focus:ring-amber-600 focus:border-amber-600"
              }`}
            />
            {state.fieldErrors?.titikKoordinat && (
              <p id="error-titikKoordinat" role="alert" className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <span>🔴</span> {state.fieldErrors.titikKoordinat[0]}
              </p>
            )}
          </div>

          {/* 8. Deskripsi */}
          <div className="md:col-span-2">
            <label htmlFor="deskripsi" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Deskripsi Wilayah & Batas Sakral <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              rows={3}
              value={formValues.deskripsi}
              onChange={(e) => setFormValues({ ...formValues, deskripsi: e.target.value })}
              placeholder="Jelaskan sejarah kepemilikan, peruntukan konservasi adat, dan batas alam (minimal 10 karakter)..."
              aria-invalid={Boolean(state.fieldErrors?.deskripsi)}
              aria-describedby={state.fieldErrors?.deskripsi ? "error-deskripsi" : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                state.fieldErrors?.deskripsi
                  ? "border-rose-400 bg-rose-50/30 focus:ring-rose-500 focus:border-rose-500"
                  : "border-stone-300 bg-white focus:ring-amber-600 focus:border-amber-600"
              }`}
            />
            {state.fieldErrors?.deskripsi && (
              <p id="error-deskripsi" role="alert" className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                <span>🔴</span> {state.fieldErrors.deskripsi[0]}
              </p>
            )}
          </div>

          {/* 9. Checkbox Persetujuan Batas Adat */}
          <div className="md:col-span-2 p-4 rounded-xl bg-amber-50/50 border border-amber-200/80">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                id="persetujuanBatasAdat"
                name="persetujuanBatasAdat"
                checked={formValues.persetujuanBatasAdat}
                onChange={(e) => setFormValues({ ...formValues, persetujuanBatasAdat: e.target.checked })}
                aria-invalid={Boolean(state.fieldErrors?.persetujuanBatasAdat)}
                aria-describedby={state.fieldErrors?.persetujuanBatasAdat ? "error-persetujuan" : undefined}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-amber-700 focus:ring-amber-500"
              />
              <span className="text-xs text-stone-700 leading-relaxed">
                <strong className="text-stone-900">Persetujuan Batas Adat Mimika:</strong> Saya menyatakan bahwa batas-batas tanah ulayat ini telah disepakati melalui musyawarah adat bersama marga dan suku tetangga tanpa sengketa aktif.
              </span>
            </label>
            {state.fieldErrors?.persetujuanBatasAdat && (
              <p id="error-persetujuan" role="alert" className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1">
                <span>🔴</span> {state.fieldErrors.persetujuanBatasAdat[0]}
              </p>
            )}
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200">
          <Link
            href="/katalog"
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            ← Batal & Kembali ke Katalog
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all flex items-center gap-2 ${
              isPending
                ? "bg-amber-400 cursor-not-allowed"
                : "bg-amber-700 hover:bg-amber-800 active:scale-95"
            }`}
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Menyimpan ke Arsip...</span>
              </>
            ) : (
              <>
                <span>💾 Simpan Ulayat Adat</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
