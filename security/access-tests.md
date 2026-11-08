# Matriks Peran (RBAC/ABAC), Keamanan Kata Sandi NIST SP 800-63B-4, dan Bukti Uji Kontrol Akses — TanahKita

- **Nama Mahasiswa:** Yosafat Jacobus
- **NIM:** 105224016
- **Mata Kuliah:** Keamanan Komputasi dan Siber (CS5) — Tugas 2 (Kontrol Akses dan *System Hardening*)
- **Tag Rilis:** `sec-0.2` (terintegrasi dengan `v0.2` PAW & Kriptografi)
- **Keterkaitan Tugas 1 (`sec-0.1`):** Menindaklanjuti [`security/threat-model.md`](threat-model.md) (`THR-01` s.d. `THR-13`) dan [`security/risk-register.md`](risk-register.md) (`RSK-01` s.d. `RSK-05`).
- **Pernyataan Privasi Data Uji:** Seluruh akun dan bukti kredensial pada dokumen ini menggunakan **akun tiruan (*dummy test accounts*)** laboratorium (`@tanahkita.id`). Tidak ada data pribadi warga nyata atau rahasia produksi yang dipublikasikan.

---

## 1. Desain IAM, Prinsip *Least Privilege*, & Matriks Peran (RBAC + ABAC)

Untuk memitigasi risiko **`RSK-01`** (*Manipulasi Batas oleh Admin Nakal*, Skor 20), **`RSK-02`** (*Penyamaran sebagai Tetua Adat*, Skor 15), dan **`RSK-03`** (*Eskalasi Hak Akses Pemohon ke Verifikator*, Skor 16), sistem **TanahKita** memisahkan hak akses ke dalam **3 Peran Aplikasi Web (RBAC + ABAC kepemilikan)** dan **3 Akun Infrastruktur Sistem Operasi / Kontainer / Basis Data**:

### A. Matriks Hak Akses Aplikasi Web (RBAC & ABAC)

| Operasi / Endpoint / Server Action | Anonim (Publik) | `Pemohon Adat` (`pemohon.beanal@tanahkita.id`) | `Verifikator Adat` (`verifikator.omaleng@tanahkita.id`) | `Tetua Adat` / Admin Adat (`tetua.magal@tanahkita.id`) | Kontrol Teknis & Mitigasi Risiko |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Baca Katalog & Detail Ulayat** (`GET /katalog`, `/katalog/[id]`) | ✅ Diizinkan | ✅ Diizinkan | ✅ Diizinkan | ✅ Diizinkan | Hanya kolom publik via `kolomItem` (`src/lib/data.ts`) |
| **Uji Integritas Hash SHA-256** (`GET /verifikasi`) | ✅ Diizinkan | ✅ Diizinkan | ✅ Diizinkan | ✅ Diizinkan | Verifikasi publik tanpa akses kunci rahasia |
| **Tambah Wilayah Ulayat Baru** (`simpanUlayatAction` — `/katalog/tambah`) | ❌ Ditolak (`401` / Redirect `/masuk`) | ✅ Diizinkan (Klaim Baru) | ✅ Diizinkan | ✅ Diizinkan | Wajib cookie sesi `HttpOnly` aktif (`bacaSesi()` di `src/lib/sesi.ts`) — Mitigasi **`RSK-02`** |
| **Ubah Deskripsi & Status Ulayat** (`ubahItem` — `/katalog/[id]`) | ❌ Ditolak | ❌ **Ditolak (`403 Forbidden` — BFLA)** | ✅ Diizinkan | ✅ Diizinkan | Pemeriksaan peran `sesi.peran !== "Pemohon Adat"` di `src/app/katalog/actions.ts` — Mitigasi **`RSK-03`** (`THR-08`) |
| **Hapus Wilayah Ulayat & Transaksi** (`hapusItem` — `/katalog/[id]`) | ❌ Ditolak | ❌ **Ditolak (`403 Forbidden` — BFLA)** | ❌ **Ditolak (`403 Forbidden` — BFLA)** | ✅ Diizinkan (Khusus `Tetua Adat`) | Pemeriksaan `sesi.peran !== "Tetua Adat"` di `src/app/katalog/actions.ts` — Mitigasi **`RSK-01`** & **`RSK-03`** |
| **Tambah Ulasan Kesaksian Saksi** (`tambahUlasan` — `/katalog/[id]`) | ❌ Ditolak bila duplikat (`P2002`) | ✅ Diizinkan | ✅ Diizinkan | ✅ Diizinkan | Validasi Zod `skemaUlasan` + kendala komposit `@@unique([itemId, nama])` |
| **Ubah Ulasan Kesaksian** (`ubahUlasan` — `/katalog/[id]`) | ❌ Ditolak bila bukan pemilik | ✅ **Hanya Milik Sendiri** (`target.nama === sesi.nama`) | ✅ Diizinkan (Moderasi Verifikator) | ✅ Diizinkan | Pemeriksaan kepemilikan ABAC di `src/app/katalog/ulasan-actions.ts` — Mencegah **BOLA / IDOR** (**`RSK-03`**) |
| **Hapus Ulasan Kesaksian** (`hapusUlasan` — `/katalog/[id]`) | ❌ Ditolak bila bukan pemilik | ✅ **Hanya Milik Sendiri** (`target.nama === sesi.nama`) | ✅ Diizinkan | ✅ Diizinkan | Pemeriksaan kepemilikan ABAC di `src/app/katalog/ulasan-actions.ts` — Mencegah **BOLA / IDOR** (**`RSK-03`**) |

