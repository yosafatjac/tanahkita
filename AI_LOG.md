# Catatan Pemanfaatan Kecerdasan Artifisial (`AI_LOG.md`)

**Produk Digital Terintegrasi:** TanahKita — Sistem Dokumentasi, Pendaftaran, dan Verifikasi Bukti Klaim Tanah Ulayat & Adat di Kabupaten Mimika (Timika, Papua Tengah)  
**Pengembang:** Yosafat Jacobus (NIM: `105224016`)  
**Mata Kuliah Terintegrasi:**
1. **Pengembangan Aplikasi Web (`CS5-2026`)** — Tag `v0.1` & `v0.2`
2. **Kriptografi (`052357` / `CS5-2026`)** — Tag `v0.1` & `v0.2`
3. **Keamanan Komputasi dan Siber (`052353` / `CS5-2026`)** — Tag `sec-0.1` & `sec-0.2`

---

## 1. Tabel Ringkasan Pemanfaatan AI (Format Kebijakan KKS & Kriptografi)

| Tanggal | Alat | Tujuan | Prompt ringkas | Yang dihasilkan AI | Yang saya ubah atau periksa |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-10-20** | Antigravity (Gemini / Claude) | Tugas 1 Kriptografi (`v0.1`): Implementasi SHA-256, Hash-Chain riwayat tanah, dan token CSPRNG. | "Buat modul Python menggunakan `hashlib` dan `secrets` untuk menghitung SHA-256 berkas patok tanah dan hash-chain riwayat tanah adat Papua beserta 5 skenario uji unit." | Kerangka modul `hasher.py`, `tokens.py`, `chain.py`, dan `test_crypto.py`. | Menyesuaikan struktur `LandClaimRecord` dengan data marga sintetis Mimika (`Marga Amungme - Kwamki Narama`), menambahkan uji *avalanche effect* dan manipulasi 1-byte, serta menjalankan `pytest` mandiri (`5 passed`). |
| **2026-10-21** | Antigravity (Gemini / Claude) | Milestone 1 PAW (`v0.1`): Perancangan antarmuka Next.js App Router semantik, responsif, dan Web Crypto API. | "Rancang antarmuka web modern Next.js App Router di `Pengembangan Aplikasi Web/` dengan 8 komponen reusable, kalkulasi SHA-256 live via Web Crypto API, dan tema tanah ulayat Papua." | Komponen UI di `src/components/`, halaman katalog & detail klaim, serta utilitas `src/lib/crypto.ts`. | Memeriksa hierarki heading semantik (`h1`–`h3`), atribut aksesibilitas ARIA (`aria-live`, `role="status"`), responsivitas mobile/desktop, dan menguji unggah berkas di browser. |
| **2026-10-22** | Antigravity (Gemini / Claude) | Tugas 1 KKS (`sec-0.1`): Penyusunan inventaris aset, DFD Level 1, ancaman STRIDE, dan register risiko. | "Susun DFD Level 1 dengan ID elemen konsisten, pemetaan ancaman STRIDE spesifik konteks TanahKita di Mimika, dan 5 risiko prioritas." | Draf `asset-inventory.md`, `dfd.md`, `threat-model.md`, dan `risk-register.md`. | Menghapus istilah ancaman generik, menautkan setiap ancaman `THR-01`..`THR-13` ke ID elemen DFD (`E1`–`E3`, `P1`–`P4`, `D1`–`D6`, `DF1`–`DF19`), dan memverifikasi alasan *Likelihood* $\times$ *Impact*. |
| **2026-11-08** | Antigravity (Gemini / Claude) | Tugas 2 Kriptografi (`v0.2`): Implementasi AEAD `AES-256-GCM`, `HMAC-SHA-256` chain, derivasi kunci `HKDF-SHA256`, dan `Argon2id`. | "Bangun modul `key_manager.py`, `validator.py`, `aead_archive.py`, `hmac_chain.py`, `password_security.py`, `KEPUTUSAN.md`, dan 12 skenario `test_tugas2.py` yang menyambung Tugas 1." | Kode layanan kriptografi modular di `Kriptografi/src/`, pengujian `test_tugas2.py`, dan dokumen `KEPUTUSAN.md`. | Memindahkan kunci master 256-bit ke luar repositori (`/Volumes/For Apple/.secrets/tanahkita_master.key`, `chmod 600`), menambahkan uji negatif manipulasi tag/ciphertext/AAD & *insider threat* `TC-08`, serta memverifikasi `pytest` (`16 passed, 1 xfailed`). |
| **2026-11-08** | Antigravity (Gemini / Claude) | Milestone 2 PAW (`v0.2`): Integrasi PostgreSQL 18, Prisma ORM 7, Server Actions, Zod 4, dan CRUD penuh 2 entitas berelasi (`Item` & `Ulasan`). | "Lengkapi operasi Create, Read, Update, dan Delete pada entitas `Item` dan `Ulasan` dengan Zod 4 `safeParse`, RBAC/ABAC sesi `HttpOnly`, dan skrip uji otomatis 12 skenario." | Server Actions `ulasan-actions.ts`, `FormUbahUlasan.tsx`, `password-hash.ts`, `sesi.ts`, dan `scripts/uji-crud-modul6.ts`. | Menguji langsung ke PostgreSQL 18 lokal, memeriksa penanganan kode galat Prisma `P2002`/`P2025`, memverifikasi `npx tsc --noEmit` (`0 error`) dan `npm run test:paw` (`12/12 LULUS`), serta mengambil tangkapan layar asli dari aplikasi. |
| **2026-11-08** | Antigravity (Gemini / Claude) | Tugas 2 KKS (`sec-0.2`): Kontrol akses RBAC/ABAC (*least privilege*), *hardening* SSH & Lynis, kontainer non-root `read_only`, Trivy, dan SBOM CycloneDX. | "Susun matriks & 16 uji akses (`access-tests.md`), konfigurasi SSH (`00-hardening.conf`), `Dockerfile` multi-stage non-root, `compose.yaml`, analisis Lynis & Trivy sebelum-sesudah, dan SBOM CycloneDX v1.6." | Berkas `Dockerfile`, `compose.yaml`, `.github/dependabot.yml`, dan artefak audit di `security/`. | Memastikan *digest pinning* `node:22-alpine3.21`, memverifikasi pemetaan balik setiap kontrol ke `RSK-01`..`RSK-05` di `risk-register.md`, menguji seluruh 8 uji akses positif & 8 negatif, dan memastikan tidak ada kredensial di Git. |

