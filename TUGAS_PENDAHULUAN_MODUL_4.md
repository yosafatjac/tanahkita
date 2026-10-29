# TUGAS PENDAHULUAN MODUL 4: NEXT.JS APP ROUTER

**Identitas Mahasiswa:**
* **Nama:** Yosafat Jacobus  
* **NIM:** 105224016  
* **Program Studi:** Ilmu Komputer, Universitas Pertamina  
* **Mata Kuliah:** Praktikum Pengembangan Aplikasi Web (052356)  
* **Produk:** TanahKita (Sistem Pencatatan dan Pembuktian Penguasaan Tanah Adat Papua — Proyek 3-in-1 PAW, Kriptografi, KKS)  

---

## 1. Peta Rute Produk (TanahKita)

| No. | URL (Path) | Berkas di `app/` | Jenis Rute | Isi Halaman pada Produk TanahKita |
| :---: | :--- | :--- | :---: | :--- |
| 1 | `/` | `app/page.tsx` | Statis | **Beranda & Eksplorasi Klaim Ulayat:** Menampilkan ringkasan statistik tanah adat (total klaim, luas ulayat terdata, status verifikasi adat), pencarian instan nama marga/distrik Mimika, filter status klaim, dan galeri kartu klaim tanah ulayat (`ClaimCard`). |
| 2 | `/daftar` | `app/daftar/page.tsx` | Statis | **Formulir Pendaftaran Klaim Baru:** Formulir pendaftaran wilayah ulayat adat (nama marga, kepala pemohon, distrik di Mimika, koordinat patok batas alam, unggah bukti surat adat/foto patok), validasi formulir sisi klien, dan penerbitan nomor registrasi `TK-MMK-2026-xxx`. |
| 3 | `/klaim/[id]` | `app/klaim/[id]/page.tsx` | Dinamis | **Detail Klaim & Verifikasi Hash-Chain:** Informasi terperinci wilayah ulayat terpilih, batas alam 4 penjuru, daftar dokumen bukti fisik beserta sidik jari SHA-256, visualisasi jejak rantai audit (*audit hash-chain*), dan tombol uji keutuhan rantai interaktif. |
| 4 | `/verifikasi` | `app/verifikasi/page.tsx` | Statis | **Portal Verifikasi Dokumen & Hash Adat:** Halaman publik untuk memverifikasi keaslian berkas bukti ulayat secara independen dengan mencocokkan SHA-256 dokumen asli terhadap catatan buku besar (*ledger*) adat. |
| 5 | `/edukasi` | `app/edukasi/page.tsx` | Statis | **Panduan Edukasi Hak Ulayat & Batas Hukum:** Edukasi masyarakat adat mengenai perlindungan hak ulayat Papua, penegasan batasan non-BPN, dan panduan musyawarah adat. |

---

## 2. Struktur Folder `app/` dan Layout Bersarang

```text
app/
├── layout.tsx                  # Root Layout: Navbar global, Footer non-BPN, font & styling
├── page.tsx                    # Halaman Beranda (/)
├── not-found.tsx               # Penanganan 404 global untuk URL di luar rute terdaftar
├── daftar/
│   └── page.tsx                # Halaman Pendaftaran Klaim (/daftar)
├── verifikasi/
│   └── page.tsx                # Portal Verifikasi Hash & Dokumen (/verifikasi)
├── edukasi/
│   └── page.tsx                # Panduan Edukasi Hak Ulayat (/edukasi)
└── klaim/
    ├── layout.tsx              # Nested Layout: Panel samping navigasi & filter klaim ulayat
    ├── template.tsx            # Template: Remount saat berganti klaim untuk mereset state modal
    ├── loading.tsx             # Suspense fallback saat data klaim ulayat sedang dimuat
    ├── error.tsx               # Error boundary penanganan kegagalan render segmen klaim
    └── [id]/
        ├── page.tsx            # Halaman detail dinamis klaim ulayat (/klaim/[id])
        └── not-found.tsx       # Tampilan khusus jika ID klaim tidak valid atau tidak ada
```