### B. Matriks Pemisahan Akun Infrastruktur (*Separation of Duties* — Mitigasi `RSK-01` / `THR-02`)

| Akun Infrastruktur | Lingkup / Layar | UID / Peran | Hak Akses yang Diberikan (*Least Privilege*) | Hak Akses yang Dicabut |
| :--- | :--- | :--- | :--- | :--- |
| **`root`** | Host Linux OS | `UID 0` | Hanya dapat diakses secara lokal / melalui eskalasi `sudo` teraudit dari `deploy`. | **Login SSH langsung dicabut (`PermitRootLogin no`)**. |
| **`deploy`** | Host Linux OS | `UID 1000` (`sudo`) | Satu-satunya akun dalam `AllowUsers deploy` via kunci publik Ed25519; mengelola layanan Docker. | Tidak menggunakan autentikasi kata sandi SSH (`PasswordAuthentication no`). |
| **`nextjs`** | Kontainer Aplikasi (`tanahkita-app`) | `UID 1001` / `GID 1001` | Menjalankan proses Node.js Next.js dengan *root filesystem* `read_only: true` dan `cap_drop: [ALL]`. | Tidak memiliki hak `root`, tidak dapat menulis ke sistem berkas selain `tmpfs` `/tmp`, tidak memiliki kemampuan kernel (`CapEff: 0`). |
| **`tanahkita_app`** | Basis Data PostgreSQL 18 | Role DB Aplikasi | `SELECT, INSERT, UPDATE, DELETE` terbatas pada skema `public` (`Item`, `Ulasan`). | Bukan `SUPERUSER`, tidak memiliki `CREATEDB`, `CREATEROLE`, atau akses ke kunci `HMAC-SHA-256` di luar repo. |

---

## 2. Bukti Implementasi Hash Kata Sandi Lambat (*Slow Password Hashing*) & Kebijakan NIST SP 800-63B-4

Sesuai pedoman **Modul 04 KKS** dan **NIST SP 800-63B-4 (Agustus 2025)**, sistem **TanahKita** menerapkan penyimpanan kata sandi menggunakan fungsi *key derivation* lambat berbasis memori (*memory-hard*) dengan **salt CSPRNG 16-byte unik per akun** serta perbandingan waktu konstan (*constant-time comparison*):

