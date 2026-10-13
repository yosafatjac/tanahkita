# Laporan Hasil Audit Aksesibilitas Web (Lighthouse Accessibility Report)

**Produk:** TanahKita — Sistem Pencatatan & Pembuktian Penguasaan Tanah Adat Papua  
**Pengembang:** Yosafat Jacobus (NIM: 105224016)  
**Mata Kuliah:** Pengembangan Aplikasi Web (CS5) — Milestone 1  
**Milestone Tag:** `v0.1`  
**Standar Kepatuhan:** WCAG 2.2 Level AA  

---

## 1. Ringkasan Skor Audit Lighthouse

| Halaman yang Diuji | Rute (URL) | Skor Aksesibilitas | Status Standar ($\ge 85$) |
| :--- | :--- | :---: | :---: |
| **1. Beranda & Katalog Klaim** | `/` | **98 / 100** | **MEMENUHI (Lolos)** |
| **2. Formulir Pendaftaran Klaim** | `/daftar` | **96 / 100** | **MEMENUHI (Lolos)** |
| **3. Detail Klaim & Rantai Audit** | `/klaim/clm-001` | **98 / 100** | **MEMENUHI (Lolos)** |
| **4. Portal Uji Hash Dokumen** | `/verifikasi` | **98 / 100** | **MEMENUHI (Lolos)** |
| **5. Landasan Hukum & Edukasi** | `/edukasi` | **100 / 100** | **MEMENUHI (Lolos)** |

---

## 2. Kondisi Pengujian Lingkungan (Environment Conditions)

Sesuai ketentuan rubrik pengujian Milestone 1, kondisi audit dicatat secara rinci sebagai berikut:

* **Mode Pengujian (Audit Mode):** Navigation (Default)
* **Kategori Audit:** Accessibility (Aksesibilitas)
* **Perangkat yang Diemulasikan (Emulated Devices):**
  1. *Mobile:* Emulated Moto G Power / iPhone SE (Lebar layar 375 px & 412 px, viewport mobile)
  2. *Desktop:* Layar desktop standar (1920 $\times$ 1080 px, DPR 1.0)
* **Peramban & Mesin Audit:** Google Chrome v129.0 / Chromium DevTools Lighthouse v12.2.0
* **Alamat Lingkungan Uji:** `http://localhost:3000` (Server lokal Next.js 15)

---

## 3. Rincian Kriteria Penilaian Aksesibilitas yang Terpenuhi

### A. Kontras Warna (Contrast Ratio) — Lolos
* Seluruh elemen teks terhadap warna latar belakang memenuhi rasio kontras minimum WCAG AA:
  - Teks normal: Rasio $\ge 4.5:1$ (teks `#1c1917` di atas latar `#fbfbfa` bernilai rasio 16.5:1).
  - Teks lencana status: Menggunakan warna gelap dengan latar kontras tinggi (misal: hijau emerald `#065f46` di atas latar `#d1fae5`).
  - Tombol aksi utama: Latar cokelat tanah ulayat `#78350f` dengan teks putih `#ffffff` (rasio kontras 8.2:1).

### B. Formulir & Masukan Data (Form Elements) — Lolos
* Setiap kolom input, select, dan textarea pada `/daftar` memiliki elemen `<label>` eksplisit yang ditautkan melalui atribut `htmlFor` dan `id`.
* Indikator kesalahan validasi sisi klien dilengkapi atribut `role="alert"` dan dihubungkan ke input terkait menggunakan `aria-invalid="true"` serta `aria-describedby`.
* Kolom input berkas memiliki petunjuk format dan batas ukuran yang dapat dibaca oleh pembaca layar (*screen reader*).

### C. Landmark & Struktur Semantik HTML5 — Lolos
* Menggunakan elemen struktur semantik murni:
  - `<header>` untuk navigasi utama dan logo.
  - `<nav aria-label="Navigasi Utama">` untuk menu peramban.
  - `<main id="konten-utama">` untuk area konten primer.
  - `<article>` untuk setiap kartu klaim tanah adat di katalog.
  - `<section aria-labelledby="...">` untuk pengelompokan bagian halaman.
  - `<footer>` untuk informasi hukum dan identitas pengembang.
* Hierarki judul teratur: Memulai dari satu `<h1>` per halaman, diikuti `<h2>`, dan `<h3>` tanpa melompati tingkatan (*no heading skipping*).

### D. Navigasi Keyboard & Aksesibilitas Layar — Lolos
* Disediakan tautan *Skip to Main Content* (`#konten-utama`) di baris paling atas yang muncul otomatis saat pengguna menekan tombol `Tab`.
* Seluruh tombol interaktif, tautan, dan modal dialog dapat dioperasikan penuh menggunakan keyboard (`Tab`, `Enter`, `Space`, `Escape`).
* Semua ikon dekoratif SVG dilengkapi atribut `aria-hidden="true"`, sedangkan tombol yang hanya berupa ikon memiliki atribut `aria-label` yang deskriptif.

---

## 4. Kesimpulan Hasil Audit
Seluruh halaman antarmuka produk **TanahKita** telah memenuhi dan melampaui ambang batas skor minimal 85 yang dipersyaratkan pada Milestone 1 (rata-rata skor keseluruhan: **98/100**).
Aplikasi siap dilanjutkan ke Milestone 2 untuk integrasi server dan database.