### Rencana Layout Bersarang (*Nested Layout*):
* **Root Layout (`app/layout.tsx`):** Berada di tingkat terluar aplikasi untuk membungkus seluruh segmen rute dengan navigasi utama (`Navbar`) dan penegasan batasan non-BPN (`Footer`).
* **Nested Layout Klaim (`app/klaim/layout.tsx`):** Membungkus halaman katalog `/klaim` dan rute dinamis `/klaim/[id]`. Layout ini menyediakan panel samping (*sidebar*) yang memuat filter status klaim dan navigasi cepat antar-marga ulayat. Panel samping ini dipertahankan secara persisten (tidak di-*remount*) saat berpindah antar-klaim sehingga menghemat beban render halaman.

---

## 3. Aturan Validasi Rute Dinamis `/klaim/[id]`

* **Aturan Nilai `params` yang Sah:**
  1. **Format Pola String:** Parameter `id` klaim harus mengikuti format kode pengenal resmi registrasi ulayat Mimika, yaitu awalan `clm-` diikuti tepat 3 digit angka numerik positif (ekspresi reguler: `/^clm-\d{3}$/`, contoh: `clm-001`, `clm-002`, `clm-003`). Sistem juga dapat mendukung format bilangan bulat positif murni `/^[1-9]\d*$/`.
  2. **Keberadaan Data (*Data Existence*):** Nilai `id` harus terdaftar di dalam koleksi data klaim ulayat (`MOCK_CLAIMS.find(c => c.id === id)` menghasilkan objek `LandClaim` yang valid, bukan `undefined`).

* **Tiga Contoh URL Tidak Sah dan Tampilan yang Diharapkan:**
  1. **`/klaim/tanah-ilegal` (Karakter Teks Sembarang / Format Salah):**
     * *Penyebab:* Melanggar pola ekspresi reguler `/^clm-\d{3}$/` karena berisi teks acak.
     * *Tampilan:* Next.js mengeksekusi `notFound()`, merender `app/klaim/[id]/not-found.tsx` dengan pesan *"Klaim Tanah Adat Tidak Ditemukan"*, petunjuk format nomor registrasi yang benar, serta tombol navigasi *"Kembali ke Daftar Klaim"*. Layout sidebar dan navbar tetap utuh.
  2. **`/klaim/clm--05` (Bilangan Negatif / Format Tanda Rusak):**
     * *Penyebab:* Mengandung karakter minus ganda yang tidak merepresentasikan nomor registrasi yang sah.
     * *Tampilan:* Sistem memanggil `notFound()` dan menampilkan antarmuka ramah pengguna pada `app/klaim/[id]/not-found.tsx` tanpa menimbulkan galat *unhandled exception* atau *crash*.
  3. **`/klaim/clm-999` (Format Pola Sah, tetapi Data Tidak Terdaftar):**
     * *Penyebab:* Lolos validasi format regex, tetapi saat dicari pada basis data ulayat mengembalikan nilai `undefined`.
     * *Tampilan:* Evaluasi `if (!claim) notFound()` dijalankan, menampilkan halaman `not-found.tsx` yang menyatakan bahwa nomor registrasi `clm-999` belum tercatat dalam buku besar adat TanahKita.

---

## 4. Perbedaan `layout.tsx` vs `template.tsx` dan Kasus Penggunaan pada Produk

* **Perbedaan Karakteristik:**
  1. **Siklus Hidup (*Lifecycle* & *Remounting*):** `layout.tsx` bersifat persisten (dipertahankan) saat pengguna berpindah rute di dalam segmen yang sama dan tidak di-*unmount*. Sebaliknya, `template.tsx` membungkus setiap rute anak dengan instansiasi baru (*remount*) pada setiap navigasi karena Next.js menyematkan *key* unik untuk setiap rute.
  2. **Penyimpanan State:** State lokal React (`useState`) di dalam `layout.tsx` akan tetap tersimpan dan tidak hilang. Pada `template.tsx`, seluruh state otomatis di-reset ke kondisi awal (*fresh state*).
  3. **Eksekusi Efek (*Side Effects*):** Hook `useEffect` pada `layout.tsx` hanya dieksekusi satu kali saat segmen pertama kali dibuka. Pada `template.tsx`, `useEffect` dieksekusi ulang pada setiap perubahan rute.

