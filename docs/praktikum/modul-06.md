# Dokumen Teknis Modul 6 — PostgreSQL dan Prisma ORM

* **Nama/NIM**    : Yosafat Jacobus / 105224016
* **Repositori**  : [https://github.com/yosafatjac/tanahkita](https://github.com/yosafatjac/tanahkita)
* **Branch kerja**: `praktikum/modul-06` (digabungkan ke `main`)
* **Produk**      : **TanahKita** — Sistem Pencatatan dan Pembuktian Penguasaan Tanah Adat Papua (Kabupaten Mimika)

---

## 1. Rancangan Data

Pada produk **TanahKita**, penyimpanan arsip wilayah tanah adat dikelola secara persisten menggunakan basis data relasional **PostgreSQL 18 (`18.6`)** dan **Prisma ORM 7 (`prisma@7.10.1`, `@prisma/client@7.10.1`, `@prisma/adapter-pg@7.10.1`)**. Struktur data dirancang dengan relasi **satu-ke-banyak (1:N)** antara dua entitas utama:
1. **`Item` (Arsip Wilayah Ulayat Adat Mimika)** sebagai **entitas induk (1)** yang menyimpan catatan hamparan tanah ulayat marga di Kabupaten Mimika.
2. **`Ulasan` (Kesaksian & Verifikasi Saksi Batas Adat)** sebagai **entitas anak (N)** yang menyimpan catatan verifikasi, kesaksian batas alam (sungai, gunung, pohon keramat), dan skor keabsahan dari tetua adat atau saksi marga tetangga terhadap suatu wilayah ulayat. Satu wilayah ulayat (`Item`) dapat memiliki banyak kesaksian batas (`Ulasan`), sehingga kolom *foreign key* `itemId` ditempatkan pada tabel `Ulasan`.

### A. Diagram Dua Entitas, Relasi, Kunci, dan Constraint Unik

![Diagram Relasi Dua Entitas (1:N) TanahKita](./screenshoot/modul-06/diagram_erd_modul_06.png)

```mermaid
erDiagram
    Item ||--o{ Ulasan : "memiliki kesaksian (1:N, onDelete: Restrict)"
    Item {
        Int id PK "SERIAL (@id @default(autoincrement())) -> Item_pkey"
        String judul UK "TEXT (@unique) -> Item_judul_key"
        Kategori kategori "ENUM (HutanAdat, ZonaSagu, PesisirUlayat, LembahKeramat, PerkebunanKomunal)"
        String distrik "TEXT NOT NULL (Distrik di Kabupaten Mimika)"
        Float luasHektar "DOUBLE PRECISION NOT NULL (Luas wilayah Ha)"
        String deskripsi "TEXT NOT NULL (Deskripsi & patok batas alam)"
        Boolean tersedia "BOOLEAN NOT NULL DEFAULT true (@default(true))"
        String gambar "TEXT NULL (String? / Opsional)"
        DateTime dibuatPada "TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP"
    }
    Ulasan {
        Int id PK "SERIAL (@id @default(autoincrement())) -> Ulasan_pkey"
        Int itemId FK "INTEGER NOT NULL -> Item.id (ON DELETE RESTRICT)"
        String nama "TEXT NOT NULL (Bagian dari @@unique([itemId, nama]))"
        Int nilai "INTEGER NOT NULL (Skor verifikasi 1 s.d. 5)"
        String komentar "TEXT NOT NULL (Catatan batas alam & kesaksian)"
        DateTime dibuatPada "TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP"
    }
```

#### Tabel Spesifikasi Atribut, Kunci, dan Constraint di PostgreSQL 18

| Entitas | Nama Kolom | Tipe Prisma / PostgreSQL | Atribut Skema Prisma | Hasil Constraint di PostgreSQL 18 |
| :--- | :--- | :--- | :--- | :--- |
| **`Item`** *(Induk - 1)* | `id` | `Int` / `SERIAL` | `@id @default(autoincrement())` | Primary Key `Item_pkey` |
| **`Item`** | `judul` | `String` / `TEXT` | `@unique` | Indeks unik `Item_judul_key` |
| **`Item`** | `kategori` | `Kategori` / `ENUM` | Wajib (`NOT NULL`) | Tipe Enum `"Kategori"` |
| **`Item`** | `distrik` | `String` / `TEXT` | Wajib (`NOT NULL`) | `TEXT NOT NULL` |
| **`Item`** | `luasHektar` | `Float` / `DOUBLE PRECISION` | Wajib (`NOT NULL`) | `DOUBLE PRECISION NOT NULL` |
| **`Item`** | `deskripsi` | `String` / `TEXT` | Wajib (`NOT NULL`) | `TEXT NOT NULL` |
| **`Item`** | `tersedia` | `Boolean` / `BOOLEAN` | `@default(true)` | `BOOLEAN NOT NULL DEFAULT true` |
| **`Item`** | `gambar` | `String?` / `TEXT NULL` | Opsional (`Nullable`) | Kolom tanpa `NOT NULL`, bernilai `null` bila kosong |
| **`Item`** | `dibuatPada` | `DateTime` / `TIMESTAMP(3)` | `@default(now())` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP` |
| **`Ulasan`** *(Anak - N)* | `id` | `Int` / `SERIAL` | `@id @default(autoincrement())` | Primary Key `Ulasan_pkey` |
| **`Ulasan`** | `itemId` | `Int` / `INTEGER` | `@relation(fields: [itemId], references: [id], onDelete: Restrict)` | Foreign Key `Ulasan_itemId_fkey` (`ON DELETE RESTRICT`) |
| **`Ulasan`** | `nama` | `String` / `TEXT` | Bagian dari unik gabungan | Bagian dari indeks `Ulasan_itemId_nama_key` |
| **`Ulasan`** | `nilai` | `Int` / `INTEGER` | Wajib (`1`–`5`) | `INTEGER NOT NULL` |
| **`Ulasan`** | `komentar` | `String` / `TEXT` | Wajib (`NOT NULL`) | `TEXT NOT NULL` |
| **`Ulasan`** | `dibuatPada` | `DateTime` / `TIMESTAMP(3)` | `@default(now())` | `TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP` |
| **`Ulasan`** | `[itemId, nama]` | Gabungan `(Int, String)` | `@@unique([itemId, nama])` | Indeks unik gabungan `Ulasan_itemId_nama_key` |

### B. Alasan Pemilihan Aturan `onDelete` dan Constraint Unik terhadap Nilai Data Produk

1. **Alasan Pemilihan `onDelete: Restrict` (`ON DELETE RESTRICT`):**
   * **Perlindungan Bukti Historis Kesaksian Adat:** Pada domain **TanahKita**, setiap baris di tabel `Ulasan` merepresentasikan catatan kesaksian tetua adat atau pengakuan batas dari marga tetangga terhadap suatu hamparan tanah ulayat (`Item`). Data kesaksian ini memiliki nilai pembuktian sosial dan hukum adat yang krusial untuk mencegah sengketa lahan di Kabupaten Mimika.
   * **Mengapa Bukan `Cascade`:** Apabila menggunakan `Cascade`, penghapusan satu baris wilayah ulayat (`Item`) akan secara otomatis dan diam-diam memusnahkan seluruh riwayat kesaksian adat (`Ulasan`) yang terhubung dengannya sebagai efek samping tersembunyi. Jika terjadi salah klik atau bug pada fitur hapus, seluruh rekaman kesaksian marga akan hilang tanpa jejak.
   * **Mengapa Bukan `SetNull`:** Apabila menggunakan `SetNull`, kolom `itemId` pada `Ulasan` harus dibuat opsional (`Int?`) dan akan dikosongkan menjadi `NULL` saat wilayah ulayat dihapus. Hal ini menyisakan kesaksian yatim (*orphan records*) yang tidak lagi diketahui merujuk pada hamparan tanah yang mana, sehingga kehilangan nilai pembuktiannya.
   * **Keunggulan `Restrict` dengan Transaksi Eksplisit:** Dengan `onDelete: Restrict`, PostgreSQL bertindak sebagai pengaman terakhir yang **menolak penghapusan wilayah ulayat selama masih ada kesaksian adat yang merujuk kepadanya**. Penghapusan wilayah ulayat beserta kesaksiannya hanya dapat dilakukan secara sadar, terencana, dan atomik melalui transaksi eksplisit `prisma.$transaction([prisma.ulasan.deleteMany(...), prisma.item.delete(...)])`.
2. **Alasan Pemilihan Constraint Unik (`@unique` dan `@@unique([itemId, nama])`):**
   * **`@unique` pada `Item.judul` (`Item_judul_key`):** Mencegah satu nama wilayah ulayat adat (misalnya *"Kawasan Ulayat Lembah Nemangkawi"*) didaftarkan ganda oleh pihak berbeda yang dapat memicu tumpang tindih klaim di dalam arsip.
   * **`@@unique([itemId, nama])` pada `Ulasan` (`Ulasan_itemId_nama_key`):** Memastikan satu nama saksi/marga hanya dapat memberikan satu kesaksian resmi pada wilayah ulayat yang sama (mencegah manipulasi skor keabsahan melalui pengiriman ulasan berulang pada satu tanah), namun saksi tersebut tetap diizinkan memberikan kesaksian pada wilayah ulayat (`itemId`) yang lain.

---

## 2. Skema dan Migrasi

### A. Isi `prisma/schema.prisma`

Berkas `prisma/schema.prisma` menggunakan generator Prisma 7 (`provider = "prisma-client"`) dengan lokasi keluaran wajib di `../generated/prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum Kategori {
  HutanAdat
  ZonaSagu
  PesisirUlayat
  LembahKeramat
  PerkebunanKomunal
}

model Item {
  id         Int       @id @default(autoincrement())
  judul      String    @unique
  kategori   Kategori
  distrik    String
  luasHektar Float
  deskripsi  String
  tersedia   Boolean   @default(true)
  gambar     String?
  dibuatPada DateTime  @default(now())
  ulasan     Ulasan[]
}

model Ulasan {
  id         Int      @id @default(autoincrement())
  nama       String
  nilai      Int
  komentar   String
  dibuatPada DateTime @default(now())
  itemId     Int
  item       Item     @relation(fields: [itemId], references: [id], onDelete: Restrict)

  @@unique([itemId, nama])
}
```

### B. Daftar Folder `prisma/migrations` dan Potongan `migration.sql`

Eksekusi `npx prisma migrate dev --name init` dan `npx prisma generate` menghasilkan pohon direktori migrasi berikut yang ikut di-*commit* ke repositori:

```text
prisma/
├── data-awal.ts
├── migrations/
│   ├── 20261030082804_init/
│   │   └── migration.sql
│   └── migration_lock.toml
├── schema.prisma
└── seed.ts
```

#### Keluaran Perintah Migrasi dan Generate:
```text
$ npx prisma migrate dev --name init
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma/schema.prisma.
Datasource "db": PostgreSQL database "produk", schema "public" at "localhost:5432"

Applying migration `20261030082804_init`
The following migration(s) have been created and applied from new schema changes:
migrations/
  └─ 20261030082804_init/
    └─ migration.sql
Your database is now in sync with your schema.

$ npx prisma generate
✔ Generated Prisma Client (7.10.1) to ./generated/prisma in 42ms
```

#### Isi Berkas `prisma/migrations/20261030082804_init/migration.sql`:
```sql
-- CreateEnum
CREATE TYPE "Kategori" AS ENUM ('HutanAdat', 'ZonaSagu', 'PesisirUlayat', 'LembahKeramat', 'PerkebunanKomunal');

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "kategori" "Kategori" NOT NULL,
    "distrik" TEXT NOT NULL,
    "luasHektar" DOUBLE PRECISION NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tersedia" BOOLEAN NOT NULL DEFAULT true,
    "gambar" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ulasan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nilai" INTEGER NOT NULL,
    "komentar" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "Ulasan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_judul_key" ON "Item"("judul");

-- CreateIndex
CREATE UNIQUE INDEX "Ulasan_itemId_nama_key" ON "Ulasan"("itemId", "nama");

-- AddForeignKey
ALTER TABLE "Ulasan" ADD CONSTRAINT "Ulasan_itemId_fkey"
    FOREIGN KEY ("itemId") REFERENCES "Item"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
```

### C. Hasil Pemeriksaan `\d` pada `psql` (Indeks dan Foreign Key)

Pemeriksaan langsung struktur tabel `Item` dan `Ulasan` di PostgreSQL 18 menggunakan perintah `psql`:

```text
$ psql "postgresql://praktikum:lokal-saja-123@localhost:5432/produk" -c '\d "Item"' -c '\d "Ulasan"'
                                            Table "public.Item"
   Column   |              Type              | Collation | Nullable |             Default              
------------+--------------------------------+-----------+----------+----------------------------------
 id         | integer                        |           | not null | nextval('"Item_id_seq"'::regclass)
 judul      | text                           |           | not null | 
 kategori   | "Kategori"                     |           | not null | 
 distrik    | text                           |           | not null | 
 luasHektar | double precision               |           | not null | 
 deskripsi  | text                           |           | not null | 
 tersedia   | boolean                        |           | not null | true
 gambar     | text                           |           |          | 
 dibuatPada | timestamp(3) without time zone |           | not null | CURRENT_TIMESTAMP
Indexes:
    "Item_pkey" PRIMARY KEY, btree (id)
    "Item_judul_key" UNIQUE, btree (judul)
Referenced by:
    TABLE ""Ulasan"" CONSTRAINT "Ulasan_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"(id) ON UPDATE CASCADE ON DELETE RESTRICT

                                           Table "public.Ulasan"
   Column   |              Type              | Collation | Nullable |               Default                
------------+--------------------------------+-----------+----------+--------------------------------------
 id         | integer                        |           | not null | nextval('"Ulasan_id_seq"'::regclass)
 nama       | text                           |           | not null | 
 nilai      | integer                        |           | not null | 
 komentar   | text                           |           | not null | 
 dibuatPada | timestamp(3) without time zone |           | not null | CURRENT_TIMESTAMP
 itemId     | integer                        |           | not null | 
Indexes:
    "Ulasan_pkey" PRIMARY KEY, btree (id)
    "Ulasan_itemId_nama_key" UNIQUE, btree ("itemId", nama)
Foreign-key constraints:
    "Ulasan_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"(id) ON UPDATE CASCADE ON DELETE RESTRICT
```

![Tangkapan Layar Hasil \d pada psql Menampilkan Indeks Unik dan Foreign Key ON DELETE RESTRICT](./screenshoot/modul-06/01_psql_describe_ulasan.png)

---

## 3. Seed dan Prisma Client

### A. Konfigurasi Prisma 7 (`prisma.config.ts`) dan Skrip `prisma/seed.ts`

Pada Prisma 7, konfigurasi URL basis data dan perintah seed diatur pada `prisma.config.ts` di akar proyek dengan mengimpor `"dotenv/config"` secara eksplisit:

```ts
// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Skrip `prisma/seed.ts` menyisipkan 6 wilayah ulayat adat Mimika dari `prisma/data-awal.ts` beserta 6 kesaksian awal menggunakan metode **`upsert`**:

```ts
// prisma/seed.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { dataAwal } from "./data-awal";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  for (const data of dataAwal) {
    const item = await prisma.item.upsert({
      where: { judul: data.judul },
      update: {},
      create: data,
    });

    await prisma.ulasan.upsert({
      where: { itemId_nama: { itemId: item.id, nama: "Tetua Adat Mimika" } },
      update: {},
      create: {
        itemId: item.id,
        nama: "Tetua Adat Mimika",
        nilai: 5,
        komentar: "Batas tanah ulayat marga telah diverifikasi dan disepakati bersama tetua marga tetangga.",
      },
    });
  }

  const jItem = await prisma.item.count();
  const jUlasan = await prisma.ulasan.count();
  console.log(`Seed selesai: ${jItem} item, ${jUlasan} ulasan`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
```

### B. Keluaran `npx prisma db seed` yang Dijalankan Dua Kali & Alasan Penggunaan `upsert`

```text
$ npx prisma db seed
Loaded Prisma config from prisma.config.ts.
Running seed command `tsx prisma/seed.ts` ...
Seed selesai: 6 item, 6 ulasan
🌱  The seed command has been executed.

$ npx prisma db seed
Loaded Prisma config from prisma.config.ts.
Running seed command `tsx prisma/seed.ts` ...
Seed selesai: 6 item, 6 ulasan
🌱  The seed command has been executed.
```

![Tangkapan Layar Keluaran npx prisma db seed Dua Kali Berturut-turut](./screenshoot/modul-06/02_migrasi_dan_seed_dua_kali.png)

* **Mengapa `upsert` Dapat Dijalankan Ulang (*Idempotent*) Sedangkan `create` Biasa Tidak:**  
  Tabel `Item` memiliki constraint unik `@unique` pada `judul` (`Item_judul_key`) dan tabel `Ulasan` memiliki constraint unik gabungan `@@unique([itemId, nama])` (`Ulasan_itemId_nama_key`). Apabila `seed.ts` memakai `prisma.item.create()` biasa, eksekusi kedua akan mencoba menyisipkan judul wilayah ulayat yang sudah ada sehingga ditolak oleh PostgreSQL dengan galat **`P2002` (*Unique constraint failed*)**. Sebaliknya, `upsert` mencari baris berdasarkan kunci unik (`where: { judul }` dan `where: { itemId_nama }`): bila belum ada maka menjalankan `create`, dan bila sudah ada maka menjalankan `update: {}` (tanpa mengubah atau menggandakan data), sehingga jumlah data tetap konsisten **6 item dan 6 ulasan**.

### C. Alasan `prisma/seed.ts` Tidak Mengimpor `src/lib/prisma.ts`

Berkas `src/lib/prisma.ts` dirancang khusus untuk dijalankan di dalam lingkungan server Next.js:

```ts
// src/lib/prisma.ts
import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Skrip `prisma/seed.ts` **tidak mengimpor `src/lib/prisma.ts`** karena tiga alasan teknis:
1. **Penolakan Paket `server-only` di Luar Next.js:** `src/lib/prisma.ts` memuat baris `import "server-only"` pada baris pertama untuk mencegah modul tersebut terimpor ke Client Component Next.js. Karena `npx prisma db seed` dieksekusi sebagai proses Node.js mandiri di luar Next.js menggunakan `tsx prisma/seed.ts` (tanpa kondisi bundler `--conditions react-server`), mengimpor `src/lib/prisma.ts` di dalam `seed.ts` akan langsung gagal dengan galat `Error: This module cannot be imported from a Client Component module`.
2. **Pemuatan Variabel Lingkungan (`.env`):** Next.js memuat berkas `.env` secara otomatis saat server aplikasi berjalan, sehingga `src/lib/prisma.ts` tidak mengimpor `dotenv`. Sebaliknya, proses CLI `tsx prisma/seed.ts` berjalan di luar Next.js sehingga wajib memuat `import "dotenv/config"` sendiri sebelum membaca `process.env.DATABASE_URL`.
3. **Siklus Hidup Koneksi (*Connection Lifecycle*):** `src/lib/prisma.ts` menyimpan instans di `globalThis` agar pool koneksi bertahan lintas *hot-reload* selama server pengembangan menyala, sedangkan `seed.ts` adalah skrip satu kali jalan (*one-off script*) yang membuat koneksi sendiri dan wajib menutupnya secara eksplisit melalui `prisma.$disconnect()` di blok `.finally()`.

---

## 4. Operasi CRUD

### A. Tabel Operasi CRUD, Metode Prisma Client, dan Galat yang Ditangani

Seluruh pembacaan data dilakukan langsung di *async Server Component* melalui `src/lib/data.ts` (menggunakan `select` bertingkat pada `ambilItem(id)` untuk memuat item beserta ulasannya dalam satu *query* dan mencegah masalah **N+1 query**), sedangkan seluruh perubahan data dilakukan melalui *Server Action* dengan validasi **Zod 4**:

| Entitas | Operasi | Aksi atau Halaman | Metode Prisma Client | Galat yang Ditangani | Pesan Aman ke Pengguna |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **`Item`** *(Wilayah Ulayat)* | **Create** | `simpanUlayatAction` & `tambahItem` pada `src/app/katalog/actions.ts` (Halaman `/katalog/tambah`) | `prisma.item.create({ data })` | • Validasi Zod 4 gagal<br>• **`P2002`** (*Unique constraint failed* pada `judul`) | • Pesan galat per kolom (`fieldErrors`)<br>• `"Judul item sudah terdaftar"` / `"Nama wilayah ulayat ini sudah tercatat di dalam arsip."` |
| **`Item`** *(Wilayah Ulayat)* | **Read (Daftar)** | `ambilDaftarItem()` pada `src/lib/data.ts` (Halaman `/katalog/page.tsx` dengan `await connection()`) | `prisma.item.findMany({ select, orderBy })` | — | Menampilkan daftar kartu wilayah ulayat dari PostgreSQL |
| **`Item` + `Ulasan`** | **Read (Detail)** | `ambilItem(id)` pada `src/lib/data.ts` (Halaman `/katalog/[id]/page.tsx`) | `prisma.item.findUnique({ where: { id }, include: { ulasan } })` | • `!Number.isInteger(id) \|\| id <= 0`<br>• Hasil query `null` (ID tidak ada) | Memanggil `notFound()` ➔ Menampilkan **Halaman 404 Not Found** rapi |
| **`Item`** *(Wilayah Ulayat)* | **Update** | `ubahItem(id, ...)` pada `src/app/katalog/actions.ts` (`FormUbahItem` di `/katalog/[id]`) | `prisma.item.update({ where: { id }, data })` | • **`P2002`** (judul bentrok)<br>• **`P2025`** (*Record to update not found*) | • `"Judul item sudah terdaftar"`<br>• `"Item tidak ditemukan atau sudah dihapus."` |
| **`Item` + `Ulasan`** | **Delete** | `hapusItem(id)` pada `src/app/katalog/actions.ts` (Tombol hapus di `/katalog/[id]`) | `prisma.$transaction([prisma.ulasan.deleteMany({ where: { itemId: id } }), prisma.item.delete({ where: { id } })])` | • **`P2003`** bila tanpa transaksi (`ON DELETE RESTRICT`)<br>• **`P2025`** bila ID tidak ditemukan | Menghapus ulasan dan item secara atomik, `revalidatePath("/katalog")`, lalu `redirect("/katalog")` |
| **`Ulasan`** *(Kesaksian Adat)* | **Create Anak** | `tambahUlasan(itemId, ...)` pada `src/app/katalog/ulasan-actions.ts` (`FormUlasan` di `/katalog/[id]`) | `prisma.ulasan.create({ data: { ...hasil.data, itemId } })` | • Validasi Zod `skemaUlasan`<br>• **`P2002`** (`@@unique([itemId, nama])`)<br>• **`P2003`** (*Foreign key constraint failed* pada `itemId`) | • Pesan galat per kolom (`nilai` 1–5, dll.)<br>• `"Nama ini sudah mengulas item ini"`<br>• `"Item wilayah ulayat tidak ditemukan."` |
| **`Ulasan`** *(Kesaksian Adat)* | **Delete Anak** | `hapusUlasan(id, itemId)` pada `src/app/katalog/ulasan-actions.ts` (Tombol hapus ulasan di `/katalog/[id]`) | `prisma.ulasan.deleteMany({ where: { id, itemId } })` | `deleteMany` mengembalikan `{ count }` tanpa lempar `P2025` bila sudah terhapus | Memperbarui daftar ulasan pada `/katalog/[id]` melalui `revalidatePath` |

*(Kode galat di luar yang diharapkan dilempar ulang dengan `throw e` agar ditangkap oleh batas galat `src/app/katalog/error.tsx` dan tidak pernah membocorkan nama tabel/constraint mentah basis data ke pengguna).*

### B. Tangkapan Layar Pesan Galat `P2002` dan `P2025` di Formulir

1. **Tangkapan Layar Penanganan Galat `P2002` (Judul Ulayat Ganda & Nama Saksi Ulasan Ganda):**  
   Saat pengguna mencoba mendaftarkan wilayah ulayat dengan `judul` yang sudah tercatat di PostgreSQL (`"Kawasan Ulayat Lembah Nemangkawi"`) atau saat saksi yang sama mencoba mengirim ulasan kedua pada item yang sama, Server Action menangkap `PrismaClientKnownRequestError` berkode **`P2002`** dan menampilkan pesan ramah langsung pada formulir:

![Tangkapan Layar Pesan Galat P2002 pada Formulir Antarmuka](./screenshoot/modul-06/03_galat_p2002_judul_ganda.png)

2. **Tangkapan Layar Penanganan Galat `P2025` (Mengubah Item yang Sudah Dihapus):**  
   Saat halaman detail dibuka pada dua tab, lalu item dihapus pada tab kedua (atau melalui Prisma Studio), dan pengguna menekan tombol **Simpan Pembaruan (Update)** pada `FormUbahItem` di tab pertama, Server Action menangkap `PrismaClientKnownRequestError` berkode **`P2025`** dan menampilkan pesan aman *"Item tidak ditemukan atau sudah dihapus."* tanpa membuat aplikasi crash:

![Tangkapan Layar Pesan Galat P2025 Saat Mengubah Item yang Sudah Dihapus](./screenshoot/modul-06/04_galat_p2025_ubah_item_terhapus.png)

---

## 5. Transaksi dan Rollback

### A. Galat Saat Menghapus Tanpa Transaksi (`ON DELETE RESTRICT`)

Sesuai langkah praktikum Bagian 5 nomor 1, dilakukan pengujian menghapus `Item` yang masih memiliki `Ulasan` secara langsung **tanpa transaksi** (`await prisma.item.delete({ where: { id } })`). Karena relasi pada `Ulasan.itemId` menggunakan aturan **`onDelete: Restrict`** (`ON DELETE RESTRICT`), PostgreSQL menolak penghapusan baris induk tersebut dan Prisma melempar `PrismaClientKnownRequestError` berkode **`P2003`**:

```text
PrismaClientKnownRequestError: 
Invalid `prisma.item.delete()` invocation:
Foreign key constraint violated on the constraint: `Ulasan_itemId_fkey`
  code: 'P2003',
  meta: {
    modelName: 'Item',
    constraint: 'Ulasan_itemId_fkey'
  }
```

Galat tak terduga tersebut ditangkap oleh komponen batas galat `src/app/katalog/error.tsx` di antarmuka web:

![Tangkapan Layar Galat Saat Menghapus Item Tanpa Transaksi (Ditolak oleh ON DELETE RESTRICT)](./screenshoot/modul-06/05_galat_restrict_tanpa_transaksi.png)

### B. Alasan Pemilihan Bentuk Transaksi Larik (`prisma.$transaction([...])`)

Prisma menyediakan dua bentuk transaksi:
1. **Bentuk larik (*batch/sequential array*):** `prisma.$transaction([q1, q2])`
2. **Bentuk interaktif (*interactive callback*):** `prisma.$transaction(async (tx) => { ... })`

Pada aksi `hapusItem(id)` di produk **TanahKita**, dipilih **bentuk transaksi larik**:

```ts
export async function hapusItem(id: number) {
  await prisma.$transaction([
    prisma.ulasan.deleteMany({ where: { itemId: id } }),
    prisma.item.delete({ where: { id } }),
  ]);
  revalidatePath("/katalog");
  redirect("/katalog");
}
```

* **Alasan Teknis Pemilihan Bentuk Larik:**  
  Kedua operasi penghapusan di atas (`deleteMany` pada `Ulasan` dan `delete` pada `Item`) hanya membutuhkan parameter `id` wilayah ulayat yang sudah diketahui sejak awal; perintah kedua **tidak bergantung pada nilai kembalian (*return value*) atau percabangan logika dari perintah pertama**. Bentuk larik lebih ringkas, dieksekusi secara berurutan di dalam satu blok transaksi SQL (`BEGIN ... COMMIT / ROLLBACK`) dengan waktu penguncian baris (*row lock duration*) yang paling singkat di PostgreSQL.

### C. Bukti Rollback Sebelum dan Sesudah Pengujian

Untuk membuktikan sifat **atomik (*all-or-nothing*)** transaksi di PostgreSQL 18, perintah kedua di dalam `prisma.$transaction` diubah sementara menjadi ID fiktif `prisma.item.delete({ where: { id: id + 100000 } })`:

```ts
await prisma.$transaction([
  prisma.ulasan.deleteMany({ where: { itemId: id } }),
  prisma.item.delete({ where: { id: id + 100000 } }), // Sengaja dibuat gagal (P2025)
]);
```

Berikut adalah hasil pemeriksaan jumlah ulasan per item di `psql` **sebelum** dan **sesudah** transaksi tersebut dijalankan pada `itemId = 1`:

```text
# 1. SEBELUM PENGUJIAN ROLLBACK:
$ psql "postgresql://praktikum:lokal-saja-123@localhost:5432/produk" \
  -c 'SELECT "itemId", COUNT(*) FROM "Ulasan" GROUP BY "itemId" ORDER BY "itemId";'
 itemId | count 
--------+-------
      1 |     1
      2 |     1
      3 |     1
      4 |     1
      5 |     1
      6 |     1
(6 rows)

# 2. SAAT TRANSAKSI DIJALANKAN (Perintah 1: deleteMany itemId=1, Perintah 2: delete id=100001):
PrismaClientKnownRequestError: An operation failed because it depends on one or more records that were required but not found. Record to delete does not exist. (code: 'P2025')

# 3. SESUDAH PENGUJIAN ROLLBACK:
$ psql "postgresql://praktikum:lokal-saja-123@localhost:5432/produk" \
  -c 'SELECT "itemId", COUNT(*) FROM "Ulasan" GROUP BY "itemId" ORDER BY "itemId";'
 itemId | count 
--------+-------
      1 |     1
      2 |     1
      3 |     1
      4 |     1
      5 |     1
      6 |     1
(6 rows)
```

Meskipun perintah pertama (`prisma.ulasan.deleteMany({ where: { itemId: 1 } })`) sempat dieksekusi di dalam transaksi, kegagalan perintah kedua (`P2025`) memicu perintah **`ROLLBACK`** otomatis dari PostgreSQL sehingga ulasan pada `itemId = 1` **terbukti tetap utuh (`count = 1`)**. Setelah kode dikembalikan menjadi `where: { id }`, penghapusan transaksi normal berhasil menghapus item beserta ulasannya secara bersih.

![Tangkapan Layar Bukti Rollback Transaksi Sebelum dan Sesudah Pengujian di psql](./screenshoot/modul-06/06_bukti_rollback_transaksi.png)

---

## 6. Skenario Uji

Pengujian dilakukan terhadap **10 skenario uji** (8 skenario operasi CRUD dan 2 skenario relasi/constraint anak) baik melalui antarmuka peramban maupun skrip verifikasi otomatis `scripts/uji-crud-modul6.ts`:

### Tabel 10 Skenario Uji dengan Hasil Aktual

| No | Kategori | Skenario Uji | Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :-: | :---: | :--- | :--- | :--- | :--- | :-: |
| **1** | **CRUD (Create)** | **Tambah item wilayah ulayat sah** | Buka `/katalog/tambah`, masuk sesi Tetua, isi data sah (`"Kawasan Adat Hutan Sagu Tipuka"`, kategori `ZonaSagu`, distrik `Mimika Timur`, luas `120.5`), lalu kirim. | Tersimpan di tabel `Item` PostgreSQL, tampil di `/katalog`, dan tetap ada setelah `npm run dev` dimulai ulang. | Baris baru tersimpan di PostgreSQL (`ID: 7`), tampil di daftar katalog, dan persisten saat server di-*restart*. | **LULUS** |
| **2** | **CRUD (Create)** | **Tambah item judul ganda (`@unique`)** | Kirim formulir tambah dengan judul yang sudah terdaftar (`"Kawasan Ulayat Lembah Nemangkawi"`). | Ditolak oleh constraint `Item_judul_key`; Server Action menangkap **`P2002`** dan menampilkan galat pada kolom judul. | Server Action menangkap `P2002` dan menampilkan pesan ramah pada kolom judul/nama: *"Judul item sudah terdaftar"*. | **LULUS** |
| **3** | **CRUD (Create)** | **Tambah item judul kosong / pendek** | Lewatkan validasi HTML (`novalidate`), isi `judul` dengan `""` atau `"Ab"` (< 3 karakter), lalu kirim. | Ditolak oleh validasi Zod di Server Action; tidak ada query `INSERT` ke PostgreSQL. | `safeParse` menolak masukan dengan pesan `["Judul minimal 3 karakter"]`; jumlah baris di database tidak berubah. | **LULUS** |
| **4** | **CRUD (Update)** | **Ubah deskripsi item wilayah ulayat** | Buka `/katalog/[id]`, klik *Ubah Deskripsi / Status*, perbarui teks deskripsi patok batas, lalu simpan. | `prisma.item.update` memperbarui baris di PostgreSQL dan perubahan langsung tampil di halaman detail. | Baris berhasil diperbarui di PostgreSQL, `revalidatePath` berjalan, dan deskripsi baru langsung tampil di detail. | **LULUS** |
| **5** | **CRUD (Update)** | **Ubah item yang sudah dihapus** | Buka form ubah item, hapus item tersebut dari sesi lain/database, lalu kirim form ubah. | Prisma melempar **`P2025`**; Server Action menangkapnya dan menampilkan pesan aman. | Ditangkap kode `P2025` dan tampil pesan merah: *"Item tidak ditemukan atau sudah dihapus."* tanpa crash. | **LULUS** |
| **6** | **CRUD (Read)** | **Buka `/katalog/abc` dan `/katalog/99999`** | Akses URL `/katalog/abc` (ID bukan bilangan bulat positif) dan `/katalog/99999` (ID tidak ada di tabel `Item`). | Memanggil `notFound()` dan menampilkan halaman **404 Not Found**, bukan galat server 500. | Keduanya memicu `notFound()` dan menampilkan halaman 404 khusus arsip ulayat dengan status HTTP `404`. | **LULUS** |
| **7** | **CRUD (Delete)** | **Hapus item beserta ulasannya (Transaksi)** | Pada halaman detail item yang memiliki 2 ulasan saksi, klik tombol **Hapus Item & Kesaksian (Transaksi)**. | `prisma.$transaction([deleteMany, delete])` menghapus ulasan dan item secara atomik, lalu mengalihkan ke `/katalog`. | Seluruh ulasan anak dan baris item induk terhapus bersih dari PostgreSQL; halaman dialihkan ke `/katalog`. | **LULUS** |
| **8** | **CRUD (Rollback)** | **Hapus item, perintah kedua di transaksi gagal** | Ubah sementara perintah kedua menjadi `delete({ where: { id: id + 100000 } })`, jalankan hapus pada item berulasan, lalu cek `psql`. | Perintah kedua gagal (`P2025`), transaksi di-*rollback*, dan ulasan item tersebut tetap ada di tabel `Ulasan`. | Langkah kedua gagal `P2025`; query `SELECT COUNT(*)` di `psql` membuktikan ulasan **tetap utuh 100%** (rollback berhasil). | **LULUS** |
| **9** | **Relasi (1:N)** | **Tambah ulasan dengan `nilai: 6`** | Pada `FormUlasan` di `/katalog/[id]`, kirim ulasan dengan `nilai: 6` (di luar rentang 1–5). | Ditolak oleh `skemaUlasan` (`z.coerce.number().int().min(1).max(5)`) sebelum menyentuh database. | Ditolak Zod dengan galat kolom `nilai`: `["Nilai maksimal 5"]`; tidak ada baris baru di tabel `Ulasan`. | **LULUS** |
| **10** | **Relasi (1:N)** | **Ulasan kedua dengan nama saksi yang sama** | Kirim ulasan kedua menggunakan `nama` saksi yang sama (`"Saksi Marga Beanal"`) pada `itemId` yang sama. | Ditolak oleh indeks unik gabungan `Ulasan_itemId_nama_key`; Server Action menangkap **`P2002`**. | Ditangkap kode `P2002` dan tampil galat pada kolom nama: *"Nama ini sudah mengulas item ini"*. | **LULUS** |

* **Perhitungan Persentase Kelulusan:**  
  $$\text{Persentase Kelulusan} = \frac{10\text{ skenario lulus}}{10\text{ total skenario}} \times 100\% = \mathbf{100\%}$$  
  *(Memenuhi dan melampaui ambang kelulusan minimum modul sebesar $\lceil 0,9 \times 10 \rceil = 9$ skenario atau $90\%$)*.

![Tangkapan Layar Keluaran Eksekusi 10 Skenario Uji CRUD dan Transaksi](./screenshoot/modul-06/07_uji_10_skenario_crud.png)

---

## 7. Kendala dan Penyelesaian

Selama pengerjaan praktikum Modul 6, ditemukan empat kendala teknis beserta penyelesaiannya:

| No | Kendala yang Dihadapi | Penyebab Teknis | Penyelesaian yang Dilakukan |
| :-: | :--- | :--- | :--- |
| **1** | **Galat `Module not found: Can't resolve '@/generated/prisma/client'` setelah migrasi** | Pada Prisma ORM 7, perintah `npx prisma migrate dev` hanya membuat dan menerapkan berkas SQL migrasi ke PostgreSQL, tetapi **tidak lagi menjalankan `prisma generate` secara otomatis**, serta lokasi keluaran berada di `./generated/prisma`. | Menjalankan `npx prisma generate` secara eksplisit setelah migrasi dan menambahkan pemetaan alias path `"@/generated/*": ["./generated/*"]` pada berkas `tsconfig.json`. |
| **2** | **Skrip `prisma/seed.ts` tidak dapat mengimpor `src/lib/prisma.ts`** | `src/lib/prisma.ts` memuat direktif `import "server-only"` dan mengandalkan pemuatan `.env` dari runtime Next.js, sedangkan `npx prisma db seed` dijalankan di luar Next.js melalui `tsx prisma/seed.ts`. | Mengimpor `"dotenv/config"` pada baris pertama `prisma/seed.ts`, membuat instans `PrismaClient` tersendiri dengan driver adapter `@prisma/adapter-pg`, dan menutup koneksi dengan `prisma.$disconnect()`. |
| **3** | **Ketidakcocokan tipe kolom opsional `gambar` antara Prisma dan TypeScript (`string \| null` vs `string \| undefined`)** | Kolom opsional `gambar String?` pada PostgreSQL dikembalikan oleh Prisma Client dengan nilai `null` saat kosong, sedangkan tipe lama dari Modul 3–5 menggunakan properti opsional `gambar?: string`. | Memperbarui definisi antarmuka `Item` pada `src/lib/tipe.ts` menjadi `gambar: string \| null` sehingga kompatibel penuh dengan hasil `select` Prisma Client. |
| **4** | **Penanganan tipe variabel `catch (e)` pada TypeScript Strict Mode** | Pada konfigurasi TypeScript ketat (*strict mode*), variabel tangkapan `catch (e: unknown)` tidak mengizinkan akses langsung ke properti `e.code`. | Melakukan penyempitan tipe (*type narrowing*) menggunakan `if (e instanceof Prisma.PrismaClientKnownRequestError)` sebelum memeriksa kode `P2002`, `P2003`, dan `P2025`. |

---

## 8. Catatan Pemanfaatan AI

Sesuai ketentuan akademik pada Bagian K Modul 6, berikut adalah pencatatan transparan pemanfaatan asisten kecerdasan artifisial selama penyusunan kode dan Dokumen Teknis:

* **Alat yang Digunakan:**  
  Antigravity AI Coding Assistant (Google DeepMind) sebagai mitra diskusi (*pair-programming*).
* **Perintah Utama (*Prompt*) yang Diberikan:**  
  1. *"Bantu saya mengonfigurasi Prisma ORM 7 dengan driver adapter `@prisma/adapter-pg` dan menyusun skema 2 entitas berelasi 1:N (`Item` wilayah ulayat dan `Ulasan` kesaksian saksi batas adat) dengan `onDelete: Restrict` serta `@@unique([itemId, nama])`."*
  2. *"Perbarui Server Action pada `src/app/katalog/actions.ts` dan `src/app/katalog/ulasan-actions.ts` agar menangani kode galat Prisma `P2002`, `P2003`, dan `P2025` menjadi pesan ramah sesuai Tabel 3 Modul 6, serta terapkan transaksi atomik `prisma.$transaction` pada `hapusItem`."*
  3. *"Susun skrip pengujian `scripts/uji-crud-modul6.ts` untuk memverifikasi ke-10 skenario uji CRUD, relasi, dan pembuktian rollback transaksi di PostgreSQL 18."*
* **Bagian yang Digunakan dan Bagian yang Diubah/Disesuaikan Sendiri:**  
  * **Bagian yang Digunakan:** Pola dasar singleton `PrismaClient` dengan `@prisma/adapter-pg` pada `src/lib/prisma.ts`, struktur pemanggilan `useActionState` pada `FormUlasan.tsx` & `FormUbahItem.tsx`, serta kerangka skrip pengujian otomatis 10 skenario.
  * **Bagian yang Ditentukan dan Diubah Sendiri oleh Praktikan:** Penentuan domain atribut adat Kabupaten Mimika (`Kategori` enum: `HutanAdat`, `ZonaSagu`, `PesisirUlayat`, `LembahKeramat`, `PerkebunanKomunal`, kolom `distrik`, `luasHektar`), keputusan pemilihan aturan `onDelete: Restrict` demi melindungi nilai bukti kesaksian marga, penyesuaian pesan galat bahasa Indonesia pada formulir, serta eksekusi pengujian dan manajemen repositori Git.
* **Cara Memverifikasi Kebenaran Hasil AI:**  
  1. **Verifikasi Struktur Tabel & Constraint di PostgreSQL:** Menjalankan perintah `\d "Item"` dan `\d "Ulasan"` melalui `psql` untuk memastikan indeks unik `Item_judul_key`, indeks unik gabungan `Ulasan_itemId_nama_key`, dan constraint `Ulasan_itemId_fkey ... ON DELETE RESTRICT` benar-benar terbentuk di basis data `produk`.
  2. **Verifikasi Idempotensi Seed:** Menjalankan `npx prisma db seed` dua kali berturut-turut di terminal dan memeriksa di Prisma Studio (`http://localhost:5555`) bahwa jumlah baris tetap konsisten **6 item dan 6 ulasan** tanpa duplikasi.
  3. **Verifikasi Kompilasi & Linter:** Menjalankan `npx tsc --noEmit` dan `npm run lint` hingga menghasilkan **0 error dan 0 warning**.
  4. **Verifikasi Rollback & 10 Skenario Uji:** Menguji kegagalan langkah kedua di dalam `prisma.$transaction` (`id + 100000`) dan memeriksa melalui query `SELECT "itemId", COUNT(*) FROM "Ulasan" GROUP BY "itemId"` di `psql` bahwa jumlah ulasan tidak berkurang sedikit pun saat transaksi batal.
