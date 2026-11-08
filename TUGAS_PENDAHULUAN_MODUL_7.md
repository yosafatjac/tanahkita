# Tugas Pendahuluan Modul 7: Debugging dan Telaah Kode

* **Nama:** Yosafat Jacobus  
* **NIM:** 105224016  
* **Program Studi:** Ilmu Komputer, Universitas Pertamina  
* **Mata Kuliah:** Praktikum Pengembangan Aplikasi Web (052356)  
* **Produk:** **TanahKita** (Sistem Pencatatan dan Pembuktian Penguasaan Tanah Adat Papua — Kabupaten Mimika)  

---

## 1. Langkah Reproduksi Galat pada Produk TanahKita

Berikut adalah laporan langkah reproduksi lengkap untuk galat nyata yang ditemukan dan ditelusuri pada produk **TanahKita**:

#### Judul Galat: Penghapusan Wilayah Ulayat (`Item`) yang Memiliki Kesaksian (`Ulasan`) Ditolak Tanpa Transaksi (`P2003`) dan Gagal Diam-diam bila Ditelan `try/catch`

* **Lingkungan:**
  * **Runtime & Framework:** Node.js `v24.21.0` (LTS), Next.js `15.1.0` (App Router), React `19.0.0`, TypeScript `5.x`
  * **Basis Data & ORM:** PostgreSQL `18.6` (database `produk`), Prisma ORM `7.10.1` dengan `@prisma/adapter-pg`
  * **Peramban & OS:** Google Chrome (macOS)
  * **Repositori, Branch & Commit Awal:** `https://github.com/yosafatjac/tanahkita`, branch `praktikum/modul-06` (`main`), commit `69ff9fb` (`d4c8b42`)
* **Data Awal:**
  * Basis data telah diisi melalui `npx prisma db seed` (memuat 6 baris pada tabel `Item` dan 6 baris pada tabel `Ulasan`).
  * Baris `Item` dengan `id = 1` (*"Kawasan Ulayat Lembah Nemangkawi"*, distrik *Tembagapura*, status `tersedia = true`) memiliki 1 baris anak yang merujuk kepadanya di tabel `Ulasan` (`itemId = 1`, `nama = "Tetua Adat Mimika"`, `nilai = 5`) dengan aturan *foreign key* `onDelete: Restrict` (`ON DELETE RESTRICT`).
* **Langkah Reproduksi (Bernomor):**
  1. Pastikan layanan PostgreSQL 18 berjalan dan data awal telah terisi (`npx prisma db seed`), lalu jalankan server pengembangan (`npm run dev` atau konfigurasi debugger `"Next.js: debug server-side"`).
  2. Pada fungsi Server Action `hapusItem(id)` di `src/app/katalog/actions.ts`, panggil penghapusan induk secara langsung tanpa transaksi: `await prisma.item.delete({ where: { id } })`.
  3. Buka peramban dan arahkan ke halaman detail wilayah ulayat pertama di `http://localhost:3000/katalog/1` (yang memiliki 1 ulasan saksi adat).
  4. Klik tombol **"Hapus Item"** pada halaman detail tersebut (atau jalankan pemanggilan `prisma.item.delete({ where: { id: 1 } })`).
  5. Periksa tampilan halaman di peramban serta keluaran *stack trace* / log pada terminal server Node.js.
* **Hasil yang Diharapkan:**
  * Wilayah ulayat `id = 1` beserta seluruh catatan kesaksian (`Ulasan`) yang merujuk kepadanya terhapus secara atomik dari PostgreSQL, cache rute `/katalog` direvalidasi (`revalidatePath("/katalog")`), dan pengguna dialihkan kembali ke halaman daftar `/katalog` (atau bila penghapusan ditolak, pengguna menerima pesan galat yang jelas di antarmuka).
* **Hasil Aktual:**
  * Penghapusan ditolak oleh PostgreSQL karena constraint *foreign key* `Ulasan_itemId_fkey` (`ON DELETE RESTRICT`) masih memiliki baris anak yang merujuk ke `Item.id = 1`.
  * Prisma melempar `PrismaClientKnownRequestError` dengan `code: 'P2003'` (`Foreign key constraint violated on the constraint: Ulasan_itemId_fkey`).
  * Apabila di dalam `hapusItem` digunakan blok `try { ... } catch (e) { console.log("Gagal menghapus"); }`, objek galat `P2003` tertelan oleh `catch`, halaman tidak berpindah dari `/katalog/1`, item tidak terhapus di basis data, pengguna tidak mendapatkan pesan umpan balik apa pun di layar, dan terminal hanya mencetak teks tidak informatif `"Gagal menghapus"`.
