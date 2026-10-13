# Antarmuka Produk Web Responsif dan Aksesibel — TanahKita

**Produk:** TanahKita (Sistem Pencatatan dan Pembuktian Penguasaan Tanah Adat Papua)  
**Pengembang:** Yosafat Jacobus (NIM: 105224016)  
**Mata Kuliah:** Pengembangan Aplikasi Web (CS5) — Tugas 1 / Milestone 1  
**Milestone Tag:** `v0.1`  

---

## 1. Konsep Produk & Permasalahan

### Latar Belakang & Masalah
Di Papua (khususnya Kabupaten Mimika dan Timika), batas penguasaan tanah ulayat adat secara historis diwariskan secara lisan dari generasi ke generasi. Ketiadaan bukti tertulis dan belum adanya sertifikat resmi BPN sering memicu sengketa horizontal antarsuku maupun ancaman pencaplokan sepihak oleh korporasi dan oknum tidak bertanggung jawab.

### Tujuan Produk
TanahKita hadir sebagai platform pencatatan bukti tanah ulayat yang mengintegrasikan kearifan musyawarah adat dengan integritas kriptografis digital.
* **Bukan Pengganti BPN:** Platform ini secara tegas **bukan** pengganti sertifikat resmi BPN, melainkan instrumen pendokumentasian riwayat (*evidence preservation ledger*) yang memperkuat posisi hukum masyarakat adat saat mediasi atau permohonan sertifikat komunal.

### Sasaran Pengguna
1. **Masyarakat & Kepala Marga Adat Papua:** Mendaftarkan klaim wilayah ulayat, mendokumentasikan batas alam (sungai, tebing, pohon), dan mengunggah bukti surat adat atau foto patok batu.
2. **Tetua Adat & Lembaga Musyawarah (Verifikator):** Meninjau batas wilayah, memvalidasi hasil musyawarah, dan menandatangani persetujuan adat.
3. **Masyarakat Umum / Pendamping Hukum:** Memeriksa status klaim dan memverifikasi integritas dokumen agar tidak terjadi tumpang tindih.

---

## 2. Fitur Awal & Halaman Aplikasi (Min. 3 Halaman)

1. **Halaman 1: Beranda & Eksplorasi Klaim (`/`):**
   * Menampilkan ringkasan statistik (total klaim, luas ulayat terdata dalam hektar, jumlah tervalidasi).
   * Fitur pencarian instan berdasarkan nama marga, kepala marga, distrik, atau nomor registrasi.
   * Filter status klaim (Terverifikasi Adat, Menunggu Verifikasi, Dalam Sengketa).
   * Grid kartu klaim adat yang responsif (1 kolom di ponsel, 2 kolom di tablet, 3 kolom di desktop).

2. **Halaman 2: Formulir Pendaftaran Klaim Baru (`/daftar`):**
   * Formulir lengkap mencakup: nama marga, kepala pemohon, distrik di Mimika, kampung, luas lahan, peruntukan, koordinat patok, dan batas 4 penjuru mata angin.
   * **Validasi Sisi Klien (Client-Side Validation):** Memeriksa masukan secara ketat sebelum submit (panjang karakter minimal, angka positif pada luas, distrik terpilih, berkas terunggah, dan persetujuan pernyataan adat).
   * Menampilkan pesan kesalahan spesifik berwarna merah di bawah kolom input yang tidak valid.
   * Notifikasi berhasil pendaftaran dengan penerbitan nomor registrasi otomatis (`TK-MMK-2026-xxx`) dan pembangkitan sidik jari SHA-256.

