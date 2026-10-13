# Inventarisasi Aset (Asset Inventory) — TanahKita

**Produk:** TanahKita  
**Pengembang:** Yosafat Jacobus (NIM: 105224016)  
**Mata Kuliah:** Keamanan Komputasi dan Siber (CS5) — Latihan 1 → Tugas 1  
**Penanda:** `sec-0.1`  

---

## 1. Skala Penilaian

Setiap aset dinilai pada tiga aspek **CIA** dengan skala yang sama:

| Nilai | Arti |
| :---: | :--- |
| **Rendah** | Gangguan pada aspek ini hampir tidak berdampak bagi pengguna atau produk. |
| **Sedang** | Gangguan menimbulkan kerugian terbatas dan dapat dipulihkan. |
| **Tinggi** | Gangguan merugikan hak tanah warga adat atau kepercayaan pada sistem. |
| **Sangat Tinggi** | Gangguan dapat memicu sengketa atau konflik nyata dan sulit dipulihkan. |

Status kolom **Perlindungan Kriptografi**:
* **Diterapkan** — sudah diimplementasikan dan diuji di `Kriptografi/` (tag `v0.1`).
* **Rencana** — belum diimplementasikan; dijadwalkan pada Tugas 2/Tugas 3 atau Milestone 2.

---

## 2. Daftar Aset

| ID | Nama Aset | Jenis | Deskripsi | C | I | A | Perlindungan Kriptografi |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **AST-01** | Berkas Bukti Fisik Adat | Data | Salinan digital (PDF/JPG/PNG) surat pernyataan adat dan foto patok batas. | Sedang | Sangat Tinggi | Tinggi | **Diterapkan:** sidik jari SHA-256 (`hasher.py`) |
| **AST-02** | Riwayat Klaim (Hash-Chain) | Data | Catatan kronologis pendaftaran, verifikasi, sengketa, dan mediasi setiap klaim. | Sedang | Sangat Tinggi | Tinggi | **Diterapkan:** rantai SHA-256 `previous_hash` (`chain.py`) |
| **AST-03** | Token Verifikasi Tetua Adat | Secret | Token sekali pakai yang dipakai tetua adat untuk menyatakan persetujuan batas wilayah. | Tinggi | Tinggi | Sedang | **Diterapkan:** dibangkitkan CSPRNG `secrets` (`tokens.py`) |
| **AST-04** | Kredensial Pengguna (Pemohon & Tetua) | Secret / Akun | Kata sandi atau PIN akun pemohon marga dan verifikator adat. | Sangat Tinggi | Tinggi | Sedang | **Rencana:** hash kata sandi `hashlib.scrypt` + salt (Milestone 2) |
| **AST-05** | Koordinat & Batas Empat Penjuru | Data | Titik GPS patok dan deskripsi batas alam utara–selatan–timur–barat. | Sedang | Sangat Tinggi | Tinggi | **Diterapkan:** ikut terkunci di dalam blok hash-chain (AST-02) |
| **AST-06** | Modul Kriptografi | Layanan / Perangkat Lunak | Kode Python yang menghitung hash, membangkitkan token, dan memverifikasi rantai. | Rendah | Sangat Tinggi | Tinggi | — (modul ini *penyedia* perlindungan, bukan objek yang dilindungi) |
| **AST-07** | Layanan Web & API | Layanan | Antarmuka Next.js dan (nanti) server API yang menerima formulir dan permintaan verifikasi. | Rendah | Tinggi | Sangat Tinggi | **Rencana:** HTTPS/TLS 1.3 (Tugas 3) |
| **AST-08** | Basis Data & Penyimpanan Berkas | Infrastruktur | Tempat menyimpan berkas bukti, rantai riwayat, akun, dan token. | Tinggi | Sangat Tinggi | Sangat Tinggi | **Rencana:** enkripsi saat disimpan / *encryption at rest* (Tugas 3) |
| **AST-09** | Akun Administrator Sistem | Akun | Akun teknis pemelihara server dan basis data. | Sangat Tinggi | Sangat Tinggi | Sedang | **Rencana:** hash kata sandi `scrypt` + MFA (Tugas 2) |
| **AST-10** | Secrets Aplikasi | Secret | Kunci penandatangan sesi, kata sandi basis data, dan variabel `.env`. | Sangat Tinggi | Tinggi | Tinggi | **Rencana:** disimpan di luar repo (`.env` di-*ignore*), dirotasi berkala |
| **AST-11** | Backup Data | Backup | Salinan terjadwal basis data riwayat dan berkas bukti. | Tinggi | Sangat Tinggi | Tinggi | **Rencana:** digest SHA-256 per file backup + enkripsi backup (Tugas 3) |
| **AST-12** | Log Aplikasi & Audit Akses | Log | Catatan login, perubahan status klaim, dan aksi admin. | Sedang | Tinggi | Sedang | **Rencana:** log *append-only* dengan rantai hash (Tugas 2) |

---

## 3. Alasan Rating CIA (Satu Kalimat per Aspek)

### AST-01 — Berkas Bukti Fisik Adat
* **C (Sedang):** Surat adat tidak rahasia negara, tetapi memuat nama dan wilayah marga yang tidak perlu terbuka untuk umum.
* **I (Sangat Tinggi):** Satu berkas yang diganti dokumen palsu bisa membalik siapa pemilik sah tanah ulayat.
* **A (Tinggi):** Berkas harus bisa dibuka saat mediasi atau saat mengajukan sertifikat komunal.