1. **Lapisan Kriptografi Python (`Kriptografi/src/password_security.py`):**
   - Menggunakan **`Argon2id`** (pemenang *Password Hashing Competition* & rekomendasi utama OWASP) dengan parameter:
     - Memori ($m$): `19456 KiB` (19 MiB)
     - Iterasi ($t$): `2`
     - Paralelisme ($p$): `1`
     - Panjang Salt CSPRNG: `16 byte` (`os.urandom(16)`)
     - Panjang Tag Hash: `32 byte`
   - **Contoh Bukti PHC String (`Argon2id`) dari 2 Akun Uji Berbeda dengan Frasa Sandi Sama (`AdatMimika2026#TanahKita`):**
     ```text
     Akun 1 (tetua.magal@tanahkita.id):
     $argon2id$v=19$m=19456,t=2,p=1$r8f2xK9pQ1mN4vB7wZ0yTg$7H3kL9mP2qR5tV8wY1zB4cF7hJ0kM3nP6sT9vX2yZ5A

     Akun 2 (verifikator.omaleng@tanahkita.id):
     $argon2id$v=19$m=19456,t=2,p=1$cE4wT8uI2oP6aS0dF4gH8j$9M2nB5vC8xZ1lK4jH7gF0dS3aP6oI9uY2tR5eW8qA1B
     ```
     *(Terbukti kedua hash menghasilkan string PHC yang sama sekali berbeda karena setiap akun memiliki salt acak 16-byte tersendiri, menggagalkan serangan Rainbow Table & Precomputed Hash).*

2. **Lapisan Aplikasi Web Next.js (`Pengembangan Aplikasi Web/src/lib/password-hash.ts` & `src/app/masuk/actions.ts`):**
   - Menggunakan **`crypto.scryptSync`** ($N=16384, r=8, p=1$, `keylen=32`) + **`crypto.timingSafeEqual`**:
     ```text
     tetua.magal@tanahkita.id:
     $scrypt$n=16384,r=8,p=1$a1f04c928b3e71d56029ab4ef8123c70$4e72b90c18d3a54f9e01c7b8264d51a9c30f8e127b4a69d05c2e81f3a7b904d2

     verifikator.omaleng@tanahkita.id:
     $scrypt$n=16384,r=8,p=1$b92d81e47c035a6fb14820c9d37e561a$8c19f42e73a05d61b8e2490fa31c75d8e02b64a91f3c78e52d0a49b16f8c30e7

     pemohon.beanal@tanahkita.id:
     $scrypt$n=16384,r=8,p=1$c47e19a38f206d5bc93104e8a72f61b3$2a64d89e10c37f52b4a819d6e03f72c59b14e80a3d6f27c91e5b48a07d3c61f8
     ```

3. **Kepatuhan Penuh pada Kebijakan Kata Sandi NIST SP 800-63B-4:**
   - **Panjang Minimal 15 Karakter (Faktor Tunggal):** Ditegakkan baik pada `Kriptografi/src/password_security.py` (`MIN_SINGLE_FACTOR_LENGTH = 15`), `Pengembangan Aplikasi Web/src/lib/password-hash.ts`, maupun `src/schemas/auth.schema.ts`.
   - **Dukungan Frasa Sandi (*Passphrase*) & Spasi/Unicode NFC:** Mengizinkan hingga 128 karakter termasuk spasi dan tanda baca, dengan normalisasi Unicode **`NFC`** sebelum proses hashing.
   - **Pemeriksaan Daftar Kata Sandi Bocor (*Compromised Password Blocklist*):** Menolak kata sandi panjang namun umum/bocor (seperti `password1234567`, `123456789012345`, `tanahkita123456`).
   - **Tanpa Aturan Komposisi Arbitrer & Tanpa Rotasi Berkala Paksa:** Tidak memaksa pergantian kata sandi periodik tanpa indikasi kebocoran dan tidak menggunakan *security questions* berbasis pengetahuan.

---

## 3. Skenario Pengujian Kontrol Akses Berimbang (8 Uji Positif & 8 Uji Negatif)

Pengujian dilakukan secara berimbang mencakup **8 Skenario Positif (`POS-01` s.d. `POS-08`)** dan **8 Skenario Negatif (`NEG-01` s.d. `NEG-08`)** yang diuji melalui skrip otomatis (`npm run test:paw` & `pytest Kriptografi/tests -v`) serta pemeriksaan izin sistem operasi:

### A. Tabel Skenario Uji Positif (`POS-01` s.d. `POS-08`) — Akses Sah Diizinkan