---

## 2. Catatan Detail per Tugas (Format Terstruktur Kriptografi & PAW)

### Tugas 1 — Fondasi Kriptografi, Antarmuka Web v0.1, dan Threat Modeling (`v0.1` / `sec-0.1`)
- **Tool:** Google DeepMind Antigravity (Gemini / Claude)
- **Tujuan:** Membangun fondasi produk TanahKita berupa modul integritas SHA-256 & hash-chain (`Kriptografi/`), antarmuka Next.js App Router (`Pengembangan Aplikasi Web/`), serta pemodelan ancaman STRIDE & register risiko (`security/`).
- **Ringkasan prompt:** "Bangun modul SHA-256 dan hash-chain klaim tanah ulayat di `Kriptografi/`, antarmuka katalog & verifikasi dokumen di `Pengembangan Aplikasi Web/`, serta DFD Level 1 + STRIDE + Risk Register di `security/`."
- **Bagian yang digunakan:** Struktur kelas `LandClaimRecord`, fungsi `create_document_fingerprint`, komponen antarmuka React/Tailwind, dan kerangka tabel STRIDE.
- **Bagian yang diubah:** Seluruh data sampel disesuaikan menjadi data sintetis marga di Kabupaten Mimika (Amungme & Kamoro), batas klaim geografis 4 penjuru, serta penambahan analisis keterbatasan hash tanpa kunci (*insider threat* admin DB) pada `Kriptografi/README.md`.
- **Verifikasi:** Menjalankan `python3 -m unittest discover -s "Kriptografi/tests" -p "test_*.py" -v` (`5 passed`) dan memeriksa render seluruh halaman Next.js di peramban.

### Tugas 2 — Kriptografi: Enkripsi Terautentikasi (AEAD), Integritas Berautentikasi (HMAC), & Manajemen Kunci (`v0.2`)
- **Tool:** Google DeepMind Antigravity (Gemini / Claude)
- **Tujuan:** Melindungi kerahasiaan arsip sensitif surat kesaksian tetua adat dengan `AES-256-GCM`, menutup celah *insider threat* Tugas 1 dengan `HMAC-SHA-256`, menerapkan pemisahan kunci per tujuan dengan `HKDF-SHA256`, serta melindungi kata sandi dengan `Argon2id`.
- **Ringkasan prompt:** "Implementasikan `AESGCM` (nonce CSPRNG 96-bit, tag 128-bit, AAD terikat konteks klaim), `HMAC-SHA-256` dengan `hmac.compare_digest`, derivasi sub-kunci `HKDF-SHA256` (`enc-v1` & `mac-v1`), validasi *allowlist* gagal-tertutup, dan 12 skenario `pytest` di `Kriptografi/tests/test_tugas2.py`."
- **Bagian yang digunakan:** Implementasi kelas `ArchiveAEADService`, `AuthenticatedClaimChain`, `KeyManager`, validator masukan `validator.py`, dan struktur `KEPUTUSAN.md`.
- **Bagian yang diubah:** Mengatur penyimpanan kunci master di luar repositori (`/Volumes/For Apple/.secrets/tanahkita_master.key` dengan izin `0600`), menambahkan pengujian tanpa efek samping (*no partial plaintext leakage* saat `InvalidTag`), serta melengkapi analisis bahaya pengulangan nonce GCM di `KEPUTUSAN.md` Bagian 5.
- **Verifikasi:** Menjalankan `pytest Kriptografi/tests -v` dan memverifikasi hasil **`16 passed, 1 xfailed in 0.22s`** (12 skenario Tugas 2 + 5 skenario Tugas 1 berjalan konsisten).

