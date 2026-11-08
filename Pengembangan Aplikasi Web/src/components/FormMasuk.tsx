"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { masukAction, masukCepatTetuaAction } from "@/app/masuk/actions";
import type { FormActionState } from "@/schemas";

const initialState: FormActionState = {
  success: false,
};

export function FormMasuk() {
  const [state, formAction, isPending] = useActionState(masukAction, initialState);
  const [email, setEmail] = useState((state.fields?.email as string) || "");
  const [kataSandi, setKataSandi] = useState("");

  const isiKredensialPeran = (pilihanEmail: string) => {
    setEmail(pilihanEmail);
    setKataSandi("AdatMimika2026#TanahKita");
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-stone-900 p-6 text-white text-center">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30 mb-2">
          Otoritas Adat Mimika • RBAC 3 Peran
        </span>
        <h2 className="text-xl font-bold font-serif">Masuk Sesi Otoritas Adat</h2>
        <p className="text-xs text-amber-100/80 mt-1">
          Dilindungi hash kata sandi lambat (scrypt + salt unik) & standar NIST SP 800-63B-4 (min. 15 karakter).
        </p>
      </div>

      {/* Alert Error */}
      {state.message && (
        <div role="alert" className="p-4 mx-6 mt-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
          <p className="font-bold">⚠️ Masuk Gagal</p>
          <p className="mt-0.5">{state.message}</p>
        </div>
      )}

      {/* Tombol Demo Pintas */}
      <div className="p-6 pb-0">
        <form action={masukCepatTetuaAction}>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
          >
            <span>⚡ Masuk Cepat sebagai Tetua Adat (Demo Praktikum)</span>
          </button>
        </form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white px-2 text-stone-400 font-semibold">Atau Masuk Manual (Uji RBAC)</span>
          </div>
        </div>
      </div>

      {/* Form Manual */}
      <form action={formAction} noValidate className="p-6 pt-0 space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Alamat Email Peran Adat
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tetua.magal@tanahkita.id"
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={state.fieldErrors?.email ? "err-email-masuk" : undefined}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
          {state.fieldErrors?.email && (
            <p id="err-email-masuk" className="text-xs text-rose-600 font-medium mt-1">
              🔴 {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="kataSandi" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Frasa Kata Sandi (Min. 15 Karakter — NIST SP 800-63B-4)
          </label>
          <input
            type="password"
            id="kataSandi"
            name="kataSandi"
            value={kataSandi}
            onChange={(e) => setKataSandi(e.target.value)}
            placeholder="AdatMimika2026#TanahKita"
            aria-invalid={Boolean(state.fieldErrors?.kataSandi)}
            aria-describedby={state.fieldErrors?.kataSandi ? "err-sandi-masuk" : undefined}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
          {state.fieldErrors?.kataSandi && (
            <p id="err-sandi-masuk" className="text-xs text-rose-600 font-medium mt-1">
              🔴 {state.fieldErrors.kataSandi[0]}
            </p>
          )}
        </div>

        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-semibold text-stone-500">
            📋 Isi Otomatis Kredensial Uji RBAC (Frasa Sandi 24 Karakter):
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => isiKredensialPeran("tetua.magal@tanahkita.id")}
              className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 hover:bg-amber-100 font-semibold"
            >
              1. Tetua Adat (Admin)
            </button>
            <button
              type="button"
              onClick={() => isiKredensialPeran("verifikator.omaleng@tanahkita.id")}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 hover:bg-emerald-100 font-semibold"
            >
              2. Verifikator Adat
            </button>
            <button
              type="button"
              onClick={() => isiKredensialPeran("pemohon.beanal@tanahkita.id")}
              className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-300 text-[11px] text-stone-800 hover:bg-stone-200 font-semibold"
            >
              3. Pemohon Adat
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-amber-700 hover:bg-amber-800 transition-colors shadow-sm disabled:bg-stone-300"
        >
          {isPending ? "Memeriksa Kredensial..." : "Masuk ke Sistem"}
        </button>

        <div className="text-center pt-2">
          <Link href="/katalog" className="text-xs text-stone-500 hover:text-stone-800">
            ← Kembali ke Katalog Ulayat
          </Link>
        </div>
      </form>
    </div>
  );
}
