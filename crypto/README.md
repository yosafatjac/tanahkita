# Komponen Kriptografi Dasar — TanahKita

**Produk:** TanahKita (Sistem Pencatatan dan Pembuktian Penguasaan Tanah Adat Papua)  
**Pengembang:** Yosafat Jacobus (NIM: 105224016)  
**Mata Kuliah:** Kriptografi (CS5) — Tugas 1  
**Milestone Tag:** `v0.1`  

---

## 1. Deskripsi Produk dan Kebutuhan Kriptografi (K1)

TanahKita dirancang untuk mencatat dan melindungi bukti penguasaan tanah bagi masyarakat adat di Papua (khususnya wilayah Timika/Mimika) yang belum bersertifikat BPN. Sistem ini **bukan pengganti sertifikat resmi BPN**, melainkan sarana dokumentasi berbasis pembuktian digital yang mencegah pemalsuan dan perubahan sepihak atas batas adat lisan.

### Tabel Pemetaan Data, Tujuan Keamanan, dan Prioritas

| No | Aset Data Produk | Tujuan Keamanan | Algoritma & Pustaka | Prioritas | Keterangan |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **1** | **Berkas Bukti Fisik Tanah** (Foto patok batas, rekaman kesaksian batas adat, surat pernyataan suku) | **Integritas (Integrity)** & **Keaslian (Authenticity)** | SHA-256 (`hashlib.sha256`) | **Tinggi (P1)** | Menjamin berkas digital tidak dimanipulasi 1 byte pun sejak pertama kali dicatat. |
| **2** | **Riwayat Perubahan & Status Sengketa Tanah** | **Integritas Rantai (Tamper-evident Audit Trail)** | Hash-Chain (`hashlib.sha256`) | **Tinggi (P1)** | Mengunci urutan peristiwa agar admin nakal tidak bisa menyisipkan atau merevisi status klaim masa lalu secara diam-diam. |
| **3** | **Token Verifikasi Tetua Adat / Lembaga** | **Kerahasiaan (Confidentiality)** & **Unpredictability** | CSPRNG (`secrets.token_hex`) | **Sedang (P2)** | Menghasilkan token otorisasi sementara yang tidak dapat ditebak untuk validasi penguasaan adat. |
| **4** | **Kredensial Pengguna / PIN Pemilik** | **Kerahasiaan (Confidentiality)** | KDF Modern (`hashlib.scrypt`) *(Roadmap M2)* | **Sedang (P2)** | Sandi klasik tidak digunakan sama sekali untuk perlindungan data produk riil. |

> **Catatan Kepatuhan:** Sandi klasik (seperti Caesar atau Vigenere) hanya dipelajari di perkuliahan sebagai fondasi historis matematika kriptografi, **TIDAK DIGUNAKAN** untuk melindungi data produk TanahKita.

---

## 2. Rancangan Komponen Awal (K2)

### A. Komponen 1: Sidik Jari Dokumen (`hasher.py`)
* **Masukan (Input):** Berkas biner (`bytes`) dari foto patok batas atau surat adat fisik.
* **Proses:** Penghitungan nilai ringkasan (*message digest*) 256-bit menggunakan fungsi hash satu arah SHA-256. Verifikasi menggunakan perbandingan waktu-konstan (`hmac.compare_digest`) guna menangkal *timing attacks*.
* **Keluaran (Output):** String heksadesimal 64 karakter (representasi *hex encoding*, bukan enkripsi).
* **Perbedaan Encoding vs Enkripsi:** Heksadesimal adalah *encoding* (representasi data biner ke karakter yang dapat dibaca manusia tanpa kunci rahasia), sedangkan enkripsi memerlukan kunci kriptografis dua arah untuk mengembalikan teks asli.

### B. Komponen 2: Hash-Chain Riwayat Klaim (`chain.py`)
* **Masukan (Input):** Indeks blok, timestamp ISO-8601, ID klaim, nama marga, koordinat lokasi, aksi, hash bukti berkas, dan `previous_hash`.
* **Proses:** Serialisasi deterministik berbasis JSON (`sort_keys=True`) kemudian dihitung SHA-256 dan ditautkan ke blok sebelumnya membentuk rantai berintegritas.
* **Keluaran (Output):** Blok riwayat berantai (`LandClaimRecord`) yang tidak dapat diubah tanpa merusak seluruh rantai setelahnya.

