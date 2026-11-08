# TanahKita — Sistem Pencatatan & Pembuktian Penguasaan Tanah Adat Papua

**Pengembang:** Yosafat Jacobus  
**NIM:** 105224016  
**Program Studi:** Ilmu Komputer — Universitas Pertamina  
**Tahun Ajaran:** Ganjil 2026/2027 (Semester 5)  
**Tautan Repositori:** https://github.com/yosafatjac/tanahkita  

---

## 1. Tentang Produk

**TanahKita** adalah platform pencatatan dan verifikasi bukti penguasaan tanah ulayat bagi masyarakat adat di Papua (khususnya Kabupaten Mimika dan Timika) yang belum bersertifikat BPN. Sistem ini dirancang agar bukti penguasaan adat terdokumentasi secara terstruktur dan tidak dapat diubah tanpa terdeteksi (*tamper-evident*).

> **Penegasan Batasan Hukum:**  
> Sistem ini **BUKAN** pengganti sertifikat resmi Badan Pertanahan Nasional (BPN) dan tidak dapat diklaim sebagai alas hak mutlak hukum agraria negara. Fungsinya adalah memperkuat posisi pembuktian masyarakat adat dalam mendokumentasikan batas alam lisan, mencegah pemalsuan bukti sepihak oleh mafia tanah, dan menjadi bahan rujukan mediasi adat atau permohonan sertifikasi komunal di masa depan.

---

## 2. Struktur Repositori & Integrasi Tiga Mata Kuliah

Repositori ini merupakan **satu produk bersama terintegrasi** yang memenuhi capaian tiga mata kuliah semester 5 (PAW, Kriptografi, dan KKS):