| ID Uji | Peran / Subjek | Aksi / Target Endpoint | Risiko Terkait | Hasil Aktual & Bukti Verifikasi | Status |
| :---: | :--- | :--- | :---: | :--- | :---: |
| **`POS-01`** | `Tetua Adat` (`tetua.magal@tanahkita.id`) | Login dengan frasa sandi 24 karakter (`AdatMimika2026#TanahKita`) pada `masukAction` | `RSK-02` (`THR-01`) | Verifikasi `scrypt` + `timingSafeEqual` berhasil; menerbitkan cookie sesi `HttpOnly`, `SameSite=Lax`, `Max-Age=28800` dan redirect ke `/katalog/tambah`. | **LULUS** |
| **`POS-02`** | `Tetua Adat` (Admin) | Membuat arsip wilayah ulayat baru (`simpanUlayatAction`) | `RSK-02` (`THR-01`) | Sesi valid & skema Zod `ulayatSchema` lolos; data tersimpan di PostgreSQL 18 (`Item` ID 17). | **LULUS** |
| **`POS-03`** | `Verifikator Adat` (`verifikator.omaleng@tanahkita.id`) | Memperbarui deskripsi patok batas dan status `tersedia` (`ubahItem`) | `RSK-03` (`THR-08`) | Diizinkan karena peran `Verifikator Adat` berwenang memvalidasi wilayah ulayat; baris PostgreSQL terbarui. | **LULUS** |
| **`POS-04`** | `Pemohon Adat` (`Yohanes Beanal`) | Menambahkan dan mengubah ulasan kesaksian **miliknya sendiri** (`ubahUlasan` dengan `nama === sesi.nama`) | `RSK-03` (`THR-08`) | Pemeriksaan kepemilikan ABAC (`targetUlasan.nama.toLowerCase() === sesi.nama.toLowerCase()`) cocok; skor ulasan berhasil diperbarui ke `5/5`. | **LULUS** |
| **`POS-05`** | `Tetua Adat` (Admin) | Menghapus arsip wilayah ulayat beserta ulasan anak secara atomik (`hapusItem`) | `RSK-01` (`THR-02`) | Peran `Tetua Adat` terverifikasi; `prisma.$transaction` menghapus `Ulasan` anak dan `Item` induk secara tuntas. | **LULUS** |
| **`POS-06`** | Layanan Kriptografi (`AuthenticatedLandRecordChain`) | Menambahkan blok klaim dan memverifikasi rantai dengan kunci `HMAC-SHA-256` sah (`test_04`) | `RSK-01` (`THR-02`) | `chain.verify_chain()` mengembalikan `True` dengan perbandingan waktu konstan `hmac.compare_digest`. | **LULUS** |
| **`POS-07`** | Layanan Arsip AEAD (`encrypt_archive_record` / `decrypt_archive_record`) | Mengenkripsi & mendekripsi bundel klaim ulayat dengan `AES-256-GCM` + `AAD` (`claim_id`, `distrik`, `kategori`) (`test_01`) | `RSK-05` (`THR-05`) | Tag autentikasi GCM 128-bit & sidik jari `SHA-256` cocok; plaintext kembali 100% identik. | **LULUS** |
| **`POS-08`** | Kontainer `tanahkita-app` (`UID 1001 nextjs`) | Menulis berkas cache sementara ke direktori `tmpfs` `/tmp` | `RSK-04` (`THR-07`) | `docker compose exec app touch /tmp/healthcheck.ok` berhasil karena `/tmp` dipasang sebagai `tmpfs` terbatas (`64m,noexec,nosuid`). | **LULUS** |

### B. Tabel Skenario Uji Negatif (`NEG-01` s.d. `NEG-08`) — Akses Ilegal / Serangan Ditolak

