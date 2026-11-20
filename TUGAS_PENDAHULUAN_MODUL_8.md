# Tugas Pendahuluan Modul 8 — RESTful API dengan Route Handlers

* **Nama:** Yosafat Jacobus  
* **NIM:** 105224016  
* **Program Studi:** Ilmu Komputer, Universitas Pertamina  
* **Mata Kuliah:** Praktikum Pengembangan Aplikasi Web (`052356`) — Modul 8 (Pekan 9)  
* **Produk:** **TanahKita** (Sistem Pencatatan dan Pembuktian Penguasaan Tanah Adat Papua — Kabupaten Mimika)  
* **Repositori:** [https://github.com/yosafatjac/tanahkita](https://github.com/yosafatjac/tanahkita)  

---

## 1. Tabel Endpoint RESTful API Produk TanahKita (`/api/v1`)

Berdasarkan entitas basis data **TanahKita** pada `prisma/schema.prisma` (entitas induk **`Item`** untuk arsip wilayah ulayat adat dan entitas anak berelasi 1:N **`Ulasan`** untuk kesaksian saksi batas adat) serta daftar kebutuhan pada **`docs/kebutuhan.md`**, berikut adalah **6 operasi endpoint** di bawah `/api/v1`:

| No | Metode | Path di Bawah `/api/v1` | Kebutuhan yang Dilayani (`docs/kebutuhan.md`) | Ringkasan Operasi pada Produk TanahKita | Semua Kode Status yang Mungkin |
| :---: | :---: | :--- | :---: | :--- | :--- |
| **1** | `GET` | `/api/v1/item` | **`K-01`** | Mengambil daftar wilayah ulayat adat (`Item`) dengan paginasi (`halaman`, `batas` maks. 50) dan filter opsional `kategori` (`HutanAdat`, `ZonaSagu`, `PesisirUlayat`, `LembahKeramat`, `PerkebunanKomunal`). | `200 OK`, `400 Bad Request` (parameter kueri rusak/`batas > 50`), `405 Method Not Allowed`, `500 Internal Server Error` |
| **2** | `POST` | `/api/v1/item` | **`K-02`** | Mendaftarkan arsip wilayah ulayat adat baru ke PostgreSQL; mengembalikan objek `Item` baru disertai header `Location: /api/v1/item/{id}`. | `201 Created`, `400 Bad Request` (body bukan JSON valid), `405 Method Not Allowed`, `409 Conflict` (`P2002` judul wilayah ulayat sudah terdaftar), `422 Unprocessable Content` (JSON valid tetapi gagal validasi Zod), `500 Internal Server Error` |
| **3** | `GET` | `/api/v1/item/{id}` | **`K-03`** | Mengambil detail satu arsip wilayah ulayat adat berdasarkan `id` bilangan bulat positif. | `200 OK`, `400 Bad Request` (`id` bukan bilangan bulat positif, misal `abc`/`0`/`-3`), `404 Not Found` (`Item` tidak ada), `405 Method Not Allowed`, `500 Internal Server Error` |
| **4** | `PATCH` | `/api/v1/item/{id}` | **`K-04`** | Memperbarui sebagian atribut wilayah ulayat adat (misalnya mengubah `deskripsi` patok batas atau status `tersedia` menjadi `false`) dengan syarat minimal satu field dikirim. | `200 OK`, `400 Bad Request` (`id` tidak sah atau body bukan JSON), `404 Not Found` (`P2025` item tidak ada), `405 Method Not Allowed`, `409 Conflict` (`P2002` judul baru duplikat), `422 Unprocessable Content` (body `{}` kosong atau isi gagal validasi Zod), `500 Internal Server Error` |
| **5** | `DELETE` | `/api/v1/item/{id}` | **`K-05`** | Menghapus satu arsip wilayah ulayat adat yang tidak memiliki kesaksian adat terhubung (`onDelete: Restrict`). | `204 No Content`, `400 Bad Request` (`id` tidak sah), `404 Not Found` (`P2025` item tidak ada), `405 Method Not Allowed`, `409 Conflict` (item masih memiliki baris anak pada tabel `Ulasan`), `500 Internal Server Error` |
| **6** | `GET` | `/api/v1/item/{id}/ulasan` | **`K-06`** | Mengambil daftar kesaksian/verifikasi saksi batas adat (`Ulasan`) yang berelasi 1:N dengan wilayah ulayat `id` tertentu (diurutkan dari yang terbaru). | `200 OK`, `400 Bad Request` (`id` bukan bilangan bulat positif), `404 Not Found` (wilayah ulayat induk tidak ditemukan), `405 Method Not Allowed`, `500 Internal Server Error` |

*(Catatan: Untuk metode HTTP yang tidak diekspor pada suatu path—misalnya `PUT /api/v1/item/1`—Next.js Route Handler otomatis menjawab `405 Method Not Allowed`, dan untuk `OPTIONS` Next.js otomatis menjawab `204 No Content` disertai header `Allow`.)*

---

## 2. Arti *Aman* (*Safe*) dan *Idempoten* (*Idempotent*) serta Sifat `GET`, `POST`, `PATCH`, dan `DELETE`

### A. Definisi Berdasarkan RFC 9110 Bagian 9.2
1. **Aman (*Safe*):**  
   Sebuah metode HTTP disebut **aman** apabila operasi yang diminta bersifat **baca-saja (*read-only*)** dan **tidak boleh mengubah keadaan (*state*) resource di server**. Karena tidak menimbulkan perubahan data, metode aman boleh diulang secara otomatis oleh peramban, *crawler*, atau *proxy*, dan hasilnya aman untuk di-*cache*.
2. **Idempoten (*Idempotent*):**  
   Sebuah metode HTTP disebut **idempoten** apabila mengirim permintaan identik **satu kali maupun berkali-kali menghasilkan keadaan akhir (*state*) yang sama di server** (tidak menimbulkan duplikasi efek samping). Perlu diperhatikan bahwa **respons HTTP-nya boleh berbeda** antar-pengulangan (misalnya `DELETE` pertama mengembalikan `204 No Content` dan `DELETE` kedua mengembalikan `404 Not Found`), namun keadaan akhir basis data tetap sama: resource tersebut tidak ada.

### B. Tabel Sifat Metode HTTP dan Contoh pada Produk **TanahKita**

| Metode | Aman (*Safe*)? | Idempoten (*Idempotent*)? | Alasan & Contoh Konkret pada Produk **TanahKita** |
| :---: | :---: | :---: | :--- |
| **`GET`** | **Ya** | **Ya** | Hanya membaca data tanpa mengubah isi tabel PostgreSQL. Contoh: memanggil `GET /api/v1/item?kategori=HutanAdat&halaman=1&batas=10` atau `GET /api/v1/item/1/ulasan` sebanyak 1 kali atau 10 kali berturut-turut tidak mengubah baris `Item`/`Ulasan` mana pun di basis data. |
| **`POST`** | **Tidak** | **Tidak** | Menciptakan resource baru sehingga mengubah keadaan server, dan mengulang permintaan yang sama (misal saat jaringan *timeout* lalu klien mengirim ulang) berpotensi menciptakan **duplikasi data** baru. Contoh: mengirim `POST /api/v1/item` dengan payload wilayah ulayat baru dua kali dapat membuat dua entri arsip (atau memicu konflik unik jika judul sama). |
| **`PATCH`** | **Tidak** | **Tidak dijamin** | Mengubah sebagian field pada resource di server (sehingga tidak aman). Sifat idempotennya **tidak dijamin oleh RFC 9110** karena bergantung pada jenis perubahan: jika payload menetapkan nilai tetap seperti `PATCH /api/v1/item/1` dengan `{"tersedia": false}` hasilnya memang sama saat diulang, tetapi jika berupa operasi relatif (misalnya menambah luas lahan `+5` hektar atau menambah lampiran ke array), pengulangan permintaan akan terus mengubah keadaan server. |
| **`DELETE`** | **Tidak** | **Ya** | Menghapus data di server (sehingga tidak aman), tetapi **idempoten**: memanggil `DELETE /api/v1/item/9` pertama kali menghapus arsip `Item #9` dan menjawab `204 No Content`; bila permintaan `DELETE /api/v1/item/9` yang sama diulang kedua kali, server menjawab `404 Not Found`, namun **keadaan akhir server identik**—yaitu `Item #9` sudah tidak ada di tabel `Item`. |

---

## 3. Penentuan Kode Status HTTP untuk Empat Kasus dan Alasannya

| No | Kasus Pengujian | Kode Status HTTP | Alasan Teknis (Mengacu RFC 9110, RFC 9457, & Aturan Modul 8) |
| :---: | :--- | :---: | :--- |
| **1** | **Body bukan JSON** (misalnya string terpotong `{"judul":` atau teks biasa) | **`400 Bad Request`** | Kesalahan terjadi pada **sintaks/bentuk permintaan** (*malformed request syntax*) sehingga server gagal mengurai payload saat memanggil `await request.json()` (`SyntaxError`). Helper `bacaJson()` menangkap kegagalan parsing tersebut dan langsung mengembalikan `400 Bad Request` (`application/problem+json`) sebelum masuk ke tahap validasi skema Zod. |
| **2** | **JSON valid dengan kategori yang tidak dikenal** (misalnya `{"judul":"Hutan Iwaka","kategori":"transportasi","deskripsi":"..."}`) | **`422 Unprocessable Content`** | Sintaks JSON sudah valid dan berhasil diurai oleh server (bukan `400`), tetapi **isi/semantik datanya melanggar aturan validasi domain** yang didefinisikan pada skema Zod (`z.enum(["HutanAdat", "ZonaSagu", "PesisirUlayat", "LembahKeramat", "PerkebunanKomunal"])`). Sesuai RFC 9110 & RFC 9457, kegagalan aturan validasi field pada JSON yang sah dijawab `422` beserta rincian `errors` dari `z.flattenError()`. |
| **3** | **`id` yang tidak ada** (misalnya `GET /api/v1/item/99999` atau `PATCH`/`DELETE` pada ID yang telah terhapus) | **`404 Not Found`** | Format parameter path `id` sudah sah sebagai bilangan bulat positif (lolos `bacaId()`), namun saat dicari di PostgreSQL (`findUnique` mengembalikan `null`, atau `update`/`delete` melempar galat Prisma **`P2025`**), baris `Item` yang diminta tidak ditemukan di server. |
| **4** | **Menghapus item yang masih memiliki data relasi** (misalnya `DELETE /api/v1/item/1` yang masih memiliki 1 baris `Ulasan`) | **`409 Conflict`** | Permintaan valid secara sintaks dan resource-nya ada, tetapi **bertentangan dengan keadaan data saat ini** (*state conflict*). Pada skema **TanahKita**, relasi `Ulasan.itemId -> Item.id` memakai `onDelete: Restrict` agar bukti kesaksian saksi batas adat tidak hilang diam-diam. Dengan memeriksa `prisma.ulasan.count({ where: { itemId: id } }) > 0` dan mengembalikan `409 Conflict`, klien memperoleh informasi penyebab konflik secara jelas dan server terhindar dari galat `500` akibat pelanggaran *foreign key* Prisma (`P2003`). |

---

## 4. Contoh Respons Galat *Problem Details* (RFC 9457) untuk Kasus `404` pada Produk TanahKita

Misalkan klien mengirim permintaan `GET /api/v1/item/99999` (wilayah ulayat dengan `id = 99999` tidak ada di tabel `Item` PostgreSQL). Berikut adalah respons HTTP lengkap beserta header `Content-Type` sesuai **RFC 9457**:

```http
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "Item 99999 tidak ditemukan.",
  "instance": "/api/v1/item/99999"
}
```

**Penjelasan kesesuaian RFC 9457:**
* Header **`Content-Type: application/problem+json`** wajib dikirim secara eksplisit agar klien mengenali bahwa payload berformat standar *Problem Details*.
* Ketika anggota `"type"` bernilai `"about:blank"`, anggota `"title"` disamakan persis dengan frasa status HTTP-nya (`"Not Found"`), `"status"` memuat angka kode status (`404`), `"detail"` menjelaskan masalah spesifik secara ramah manusia tanpa membocorkan *stack trace* atau kueri SQL Prisma, dan `"instance"` menandai URI spesifik permintaan yang mengalami galat.

---

## 5. Mengapa `params` pada Route Handler Next.js 16 Harus Di-`await` dan Wajib Divalidasi Sebelum Kueri Prisma

### A. Mengapa `params` Harus Di-`await`?
1. **Perubahan Arsitektur Dynamic Request APIs (Next.js 15 & 16):**  
   Pada Next.js 15 ke atas (termasuk Next.js 16), argumen konteks kedua pada Route Handler dinamis (seperti `app/api/v1/item/[id]/route.ts`) tidak lagi menerima objek sinkron `{ params: { id: string } }`, melainkan objek berisi **`Promise`**: `{ params: Promise<{ id: string }> }`. Perubahan ini dirancang oleh Next.js agar *runtime* server dapat menunda resolusi data dinamis berbasis permintaan secara asinkron dan mendukung optimasi *rendering*/*streaming*.
2. **Dampak Bila Tidak Di-`await`:**  
   Jika kode langsung menulis `params.id` tanpa `await`, pemeriksa tipe TypeScript (`tsc --noEmit`) akan menolak dengan galat properti `id` tidak ada pada `Promise`, dan pada saat *runtime* ekspresi tersebut bernilai `undefined` (yang saat dikonversi dengan `Number(undefined)` menghasilkan `NaN`). Oleh sebab itu, nilai segmen path harus dibaca dengan `const { id } = await params;` atau melalui helper asinkron `bacaId(params)`.

### B. Mengapa Nilainya Perlu Divalidasi Sebelum Dipakai pada Kueri Prisma?
1. **Nilai dari URL Selalu Bertipe `string` dan Berasal dari Klien (*Untrusted Input*):**  
   Setiap parameter path pada URL selalu diterima sebagai `string` mentah. Klien atau penyerang dapat mengirim alamat apa pun seperti `/api/v1/item/abc`, `/api/v1/item/0`, `/api/v1/item/-5`, `/api/v1/item/1.5`, atau string super panjang.
2. **Mencegah Galat `500` (`PrismaClientValidationError`) dan Beban Kueri Tak Perlu:**  
   Kolom `Item.id` pada PostgreSQL / Prisma bertipe `Int` (*primary key auto-increment* positif). Jika nilai `NaN`, bilangan desimal (`1.5`), atau nilai di luar batas integer langsung diteruskan ke `prisma.item.findUnique({ where: { id } })`, Prisma akan melempar `PrismaClientValidationError` yang menghasilkan respons **`500 Internal Server Error`** alih-alih **`400 Bad Request`**.
3. **Prinsip *Fail-Fast* dengan Zod (`skemaId`):**  
   Dengan memvalidasi `(await params).id` memakai `skemaId = z.coerce.number().int().positive()` di helper `bacaId(params)` sebelum menyentuh Prisma, setiap nilai tidak sah langsung ditolak di lapisan HTTP dengan status **`400 Bad Request`** (`application/problem+json`) tanpa membebani koneksi basis data PostgreSQL.

---

### Catatan Pemanfaatan AI
* **Alat yang digunakan:** Antigravity AI Coding Assistant (Google DeepMind).
* **Bagian yang dibantu:** Penyusunan kerapian struktur tabel 6 endpoint RESTful API berdasarkan entitas `Item` dan `Ulasan` produk TanahKita (Nomor 1), pemetaan referensi RFC 9110 Bagian 9.2 untuk sifat aman dan idempoten (Nomor 2), perumusan perbandingan kasus kode status `400`/`422`/`404`/`409` (Nomor 3), format blok HTTP *Problem Details* RFC 9457 (Nomor 4), serta perapian penjelasan teknis `Promise` pada `params` Next.js 16 dan validasi `skemaId` (Nomor 5). Seluruh nama entitas, enum kategori (`HutanAdat`, `ZonaSagu`, `PesisirUlayat`, `LembahKeramat`, `PerkebunanKomunal`), aturan `onDelete: Restrict`, dan pemetaan ID kebutuhan (`docs/kebutuhan.md`) diverifikasi langsung terhadap `prisma/schema.prisma` dan Modul 8 Praktikum PAW 2026.
