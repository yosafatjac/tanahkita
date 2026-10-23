"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface FormAksesArsipProps {
  validIds: string[];
}

export default function FormAksesArsip({ validIds }: FormAksesArsipProps) {
  const router = useRouter();
  const [inputId, setInputId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const raw = inputId.trim().toLowerCase();
    if (!raw) {
      setErrorMessage("Silakan masukkan Nomor Registrasi atau Kunci ID Wilayah Adat.");
      return;
    }

    // Normalisasi input (contoh: k-001 atau k001 atau ktl001 menjadi ktl-001)
    let targetId = raw;
    const cleanNumbers = raw.replace(/\D/g, "");

    if (raw.startsWith("k-") || raw.startsWith("ktl-") || raw.startsWith("k0")) {
      if (cleanNumbers.length > 0) {
        targetId = `ktl-${cleanNumbers.padStart(3, "0")}`;
      }
    } else if (/^\d+$/.test(raw)) {
      targetId = `ktl-${cleanNumbers.padStart(3, "0")}`;
    }

    // Periksa apakah ID terdaftar di sistem
    const matched = validIds.find((id) => id.toLowerCase() === targetId.toLowerCase());

    if (!matched) {
      setErrorMessage(
        `Kunci ID "${inputId}" tidak sah atau tidak memiliki hak akses. Data tanah adat tetap terlindungi.`
      );
      return;
    }

    // Jika ID sah, arahkan langsung ke rute dinamis privat /katalog/[id]
    router.push(`/katalog/${matched}`);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="katalog-id-input" className="block text-sm font-bold text-stone-900 mb-1.5">
            Kunci Nomor Registrasi (ID Ulayat):
          </label>
          <p className="text-xs text-stone-500 mb-3">
            Masukkan ID lengkap pemegang hak. Sistem tidak akan memberikan petunjuk nama tanah orang lain demi mencegah penyerobotan batas.
          </p>

          <div className="relative">
            <input
              id="katalog-id-input"
              type="text"
              value={inputId}
              onChange={(e) => {
                setInputId(e.target.value);
                setErrorMessage("");
              }}
              placeholder="Masukkan ID Resmi (contoh: ktl-001)"
              className="w-full px-4 py-3.5 rounded-xl border border-stone-300 text-base font-mono focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 shadow-inner text-stone-900"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in"
          >
            <svg className="w-5 h-5 flex-shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <svg className="w-4 h-4 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          <span>Verifikasi Kunci & Buka Berkas [id]</span>
        </button>
      </form>

      {/* Catatan Akademik Praktikum Modul 4 (Tanpa Membocorkan Data) */}
      <div className="mt-8 pt-6 border-t border-stone-100 text-[11px] text-stone-500 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-stone-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          <span>Konsep Praktikum PAW (Dynamic Routing & Keamanan Data):</span>
        </div>
        <p className="leading-relaxed">
          Halaman ini bertindak sebagai <strong>Gerbang Rute Statis (`/katalog`)</strong> yang dirender sebagai <em>Server Component</em> dan meneruskan daftar ID terotorisasi ke <em>Client Component</em> (<code>FormAksesArsip</code>). Saat ID yang sah dimasukkan, Next.js mengeksekusi routing dinamis ke segmen privat <strong>`app/katalog/[id]`</strong>.
        </p>
      </div>
    </div>
  );
}
