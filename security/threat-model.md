# Pemodelan Ancaman STRIDE (Threat Model) — TanahKita

**Produk:** TanahKita  
**Pengembang:** Yosafat Jacobus (NIM: 105224016)  
**Mata Kuliah:** Keamanan Komputasi dan Siber (CS5) — Tugas 1  
**Milestone Tag:** `sec-0.1`  

---

## 1. Metodologi Analisis Ancaman

Pemodelan ancaman dilakukan menggunakan kerangka kerja **STRIDE** (*Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege*) yang dipetakan langsung ke elemen **Data Flow Diagram (DFD)** dan inventaris aset tanah adat TanahKita.

---

## 2. Tabel Ancaman Spesifik STRIDE

| ID Threat | Kategori STRIDE | Elemen DFD Terkait | Aset Terdampak | Deskripsi Skenario Ancaman Spesifik | Konsekuensi terhadap Kondisi Produk |
| :---: | :---: | :---: | :---: | :--- | :--- |
| **THR-01** | **Spoofing** | `E2` → `P1` (`DF2`) | `AST-03` | Pihak sengketa menyamar sebagai Tetua Adat Amungme/Kamoro dengan memalsukan sesi atau menebak token verifikasi. | Klaim tanah yang belum disepakati tetua adat disahkan secara tidak sah. |
| **THR-02** | **Tampering** | `D2` (akses langsung) | `AST-02`, `AST-05` | Administrator nakal (*insider threat*) mengubah koordinat batas ulayat langsung dari konsol basis data. | Batas ulayat bergeser sepihak; perubahan sebagian terdeteksi hash-chain, tetapi penghitungan ulang seluruh rantai belum tercegah. |
| **THR-03** | **Tampering** | `D1` / `DF5` | `AST-01` | Penyerang mengganti berkas scan surat adat asli dengan dokumen palsu yang tampak serupa di penyimpanan berkas. | Digest SHA-256 tidak cocok saat `DF12` dibaca `P4`; berkas ditandai rusak. |
| **THR-04** | **Repudiation** | `E2` → `P1` (`DF2`) | `AST-02` | Tetua adat yang telah menyetujui batas wilayah menyangkal pernah memberi verifikasi setelah mendapat tekanan pihak luar. | Timbul ketidakpastian hukum bila persetujuan tidak terikat jejak audit dan rekaman kesaksian. |
| **THR-05** | **Info Disclosure** | `DF1`, `DF2` | `AST-04`, `AST-03` | Penyerang mengendus Wi-Fi publik di Timika untuk mencegat token otorisasi atau kredensial pemohon. | Kredensial kepala marga bocor dan dipakai mengajukan klaim fiktif. |
| **THR-06** | **Info Disclosure** | `DF14` (`D2` → `P4` → `P1` → `E1`) | `AST-05` | Spekulan tanah melihat data batas tanah yang sedang dalam mediasi sengketa melalui halaman publik. | Informasi sengketa internal keluarga adat bocor sebelum musyawarah selesai. |
| **THR-07** | **Denial of Service** | `DF1` → `P1` | `AST-07`, `AST-08` | Penyerang membanjiri formulir dengan unggahan berkas berukuran sangat besar (*payload exhaustion*). | Disk dan memori server habis sehingga warga lain tidak bisa mendaftarkan tanahnya. |
| **THR-08** | **Elevation of Privilege** | `DF1` → `P1` → `P3` | `AST-02` | Pemohon memanipulasi parameter HTTP untuk memicu aksi `VERIFIKASI_TETUA_ADAT` tanpa izin. | Pemohon memperoleh hak verifikator dan mengesahkan klaimnya sendiri. |
| **THR-09** | **Tampering** | `P2` | `AST-06` | Dependensi atau kode modul kriptografi diubah agar memakai algoritma usang (MD5/SHA-1). | Sidik jari berkas tidak lagi dapat dipercaya karena rentan tabrakan hash. |
| **THR-10** | **Spoofing** | `E1` → `P1` (`DF1`) | `AST-01`, `AST-02` | Oknum mendaftarkan tanah ulayat milik marga lain dengan mengatasnamakan marga tersebut. | Pencatatan ganda atas tanah yang sama memicu konflik horizontal. |
| **THR-11** | **Repudiation** | `D4` (`DF16`, `DF17`) | `AST-12`, `AST-09` | Admin yang mengubah data menghapus baris log audit untuk menutupi jejaknya. | Tindakan admin nakal tidak dapat dibuktikan saat investigasi sengketa. |
| **THR-12** | **Info Disclosure** | `D6` → `P1` (`DF19`) | `AST-10` | Kunci sesi atau kata sandi basis data tidak sengaja ikut ter-*commit* ke repositori GitHub publik. | Penyerang dapat memalsukan sesi atau masuk langsung ke basis data. |
| **THR-13** | **Tampering** | `D5` (`DF18`) | `AST-11` | Backup disimpan tanpa digest sehingga diganti dengan salinan yang sudah dimanipulasi. | Saat pemulihan insiden, data palsu ikut dipulihkan dan dianggap sah. |
