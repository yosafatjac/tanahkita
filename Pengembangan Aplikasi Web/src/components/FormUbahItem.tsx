"use client";

import React, { useActionState, useState } from "react";
import { ubahItem } from "@/app/katalog/actions";
import type { FormActionState } from "@/schemas/types";

interface FormUbahItemProps {
  id: number;
  deskripsiAwal: string;
  tersediaAwal: boolean;
}

const initialState: FormActionState = {
  success: false,
  message: "",
};

export default function FormUbahItem({
  id,
  deskripsiAwal,
  tersediaAwal,
}: FormUbahItemProps) {
  const [buka, setBuka] = useState(false);
  const [state, formAction, isPending] = useActionState(
    ubahItem.bind(null, id),
    initialState
  );

  return (
    <div className="mt-4 pt-4 border-t border-stone-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-600">
          Operasi CRUD: Pembaruan Data (Update)
        </span>
        <button
          type="button"
          onClick={() => setBuka(!buka)}
          className="text-xs font-medium text-amber-800 hover:text-amber-900 underline"
        >
          {buka ? "Tutup Formulir Ubah" : "✏️ Ubah Deskripsi / Status"}
        </button>
      </div>

      {buka && (
        <div className="mt-3 bg-stone-50 border border-stone-200 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-stone-800 mb-2">
            Perbarui Wilayah Ulayat (Prisma ORM Update)
          </h4>

          {state.message && (
            <div
              className={`p-2.5 rounded-xl text-xs mb-3 ${
                state.success
                  ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                  : "bg-red-50 border border-red-300 text-red-800"
              }`}
            >
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Deskripsi Patok Batas & Kawasan
              </label>
              <textarea
                name="deskripsi"
                rows={3}
                defaultValue={deskripsiAwal}
                className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`tersedia-${id}`}
                name="tersedia"
                defaultChecked={tersediaAwal}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              <label
                htmlFor={`tersedia-${id}`}
                className="text-xs text-stone-700 cursor-pointer"
              >
                Wilayah Terbuka / Tersedia dalam Registrasi Adat
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBuka(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {isPending ? "Menyimpan..." : "Simpan Pembaruan (Update)"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