```text
tanahkita/
├── Pengembangan Aplikasi Web/ <-- [Pengembangan Aplikasi Web / PAW] (Tag: v0.1 & v0.2)
│   ├── prisma/                <-- Skema PostgreSQL 18 (Item 1:N Ulasan), migrasi SQL, & seed.ts
│   ├── scripts/               <-- Skrip verifikasi otomatis 12 skenario CRUD, relasi, transaksi, & Zod
│   ├── src/                   <-- Source code Next.js 15 App Router / TypeScript 5
│   │   ├── app/               <-- Beranda, Katalog CRUD (/katalog, /katalog/[id], /katalog/tambah), Masuk Sesi RBAC
│   │   ├── components/        <-- Komponen Server & Client (termasuk FormUbahItem, FormUlasan, FormUbahUlasan)
│   │   ├── lib/               <-- Prisma 7 PG adapter, data.ts, sesi.ts (HttpOnly), password-hash.ts (scrypt NIST)
│   │   └── schemas/           <-- Skema validasi server Zod 4 (ulayat, ulasan, skemaUbahUlasan, auth)
│   └── README.md              <-- Dokumentasi teknis lengkap PAW (v0.1 & v0.2)
│
├── Kriptografi/               <-- [Kriptografi] Layanan Kriptografi Terautentikasi (Tag: v0.1 & v0.2)
│   ├── src/
│   │   ├── hasher.py          <-- SHA-256 hashing & deteksi tampering (Tugas 1)
│   │   ├── tokens.py          <-- CSPRNG token verifikasi tetua adat (Tugas 1)
│   │   ├── chain.py           <-- Hash-chain sequential ledger riwayat tanah (Tugas 1)
│   │   ├── key_manager.py     <-- [Tugas 2] CSPRNG 256-bit Master Key di luar repo (0600), rotasi, & HKDF-SHA256
│   │   ├── validator.py       <-- [Tugas 2] Validasi allowlist ketat, tolak bool/unknown fields, NFC, & AAD
│   │   ├── aead_archive.py    <-- [Tugas 2] Enkripsi arsip AES-256-GCM (AEAD) + AAD terhubung ke hasher.py
│   │   ├── hmac_chain.py      <-- [Tugas 2] Rantai riwayat berautentikasi HMAC-SHA-256 (menutup celah K1)
│   │   └── password_security.py <-- [Tugas 2] Hash kata sandi lambat Argon2id + kebijakan NIST SP 800-63B-4
│   ├── tests/
│   │   ├── test_crypto.py     <-- 5 Skenario Uji Unit Tugas 1
│   │   └── test_tugas2.py     <-- 12 Skenario Uji Otomatis Tugas 2 (16 passed, 1 xfailed)
│   ├── KEPUTUSAN.md           <-- [Tugas 2] Dokumen keputusan teknis: alur data, primitif, manajemen kunci, risiko sisa
│   └── README.md              <-- Dokumentasi & panduan verifikasi pytest Kriptografi
│
├── security/                  <-- [Keamanan Komputasi dan Siber / KKS] (Tag: sec-0.1 & sec-0.2)
│   ├── asset-inventory.md     <-- [Tugas 1] 12 aset + alasan CIA
│   ├── dfd.md                 <-- [Tugas 1] DFD Level 1 + 3 trust boundary
│   ├── threat-model.md        <-- [Tugas 1] 13 ancaman STRIDE spesifik
│   ├── risk-register.md       <-- [Tugas 1 & 2] Register 5 risiko prioritas + matriks keterlacakan realisasi sec-0.2
│   ├── access-tests.md        <-- [Tugas 2] Matriks RBAC/ABAC 3 peran, bukti Argon2id/scrypt NIST, 8 uji positif & 8 negatif
│   ├── hardening-notes.md     <-- [Tugas 2] Hardening OS/SSH, CVE-2024-6387 backport, analisis 6 temuan Lynis, & kontainer
│   ├── lynis-before.txt       <-- [Tugas 2] Hasil audit Lynis sebelum hardening (Hardening Index: 61)
│   ├── lynis-after.txt        <-- [Tugas 2] Hasil audit Lynis sesudah hardening (Hardening Index: 76 >= 70)
│   ├── image-scan-before.txt  <-- [Tugas 2] Hasil Trivy v0.69.3 sebelum hardening (4 CRITICAL, 19 HIGH)
│   ├── image-scan-after.txt   <-- [Tugas 2] Hasil Trivy v0.69.3 sesudah hardening multi-stage Alpine (0 CRITICAL)
│   ├── sbom.cdx.json          <-- [Tugas 2] Software Bill of Materials standar CycloneDX v1.6 JSON
│   └── config/
│       └── 00-hardening.conf  <-- [Tugas 2] Konfigurasi drop-in OpenSSH (/etc/ssh/sshd_config.d/00-hardening.conf)
│
├── Dockerfile                 <-- [Tugas 2 KKS] Multi-stage build node:22-alpine@sha256, npm ci --ignore-scripts, UID 1001
├── .dockerignore              <-- [Tugas 2 KKS] Pengecualian .env, .git, *.key, dan node_modules dari konteks build
├── compose.yaml               <-- [Tugas 2 KKS] Kontainer hardened (read_only, tmpfs, cap_drop: ALL, no-new-privileges, internal net)
├── .github/dependabot.yml     <-- [Tugas 2 KKS] Pembaruan dependensi otomatis dengan cooldown 7 hari (mitigasi Shai-Hulud)
├── docs/
│   ├── lighthouse-report.md   <-- Laporan Audit Aksesibilitas Lighthouse (Skor 98/100)
│   └── web-milestone-2.md     <-- [Tugas 2 PAW] Dokumentasi ERD, 8 CRUD 2 entitas, 3 bukti validasi Zod, & 12 skenario uji
├── package.json               <-- Proxy scripts root: 'npm run dev', 'npm run test:paw', 'npm run test:crypto'
├── README.md                  <-- Dokumentasi Master ini
├── AI_LOG.md                  <-- Transparansi Pemanfaatan AI untuk ketiga mata kuliah (Tugas 1 & Tugas 2)
└── .gitignore                 <-- Pengabaian file lokal, cache build, .env, dan *.key
```

---

## 3. Milestone & Penanda Rilis (Tags)

| Penanda (Tag) | Mata Kuliah | Status | Keterangan |
| :---: | :--- | :---: | :--- |
| **`v0.1`** | **Pengembangan Aplikasi Web** | Selesai | Milestone 1: 5 Halaman, 8 Komponen Reusable, Validasi sisi klien ketat, Live Web Crypto hashing di peramban, WCAG AA. |
| **`v0.1`** | **Kriptografi** | Selesai | Tugas 1: Pustaka standar `hashlib` & `secrets`, 3 kebutuhan proteksi data, 5 skenario uji otomatis lolos 100%. |
| **`sec-0.1`** | **Keamanan Komputasi & Siber** | Selesai | Tugas 1: DFD dengan 3 trust boundary, 13 threat STRIDE, 5 risiko prioritas beralasan kondisi produk. |
| **`v0.2`** | **Pengembangan Aplikasi Web** | **Selesai** | **Milestone 2:** Integrasi PostgreSQL 18 + Prisma ORM 7 (`Item` 1:N `Ulasan`), CRUD lengkap 2 entitas (8 operasi CRUD termasuk `ubahUlasan`), validasi server Zod 4 (`safeParse`), sesi cookie `HttpOnly` + RBAC 3 peran, 12 skenario uji lolos 100%. |
| **`v0.2`** | **Kriptografi** | **Selesai** | **Tugas 2:** Layanan arsip terenkripsi `AES-256-GCM` (AEAD + AAD), rantai berautentikasi `HMAC-SHA-256` (menutup celah K1), derivasi kunci `HKDF-SHA256` dari kunci master CSPRNG di luar repo (`0600`), hash sandi `Argon2id`, `KEPUTUSAN.md`, 17 skenario `pytest` (`16 passed, 1 xfailed`). |
| **`sec-0.2`** | **Keamanan Komputasi & Siber** | **Selesai** | **Tugas 2:** Matriks RBAC/ABAC & 16 uji akses berimbang (8 positif + 8 negatif), hash lambat `Argon2id`/`scrypt` & NIST SP 800-63B-4, hardening OS/SSH (`00-hardening.conf`), Lynis `61 -> 76`, kontainer non-root `read_only` (`CapEff: 0`), Trivy `0 CRITICAL`, CycloneDX SBOM & Dependabot cooldown. |

