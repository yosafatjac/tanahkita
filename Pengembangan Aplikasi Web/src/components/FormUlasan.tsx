"use client";

import React, { useActionState } from "react";
import { tambahUlasan } from "@/app/katalog/ulasan-actions";
import type { FormActionState } from "@/schemas/types";

interface FormUlasanProps {
  itemId: number;
}

const initialState: FormActionState = {
  success: false,
  message: "",
};

export default function FormUlasan({ itemId }: FormUlasanProps) {
  const [state, formAction, isPending] = useActionState(
    tambahUlasan.bind(null, itemId),
    initialState
  );

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 mt-8">
      <h3 className="text-lg font-bold text-stone-900 mb-2">
        Beri Kesaksian / Verifikasi Batas Adat
      </h3>
      <p className="text-xs text-stone-500 mb-4">
        Catat kesaksian resmi atau penilaian keabsahan batas tanah ulayat marga.
      </p>

      {state.message && (
        <div
          className={`p-3 rounded-xl text-xs mb-4 ${
            state.success
              ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
              : "bg-red-50 border border-red-300 text-red-800"
          }`}
        >
          {state.message}
        </div>
      )}

      <form action={formAction} noValidate className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Nama Saksi / Pengulas
          </label>
          <input
            type="text"
            name="nama"
            defaultValue={state.fields?.nama?.toString() || ""}
            placeholder="Contoh: Marga Omaleng / Tetua Iwaka"
            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 bg-white"
            required
          />
          {state.fieldErrors?.nama && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {state.fieldErrors.nama[0]}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Skor Verifikasi Keabsahan (1 s.d. 5)
          </label>
          <select
            name="nilai"
            defaultValue={state.fields?.nilai?.toString() || "5"}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 bg-white"
            required
          >
            <option value="5">5 - Sangat Sah (Patok & Sejarah Sangat Jelas)</option>
            <option value="4">4 - Sah (Disepakati Mayoritas Marga)</option>
            <option value="3">3 - Cukup Sah (Memerlukan Pengecekan Lapangan)</option>
            <option value="2">2 - Kurang Sah (Terdapat Klaim Batas)</option>
            <option value="1">1 - Tidak Sah (Berpotensi Sengketa)</option>
          </select>
          {state.fieldErrors?.nilai && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {state.fieldErrors.nilai[0]}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Isi Kesaksian / Catatan Batas Alam
          </label>
          <textarea
            name="komentar"
            rows={3}
            defaultValue={state.fields?.komentar?.toString() || ""}
            placeholder="Tuliskan catatan kesaksian mengenai patok batas pohon atau sungai..."
            className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 bg-white"
            required
          />
          {state.fieldErrors?.komentar && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {state.fieldErrors.komentar[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50"
        >
          {isPending ? "Menyimpan Kesaksian..." : "Kirim Ulasan & Verifikasi Adat"}
        </button>
      </form>
    </div>
  );
}