### Tugas 2 — Pengembangan Aplikasi Web: Logika Server, Prisma ORM 7, PostgreSQL 18, & CRUD 2 Entitas (`v0.2`)
- **Tool:** Google DeepMind Antigravity (Gemini / Claude)
- **Tujuan:** Mengintegrasikan database PostgreSQL 18 melalui Prisma ORM 7 (`@prisma/adapter-pg`), mengimplementasikan operasi CRUD lengkap pada 2 entitas berelasi (`Item` dan `Ulasan`), validasi server Zod 4, dan otorisasi berbasis sesi.
- **Ringkasan prompt:** "Implementasikan Server Actions CRUD penuh untuk `Item` dan `Ulasan` (termasuk `ubahUlasan` dan komponen `FormUbahUlasan.tsx`), validasi server Zod 4 dengan `z.flattenError`, hash kata sandi lambat `scryptSync` + `timingSafeEqual`, serta skrip uji 12 skenario di `scripts/uji-crud-modul6.ts`."
- **Bagian yang digunakan:** Logika Server Actions di `src/app/katalog/actions.ts` dan `src/app/katalog/ulasan-actions.ts`, skema validasi Zod di `src/schemas/`, serta komponen formulir interaktif.
- **Bagian yang diubah:** Menambahkan pemeriksaan kepemilikan atribut (ABAC) pada `ubahUlasan` agar `Pemohon Adat` hanya dapat mengubah/menghapus catatan verifikasi miliknya sendiri sementara `Petugas BPN` dapat memoderasi seluruh catatan, menghubungkan statistik beranda ke PostgreSQL 18, dan mengambil 3 tangkapan layar asli beresolusi tinggi (`v02-*.png`).
- **Verifikasi:** Menjalankan `npx tsc --noEmit` (`0 error`), menjalankan `npm run test:paw` terhadap PostgreSQL 18 (`12/12 skenario LULUS` / 100%), dan menguji langsung di browser (`http://localhost:3000`).

### Tugas 2 — Keamanan Komputasi dan Siber: Kontrol Akses, *System Hardening*, Kontainer, & *Supply Chain* (`sec-0.2`)
- **Tool:** Google DeepMind Antigravity (Gemini / Claude)
- **Tujuan:** Menerapkan kontrol akses *least privilege* (RBAC + ABAC), *hardening* layanan Linux/SSH, kontainerisasi aman (`Dockerfile` & `compose.yaml`), pemindaian kerentanan image sebelum-sesudah, dan pembuatan SBOM CycloneDX.
- **Ringkasan prompt:** "Susun konfigurasi drop-in SSH `00-hardening.conf`, `Dockerfile` multi-stage non-root dengan digest pinning, `compose.yaml` (`read_only: true`, `cap_drop: [ALL]`, `no-new-privileges`), `access-tests.md`, `hardening-notes.md`, bukti Lynis/Trivy sebelum-sesudah, dan `sbom.cdx.json`."
- **Bagian yang digunakan:** Struktur konfigurasi keamanan di `Dockerfile`, `compose.yaml`, `.github/dependabot.yml`, dan format laporan pengujian di `security/`.
- **Bagian yang diubah:** Memastikan seluruh kontrol di `access-tests.md` dan `hardening-notes.md` merujuk langsung ke ID risiko Tugas 1 (`RSK-01` s.d. `RSK-05`), menambahkan bukti verifikasi `sudo sshd -T | grep -E 'passwordauthentication|permitrootlogin'`, serta menyusun ruang lingkup etika pengujian di `security/README.md`.
- **Verifikasi:** Memvalidasi format JSON `security/sbom.cdx.json` (CycloneDX v1.6, 20 komponen), memeriksa kenaikan indeks Lynis (`61` $\rightarrow$ `76` $\ge 70$), penurunan kerentanan Trivy (`5 CRITICAL` $\rightarrow$ `0 CRITICAL`), serta menjalankan 16 skenario uji akses positif dan negatif.

---

## 3. Pernyataan Tanggung Jawab Akademik Mahasiswa
Seluruh kode sumber, konfigurasi *hardening*, skema database, dan dokumentasi pengujian di dalam repositori **TanahKita** ini telah saya tinjau, uji coba, dan pahami cara kerjanya secara menyeluruh. Tidak ada kunci privat, *secret*, kredensial produksi, ataupun data pribadi nyata (PII) yang disimpan di dalam repositori. Saya siap mendemonstrasikan dan menjelaskan setiap keputusan teknis secara mandiri pada sesi evaluasi.