### C. Komponen 3: Pembangkit Token Tetua Adat (`tokens.py`)
* **Masukan (Input):** Jumlah byte entropi (minimal 16 bytes, standar 32 bytes).
* **Proses:** Pengambilan entropi acak kriptografis tingkat sistem operasi (`/dev/urandom`) menggunakan modul `secrets`.
* **Keluaran (Output):** Token otorisasi heksadesimal 64 karakter dan kode verifikasi numerik.
* **Sumber Keacakan (CSPRNG):** Menggunakan CSPRNG (*Cryptographically Secure Pseudo-Random Number Generator*) berbasis pustaka standar `secrets`, **bukan** modul `random` bawaan yang berbasis *Mersenne Twister* (tidak aman untuk keamanan).

### Alasan Pemilihan Pustaka
1. **`hashlib`:** Pustaka standar Python yang mengikat langsung ke OpenSSL libcrypto, telah diaudit keamanannya, tahan terhadap tabrakan (*collision resistant*), dan memenuhi standar FIPS 180-4.
2. **`secrets`:** Pustaka standar Python PEP 506 yang dirancang khusus untuk mengelola nilai rahasia (token, kata sandi, OTP) dengan entropi tinggi.

---

## 3. Struktur Modul dan Cara Menjalankan (K3)

```text
crypto/
├── src/
│   ├── __init__.py
│   ├── hasher.py          <-- Fungsi hash bytes, berkas, dan verifikasi
│   ├── chain.py           <-- Struktur data LandClaimRecord dan LandRecordChain
│   └── tokens.py          <-- Pembangkit token CSPRNG dan OTP
├── tests/
│   └── test_crypto.py     <-- 5 Skenario uji otomatis
└── README.md
```

### Petunjuk Eksekusi Pengujian Otomatis

Seluruh pengujian unit dapat dijalankan ulang dengan **satu perintah**:

```bash
# Menjalankan menggunakan modul bawaan Python (Zero Dependency):
python3 -m unittest discover -s tests -p "test_*.py" -v

# Atau jika pytest terpasang di lingkungan Anda:
pytest tests/ -v
```

---

## 4. Skenario Uji dan Hasil (K4)

Pengujian memuat **5 skenario uji otomatis** dengan tingkat keberhasilan **100% (5/5 Lolos)**:

| ID Tes | Skenario Pengujian | Jenis Uji | Kondisi Masukan | Hasil yang Diharapkan | Status |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **TC-01** | `test_1_sha256_deterministic_and_avalanche` | Positif | Dokumen identik vs dokumen beda 1 karakter | Hash identik untuk dokumen sama; hash berubah total jika beda 1 byte | **PASSED** |
| **TC-02** | `test_2_document_tamper_detection_negative` | **Negatif** | Berkas diubah luasnya dari 15 Ha menjadi 50 Ha | `verify_hash()` mengembalikan `False` secara spesifik | **PASSED** |
| **TC-03** | `test_3_csprng_token_uniqueness_and_entropy` | Positif & **Batas** | Pembangkitan 200 token acak; uji batas `num_bytes < 16` | 200 token unik tanpa kolisi; memicu `ValueError` saat input < 16 | **PASSED** |
| **TC-04** | `test_4_hash_chain_integrity_valid` | Positif | Genesis block + 2 riwayat klaim berturutan | `verify_integrity()` mengembalikan `(True, "valid")` | **PASSED** |
| **TC-05** | `test_5_hash_chain_tamper_detection_negative` | **Negatif** | Memanipulasi nama marga pemilik di Blok #1 secara diam-diam | `verify_integrity()` mengembalikan `False` dan menunjuk Blok #1 | **PASSED** |

---

## 5. Keamanan Nilai Rahasia
Repositori ini **tidak menyimpan kunci privat, token produksi, kata sandi, atau data pribadi riil**. Seluruh data yang diuji merupakan data tiruan (*synthetic mock data*) marga adat di Kabupaten Mimika, Papua.
