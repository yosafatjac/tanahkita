# Pemodelan Ancaman STRIDE (Threat Model) — TanahKita

**Produk:** TanahKita  
**Pengembang:** Yosafat Jacobus (NIM: 105224016)  
**Mata Kuliah:** Keamanan Komputasi dan Siber (CS5) — Tugas 1  
**Milestone Tag:** `sec-0.1`  

---

## 1. Metodologi Analisis Ancaman

Pemodelan ancaman dilakukan menggunakan kerangka kerja **STRIDE** (*Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege*) yang dipetakan langsung ke elemen **Data Flow Diagram (DFD)** dan inventaris aset tanah adat TanahKita.

---

## 2. Tabel 10 Ancaman Spesifik STRIDE

| ID Threat | Kategori STRIDE | Elemen DFD Terkait | Aset Terdampak | Deskripsi Skenario Ancaman Spesifik | Konsekuensi terhadap Kondisi Produk |
| :---: | :---: | :---: | :---: | :--- | :--- |
| **THR-01** | **Spoofing** | `E2` $\to$ `P1` | `AST-03` | Pihak sengketa menyamar sebagai Tetua Adat Amungme/Kamoro dengan memalsukan sesi atau menebak token verifikasi. | Klaim tanah yang belum disepakati tetua adat disahkan secara tidak sah. |
| **THR-02** | **Tampering** | `P3` $\to$ `D2` | `AST-02`, `AST-05` | Administrator nakal (*insider threat*) mengubah koordinat batas ulayat di basis data secara langsung dari konsol database. | Batas ulayat marga bergeser sepihak; namun modifikasi ini akan memutus rantai hash-chain dan langsung terdeteksi saat audit. |
| **THR-03** | **Tampering** | `DF1` / `D1` | `AST-01` | Penyerang mengganti berkas scan surat adat asli dengan dokumen palsu berpiksel serupa di penyimpanan berkas `D1`. | Nilai SHA-256 berkas tidak cocok dengan digest yang tercatat di riwayat blok; berkas ditandai cacat/korup. |
| **THR-04** | **Repudiation** | `E2` $\to$ `P2` | `AST-02` | Tetua adat yang telah menyetujui batas wilayah menyangkal pernah memberikan verifikasi setelah terjadi tekanan dari pihak luar. | Timbul ketidakpastian hukum jika persetujuan tidak terikat jejak audit kriptografis dan rekaman kesaksian. |
| **THR-05** | **Info Disclosure** | `P1` $\to$ `E1` / `DF1` | `AST-04`, `AST-03` | Penyerang mengendus jaringan tidak aman di pedalaman Timika untuk mencegat token otorisasi atau kredensial pemohon. | Kredensial akun kepala marga bocor dan dapat digunakan untuk mengajukan klaim fiktif. |
| **THR-06** | **Info Disclosure** | `D2` $\to$ Publik | `AST-05` | Pihak spekulan tanah mengakses data mentah batas tanah yang sedang dalam status mediasi sengketa rahasia. | Informasi sengketa internal keluarga adat bocor ke pihak luar sebelum musyawarah perdamaian selesai. |
| **THR-07** | **Denial of Service** | Jaringan $\to$ `P1` | `AST-07` | Penyerang membanjiri formulir pendaftaran klaim dengan unggahan berkas berukuran gigabyte (*payload exhaustion*). | Server kehabisan ruang penyimpanan dan memori, sehingga warga adat lain tidak dapat mendaftarkan tanahnya. |
| **THR-08** | **Elevation of Privilege** | `E1` $\to$ `P3` | `AST-02` | Pengguna biasa (pemohon) memanipulasi parameter HTTP request untuk memicu aksi `VERIFIKASI_TETUA_ADAT` tanpa izin. | Hak akses pemohon naik menjadi hak verifikator adat tanpa otorisasi sah. |
| **THR-09** | **Tampering** | `P2` (Memory) | `AST-06` | Pustaka kriptografi dieksploitasi untuk menghasilkan nilai hash palsu atau menurunkan fungsi ke algoritma usang (MD5/SHA-1). | Integritas sidik jari berkas runtuh akibat kelemahan tabrakan (*hash collision*). |
| **THR-10** | **Spoofing** | `E1` $\to$ `DF1` | `AST-01` | Oknum mendaftarkan tanah ulayat milik marga lain dengan mengatasnamakan nama marga tersebut secara sepihak. | Terjadi pencatatan ganda atas tanah yang sama; memicu konflik horizontal antarwarga marga. |
