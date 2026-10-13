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
├── Pengembangan Aplikasi Web/ <-- [Pengembangan Aplikasi Web / PAW] (Tag: v0.1)
│   ├── src/                   <-- Source code mandiri Next.js / TypeScript
│   │   ├── app/               <-- 5 Halaman Aplikasi (Beranda, Daftar, Klaim, Verifikasi, Edukasi)
│   │   ├── components/        <-- 8 Komponen Reusable UI
│   │   ├── lib/               <-- Web Crypto API (SubtleCrypto SHA-256 lokal)
│   │   ├── data/              <-- Mock Data Marga Mimika Papua
│   │   └── types/             <-- TypeScript definitions
│   ├── screenshots/           <-- Tangkapan layar antarmuka ponsel, tablet, desktop, dan formulir
│   ├── package.json
│   ├── tailwind.config.ts
│   └── README.md              <-- Dokumentasi teknis lengkap Pemweb (termasuk embed screenshot)
│
├── Kriptografi/               <-- [Kriptografi] Komponen Kriptografi Standar (Tag: v0.1)
│   ├── src/                   <-- Source code mandiri Python
│   │   ├── hasher.py          <-- SHA-256 hashing & deteksi tampering (hashlib & hmac)
│   │   ├── tokens.py          <-- CSPRNG token verifikasi tetua adat (secrets)
│   │   └── chain.py           <-- Hash-chain sequential ledger riwayat tanah
│   ├── tests/
│   │   └── test_crypto.py     <-- 5 Skenario Uji Unit Pytest/Unittest (Lolos 100%)
│   └── README.md              <-- Matriks 3 Kebutuhan Perlindungan Data (K1-K5)
│
├── Keamanan Komputasi dan Siber/ <-- [Keamanan Komputasi dan Siber / KKS] (Tag: sec-0.1)
│   ├── asset-inventory.md     <-- Inventarisasi 8 aset & klasifikasi CIA
│   ├── dfd.md                 <-- DFD Level 1 dengan ID elemen, 3 trust boundary, marker kripto
│   ├── threat-model.md        <-- 10+ Ancaman STRIDE spesifik pada elemen DFD
│   └── risk-register.md       <-- Register 5 risiko prioritas & rencana kontrol mitigasi
│
├── docs/
│   └── lighthouse-report.md   <-- Laporan Audit Aksesibilitas Lighthouse (Skor 98/100)
├── package.json               <-- Proxy scripts root: 'npm run dev', 'npm run build', 'npm run test:crypto'
├── README.md                  <-- Dokumentasi Master ini
├── AI_LOG.md                  <-- Transparansi Pemanfaatan AI untuk ketiga mata kuliah
└── .gitignore                 <-- Pengabaian file lokal, cache build, dan secrets
```

---

## 3. Milestone & Penanda Rilis (Tags)

| Penanda (Tag) | Mata Kuliah | Status | Keterangan |
| :---: | :--- | :---: | :--- |
| **`v0.1`** | **Pengembangan Aplikasi Web** | Selesai | Milestone 1: 5 Halaman, 8 Komponen Reusable, Validasi sisi klien ketat, Live Web Crypto hashing di peramban, WCAG AA. |
| **`v0.1`** | **Kriptografi** | Selesai | Tugas 1: Pustaka standar `hashlib` & `secrets`, 3 kebutuhan proteksi data, 5 skenario uji otomatis lolos 100% dalam 0.001s. |
| **`sec-0.1`** | **Keamanan Komputasi & Siber** | Siap | Tugas 1: DFD dengan 3 trust boundary, 10+ threat STRIDE, 5 risiko prioritas beralasan kondisi produk, rencana kontrol Tugas 2/3. |

---

## 4. Cara Menjalankan Aplikasi & Pengujian

### A. Menjalankan Antarmuka Web (Next.js)
Dari direktori utama repositori (`tanahkita`):

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server pengembangan lokal
npm run dev

# 3. Buka peramban di: http://localhost:3000
```

### B. Menjalankan Pengujian Unit Kriptografi (Python)
Dapat dijalankan langsung dari root proyek menggunakan `npm` atau `python3`:

```bash
# Melalui script npm:
npm run test:crypto

# Atau langsung menggunakan Python standard library (tanpa dependensi luar):
python3 -m unittest discover -s "Kriptografi/tests" -p "test_*.py" -v
```

Hasil eksekusi: **5 dari 5 skenario lolos (100% OK)**:
- Deterministic SHA-256 & Avalanche Effect.
- Deteksi manipulasi dokumen 1-byte (Uji Negatif).
- Entropi tinggi & keunikan token CSPRNG tetua adat.
- Integritas rantai riwayat tanah utuh dari blok genesis.
- Deteksi manipulasi data riwayat di tengah rantai (Uji Negatif).

---

## 5. Etika Data dan Keamanan Nilai Rahasia
Repositori ini mematuhi prinsip kebersihan keamanan:
- **Zero Secrets in Repo:** Tidak ada kunci privat, token produksi, kata sandi, atau data pribadi riil yang diunggah.
- Seluruh data nama marga, nomor registrasi, koordinat patok, dan berkas bukti menggunakan **data tiruan realistis (*synthetic mock data*)** wilayah Mimika, Papua.