### AST-02 — Riwayat Klaim (Hash-Chain)
* **C (Sedang):** Riwayat sengketa bersifat sensitif bagi keluarga adat, tetapi status akhir klaim memang perlu dapat diperiksa.
* **I (Sangat Tinggi):** Riwayat yang bisa diubah diam-diam menghilangkan seluruh fungsi pembuktian produk.
* **A (Tinggi):** Riwayat dibutuhkan untuk menelusuri asal-usul klaim ketika terjadi perselisihan.

### AST-03 — Token Verifikasi Tetua Adat
* **C (Tinggi):** Siapa pun yang memegang token dapat menyetujui klaim atas nama tetua adat.
* **I (Tinggi):** Token yang dimodifikasi atau dipakai ulang dapat mengesahkan klaim tanpa musyawarah.
* **A (Sedang):** Jika token gagal, tetua adat masih dapat meminta token baru tanpa kerugian permanen.

### AST-04 — Kredensial Pengguna
* **C (Sangat Tinggi):** Kata sandi yang bocor memungkinkan orang lain mendaftarkan klaim atas nama kepala marga.
* **I (Tinggi):** Kredensial yang diubah penyerang membuat pemilik sah terkunci dari akunnya sendiri.
* **A (Sedang):** Gangguan login bersifat sementara dan dapat dipulihkan lewat reset akun.

### AST-05 — Koordinat & Batas Empat Penjuru
* **C (Sedang):** Lokasi patok yang sedang dalam sengketa dapat dimanfaatkan spekulan tanah bila dibuka terlalu dini.
* **I (Sangat Tinggi):** Pergeseran satu titik koordinat dapat memindahkan batas tanah antar marga.
* **A (Tinggi):** Data batas dibutuhkan saat pengecekan lapangan dan mediasi.

### AST-06 — Modul Kriptografi
* **C (Rendah):** Kode sumber memang terbuka; keamanan bergantung pada algoritma standar, bukan kerahasiaan kode.
* **I (Sangat Tinggi):** Kode yang disusupi (misal diturunkan ke MD5) membuat semua sidik jari dan rantai tidak bisa dipercaya.
* **A (Tinggi):** Tanpa modul ini, pendaftaran dan verifikasi klaim tidak dapat berjalan.

### AST-07 — Layanan Web & API
* **C (Rendah):** Halaman publik tidak menyimpan rahasia; data sensitif berada di penyimpanan, bukan di layanan.
* **I (Tinggi):** Layanan yang dimodifikasi bisa menampilkan status klaim palsu kepada warga.
* **A (Sangat Tinggi):** Ini satu-satunya pintu masuk warga dan tetua adat ke sistem.

### AST-08 — Basis Data & Penyimpanan Berkas
* **C (Tinggi):** Di sini tersimpan semua akun, token, dan berkas sekaligus, sehingga kebocoran berdampak luas.
* **I (Sangat Tinggi):** Perubahan langsung di basis data memengaruhi seluruh klaim yang tercatat.
* **A (Sangat Tinggi):** Kehilangan penyimpanan berarti kehilangan seluruh bukti yang sudah dikumpulkan.

### AST-09 — Akun Administrator Sistem
* **C (Sangat Tinggi):** Akun admin memberi akses langsung ke server dan basis data.
* **I (Sangat Tinggi):** Admin yang disusupi dapat mengubah data dan konfigurasi tanpa melalui aplikasi.
* **A (Sedang):** Jika akun admin tidak tersedia sementara, layanan untuk warga tetap berjalan.

### AST-10 — Secrets Aplikasi
* **C (Sangat Tinggi):** Kunci sesi atau kata sandi basis data yang bocor membuka akses penuh ke sistem.
* **I (Tinggi):** Secret yang diganti penyerang dapat dipakai untuk memalsukan sesi pengguna.
* **A (Tinggi):** Secret yang hilang atau rusak membuat aplikasi gagal terhubung ke basis data.

### AST-11 — Backup Data
* **C (Tinggi):** Backup berisi salinan lengkap data sehingga sama sensitifnya dengan basis data utama.
* **I (Sangat Tinggi):** Backup yang dimanipulasi dapat memulihkan data palsu saat terjadi insiden.
* **A (Tinggi):** Backup adalah satu-satunya jalan pemulihan jika server rusak atau terkena ransomware.

### AST-12 — Log Aplikasi & Audit Akses
* **C (Sedang):** Log memuat alamat IP dan aktivitas pengguna yang tidak untuk publik.
* **I (Tinggi):** Log yang bisa dihapus membuat tindakan admin nakal tidak dapat dibuktikan.
* **A (Sedang):** Log dibutuhkan saat investigasi, tetapi tidak menghentikan layanan bila sempat tidak tersedia.

---

## 4. Ringkasan Data yang Dilindungi Kriptografi

| Aset | Mekanisme | Status | Lokasi Kode / Rencana |
| :--- | :--- | :---: | :--- |
| AST-01 Berkas bukti | Sidik jari SHA-256 + pembandingan waktu-konstan | Diterapkan | `Kriptografi/src/hasher.py` |
| AST-02 Riwayat klaim | Rantai hash SHA-256 (`previous_hash`) | Diterapkan | `Kriptografi/src/chain.py` |
| AST-05 Koordinat batas | Terkunci sebagai isi blok hash-chain | Diterapkan | `Kriptografi/src/chain.py` |
| AST-03 Token tetua adat | CSPRNG `secrets.token_hex(32)` | Diterapkan | `Kriptografi/src/tokens.py` |
| AST-04, AST-09 Kata sandi | Hash `scrypt` + salt acak | Rencana | Milestone 2 / Tugas 2 |
| AST-11 Backup | Digest SHA-256 + enkripsi backup | Rencana | Tugas 3 |
| AST-12 Log | Log append-only berantai hash | Rencana | Tugas 2 |
