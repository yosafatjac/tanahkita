# Inventarisasi Aset (Asset Inventory) — TanahKita

**Produk:** TanahKita  
**Pengembang:** Yosafat Jacobus (NIM: 105224016)  
**Mata Kuliah:** Keamanan Komputasi dan Siber (CS5) — Tugas 1  
**Milestone Tag:** `sec-0.1`  

---

## 1. Klasifikasi Aset Produk

Aset diklasifikasikan berdasarkan kategori: **Data/Informasi**, **Perangkat Lunak & Logika**, **Infrastruktur/Komponen**, dan **Identitas/Akses**.

| ID Aset | Nama Aset | Kategori | Deskripsi | Tingkat Kerahasiaan | Tingkat Integritas | Tingkat Ketersediaan | Perlindungan Kriptografi |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **AST-01** | Berkas Dokumen Fisik Bukti Adat | Data | Salinan digital (PDF/JPG) surat pernyataan adat, foto patok batas pohon/batu, dan rekaman musyawarah. | Sedang | **Sangat Tinggi** | Tinggi | **Ya** (SHA-256 Digest) |
| **AST-02** | Riwayat Perubahan Batas & Status Sengketa | Data | Log catatan peristiwa kronologis (pendaftaran, verifikasi, sengketa, mediasi) tanah ulayat. | Sedang | **Sangat Tinggi** | Tinggi | **Ya** (Hash-Chain SHA-256) |
| **AST-03** | Token Otorisasi Tetua Adat | Data/Kredensial | Nilai rahasia sekali pakai yang digunakan tetua adat untuk menandatangani persetujuan batas wilayah. | **Tinggi** | **Tinggi** | Sedang | **Ya** (CSPRNG `secrets`) |
| **AST-04** | Kredensial Pengguna / Kata Sandi | Data/Kredensial | Kredensial akun kepala marga, verifikator adat, dan administrator sistem. | **Sangat Tinggi** | **Tinggi** | Tinggi | **Ya** (`scrypt` Hashing) |
| **AST-05** | Koordinat Geospasial & Peta Batas Adat | Data | Koordinat GPS patok batas tanah ulayat dan deskripsi batas alam 4 penjuru. | Publik/Internal | **Tinggi** | Tinggi | **Ya** (Terikat Hash-Chain) |
| **AST-06** | Modul Logika Kriptografi (`Kriptografi/`) | Perangkat Lunak | Komponen Python yang menghitung hash dokumen dan memvalidasi keutuhan rantai blok. | Publik | **Sangat Tinggi** | Tinggi | Diuji otomatis via pytest |
| **AST-07** | Server Web / API Gateway | Komponen | Titik temu klien untuk input formulir dan permintaan verifikasi status tanah. | Rendah | Tinggi | **Sangat Tinggi** | TLS 1.3 / HTTPS |
| **AST-08** | Penyimpanan Berkas & Database | Infrastruktur | Media penyimpanan objek berkas bukti fisik dan basis data relasional riwayat. | **Tinggi** | **Sangat Tinggi** | **Sangat Tinggi** | Encryption at Rest |
