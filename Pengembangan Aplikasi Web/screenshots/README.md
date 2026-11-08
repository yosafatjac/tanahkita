# Direktori Tangkapan Layar Antarmuka & Pengujian (`screenshots/`)

Direktori ini memuat seluruh bukti tangkapan layar (*screenshots*) antarmuka aplikasi **TanahKita** untuk **Milestone 1 (`v0.1`)** dan **Milestone 2 (`v0.2`)** Pengembangan Aplikasi Web:

## 1. Bukti Milestone 2 (`v0.2`) — Integrasi PostgreSQL 18, Prisma ORM 7, CRUD 2 Entitas, & Validasi Server Zod 4
1. **`v02-katalog-postgresql.png`** (`2880 × 2100 px` Retina 2x): Halaman Katalog Wilayah Ulayat (`/katalog`) yang membaca daftar `Item` dan jumlah relasi `Ulasan` secara persisten dari **PostgreSQL 18**.
2. **`v02-detail-crud-relasi.png`** (`2880 × 3500 px` Retina 2x): Halaman Detail Wilayah Ulayat (`/katalog/1`) yang menampilkan operasi CRUD *Update* `Item` (`FormUbahItem`), daftar relasi `1:N` `Ulasan`, formulir *inline* **Ubah Ulasan** (`FormUbahUlasan`), tombol **Hapus Ulasan**, formulir **Tambah Ulasan** (`FormUlasan`), serta tombol **Hapus Item & Kesaksian (Transaksi Atomik `prisma.$transaction`)**.
3. **`v02-masuk-rbac-validasi.png`** (`2880 × 2000 px` Retina 2x): Halaman Masuk Sesi Otoritas Adat (`/masuk`) dengan pilihan cepat 3 peran RBAC (`Tetua Adat`, `Verifikator Adat`, `Pemohon Adat`) dan perlindungan hash kata sandi lambat (`scrypt` + NIST SP 800-63B-4).
4. **`v02-validasi-server-1-ulayat.png`** (`2880 × 3300 px` Retina 2x): **Bukti Validasi Server #1** — Penolakan masukan tidak sah pada formulir pendaftaran wilayah ulayat (`/katalog/tambah`) oleh Server Action `simpanUlayatAction` (Zod 4 `safeParse` & `z.flattenError`) beserta pesan kesalahan merah pada setiap *field* terkait.
5. **`v02-validasi-server-2-ulasan.png`** (`2880 × 3500 px` Retina 2x): **Bukti Validasi Server #2** — Penolakan masukan tidak sah pada formulir kesaksian/ulasan (`/katalog/1`) oleh Server Action `tambahUlasan` saat `nama` hanya 1 karakter (`"A"`).
6. **`v02-validasi-server-3-masuk.png`** (`2880 × 2200 px` Retina 2x): **Bukti Validasi Server #3** — Penolakan kata sandi kurang dari 15 karakter (kebijakan NIST SP 800-63B-4) pada formulir masuk (`/masuk`) oleh Server Action `masukAction`.

---

## 2. Bukti Milestone 1 (`v0.1`) — Antarmuka Responsif, Aksesibilitas, & Validasi Klien
1. **`desktop.png`**: Tangkapan layar antarmuka pada resolusi desktop ($\ge 1024\text{ px}$).
2. **`tablet.png`**: Tangkapan layar antarmuka pada resolusi tablet ($768\text{ px}$).
3. **`mobile.png`** & **`mobile-360.png`**: Tangkapan layar antarmuka pada resolusi ponsel ($\le 640\text{ px}$ / $360\text{ px}$).
4. **`form-validation.png`**: Bukti implementasi pesan kesalahan merah validasi formulir sisi klien (`/daftar`).
5. **`lighthouse-score.png`**: Tangkapan layar panel Lighthouse Chrome DevTools dengan skor Aksesibilitas **98 / 100** ($\ge 85$).
