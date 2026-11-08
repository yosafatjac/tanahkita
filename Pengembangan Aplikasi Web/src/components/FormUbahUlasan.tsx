"use client";

import React, { useActionState, useState } from "react";
import { ubahUlasan } from "@/app/katalog/ulasan-actions";
import type { FormActionState } from "@/schemas/types";

interface FormUbahUlasanProps {
  id: number;
  itemId: number;
  namaPengulas: string;
  nilaiAwal: number;
  komentarAwal: string;
}

const initialState: FormActionState = {
  success: false,
  message: "",
};

export default function FormUbahUlasan({
  id,
  itemId,
  namaPengulas,
  nilaiAwal,
  komentarAwal,
}: FormUbahUlasanProps) {
  const [buka, setBuka] = useState(false);
  const [state, formAction, isPending] = useActionState(
    ubahUlasan.bind(null, id, itemId),
    initialState
  );

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setBuka(!buka)}
        className="text-xs font-medium text-amber-800 hover:text-amber-900 underline"
      >
        {buka ? "Tutup Ubah" : "✏️ Ubah Ulasan"}
      </button>

      {buka && (
        <div className="mt-2 bg-white border border-stone-200 rounded-xl p-3 shadow-xs">
          <p className="text-[11px] font-bold text-stone-800 mb-2">
            Perbarui Ulasan Kesaksian ({namaPengulas})
          </p>

          {state.message && (
            <div
              role="alert"
              className={`p-2 rounded-lg text-[11px] mb-2 ${
                state.success
                  ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                  : "bg-red-50 border border-red-300 text-red-800"
              }`}
            >
              {state.message}
            </div>
          )}

          <form action={formAction} noValidate className="space-y-2.5">
            <div>
              <label
                htmlFor={`nilai-ubah-${id}`}
                className="block text-[11px] font-semibold text-stone-700 mb-0.5"
              >
                Skor Verifikasi Adat (1–5)
              </label>
              <select
                id={`nilai-ubah-${id}`}
                name="nilai"
                defaultValue={String(nilaiAwal)}
                aria-invalid={Boolean(state.fieldErrors?.nilai)}
                aria-describedby={
                  state.fieldErrors?.nilai ? `err-nilai-${id}` : undefined
                }
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="5">5 — Sangat Terbukti (Patok & Surat Adat Lengkap)</option>
                <option value="4">4 — Terbukti Kuat (Saksi Lintas Marga Sepakat)</option>
                <option value="3">3 — Cukup Terbukti (Perlu Peninjauan Lapangan)</option>
                <option value="2">2 — Kurang Bukti (Batas Alam Belum Jelas)</option>
                <option value="1">1 — Sengketa / Perlu Musyawarah Ulang</option>
              </select>
              {state.fieldErrors?.nilai && (
                <p id={`err-nilai-${id}`} className="text-[11px] text-red-600 mt-0.5">
                  {state.fieldErrors.nilai[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={`komentar-ubah-${id}`}
                className="block text-[11px] font-semibold text-stone-700 mb-0.5"
              >
                Isi Kesaksian / Catatan Verifikasi
              </label>
              <textarea
                id={`komentar-ubah-${id}`}
                name="komentar"
                rows={2}
                defaultValue={komentarAwal}
                aria-invalid={Boolean(state.fieldErrors?.komentar)}
                aria-describedby={
                  state.fieldErrors?.komentar ? `err-komentar-${id}` : undefined
                }
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-amber-500"
                required
              />
              {state.fieldErrors?.komentar && (
                <p id={`err-komentar-${id}`} className="text-[11px] text-red-600 mt-0.5">
                  {state.fieldErrors.komentar[0]}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setBuka(false)}
                className="px-2.5 py-1 text-[11px] text-stone-600 hover:text-stone-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-[11px] font-semibold disabled:opacity-50"
              >
                {isPending ? "Menyimpan..." : "Simpan Ulasan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