* **Frekuensi:**
  * **5 dari 5 percobaan (100% — deterministik / selalu terjadi)** setiap kali penghapusan tanpa transaksi dijalankan pada `Item` yang masih memiliki minimal 1 baris `Ulasan`.
* **Bukti Penelusuran:**
  * Potongan *stack trace* terminal: `PrismaClientKnownRequestError: Invalid prisma.item.delete() invocation ... Foreign key constraint violated on the constraint: Ulasan_itemId_fkey (code: 'P2003')` (terlampir pada berkas tangkapan layar `05_galat_restrict_tanpa_transaksi.png`).

---

### 2. Perbedaan `Breakpoint`, `Conditional Breakpoint`, dan `Logpoint` di VS Code Beserta Situasi yang Tepat

| Fitur Debugger VS Code | Cara Kerja & Perbedaan Utama | Menghentikan Eksekusi (*Pause*)? | Mengubah Kode Sumber? | Situasi Penggunaan yang Tepat pada Produk (**TanahKita**) |
| :--- | :--- | :---: | :---: | :--- |
| **1. `Breakpoint` (Biasa)** | Menghentikan sementara (*pause*) eksekusi program **setiap kali** baris kode tempat titik merah dipasang dilewati oleh alur eksekusi. Saat berhenti, pengembang dapat memeriksa panel *Variables*, *Watch*, *Call Stack*, dan mengetik ekspresi di *Debug Console*. | **Ya** (Selalu berhenti setiap baris tersentuh) | **Tidak** | Saat menelusuri Server Action `ubahItem(id, _prev, formData)` di `src/app/katalog/actions.ts` tepat pada baris `await prisma.item.update(...)` untuk memeriksa isi `Object.fromEntries(formData)` dan nilai `hasil.data.tersedia` ketika tombol **Simpan** ditekan satu kali oleh pengguna. |
| **2. `Conditional Breakpoint`** | Menghentikan sementara eksekusi program **hanya apabila ekspresi kondisi yang ditentukan bernilai *truthy* (`true`)** (atau ketika jumlah ketukan / *hit count* terpenuhi). Jika kondisi bernilai `false`, baris kode dilewati tanpa menghentikan program. | **Ya, Bersyarat** (Hanya berhenti saat ekspresi bernilai `true`) | **Tidak** | Saat menelusuri fungsi yang dipanggil berulang kali (misalnya di dalam perulangan pembacaan/validasi daftar wilayah ulayat atau saat banyak permintaan masuk), tetapi galat hanya terjadi pada kasus spesifik—contohnya memasang syarat `id === 12` atau `formData.get("tersedia") === "false"` atau `!hasil.success` agar debugger hanya berhenti saat data bermasalah muncul. |
| **3. `Logpoint`** | Mencetak pesan terformat atau nilai variabel (ditulis dalam kurung kurawal, misalnya `hapusItem dipanggil: id={id}, judul={item.judul}`) langsung ke *Debug Console* **tanpa menghentikan jalannya program**. Lebih aman daripada `console.log()` karena tidak mengotori kode sumber dan tidak berisiko ikut ter-*commit* ke Git. | **Tidak** (Program terus berjalan normal tanpa jeda) | **Tidak** | Saat memantau urutan aliran data secara *real-time* pada fitur yang sensitif terhadap jeda waktu—misalnya memantau nilai ketikan `isi.length` pada komponen klien atau memantau parameter `itemId` dan `nama` yang masuk ke `tambahUlasan` secara beruntun tanpa harus menekan tombol *Continue (F5)* berulang-ulang. |

---

### 3. Arti Kode Galat Prisma `P2002`, `P2003`, dan `P2025` Beserta Contoh Kejadian pada Entitas `Item` dan `Ulasan`

Ketiga kode tersebut merupakan properti `code` pada objek **`Prisma.PrismaClientKnownRequestError`** yang dilempar oleh Prisma Client ketika operasi basis data melanggar aturan integritas di PostgreSQL:

| Kode Galat Prisma | Arti Teknis Kode Galat | Contoh Kejadian pada Entitas Induk **`Item`** (Wilayah Ulayat) | Contoh Kejadian pada Entitas Anak **`Ulasan`** (Kesaksian Adat) |
| :-: | :--- | :--- | :--- |
| **`P2002`** | **Pelanggaran Constraint Unik (*Unique constraint failed*)** — Terjadi ketika operasi `create` atau `update` mencoba menyimpan nilai pada satu kolom (atau gabungan kolom) yang sudah digunakan oleh baris lain, sehingga melanggar aturan `@unique` atau `@@unique` di skema. | Pengguna mendaftarkan wilayah ulayat baru melalui `tambahItem` / `simpanUlayatAction` (atau mengubah judul melalui `ubahItem`) menggunakan `judul` **`"Kawasan Ulayat Lembah Nemangkawi"`** yang sudah terdaftar di tabel `Item`, sehingga melanggar indeks unik **`Item_judul_key`** (`judul String @unique`). | Seorang saksi adat mengirim ulasan kedua melalui `tambahUlasan` pada wilayah ulayat yang sama (`itemId = 1`) menggunakan nama saksi yang sudah pernah mengulas item tersebut (misalnya **`nama = "Tetua Adat Mimika"`** pada `itemId = 1`), sehingga melanggar indeks unik gabungan **`Ulasan_itemId_nama_key`** (`@@unique([itemId, nama])`). |
| **`P2003`** | **Pelanggaran Constraint Kunci Asing (*Foreign key constraint failed*)** — Terjadi ketika operasi basis data melanggar integritas referensial antartabel, baik saat menghapus baris induk yang masih dirujuk oleh baris anak (`ON DELETE RESTRICT`), maupun saat menyisipkan baris anak dengan nilai *foreign key* yang tidak ada di tabel induk. | Pengguna memanggil `prisma.item.delete({ where: { id: 1 } })` secara langsung tanpa menghapus ulasannya terlebih dahulu, padahal wilayah ulayat `id = 1` masih memiliki catatan kesaksian di tabel `Ulasan` dan relasinya diatur dengan **`onDelete: Restrict`** (melanggar constraint `Ulasan_itemId_fkey`). | Pengguna mengirimkan formulir `tambahUlasan` (`prisma.ulasan.create`) untuk `itemId = 99999` (atau untuk wilayah ulayat yang baru saja dihapus oleh pengguna lain di tab berbeda), sehingga nilai `Ulasan.itemId` merujuk ke `Item.id` yang tidak ada di tabel `Item` (melanggar constraint `Ulasan_itemId_fkey`). |
| **`P2025`** | **Baris Data yang Dibutuhkan Tidak Ditemukan (*An operation failed because it depends on one or more records that were required but not found*)** — Terjadi ketika operasi `update`, `delete`, atau `findUniqueOrThrow` menargetkan baris berdasarkan `where` (seperti `id`), tetapi baris tersebut sudah tidak ada di dalam tabel. | Pengguna membuka halaman edit wilayah ulayat `/katalog/12` di dua tab peramban; setelah item `id = 12` dihapus pada tab pertama, pengguna menekan tombol **Simpan Pembaruan** (`prisma.item.update({ where: { id: 12 } })`) atau **Hapus** (`prisma.item.delete({ where: { id: 12 } })`) pada tab kedua. | Pengguna atau admin memanggil operasi `prisma.ulasan.delete({ where: { id: 50 } })` atau `prisma.ulasan.update({ where: { id: 50 } })` terhadap satu baris kesaksian adat yang ternyata sudah dihapus terlebih dahulu dari basis data oleh sesi lain. |

---

### 4. Mengapa `Boolean("false")` Bernilai `true` dan Mengapa `redirect()` Tidak Boleh Dipanggil di Dalam Blok `try`

#### A. Mengapa `Boolean("false")` Bernilai `true`?
1. **Aturan *Truthy* dan *Falsy* pada Spesifikasi JavaScript (ECMAScript):**  
   Di JavaScript, fungsi konstruktor `Boolean(nilai)` mengonversi nilai masukan menjadi tipe boolean berdasarkan daftar nilai *falsy*. Terdapat hanya 6 nilai dasar yang bernilai *falsy* (`false`), yaitu: `false`, `0` (dan `-0`, `0n`), **`""` (string kosong dengan panjang 0)**, `null`, `undefined`, dan `NaN`.
2. **Setiap String Tidak Kosong Selalu *Truthy*:**  
   Karena `"false"` adalah sebuah nilai bertipe **`string` yang tidak kosong** (memiliki panjang 5 karakter: `'f'`, `'a'`, `'l'`, `'s'`, `'e'`), JavaScript tidak membaca arti kata di dalamnya, melainkan mengevaluasinya sebagai objek string tidak kosong sehingga **`Boolean("false")` menghasilkan `true`**.
