import { ambilSesi } from "@/lib/sesi";
import { FormMasuk } from "@/components/FormMasuk";
import { keluarAction } from "./actions";
import Link from "next/link";

export const metadata = {
  title: "Masuk Tetua Adat — TanahKita Mimika",
  description: "Autentikasi sesi tetua adat untuk pendaftaran dan verifikasi wilayah ulayat.",
};

export default async function HalamanMasuk() {
  const sesi = await ambilSesi();

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        {sesi ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-bold font-serif text-stone-900">Sesi Anda Sedang Aktif</h2>
            <p className="text-sm text-stone-600">
              Anda terautentikasi sebagai <strong className="text-stone-800">{sesi.nama}</strong> ({sesi.peran} - {sesi.marga}).
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/katalog/tambah"
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-700 text-white rounded-xl text-xs font-bold hover:bg-amber-800 transition-colors"
              >
                + Buka Formulir Tambah Ulayat
              </Link>
              <form action={keluarAction} className="w-full sm:w-auto">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors border border-stone-300"
                >
                  Keluar dari Sesi
                </button>
              </form>
            </div>
          </div>
        ) : (
          <FormMasuk />
        )}
      </div>
    </main>
  );
}
