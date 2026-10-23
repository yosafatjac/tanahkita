import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tentang | TanahKita",
  description:
    "Informasi mengenai latar belakang, pengguna sasaran, dan fitur utama platform TanahKita untuk pencatatan bukti penguasaan tanah ulayat Papua.",
};

export default function HalamanTentang() {
  return (
    <main id="konten" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">
          <span>Tentang Produk • Proyek Terintegrasi 3-in-1</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Tentang TanahKita
        </h1>

        <p className="text-base text-stone-700 leading-relaxed">
          <strong>TanahKita</strong> adalah platform pencatatan dan verifikasi bukti penguasaan
          tanah ulayat bagi masyarakat adat di Papua (khususnya Kabupaten Mimika dan Timika) yang
          mengatasi masalah kerawanan sengketa batas lisan serta risiko pemalsuan dokumen bukti
          penguasaan adat secara sepihak. Produk ini ditujukan bagi kepala marga dan masyarakat
          adat sebagai pendaftar klaim, tetua adat pada lembaga musyawarah sebagai verifikator,
          serta pendamping hukum maupun masyarakat umum yang memerlukan rujukan bukti terverifikasi.
        </p>

        <p className="text-base text-stone-700 leading-relaxed">
          Fitur utama TanahKita meliputi pendaftaran klaim wilayah ulayat beserta batas alam empat
          penjuru mata angin, pembangkitan sidik jari digital <strong>SHA-256</strong> untuk setiap
          berkas bukti fisik (surat kesepakatan adat dan foto patok batas), serta pencatatan riwayat
          berantai (<em>audit hash-chain</em>) yang bersifat <em>tamper-evident</em> sehingga setiap
          perubahan data tanpa otorisasi dapat langsung terdeteksi.
        </p>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-950">
          <p className="font-bold mb-1">Penegasan Batasan Hukum (Bukan Pengganti BPN):</p>
          <p className="leading-relaxed text-amber-900">
            Sistem ini <strong>bukan</strong> pengganti sertifikat resmi Badan Pertanahan Nasional
            (BPN) dan tidak menerbitkan alas hak agraria negara, melainkan instrumen
            pendokumentasian bukti historis masyarakat adat untuk memperkuat posisi mediasi adat
            atau pengajuan sertifikasi komunal.
          </p>
        </div>

        <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-3">
          <Link
            href="/katalog"
            className="px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-semibold text-sm transition-colors"
          >
            Buka Katalog Wilayah
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 font-semibold text-sm transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