3. **Dampaknya pada Validasi Formulir Next.js + Zod:**  
   Elemen HTML `<select name="tersedia"><option value="false">Tidak tersedia</option></select>` di dalam `FormData` selalu mengirimkan nilai bertipe **string `"false"`** ke Server Action. Apabila skema validasi menggunakan `z.coerce.boolean()`, Zod secara internal memanggil `Boolean(input)` sehingga string `"false"` diubah menjadi `true` dan status item di basis data selalu tersimpan sebagai `tersedia: true`. Perbaikan yang benar pada Zod 4 adalah menggunakan **`z.stringbool()`**, yang secara eksplisit mengurai teks `"true"` menjadi `true` dan teks `"false"` menjadi `false`.

#### B. Mengapa `redirect()` Tidak Boleh Dipanggil di Dalam Blok `try`?
1. **Mekanisme Internal `redirect()` di Next.js:**  
   Di Next.js App Router (`next/navigation`), fungsi `redirect(url)` (begitu pula `notFound()`) **tidak mengembalikan nilai biasa (`return`)**, melainkan bekerja dengan cara **sengaja melempar (*throw*) sebuah galat internal khusus** milik Next.js yang memiliki pesan `e.message === "NEXT_REDIRECT"` dan properti `e.digest` berawalan `"NEXT_REDIRECT;..."`.
2. **Tujuan Pelemparan Galat Khusus Tersebut:**  
   Next.js melempar galat khusus tersebut untuk menghentikan eksekusi kode Server Action/Server Component seketika itu juga, lalu membiarkan *runtime* tingkat atas Next.js menangkap sinyal `NEXT_REDIRECT` tersebut dan mengubahnya menjadi respons pengalihan halaman HTTP (*HTTP 303/307 Redirect*) ke peramban.
3. **Apa yang Terjadi Bila Dipanggil di Dalam Blok `try`:**  
   Apabila `redirect("/katalog")` diletakkan di dalam blok `try { ... } catch (e) { ... }`, maka galat `NEXT_REDIRECT` yang dilempar oleh `redirect()` akan **tertangkap (*caught* / tertelan) oleh blok `catch (e)` kita sendiri** sebelum sempat mencapai *runtime* Next.js. Akibatnya:
   * Navigasi / perpindahan halaman ke `/katalog` **batal terjadi** (halaman diam di tempat).
   * Blok `catch` menganggap telah terjadi kegagalan database dan menjalankan kode galat (seperti mencetak `"Gagal menghapus"`), padahal operasi `prisma.item.delete` di baris sebelumnya sebenarnya sudah berhasil dijalankan.
   * Oleh sebab itu, `redirect()` wajib diletakkan **di luar (setelah) blok `try/catch`** (atau jika terpaksa di dalam `try`, blok `catch` wajib melempar ulang galat tersebut dengan `unstable_rethrow(e)` / `throw e`).

---

### 5. Informasi Pasangan Telaah Kode (*Peer Review*) dan Bukti Collaborator

* **Nama Pasangan Telaah:** Erlangga Aditya Permana
* **NIM Pasangan Telaah:** 105224038
* **Username GitHub Pasangan:** `xvasgit`
* **URL Repositori Produk Praktikan:** [https://github.com/yosafatjac/tanahkita](https://github.com/yosafatjac/tanahkita)
* **URL Repositori Pasangan Telaah:** [https://github.com/xvasgit/PrivateSession](https://github.com/xvasgit/PrivateSession)
* **Status Undangan Collaborator:** Undangan *collaborator* melalui menu **Settings $\rightarrow$ Collaborators** pada repositori GitHub telah dikirimkan ke akun `xvasgit` dan **sudah diterima (*Accepted*)** sebagai persiapan sesi praktikum telaah kode (bukti tangkapan layar terlampir pada berkas unggahan).

---

### Catatan Pemanfaatan AI (Sesuai Ketentuan Moodle)
* **Alat yang digunakan:** Antigravity AI Coding Assistant (Google DeepMind).
* **Bagian yang dibantu:** Perapian struktur tabel perbandingan fitur debugger VS Code (Nomor 2), pemetaan sistematis contoh kasus `P2002`, `P2003`, dan `P2025` pada entitas `Item` dan `Ulasan` di produk TanahKita (Nomor 3), serta penataan bahasa penjelasan teknis `Boolean("false")` dan mekanisme `NEXT_REDIRECT` pada `redirect()` (Nomor 4). Seluruh data lingkungan, kasus galat produk TanahKita (Nomor 1), dan koordinasi pasangan telaah (Nomor 5) diverifikasi langsung oleh praktikan.
