# Data Flow Diagram (DFD) & Batas Kepercayaan (Trust Boundaries)

**Produk:** TanahKita  
**Pengembang:** Yosafat Jacobus (NIM: 105224016)  
**Mata Kuliah:** Keamanan Komputasi dan Siber (CS5) — Tugas 1  
**Milestone Tag:** `sec-0.1`  

---

## 1. Diagram Aliran Data (Level 1)

Diagram disusun menggunakan notasi formal dengan **ID Elemen**, **3 Trust Boundaries (Batas Kepercayaan)**, serta **Penanda Aset yang Dilindungi Kriptografi [KRIPTO]**.

```mermaid
flowchart TD
    %% Entitas Eksternal
    subgraph TB1 ["Trust Boundary 1: Lingkungan Klien (Untrusted Device)"]
        E1["E1: Pemohon Marga Adat<br>(Browser/HP Pemilik)"]
        E2["E2: Tetua Adat / Verifikator<br>(Browser Lembaga Adat)"]
        E3["E3: Administrator Sistem<br>(Konsol Admin)"]
    end

    %% Jaringan Publik / Internet
    DF1["DF1: Kirim Formulir & Berkas Bukti"]
    DF2["DF2: Kirim Token Otorisasi Tetua"]
    DF3["DF3: Manajemen Akun & Konfigurasi"]

    subgraph TB2 ["Trust Boundary 2: Batas Server Aplikasi (DMZ / Private Subnet)"]
        P1["P1: Web Front-End & Input Validator<br>(Next.js / Client Validation)"]
        P2["P2: Mesin Kriptografi TanahKita<br>(SHA-256 Hasher & CSPRNG Token)"]
        P3["P3: Manajer Hash-Chain<br>(Pencatat Riwayat Berantai)"]
        P4["P4: Layanan Verifikasi Integritas<br>(Deteksi Tampering Rantai)"]
    end

    %% Penyimpanan Data Terisolasi
    subgraph TB3 ["Trust Boundary 3: Batas Penyimpanan Data (Isolated Storage)"]
        D1[("D1: Penyimpanan Berkas Bukti<br>[KRIPTO: AST-01 (SHA-256 Digest)]")]
        D2[("D2: Buku Kas Riwayat Hash-Chain<br>[KRIPTO: AST-02 (Rantai Blok SHA-256)]")]
        D3[("D3: Basis Data Akun & Token<br>[KRIPTO: AST-03 (CSPRNG), AST-04 (scrypt)]")]
    end

    %% Aliran Data
    E1 -->|DF1| P1
    E2 -->|DF2| P1
    E3 -->|DF3| P1

    P1 -->|DF4: Validasi Masukan| P2
    P2 -->|DF5: Hitung Digest Bukti [AST-01]| D1
    P2 -->|DF6: Buat Blok Baru| P3
    P3 -->|DF7: Tautkan Previous Hash [AST-02]| D2
    P1 -->|DF8: Verifikasi Kredensial [AST-04]| D3

    P4 -->|DF9: Baca & Uji Rantai| D2
    P4 -->|DF10: Status Validasi Rantai| E1
    P4 -->|DF10: Status Validasi Rantai| E2
```

---

## 2. Inventaris ID Elemen DFD

### A. Entitas Eksternal (External Entities)
* **`E1` (Pemohon Marga Adat):** Anggota atau kepala keluarga adat Papua yang mendaftarkan klaim tanah ulayat dan mengunggah berkas bukti.
* **`E2` (Tetua Adat / Verifikator):** Pimpinan adat wilayah Mimika yang memverifikasi kebenaran fisik patok dan musyawarah.
* **`E3` (Administrator Sistem):** Petugas teknis pemelihara server (tidak memiliki wewenang mengubah riwayat tanah).

### B. Proses (Processes)
* **`P1` (Web Front-End & Input Validator):** Menerima masukan dari formulir, menjalankan validasi sisi klien (panjang karakter, batas, angka positif).
* **`P2` (Mesin Kriptografi):** Menghitung nilai ringkasan SHA-256 untuk berkas bukti fisik dan membangkitkan token otorisasi CSPRNG.
* **`P3` (Manajer Hash-Chain):** Mengelola penambahan blok riwayat berantai dan memastikan keterkaitan `previous_hash` dengan blok sebelumnya.
* **`P4` (Layanan Verifikasi Integritas):** Menjalankan pemeriksaan keutuhan seluruh rantai dari blok awal (*genesis*) hingga blok terbaru.

### C. Penyimpanan Data (Data Stores)
* **`D1` (Penyimpanan Berkas Bukti):** Media penyimpanan berkas foto patok dan surat adat digital. *(Dilindungi: AST-01)*
* **`D2` (Buku Kas Riwayat Hash-Chain):** Basis data penyimpanan rantai blok riwayat kepemilikan dan sengketa tanah. *(Dilindungi: AST-02)*
* **`D3` (Basis Data Akun & Token):** Penyimpanan token verifikasi sekali pakai dan hash kredensial pengguna. *(Dilindungi: AST-03 & AST-04)*

---

## 3. Penjelasan Tiga Batas Kepercayaan (Trust Boundaries)

1. **`TB1` (Batas Lingkungan Klien):**
   * Memisahkan peramban pengguna (komputer/ponsel pintar warga adat di Timika) dari jaringan internet publik. Perangkat klien berada di luar kendali sistem dan berpotensi disusupi malware atau koneksi tidak aman.
2. **`TB2` (Batas Server Aplikasi):**
   * Memisahkan jaringan internet publik dari server aplikasi internal. Seluruh lalu lintas yang melintasi boundary ini wajib melewati enkripsi TLS 1.3 / HTTPS dan validasi format ketat.
3. **`TB3` (Batas Penyimpanan Data Terisolasi):**
   * Memisahkan lapisan logika aplikasi web dari media penyimpanan basis data dan berkas biner. Hanya proses terautentikasi dengan hak akses terkecil (*least privilege*) yang diizinkan menulis ke `D1`, `D2`, dan `D3`.
