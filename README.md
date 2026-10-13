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
> Sistem ini **BUKAN** pengganti sertifikat resmi Badan Pertanahan Nasional (BPN) dan tidak dapat diklaim sebagai alas hak mutlak hukum agraria negara. Fungsinya adalah memperkuat posisi pembuktian masyarakat adat dalam mendokumentasikan batas alam lisan, mencegah pemalsuan bukti sepihak, dan menjadi bahan rujukan mediasi atau permohonan sertifikasi komunal di masa depan.

---

## 2. Integrasi Tiga Mata Kuliah (Produk Digital Bersama)

Repositori ini merupakan **satu produk bersama terintegrasi** yang memenuhi capaian tiga mata kuliah semester 5:

```text
tanahkita/
├── web/                       <-- [Pengembangan Aplikasi Web] Milestone 1 (Tag: v0.1)
│   ├── src/
│   │   ├── components/        <-- 6 Komponen Reusable (Navbar, Footer, ClaimCard, StatusBadge, HashViewer, AuditTimeline)
│   │   ├── app/               <-- 3 Halaman Aplikasi (Beranda, Form Pendaftaran Validasi Klien, Detail Klaim Kripto)
│   │   ├── data/              <-- Mock Data Marga Mimika Papua (Magal, Matuan, Beanal, Murib)
│   │   └── types/             <-- TypeScript Interfaces
│   └── README.md              <-- Dokumentasi teknis antarmuka & responsivitas
│
├── crypto/                    <-- [Kriptografi] Fondasi dan Komponen Dasar (Tag: v0.1)
│   ├── src/                   <-- Modul SHA-256 (hasher.py), Hash-Chain (chain.py), CSPRNG Secrets (tokens.py)
│   ├── tests/                 <-- 5 Skenario Uji Otomatis Pytest (Uji Positif & Uji Negatif)
│   └── README.md              <-- Pemetaan 3 Data Dilindungi, I/O, Alasan Pustaka
│
├── security/                  <-- [Keamanan Komputasi & Siber] Threat Model & Risiko (Tag: sec-0.1)
│   ├── asset-inventory.md     <-- Inventarisasi Aset & Data Sensitif
│   ├── dfd.md                 <-- DFD ID Elemen + 3 Trust Boundaries + Tanda Kripto
│   ├── threat-model.md        <-- 10+ Ancaman Spesifik Kategori STRIDE
│   └── risk-register.md       <-- 5 Risiko Prioritas & Rencana Kontrol
│
├── README.md                  <-- Dokumentasi Utama Repositori
├── AI_LOG.md                  <-- Catatan Transparansi Pemanfaatan AI
└── .gitignore                 <-- Pengabaian dependensi, cache, dan secrets
```

---

## 3. Milestone & Penanda Rilis (Tags)

| Penanda (Tag) | Mata Kuliah | Status | Keterangan |
| :---: | :--- | :---: | :--- |
| **`v0.1`** | **Pengembangan Aplikasi Web** | Selesai | Milestone 1: 3 Halaman, 6 Komponen, Form validasi sisi klien, desain responsif mobile-first, mock data. |
| **`v0.1`** | **Kriptografi** | Selesai | Komponen SHA-256 berkas fisik, Hash-chain riwayat tanah, CSPRNG tokens, 5 tes otomatis lolos 100%. |
| **`sec-0.1`** | **Keamanan Komputasi & Siber** | Siap | Tugas 1: DFD dengan 3 trust boundary, 10+ threat STRIDE, 5 risiko prioritas, rencana kontrol mitigasi. |

---

## 4. Petunjuk Menjalankan Pengujian

### A. Komponen Kriptografi (Python)
Pengujian otomatis komponen kriptografi dapat dijalankan dengan satu perintah:

```bash
# Menjalankan seluruh pengujian unit kriptografi:
python3 -m unittest discover -s crypto/tests -p "test_*.py" -v

# Atau menggunakan pytest:
pytest crypto/tests/ -v
```

Hasil eksekusi: **5 dari 5 skenario lolos (100% OK)**, termasuk deteksi manipulasi berkas 1-byte dan deteksi modifikasi blok riwayat di tengah rantai.

### B. Antarmuka Web (Next.js & TypeScript)
```bash
cd web
npm install
npm run dev
# Buka di peramban: http://localhost:3000
```

---

## 5. Etika Data dan Keamanan Nilai Rahasia
Repositori ini mematuhi prinsip kebersihan keamanan:
- **Tidak ada kunci privat, token produksi, kata sandi, atau data pribadi riil** yang diunggah ke repositori.
- Seluruh data nama marga, nomor registrasi, koordinat patok, dan berkas bukti menggunakan **data tiruan (*synthetic mock data*)**.