3. **Halaman 3: Detail Klaim & Verifikasi Hash-Chain (`/klaim/[id]`):**
   * Menampilkan informasi terperinci wilayah ulayat terpilih.
   * Visualisasi batas 4 penjuru (Utara, Selatan, Timur, Barat).
   * Daftar berkas bukti fisik (surat adat, foto patok) beserta sidik jari SHA-256 64-karakter heksadesimal.
   * **Timeline Hash-Chain:** Memperlihatkan keterkaitan *previous hash* dan *current hash* tiap peristiwa.
   * Tombol interaktif *"Uji Integritas Rantai Sekarang"* untuk membuktikan tidak ada data yang dimanipulasi.

---

## 3. Komponen Antarmuka Reusable (Min. 5 Komponen)

| Komponen | Berkas | Peran dan Penggunaan Ulang |
| :--- | :--- | :--- |
| **`Navbar`** | `src/components/Navbar.tsx` | Navigasi utama dengan tautan beranda, daftar klaim, skip-to-content untuk aksesibilitas, dan tombol menu mobile seluler. |
| **`Footer`** | `src/components/Footer.tsx` | Kaki halaman memuat penegasan batasan non-BPN, identitas pengembang, dan ringkasan hak ulayat. |
| **`StatusBadge`** | `src/components/StatusBadge.tsx` | Lencana status dengan palet kontras warna WCAG AA (hijau, kuning amber, merah) dan ikon SVG aksesibel. |
| **`ClaimCard`** | `src/components/ClaimCard.tsx` | Kartu ringkasan klaim tanah ulayat untuk menampilkan marga, luas, lokasi, dan status di halaman katalog. |
| **`HashViewer`** | `src/components/HashViewer.tsx` | Penampil ringkasan hash SHA-256 (format ringkas atau penuh) dilengkapi tombol aksi salin (*clipboard*). |
| **`AuditTimeline`** | `src/components/AuditTimeline.tsx` | Komponen visual jejak hash-chain riwayat tanah berantai dengan tombol verifikasi keutuhan rantai interaktif. |

---

## 4. Teknologi yang Digunakan

* **Framework:** Next.js 15 (React 19, TypeScript)
* **Styling & Tata Letak:** Tailwind CSS (dengan palet warna tanah ulayat bumi Papua)
* **Data Layer:** Mock Data terstruktur (`src/data/mockClaims.ts`) mewakili marga di Mimika (Magal, Matuan, Beanal, Murib)
* **Standar Aksesibilitas:** WCAG 2.2 Level AA

---

## 5. Penerapan Desain Responsif & Aksesibilitas Web

### Desain Responsif (Mobile-First)
* **Layar Ponsel ($\le$ 640 px):** Navigasi bertumpuk vertikal dengan menu hamburger; grid kartu tampil 1 kolom (`grid-cols-1`); tata letak formulir tersusun rapi tanpa memicu gulir horizontal (*no horizontal scroll*).
* **Layar Tablet (768 px):** Navigasi mendatar; daftar kartu tampil 2 kolom (`sm:grid-cols-2`).
* **Layar Desktop ($\ge$ 1024 px):** Daftar kartu tampil 3 kolom (`lg:grid-cols-3`); batas 4 penjuru tampil 4 kolom berdampingan (`lg:grid-cols-4`).

### Prinsip Aksesibilitas (Target Lighthouse $\ge$ 85)
* Penggunaan elemen semantik HTML5 murni (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<fieldset>`, `<legend>`, `<footer>`).
* Tautan tersembunyi *Skip to Content* (`#konten-utama`) yang terlihat saat tombol `Tab` ditekan.
* Label formulir eksplisit dengan atribut `htmlFor` dan `id` pada seluruh elemen input.
* Indikator kesalahan formulir menggunakan `role="alert"` dan `aria-invalid="true"`.
* Rasio kontras teks terhadap latar belakang di atas standar minimum 4.5:1.

---

## 6. Petunjuk Menjalankan Proyek

```bash
# Masuk ke direktori Pengembangan Aplikasi Web
cd "Pengembangan Aplikasi Web"

# Pasang dependensi
npm install

# Jalankan server pengembangan lokal
npm run dev

# Buka di peramban: http://localhost:3000
```
