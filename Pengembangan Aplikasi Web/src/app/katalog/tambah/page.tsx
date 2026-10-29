import { ambilSesi } from "@/lib/sesi";
import { FormTambahUlayat } from "@/components/FormTambahUlayat";
import { masukCepatTetuaAction, keluarAction } from "@/app/masuk/actions";
import Link from "next/link";

export const metadata = {
  title: "Tambah Wilayah Ulayat — TanahKita Mimika",
  description: "Formulir pendaftaran dan pembuktian wilayah tanah ulayat adat Kabupaten Mimika.",
};

export default async function HalamanTambahUlayat() {
  const sesi = await ambilSesi();

  return (
    <div className="space-y-6">
      {/* Banner Status Sesi Tetua Adat */}
      <div className="p-4 rounded-xl border bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${sesi ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
            <div>
              <p className="text-xs font-bold text-stone-800">
                {sesi ? (
                  <>Sesi Aktif: <span className="text-emerald-700">{sesi.nama}</span> ({sesi.peran} • {sesi.marga})</>
                ) : (
                  <>Status Sesi: <span className="text-amber-800">Tamu (Belum Masuk Sebagai Tetua)</span></>
                )}
              </p>
              <p className="text-[11px] text-stone-500">
                {sesi
                  ? "Cookie sesi terautentikasi (HttpOnly). Berwenang menambah arsip ulayat baru."
                  : "Silakan gunakan tombol Masuk Cepat untuk menguji validasi sesi di Modul 5."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sesi ? (
              <form action={keluarAction}>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300 transition-colors"
                >
                  Keluar Sesi
                </button>
              </form>
            ) : (
              <>
                <Link
                  href="/masuk"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300 transition-colors"
                >
                  Masuk Manual
                </Link>
                <form action={masukCepatTetuaAction}>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-700 text-white hover:bg-amber-800 transition-colors"
                  >
                    ⚡ Masuk Cepat Tetua
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Komponen Formulir Utama dengan Zod Schema & useActionState */}
      <FormTambahUlayat />
    </div>
  );
}
