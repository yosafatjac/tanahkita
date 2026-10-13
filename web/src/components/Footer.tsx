import React from "react";

export default function Footer() {
  return (
    <footer className="bg-amber-950 text-amber-200 border-t border-amber-900/60 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kolom 1: Visi Produk */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="font-bold text-lg text-white">TanahKita</span>
              <span className="text-xs bg-amber-800 text-amber-200 px-2 py-0.5 rounded font-mono">
                v0.1
              </span>
            </div>
            <p className="text-sm text-amber-300/80 leading-relaxed">
              Sistem pencatatan dan perlindungan bukti penguasaan tanah ulayat masyarakat adat Papua
              (wilayah Timika & Mimika) berbasis rantai kriptografi terverifikasi.
            </p>
          </div>

          {/* Kolom 2: Penegasan Batasan Hukum */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-100 mb-3">
              Penegasan Batasan Hukum
            </h4>
            <div className="bg-amber-900/40 p-3 rounded-lg border border-amber-800/50 text-xs text-amber-300/90 leading-relaxed">
              <strong>Bukan Pengganti Sertifikat BPN:</strong> TanahKita berfungsi mengabadikan riwayat
              kesepakatan batas adat dan sidik jari berkas digital secara *tamper-evident* sebagai bahan
              pendukung pembuktian atau mediasi sengketa.
            </div>
          </div>

          {/* Kolom 3: Identitas Pengembang */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-100 mb-3">
              Informasi Pengembang
            </h4>
            <p className="text-sm text-amber-200/90 font-medium">
              Yosafat Jacobus (NIM: 105224016)
            </p>
            <p className="text-xs text-amber-300/70 mt-1">
              Program Studi Ilmu Komputer — Universitas Pertamina
            </p>
            <p className="text-xs text-amber-300/70 mt-0.5">
              Tugas Terintegrasi: PAW, Kriptografi, dan Keamanan Komputasi & Siber (CS5-2026)
            </p>
          </div>
        </div>

        <div className="border-t border-amber-900/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-amber-400/80">
          <p>© 2026 TanahKita. Hak Ulayat dan Kearifan Lokal Dilindungi.</p>
          <p className="mt-2 sm:mt-0 font-mono">CSPRNG Secrets • SHA-256 Hash-Chain • WCAG 2.2 AA</p>
        </div>
      </div>
    </footer>
  );
}
