# Catatan Pemanfaatan Kecerdasan Artifisial (AI_LOG.md)

**Produk:** TanahKita  
**Pengembang:** Yosafat Jacobus (NIM: 105224016)  
**Tujuan:** Transparansi akademik pemanfaatan AI sesuai kebijakan penggunaan AI Universitas Pertamina.

---

## 1. Alat yang Digunakan
* **Alat Utama:** Google DeepMind Antigravity / Gemini & Claude
* **Peran:** Asisten pair-programming untuk penyusunan arsitektur modular, formulasi kode kriptografis, dan verifikasi kepatuhan rubrik RPS.

---

## 2. Log Aktivitas Pemanfaatan AI

### A. Komponen Kriptografi (Tugas 1 Kriptografi)
* **Tujuan:** Menyusun implementasi fungsi sidik jari SHA-256, hash-chain riwayat tanah, dan pembangkit token CSPRNG menggunakan pustaka standar Python.
* **Ringkasan Perintah (Prompt):**
  - "Buat modul Python menggunakan `hashlib` dan `secrets` untuk menghitung SHA-256 berkas patok tanah dan hash-chain riwayat tanah adat Papua."
  - "Buat 5 skenario pengujian unit otomatis yang memuat uji avalanche effect dan uji negatif manipulasi data 1 byte."
* **Bagian yang Dihasilkan / Dimodifikasi:**
  - `crypto/src/hasher.py`: Fungsi `hash_bytes`, `verify_hash`, dan `create_document_fingerprint`.
  - `crypto/src/tokens.py`: Fungsi `generate_verification_token` dan `generate_elder_otp` berbasis CSPRNG.
  - `crypto/src/chain.py`: Struktur `LandClaimRecord` dan logika verifikasi berantai `verify_integrity`.
  - `crypto/tests/test_crypto.py`: Skenario uji unit `unittest`/`pytest`.
* **Cara Memeriksa / Verifikasi Mandiri:**
  - Menjalankan seluruh pengujian otomatis langsung di terminal: `python3 -m unittest discover -s crypto/tests -p "test_*.py" -v`.
  - Memverifikasi secara mandiri bahwa saat berkas diubah 1 karakter, fungsi `verify_hash` mengembalikan nilai boolean `False`.
  - Memastikan tidak ada kunci privat atau secret hardcoded di dalam repositori.

### B. Pengembangan Antarmuka Web (Milestone 1 PAW)
* **Tujuan:** Merancang antarmuka Next.js/React yang semantik, responsif, memiliki komponen reusable, serta validasi formulir sisi klien.
* **Ringkasan Perintah (Prompt):**
  - "Rancang 3 halaman web (Beranda, Form Pendaftaran dengan validasi sisi klien, Detail Klaim dengan audit timeline) menggunakan React, TypeScript, dan Tailwind CSS bertema tanah ulayat Papua."
  - "Implementasikan minimal 5 komponen reusable dengan aksesibilitas keyboard dan landmark ARIA."
* **Bagian yang Dihasilkan / Dimodifikasi:**
  - `web/src/components/`: `Navbar`, `Footer`, `StatusBadge`, `ClaimCard`, `HashViewer`, `AuditTimeline`.
  - `web/src/app/page.tsx`: Halaman katalog eksplorasi klaim dengan pencarian dan filter status.
  - `web/src/app/daftar/page.tsx`: Formulir pendaftaran dengan validasi sisi klien (pesan error spesifik per kolom input).
  - `web/src/app/klaim/[id]/page.tsx`: Halaman detail tanah ulayat dan verifikasi hash-chain.
* **Cara Memeriksa / Verifikasi Mandiri:**
  - Memeriksa kebenaran alur validasi formulir: memastikan tombol submit tidak dapat memproses jika kolom nama marga kosong atau luas wilayah bernilai negatif/nol.
  - Memverifikasi hierarki judul semantik (`h1`, `h2`, `h3`) dan keberadaan landmark ARIA pada panel DevTools.

---

## 3. Pernyataan Tanggung Jawab Mahasiswa
Seluruh kode dan dokumentasi yang tercantum dalam repositori ini telah ditinjau, dipahami alur logikanya, dan diverifikasi kebenarannya secara mandiri oleh saya sendiri. Saya siap mempertanggungjawabkan dan mendemonstrasikan cara kerja setiap baris kode saat evaluasi praktikum dan sesi demonstrasi dosen.
