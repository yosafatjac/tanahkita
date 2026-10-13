import React from "react";
import Link from "next/link";

export default function EdukasiPage() {
  return (
    <div className="py-8 sm:py-12 bg-stone-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div>
          <nav className="text-xs text-stone-500 mb-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Beranda</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-800 font-medium">Edukasi Hukum & Kriptografi</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Landasan Hukum Adat Papua & Peran Kriptografi Standar
          </h1>
          <p className="mt-2 text-stone-600 text-sm max-w-3xl leading-relaxed">
            Memahami mengapa masyarakat adat di Mimika membutuhkan sistem pencatatan berbasis kriptografi untuk melindungi riwayat tanah leluhur dari manipulasi dan sengketa.
          </p>
        </div>

        {/* Banner Penegasan Non-BPN */}
        <div className="bg-amber-900 text-amber-50 rounded-2xl p-6 sm:p-8 shadow-sm border border-amber-800 space-y-3">
          <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>PENEGASAN BATASAN HUKUM PRODUK (NON-BPN)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            TanahKita Bukan Pengganti Sertifikat Resmi Badan Pertanahan Nasional (BPN)
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
            Sesuai Undang-Undang Pokok Agraria (UUPA No. 5 Tahun 1960), satu-satunya lembaga negara yang berwenang menerbitkan sertifikat hak milik atas tanah di Indonesia adalah Kementerian ATR/BPN.
            <strong> TanahKita berfungsi sebagai <em>Evidence Preservation Ledger</em></strong> — buku besar digital pencatat bukti historis musyawarah adat, koordinat patok batas alam, dan kesaksian marga tetangga.
            Catatan ini menjadi bukti otentik yang tidak dapat disangkal (<em>non-repudiation</em>) saat proses mediasi peradilan adat maupun pengajuan sertifikasi komunal ke pemerintah daerah.
          </p>
        </div>

        {/* Bagian 1: Landasan Konstitusional Hak Ulayat */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-800"></span>
            <span>1. Payung Hukum Hak Masyarakat Hukum Adat Papua</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-700">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <h3 className="font-bold text-stone-900 mb-1">Pasal 18B Ayat (2) UUD 1945</h3>
              <p className="leading-relaxed text-stone-600">
                Negara mengakui dan menghormati kesatuan-kesatuan masyarakat hukum adat beserta hak-hak tradisionalnya sepanjang masih hidup dan sesuai perkembangan masyarakat.
              </p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <h3 className="font-bold text-stone-900 mb-1">UU No. 2 Tahun 2021 (Otsus Papua)</h3>
              <p className="leading-relaxed text-stone-600">
                Memberikan kewenangan khusus bagi perlindungan dan pemberdayaan hak ulayat masyarakat adat Papua atas tanah, hutan, dan sumber daya alam leluhur.
              </p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <h3 className="font-bold text-stone-900 mb-1">Putusan MK No. 35/PUU-X/2012</h3>
              <p className="leading-relaxed text-stone-600">
                Menegaskan bahwa hutan adat berada di dalam wilayah masyarakat hukum adat dan bukan lagi merupakan hutan negara, sehingga memerlukan bukti batas ulayat yang sah.
              </p>
            </div>
          </div>
        </div>

        {/* Bagian 2: Tiga Kebutuhan Perlindungan Data (Rubrik K1 Kripto) */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-800"></span>
            <span>2. Tiga Kebutuhan Perlindungan Data Kriptografis</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-300 text-stone-900">
                  <th className="p-3 font-bold">Data Produk</th>
                  <th className="p-3 font-bold">Tujuan Perlindungan</th>
                  <th className="p-3 font-bold">Konsekuensi Jika Bocor/Rusak</th>
                  <th className="p-3 font-bold">Mekanisme Kripto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-700">
                <tr className="hover:bg-stone-50">
                  <td className="p-3 font-semibold text-stone-900">1. Surat Kesepakatan & Foto Patok</td>
                  <td className="p-3">Integritas data (mencegah modifikasi sepihak)</td>
                  <td className="p-3">Batas tanah digeser diam-diam, memicu perang suku atau klaim korporasi</td>
                  <td className="p-3 font-mono text-emerald-800 font-bold">SHA-256 Digest</td>
                </tr>
                <tr className="hover:bg-stone-50">
                  <td className="p-3 font-semibold text-stone-900">2. Token Verifikasi Tetua Adat</td>
                  <td className="p-3">Otentikasi & anti-pemalsuan tanda tangan musyawarah</td>
                  <td className="p-3">Penyerang memalsukan persetujuan tetua adat yang tidak hadir</td>
                  <td className="p-3 font-mono text-emerald-800 font-bold">CSPRNG Token (256-bit)</td>
                </tr>
                <tr className="hover:bg-stone-50">
                  <td className="p-3 font-semibold text-stone-900">3. Rantai Riwayat Perubahan Klaim</td>
                  <td className="p-3">Non-repudiation & integritas urutan waktu</td>
                  <td className="p-3">Manipulator menghapus catatan penolakan sengketa masa lalu</td>
                  <td className="p-3 font-mono text-emerald-800 font-bold">Sequential Hash Chain</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bagian 3: Edukasi Hashing vs Enkripsi vs Encoding */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-800"></span>
            <span>3. Perbedaan Konsep: Hashing vs Enkripsi vs Encoding</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold uppercase tracking-wider text-[10px]">
                Digunakan di TanahKita
              </span>
              <h3 className="text-sm font-bold text-amber-950">Cryptographic Hashing (SHA-256)</h3>
              <p className="text-stone-700 leading-relaxed">
                Fungsi satu arah (<em>one-way</em>) yang memetakan masukan ukuran berapa pun menjadi ringkasan tetap 256-bit (64 heksadesimal).
                <strong> Tidak memiliki kunci dekripsi</strong>; dirancang semata-mata untuk menguji apakah data berubah atau tetap utuh.
              </p>
            </div>

            <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="px-2 py-0.5 bg-stone-200 text-stone-800 rounded font-bold uppercase tracking-wider text-[10px]">
                Kerahasiaan Pesan
              </span>
              <h3 className="text-sm font-bold text-stone-900">Enkripsi (AES / RSA)</h3>
              <p className="text-stone-700 leading-relaxed">
                Fungsi dua arah (<em>reversible</em>) yang mengaburkan teks asli (plaintext) menjadi ciphertext menggunakan kunci rahasia.
                Tujuannya adalah <strong>kerahasiaan (confidentiality)</strong> agar hanya pemegang kunci yang bisa membaca.
              </p>
            </div>

            <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="px-2 py-0.5 bg-stone-200 text-stone-800 rounded font-bold uppercase tracking-wider text-[10px]">
                Bukan Keamanan
              </span>
              <h3 className="text-sm font-bold text-stone-900">Encoding (Base64 / Hex)</h3>
              <p className="text-stone-700 leading-relaxed">
                Transformasi format data agar dapat ditransmisikan melalui protokol tertentu (misal binary ke teks ASCII).
                <strong> Sama sekali tidak memberikan proteksi keamanan</strong> karena siapa pun dapat men-decode kembali tanpa kunci.
              </p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-stone-100 rounded-2xl border border-stone-200 gap-4">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Ingin Mencoba Verifikasi Dokumen Sekarang?</h3>
            <p className="text-xs text-stone-600">Gunakan portal uji Web Crypto untuk menghitung dan mencocokkan hash berkas.</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/verifikasi"
              className="px-4 py-2 bg-amber-900 text-white rounded-lg text-xs font-semibold hover:bg-amber-950 transition-colors"
            >
              Uji Dokumen Mandiri →
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-white text-stone-800 border border-stone-300 rounded-lg text-xs font-semibold hover:bg-stone-50 transition-colors"
            >
              Lihat Katalog Klaim
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