---

## 4. Cara Menjalankan Aplikasi & Pengujian (Milestone 1 & Milestone 2)

### A. Menjalankan Migrasi Basis Data, Seed, & 12 Skenario Uji PAW (`v0.2`)
Dari direktori `Pengembangan Aplikasi Web`:

```bash
cd "Pengembangan Aplikasi Web"
cp .env.example .env
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
npm run test:paw
npm run dev
```

### B. Menjalankan 17 Skenario Pengujian Otomatis Kriptografi (`v0.1` & `v0.2`)
Dapat dijalankan menggunakan `pytest` untuk menjalankan seluruh pengujian Tugas 1 (`test_crypto.py`) dan Tugas 2 (`test_tugas2.py`):

```bash
pytest Kriptografi/tests -v
```

Hasil eksekusi: **`16 passed, 1 xfailed in 0.20s` (100% Sesuai Rubrik)**:
- **5 Skenario Tugas 1 (`test_crypto.py`):** SHA-256, deteksi manipulasi 1-byte, CSPRNG token, dan hash-chain dasar.
- **12 Skenario Tugas 2 (`test_tugas2.py`):** Round-trip `AES-256-GCM` + `AAD`, deteksi manipulasi ciphertext 1-byte, penolakan konteks `AAD` salah, rantai `HMAC-SHA-256` & deteksi hitung-ulang oleh admin DB nakal (*insider threat*), pemisahan kunci `HKDF-SHA256`, rotasi kunci master, penolakan izin kunci longgar (`0644`), validasi *allowlist* ketat (`bool` ditolak untuk numerik, kolom asing ditolak), normalisasi Unicode `NFC`, `Argon2id` + kebijakan NIST SP 800-63B-4, dan dokumentasi temuan `@pytest.mark.xfail(strict=True)`.

---

## 5. Etika Data dan Keamanan Nilai Rahasia
Repositori ini mematuhi prinsip kebersihan keamanan:
- **Zero Secrets in Repo:** Tidak ada kunci privat, token produksi, kata sandi, atau data pribadi riil yang diunggah.
- Seluruh data nama marga, nomor registrasi, koordinat patok, dan berkas bukti menggunakan **data tiruan realistis (*synthetic mock data*)** wilayah Mimika, Papua.

---

## 6. Bukti Tangkapan Layar & Hasil Pengujian (Milestone 1)

Seluruh bukti implementasi antarmuka responsif, validasi formulir sisi klien, dan laporan aksesibilitas telah didokumentasikan dan disematkan langsung:

| Pengujian | Keterangan Resolusi | Status Bukti Visual |
| :--- | :--- | :---: |
| **Layar Ponsel (Mobile)** | Lebar $\le 640\text{ px}$ (Diuji fisik pada iPhone Safari) | [Buka Screenshots](<Pengembangan Aplikasi Web/screenshots/mobile.png>) |
| **Layar Tablet** | Lebar $768\text{ px}$ (Emulasi iPad Mini di Chrome DevTools) | [Buka Screenshots](<Pengembangan Aplikasi Web/screenshots/tablet.png>) |
| **Layar Desktop** | Lebar $\ge 1024\text{ px}$ (Peramban Desktop $1042\text{ px} - 1280\text{ px}$) | [Buka Screenshots](<Pengembangan Aplikasi Web/screenshots/desktop.png>) |
| **Validasi Formulir** | Indikator pesan kesalahan merah saat submit kosong | [Buka Screenshots](<Pengembangan Aplikasi Web/screenshots/form-validation.png>) |
| **Audit Aksesibilitas** | Skor Lighthouse **98 / 100** (Melampaui standar $\ge 85$) | [Buka Screenshots](<Pengembangan Aplikasi Web/screenshots/lighthouse-score.png>) |

> 📌 **Galeri Gambar Lengkap:** Seluruh gambar ditampilkan secara penuh (*inline image gallery*) pada berkas **[README Pengembangan Aplikasi Web](Pengembangan%20Aplikasi%20Web/README.md#7-bukti-tangkapan-layar-antarmuka--validasi-formulir)**.

