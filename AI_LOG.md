# Catatan Pemanfaatan Kecerdasan Artifisial (AI_LOG.md)

**Produk:** TanahKita  
**Pengembang:** Yosafat Jacobus (NIM: 105224016)  
**Tujuan:** Transparansi akademik pemanfaatan AI sesuai kebijakan penggunaan AI Universitas Pertamina.

---

## 1. Alat yang Digunakan
* **Alat Utama:** Google DeepMind Antigravity / Gemini & Claude
* **Peran:** Asisten pair-programming untuk penyusunan arsitektur modular, formulasi kode kriptografis, perancangan antarmuka Next.js/React, dan verifikasi kepatuhan rubrik RPS.

---

## 2. Log Aktivitas Pemanfaatan AI

### A. Komponen Kriptografi (Tugas 1 Kriptografi)
* **Tujuan:** Menyusun implementasi fungsi sidik jari SHA-256, hash-chain riwayat tanah, dan pembangkit token CSPRNG menggunakan pustaka standar Python.
* **Ringkasan Perintah (Prompt):**
  - "Buat modul Python menggunakan `hashlib` dan `secrets` untuk menghitung SHA-256 berkas patok tanah dan hash-chain riwayat tanah adat Papua."
  - "Buat 5 skenario pengujian unit otomatis yang memuat uji avalanche effect dan uji negatif manipulasi data 1 byte."
* **Bagian yang Dihasilkan / Dimodifikasi:**
  - `kriptografi/src/hasher.py`: Fungsi `hash_bytes`, `verify_hash`, dan `create_document_fingerprint`.
  - `kriptografi/src/tokens.py`: Fungsi `generate_verification_token` dan `generate_elder_otp` berbasis CSPRNG.
  - `kriptografi/src/chain.py`: Struktur `LandClaimRecord` dan logika verifikasi berantai `verify_integrity`.
  - `kriptografi/tests/test_crypto.py`: Skenario uji unit `unittest`/`pytest`.
* **Cara Memeriksa / Verifikasi Mandiri:**
  - Menjalankan seluruh pengujian otomatis langsung di terminal: `python3 -m unittest discover -s kriptografi/tests -p "test_*.py" -v`.
  - Memverifikasi secara mandiri bahwa saat berkas diubah 1 karakter, fungsi `verify_hash` mengembalikan nilai boolean `False`.
  - Memastikan tidak ada kunci privat atau secret hardcoded di dalam repositori.

### B. Pengembangan Antarmuka Web (Milestone 1 PAW)
* **Tujuan:** Merancang antarmuka Next.js/React yang semantik, responsif, memiliki komponen reusable, validasi formulir sisi klien, dan integrasi Web Crypto API.
* **Ringkasan Perintah (Prompt):**
  - "Rancang antarmuka web modern dengan Next.js App Router di direktori `pengembangan-aplikasi-web/`, terdiri dari 5 halaman (Beranda, Form Pendaftaran dengan validasi sisi klien, Detail Klaim, Portal Uji Verifikasi Dokumen, Edukasi Hukum Adat) menggunakan React, TypeScript, dan Tailwind CSS bertema tanah ulayat Papua."
  - "Implementasikan 8 komponen reusable termasuk modal interaktif penjelasan kriptografi dan modal uji sidik jari berkas."
* **Bagian yang Dihasilkan / Dimodifikasi:**
  - `pengembangan-aplikasi-web/src/components/`: `Navbar`, `Footer`, `StatusBadge`, `ClaimCard`, `HashViewer`, `AuditTimeline`, `CryptoExplainerModal`, `VerifyProofModal`.
  - `pengembangan-aplikasi-web/src/lib/crypto.ts`: Utilitas peramban Web Crypto API (`window.crypto.subtle.digest`) untuk hashing SHA-256 client-side tanpa reload.
  - `pengembangan-aplikasi-web/src/app/page.tsx`: Halaman katalog eksplorasi klaim dengan pencarian, filter status, dan statistik.
  - `pengembangan-aplikasi-web/src/app/daftar/page.tsx`: Formulir pendaftaran dengan validasi sisi klien dan kalkulasi live SHA-256 saat berkas diunggah.
  - `pengembangan-aplikasi-web/src/app/klaim/[id]/page.tsx`: Halaman detail tanah ulayat, batas 4 penjuru, dan uji integritas rantai audit.
  - `pengembangan-aplikasi-web/src/app/verifikasi/page.tsx`: Portal verifikasi dokumen mandiri dan simulator OTP musyawarah tetua adat.
  - `pengembangan-aplikasi-web/src/app/edukasi/page.tsx`: Halaman landasan hukum adat Papua, penegasan non-BPN, dan matriks Hash vs Enkripsi vs Encoding.
* **Cara Memeriksa / Verifikasi Mandiri:**
  - Memeriksa kebenaran alur validasi formulir: memastikan form menolak jika nama marga kosong atau luas lahan tidak positif.
  - Menguji fungsi hashing sisi klien dengan mengunggah berkas di browser dan melihat kalkulasi SHA-256 secara langsung.
  - Memverifikasi hierarki judul semantik (`h1`, `h2`, `h3`) dan keberadaan landmark ARIA pada panel DevTools.

### C. Analisis Ancaman dan Manajemen Risiko (Tugas 1 KKS)
* **Tujuan:** Menyusun DFD Level 1, analisis ancaman STRIDE spesifik pada elemen DFD, dan register risiko dengan rencana kontrol mitigasi.
* **Bagian yang Dihasilkan / Dimodifikasi:**
  - `keamanan-komputasi-dan-siber/asset-inventory.md`: Inventarisasi 8 aset utama sistem.
  - `keamanan-komputasi-dan-siber/dfd.md`: DFD Level 1 memuat elemen ID, 3 trust boundary, dan tanda kripto.
  - `keamanan-komputasi-dan-siber/threat-model.md`: 10 ancaman spesifik berbasis STRIDE.
  - `keamanan-komputasi-dan-siber/risk-register.md`: 5 risiko prioritas dan pemetaan kontrol ke Tugas 2/Tugas 3.
* **Cara Memeriksa / Verifikasi Mandiri:**
  - Memastikan tidak ada ancaman generik seperti "server diretas" atau "database dicuri".
  - Memastikan seluruh alasan kemungkinan dan dampak merujuk pada kondisi operasional produk di Timika/Mimika.

---

## 3. Pernyataan Tanggung Jawab Mahasiswa
Seluruh kode dan dokumentasi yang tercantum dalam repositori ini telah ditinjau, dipahami alur logikanya, dan diverifikasi kebenarannya secara mandiri oleh saya sendiri. Saya siap mempertanggungjawabkan dan mendemonstrasikan cara kerja setiap baris kode saat evaluasi praktikum dan sesi demonstrasi dosen.
