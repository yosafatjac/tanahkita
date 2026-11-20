# Spesifikasi Kebutuhan Produk — TanahKita (`docs/kebutuhan.md`)

**Produk Digital Terintegrasi:** **TanahKita** — Sistem Pencatatan, Dokumentasi, dan Verifikasi Bukti Penguasaan Tanah Adat Papua (Kabupaten Mimika)  
**Pengembang:** Yosafat Jacobus (`105224016`)  
**Repositori:** [https://github.com/yosafatjac/tanahkita](https://github.com/yosafatjac/tanahkita)  
**Mata Kuliah Terintegrasi:** Pengembangan Aplikasi Web (`052355`), Praktikum PAW (`052356`), Kriptografi (`052357`), dan Keamanan Komputasi & Siber (`052353`)

---

## 1. Daftar Kebutuhan Fungsional Utama (`K-01` s.d. `K-07`)

Setiap kebutuhan di bawah ini menjadi acuan keterlacakan antara antarmuka web, Server Actions, **RESTful API (`/api/v1`)** pada Modul 8–9, mekanisme kriptografi, serta kontrol keamanan.

| ID | Nama Kebutuhan | Deskripsi Kebutuhan Pengguna | Aktor Utama | Fitur Web / Endpoint `/api/v1` Terkait |
| :---: | :--- | :--- | :--- | :--- |
| **`K-01`** | **Eksplorasi & Paginasi Daftar Wilayah Ulayat** | Pengguna dapat melihat daftar seluruh wilayah ulayat adat (`Item`) yang tercatat di PostgreSQL secara terpaginasi (`halaman`, `batas`) serta menyaring berdasarkan `kategori` wilayah (`HutanAdat`, `ZonaSagu`, `PesisirUlayat`, `LembahKeramat`, `PerkebunanKomunal`). | Masyarakat Umum, Pemohon Adat, Verifikator, Tetua Adat | `/katalog` & `GET /api/v1/item` |
| **`K-02`** | **Pendaftaran Wilayah Ulayat Adat Baru** | Pengelola/Tetua Adat dapat mendaftarkan arsip wilayah ulayat baru beserta judul unik, kategori resmi, distrik Mimika, luas hektar positif, deskripsi patok alam, dan status ketersediaan dengan validasi ketat di sisi server. | Tetua Adat, Verifikator Adat | `/katalog/tambah` & `POST /api/v1/item` |
| **`K-03`** | **Peninjauan Detail Wilayah Ulayat** | Pengguna dapat membuka informasi terperinci satu wilayah ulayat berdasarkan `id` numerik positif beserta batas alam, luas, distrik, dan status ketersediaannya; permintaan ID tidak valid/tidak ada ditolak secara terstruktur. | Seluruh Aktor | `/katalog/[id]` & `GET /api/v1/item/{id}` |
| **`K-04`** | **Pembaruan Sebagian Data & Status Ketersediaan Wilayah** | Otoritas adat dapat memperbarui sebagian atribut wilayah ulayat (seperti `deskripsi` patok batas atau status `tersedia` menjadi `true`/`false`) tanpa harus mengirim ulang seluruh kolom yang tidak berubah. | Tetua Adat, Verifikator Adat | `FormUbahItem` (`/katalog/[id]`) & `PATCH /api/v1/item/{id}` |
| **`K-05`** | **Penghapusan Arsip Wilayah Ulayat secara Aman** | Tetua Adat dapat menghapus data wilayah ulayat yang salah input/tidak relevan. Pada REST API, penghapusan item yang masih dirujuk oleh kesaksian adat (`Ulasan`) wajib ditolak (`409 Conflict`) demi mencegah hilangnya bukti kesaksian diam-diam (`onDelete: Restrict`). | Tetua Adat (Admin) | `hapusItem` (`/katalog/[id]`) & `DELETE /api/v1/item/{id}` |
| **`K-06`** | **Pengelolaan & Pembacaan Kesaksian Saksi Batas Adat (Relasi 1:N)** | Pengguna dapat membaca seluruh daftar kesaksian/verifikasi (`Ulasan`) yang terhubung dengan satu wilayah ulayat tertentu (`itemId`), serta menambahkan, memperbarui, atau menghapus kesaksian dengan batas maksimal 1 ulasan per nama saksi pada wilayah yang sama (`@@unique([itemId, nama])`). | Pemohon Adat, Verifikator Adat, Tetua Adat | `FormUlasan`, `FormUbahUlasan` (`/katalog/[id]`) & `GET /api/v1/item/{id}/ulasan` |
| **`K-07`** | **Autentikasi Sesi, Perlindungan Kriptografi, & Kontrol Akses** | Sistem melindungi operasi sensitif dengan autentikasi sesi (`HttpOnly` cookie, kata sandi lambat `scrypt`/`Argon2id` min. 15 karakter), kontrol akses RBAC/ABAC, enkripsi arsip sensitif `AES-256-GCM`, dan integritas rantai klaim `HMAC-SHA-256` / `SHA-256`. | Tetua Adat, Verifikator Adat, Pemohon Adat | `/masuk`, `/verifikasi`, `Kriptografi/src/`, & Modul 10 (Autentikasi API) |

---

## 2. Kebutuhan Non-Fungsional Utama (`NF-01` s.d. `NF-04`)

| ID | Aspek | Target Terukur |
| :---: | :--- | :--- |
| **`NF-01`** | **Konsistensi Kontrak API & Format Galat** | Seluruh galat REST API mengembalikan format **Problem Details (RFC 9457)** dengan header `Content-Type: application/problem+json` tanpa membocorkan *stack trace* atau kueri SQL, serta spesifikasi `docs/api/openapi.yaml` lolos `npx @redocly/cli lint` tanpa galat. |
| **`NF-02`** | **Validasi Sisi Server & Integritas Data** | Seluruh masukan formulir dan API (body JSON, parameter path, parameter kueri) divalidasi dengan **Zod 4** di server sebelum menyentuh PostgreSQL 18 / Prisma ORM 7. |
| **`NF-03`** | **Penanganan Galat Tak Terduga & Ketersediaan** | Galat tak terduga tidak pernah ditelan blok `catch` kosong (OWASP A10:2025), tercatat di log server, dan ditampilkan ramah oleh `error.tsx` dengan `error.digest` serta paginasi dibatasi maksimum `batas <= 50`. |
| **`NF-04`** | **Aksesibilitas & Responsivitas Antarmuka** | Kepatuhan WCAG 2.2 Level AA, skor Lighthouse Aksesibilitas $\ge 85$ (aktual: `98/100`), dan tata letak responsif ponsel/tablet/desktop. |