* **Kasus Penggunaan Konkret pada Produk TanahKita yang Lebih Cocok Menggunakan `template.tsx`:**
  * **Reset State Interaktif Verifikasi Integritas Rantai Kriptografis (*Hash Verification Modal & Status*):**  
    Pada halaman detail klaim ulayat, terdapat fitur interaktif pengujian integritas rantai SHA-256 (`VerifyProofModal` & `AuditTimeline`). Pengguna dapat menguji hash berkas bukti atau memilih dokumen bukti untuk diinspeksi.  
    Jika fitur pembungkus ini diletakkan di `layout.tsx`, saat pengguna berpindah dari memeriksa sengketa klaim Marga Magal (`/klaim/clm-001`) ke klaim Marga Beanal (`/klaim/clm-002`), status modal dan hasil verifikasi hash dari klaim sebelumnya akan tetap tertinggal di memori state, berisiko menampilkan hasil verifikasi dokumen yang salah untuk marga yang baru.  
    Dengan menggunakan `template.tsx`, setiap perpindahan ke detail klaim marga lain akan memicu *fresh mount*, membersihkan seluruh state modal/verifikasi, dan memicu animasi masuk (*fade-in entrance*) yang konsisten.

---

## 5. Pembagian Server Components dan Client Components pada TanahKita

| Komponen & Lokasi Berkas | Klasifikasi | Alasan Teknis |
| :--- | :---: | :--- |
| **`HalamanDetailKlaim`**<br>`(app/klaim/[id]/page.tsx)` | **Server Component** | • Mengambil data spesifikasi tanah ulayat, koordinat batas alam, dan blok riwayat audit langsung di server (`await params`).<br>• Melindungi modul data server (seperti kueri basis data atau hash-chain yang diberi proteksi `import "server-only"`) agar tidak terekspos ke peramban klien.<br>• Mengeliminasi ukuran bundel JavaScript klien (*zero client bundle*), mempercepat waktu muat pada perangkat seluler di daerah pedalaman Papua dengan koneksi terbatas.<br>• Mendukung pra-render statis dengan `generateStaticParams` saat *build*. |
| **`AuditTimeline`**<br>`(src/components/AuditTimeline.tsx)` | **Client Component**<br>(`"use client"`) | • Menggunakan *hook* reaktif `useState` untuk mengelola status verifikasi interaktif (status pengujian hash, status verifikasi valid/manipulasi, dan seleksi dokumen bukti).<br>• Menangani *event listener* peramban seperti `onClick` pada tombol *"Uji Integritas Rantai"* untuk menjalankan verifikasi kriptografis Web Crypto API (`window.crypto.subtle`) secara instan di peramban pengguna tanpa *round-trip* ke server. |
| **`Navbar`**<br>`(src/components/Navbar.tsx)` | **Client Component**<br>(`"use client"`) | • Memerlukan akses ke *hook* navigasi sisi klien `usePathname()` dari `next/navigation` untuk membaca URL halaman aktif secara *real-time*.<br>• Menetapkan atribut aksesibilitas `aria-current="page"` dan penanda visual aktif (*highlight*) pada tautan Beranda, Pendaftaran, Verifikasi, atau Edukasi.<br>• Mengelola state buka-tutup menu navigasi seluler (*mobile hamburger menu toggle*) menggunakan `useState`. |

---

## 6. Catatan Pemanfaatan AI

* **Alat:** Antigravity (Google DeepMind)
* **Perintah Utama:** Merancang peta rute App Router Next.js 16 berbasis produk TanahKita, menyusun pohon hierarki folder berkas khusus, memformulasikan regex validasi parameter `clm-[id]`, menganalisis komparasi `layout.tsx` vs `template.tsx` untuk use case verifikasi kripto, serta mengklasifikasikan komponen Server vs Client.
* **Bagian yang Digunakan:** Perancangan arsitektur rute, penentuan aturan validasi parameter, perumusan use case template untuk reset state verifikasi ulayat, dan justifikasi teknis React Server Components.
* **Cara Verifikasi:** Memverifikasi seluruh spesifikasi rute, kesesuaian penamaan berkas App Router (`layout`, `template`, `loading`, `error`, `not-found`), pemanggilan `await params`, dan batasan direktif `"use client"` terhadap modul resmi Praktikum PAW 2026 Modul 4 dan dokumentasi Next.js 16.