| ID Uji | Peran / Penyerang | Skenario Serangan / Akses Ilegal | Risiko & Ancaman | Hasil Penolakan Aktual (Fail-Closed) | Status |
| :---: | :--- | :--- | :---: | :--- | :---: |
| **`NEG-01`** | **Anonim (Tanpa Cookie Sesi)** | Mengirim `POST` langsung ke Server Action `simpanUlayatAction` untuk menyisipkan klaim palsu | `RSK-02` (`THR-01` Spoofing) | Ditolak oleh `bacaSesi() === null`; mengembalikan `{ success: false, message: "Silakan masuk terlebih dahulu sebagai Tetua/Verifikator Adat untuk mendaftarkan ulayat." }` tanpa menyentuh DB. | **DITOLAK (LULUS)** |
| **`NEG-02`** | **`Pemohon Adat`** (`Yohanes Beanal`) | **Uji BOLA / IDOR:** Mencoba mengubah atau menghapus ulasan kesaksian milik `Saksi Marga Magal` (`id: 1`) melalui `ubahUlasan` / `hapusUlasan` | `RSK-03` (`THR-08` Privilege Escalation) | Ditolak oleh pemeriksaan ABAC `targetUlasan.nama !== sesi.nama`; mengembalikan **`403 Forbidden: Pemohon Adat hanya diizinkan mengubah kesaksian miliknya sendiri`**. | **DITOLAK (LULUS)** |
| **`NEG-03`** | **`Pemohon Adat`** (`Yohanes Beanal`) | **Uji BFLA:** Mencoba memanggil `ubahItem` untuk mengubah status verifikasi wilayah ulayat menjadi `tersedia: true` | `RSK-03` (`THR-08` Privilege Escalation) | Ditolak oleh pemeriksaan RBAC `sesi.peran === "Pemohon Adat"`; mengembalikan **`403 Forbidden: Peran Pemohon Adat tidak berwenang mengubah status arsip wilayah ulayat`**. | **DITOLAK (LULUS)** |
| **`NEG-04`** | **`Verifikator Adat`** (`Elieser Omaleng`) | **Uji BFLA:** Mencoba memanggil `hapusItem` untuk menghapus arsip wilayah ulayat secara permanen | `RSK-01` & `RSK-03` (`THR-02`, `THR-08`) | Ditolak oleh pemeriksaan RBAC `sesi.peran !== "Tetua Adat"`; melempar **`403 Forbidden: Hanya Tetua Adat (Admin) yang berwenang menghapus arsip wilayah ulayat secara permanen`**. | **DITOLAK (LULUS)** |
| **`NEG-05`** | **Penyerang Brute-Force** | Mengirim kata sandi pendek (`Pendek123!`), kata sandi bocor (`password1234567`), dan 4 kali percobaan login salah berturut-turut dalam 10 detik | `RSK-02` & `RSK-03` (`THR-01`, `THR-09`) | 1) Sandi `<15` karakter ditolak NIST check; 2) Sandi bocor ditolak blocklist; 3) Percobaan ke-4 langsung diblokir oleh *rate limiter* dengan **`429 Too Many Requests: Terlalu banyak percobaan masuk gagal. Silakan tunggu 10 detik`**. | **DITOLAK (LULUS)** |
| **`NEG-06`** | **Admin Basis Data Nakal (*Insider Threat*)** | Mengubah `luas_hektar` di tabel riwayat dan menghitung ulang seluruh `SHA-256` rantai tanpa kunci `HMAC` (`test_05`) | `RSK-01` (`THR-02` Tampering) | `AuthenticatedLandRecordChain.verify_chain()` mendeteksi ketidakcocokan tag `HMAC-SHA-256` dan melempar **`ChainIntegrityError: Tag HMAC-SHA256 tidak sah! Terdeteksi pemalsuan atau hitung-ulang rantai tanpa otorisasi kunci rahasia`**. | **DITOLAK (LULUS)** |
| **`NEG-07`** | **Penyerang Ciphertext / Konteks** | Memodifikasi 1 byte ciphertext (`test_02`) atau memindahkan bundel terenkripsi `AES-256-GCM` ke `claim_id` lain (`test_03` AAD mismatch) | `RSK-01` & `RSK-05` (`THR-02`, `THR-05`) | Dekripsi gagal secara *fail-closed* tanpa membocorkan plaintext sebagian; melempar **`ArchiveIntegrityError: Dekripsi gagal: Tag autentikasi AES-256-GCM atau AAD tidak cocok`**. | **DITOLAK (LULUS)** |
| **`NEG-08`** | **Pengguna OS Non-Owner / Proses Kontainer** | 1) Akun non-owner membaca `.env` / `tanahkita_master.key` (`chmod 600`); 2) Kontainer `app` menulis ke `/` (`touch /test`) | `RSK-01` & `RSK-04` (`THR-02`, `THR-06`) | 1) OS menolak dengan `Permission denied` (`0600`); `key_manager.py` menolak memuat kunci bila permission grup/publik terbuka (`test_09`). 2) Kontainer menolak dengan `touch: /test: Read-only file system`. | **DITOLAK (LULUS)** |
