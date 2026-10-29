# Tugas Pendahuluan Modul 5: Formulir, Validasi Masukan, dan Pengelolaan Sesi

* **Nama:** Yosafat Jacobus  
* **NIM:** 105224016  
* **Program Studi:** Ilmu Komputer, Universitas Pertamina  
* **Mata Kuliah:** Praktikum Pengembangan Aplikasi Web (052356)  
* **Produk:** **TanahKita** (Sistem Pencatatan dan Pembuktian Penguasaan Tanah Adat Papua — Kabupaten Mimika)  

---

### 1. Tabel Aturan Validasi Formulir Utama Produk

Formulir utama pada produk **TanahKita** adalah **Formulir Pendaftaran & Pencatatan Wilayah Ulayat Baru** (Tambah Arsip Katalog Ulayat). Formulir ini digunakan oleh perwakilan marga adat atau pendamping hukum untuk mendaftarkan batas fisik dan identitas penguasaan tanah adat ke dalam sistem.

| Nama Kolom (*Field*) | Tipe Data | Aturan Validasi | Pesan Galat Spesifik (*Error Message*) |
| :--- | :---: | :--- | :--- |
| **`nama`** | String | • Wajib diisi (*required*)<br>• Minimal 5 karakter<br>• Maksimal 100 karakter<br>• Dilarang hanya berisi spasi kosong (*trimmed*) | "Nama kawasan tanah ulayat wajib diisi antara 5 hingga 100 karakter." |
| **`kategori`** | Enum (Pilihan) | • Wajib memilih salah satu opsi yang sah:<br>`"Hutan Adat"`, `"Zona Sagu"`, `"Pesisir Ulayat"`, `"Lembah Keramat"`, `"Perkebunan Komunal"` | "Pilih salah satu kategori wilayah ulayat yang sah dari daftar yang tersedia." |
| **`distrik`** | String | • Wajib diisi (*required*)<br>• Minimal 3 karakter<br>• Maksimal 50 karakter | "Nama distrik di Kabupaten Mimika wajib diisi (minimal 3 karakter)." |
| **`luasHektar`** | Number (Float) | • Wajib diisi (*required*)<br>• Bilangan positif (*greater than 0*)<br>• Maksimal 10.000 hektar per hamparan klaim | "Luas tanah ulayat harus berupa angka positif lebih dari 0 dan maksimal 10.000 hektar." |
| **`margaPengelola`** | String | • Wajib diisi (*required*)<br>• Minimal 3 karakter<br>• Format diawali kata "Marga " (contoh: "Marga Magal") | "Nama marga pengelola wajib diisi minimal 3 karakter (contoh: Marga Magal)." |
| **`persetujuanBatas`** | Boolean (Checkbox) | • Wajib dicentang (*must be checked*)<br>• Konfirmasi kesepakatan musyawarah adat bersama saksi batas marga tetangga | "Anda wajib mencentang persetujuan bahwa batas tanah telah disepakati melalui musyawarah adat." |

---

### 2. Skema Zod 4 untuk Formulir Utama

Berikut adalah implementasi skema validasi menggunakan **Zod 4** yang mencakup kolom pilihan dengan `z.enum` dan kolom kotak centang (*checkbox* `FormData`):

```typescript
import { z } from "zod";

// Daftar pilihan kategori resmi tanah ulayat Mimika
export const KATEGORI_ULAYAT = [
  "Hutan Adat",
  "Zona Sagu",
  "Pesisir Ulayat",
  "Lembah Keramat",
  "Perkebunan Komunal",
] as const;

// Skema Validasi Zod 4 untuk Penambahan Arsip Wilayah Ulayat
export const skemaTambahUlayat = z.object({
  nama: z
    .string()
    .trim()
    .min(5, { message: "Nama kawasan tanah ulayat wajib diisi minimal 5 karakter." })
    .max(100, { message: "Nama kawasan tanah ulayat tidak boleh melebihi 100 karakter." }),

  kategori: z.enum(KATEGORI_ULAYAT, {
    errorMap: () => ({
      message: "Pilih salah satu kategori wilayah ulayat yang sah dari daftar yang tersedia.",
    }),
  }),

  distrik: z
    .string()
    .trim()
    .min(3, { message: "Nama distrik di Kabupaten Mimika wajib diisi minimal 3 karakter." })
    .max(50, { message: "Nama distrik tidak boleh melebihi 50 karakter." }),

  luasHektar: z.coerce
    .number({ invalid_type_error: "Luas wilayah harus berupa angka valid." })
    .positive({ message: "Luas tanah ulayat harus lebih besar dari 0 hektar." })
    .max(10000, { message: "Luas tanah ulayat maksimal 10.000 hektar per bidang pencatatan." }),

  margaPengelola: z
    .string()
    .trim()
    .min(3, { message: "Nama marga pengelola wajib diisi minimal 3 karakter." })
    .max(50, { message: "Nama marga pengelola tidak boleh melebihi 50 karakter." }),

  // Validasi Kotak Centang (Checkbox):
  // Pada FormData peramban, checkbox yang dicentang mengirimkan nilai "on" (atau true)
  persetujuanBatas: z.preprocess(
    (val) => val === "on" || val === true || val === "true",
    z.literal(true, {
      errorMap: () => ({
        message: "Anda wajib mencentang persetujuan bahwa batas tanah telah disepakati melalui musyawarah adat.",
      }),
    })
  ),
});

// Ekstraksi tipe TypeScript dari skema Zod
export type TambahUlayatInput = z.infer<typeof skemaTambahUlayat>;
```

---

### 3. Aturan Semantik yang Tidak Dapat Diperiksa oleh Skema Saja & Lokasi Pemeriksaannya

* **Aturan Semantik Produk TanahKita:**  
  **Pemeriksaan Keunikan Identitas Kode Arsip / Pencegahan Duplikasi Wilayah Ulayat (*Uniqueness & Conflict Check*):**  
  Sistem harus memastikan bahwa nama kawasan tanah ulayat yang didaftarkan belum pernah terdaftar sebelumnya oleh marga lain di distrik yang sama untuk mencegah sengketa ganda (*overlapping territorial claims*), serta memastikan bahwa pengguna yang sedang login memiliki hak adat (*authorized clan elder/administrator*) untuk marga yang bersangkutan.

* **Mengapa Tidak Dapat Diperiksa oleh Skema Saja?**  
  Skema Zod bersifat statis dan tersinkronisasi murni di memori (*in-memory syntax/type checking*). Skema Zod hanya memvalidasi format string, batasan angka, atau kecocokan tipe data satu per satu, tanpa memiliki akses ke status sistem eksternal, koneksi basis data (*database / ledger*), atau sesi otentikasi pengguna.

* **Di Mana Aturan Tersebut Diperiksa?**  
  Aturan semantik ini diperiksa di dalam **Server Action** (misalnya fungsi `tambahUlayatAction` di `src/actions/katalog.ts`), tepat **setelah** tahap validasi Zod `skemaTambahUlayat.safeParse(formData)` berhasil lulus (`parsed.success === true`).  
  Di dalam Server Action, kode akan mengeksekusi pemeriksaan basis data:
  ```typescript
  // 1. Validasi sintaksis lewat Zod
  const hasilValidasi = skemaTambahUlayat.safeParse(dataMasukan);
  if (!hasilValidasi.success) {
    return { errors: hasilValidasi.error.flatten().fieldErrors };
  }

  // 2. Pemeriksaan Semantik (Bisnis / Database) di Server Action:
  const sudahAda = await db.katalog.findFirst({
    where: {
      nama: hasilValidasi.data.nama,
      distrik: hasilValidasi.data.distrik,
    },
  });

  if (sudahAda) {
    return {
      errors: {
        nama: ["Wilayah ulayat dengan nama ini sudah terdaftar di distrik tersebut. Periksa arsip yang ada."],
      },
    };
  }
  ```

---

### 4. Mengapa Validasi Atribut HTML `required` Tidak Cukup untuk Melindungi Data?

Validasi menggunakan atribut HTML (seperti `required`, `minlength`, `type="number"`) **sama sekali tidak cukup** untuk melindungi integritas dan keamanan data aplikasi karena alasan-alasan berikut:

1. **Sisi Klien Berada Penuh di Bawah Kendali Pengguna (*Untrusted Client*):**  
   Atribut HTML `required` hanya berjalan di lingkungan peramban (*client-side*). Setiap pengguna dapat dengan sangat mudah mematikan atau menghapus atribut tersebut menggunakan fitur *Inspect Element* (DevTools), menonaktifkan eksekusi JavaScript, atau memanipulasi DOM sebelum formulir dikirim.

2. **Server Action Adalah Endpoint HTTP POST Terbuka:**  
   Dalam arsitektur Next.js App Router, setiap Server Action (yang dideklarasikan dengan `'use server'`) pada dasarnya diekspos oleh Next.js sebagai *endpoint* HTTP POST publik. Penyerang tidak perlu membuka antarmuka formulir di peramban; mereka dapat langsung mengirimkan *request* HTTP POST berbahaya menggunakan alat seperti `curl`, Postman, atau skrip otomatis (*bot*) secara langsung ke server.

3. **Perlindungan Terakhir Wajib Berada di Server (*Defense in Depth*):**  
   Jika server hanya mengandalkan validasi HTML klien tanpa validasi ulang di sisi server (menggunakan Zod di dalam Server Action), data kosong, data bertipe salah, data dengan muatan injeksi berbahaya (*payload injection*), atau data yang melanggar logika sistem akan langsung lolos masuk ke pemrosesan backend dan merusak basis data. Oleh karena itu, validasi HTML klien hanyalah alat bantu kenyamanan pengguna (*User Experience / UX*), sedangkan validasi sisi server adalah **garis pertahanan wajib (*Security & Integrity Boundary*)**.

---

### 5. Fungsi Atribut Cookie Session dan Ancaman yang Dikuranginya

Pengelolaan sesi pengguna yang aman pada Next.js memerlukan penetapan atribut cookie yang ketat. Berikut fungsi dari keempat atribut wajib beserta ancaman keamanan yang dikuranginya:

| Atribut Cookie | Fungsi Teknis | Ancaman yang Dikurangi (*Threat Mitigation*) |
| :--- | :--- | :--- |
| **`HttpOnly`** | Menginstruksikan peramban agar cookie **tidak dapat diakses oleh skrip sisi klien** (seperti melalui perintah JavaScript `document.cookie`). Cookie hanya akan dikirimkan otomatis oleh browser melalui header HTTP saat melakukan komunikasi dengan server. | **Pencurian Token Sesi via Cross-Site Scripting (XSS):**<br>Jika peramban disusupi skrip JavaScript berbahaya (*malicious script injection*), penyerang tetap tidak dapat membaca atau mencuri token cookie sesi pengguna. |
| **`Secure`** | Memastikan bahwa cookie **hanya dikirimkan melalui saluran komunikasi terenkripsi (protokol HTTPS)** dan tidak akan pernah dikirimkan melalui koneksi HTTP polos yang tidak aman. | **Man-in-the-Middle (MitM) & Eavesdropping:**<br>Mencegah penyerang yang berada di jaringan publik (seperti Wi-Fi publik) mengintip (*sniffing*) dan menyadap token sesi yang dikirimkan dalam bentuk teks terbuka (*plaintext*). |
| **`SameSite=Lax`** | Membatasi pengiriman cookie pada permintaan lintas situs (*cross-site requests*). Peramban tidak akan menyertakan cookie ini pada sub-permintaan pihak ketiga (seperti pemanggilan gambar, iframe, atau AJAX dari situs lain), tetapi cookie tetap dikirimkan saat pengguna melakukan navigasi tingkat atas (*top-level navigation*, misalnya mengeklik tautan biasa menuju aplikasi). | **Cross-Site Request Forgery (CSRF):**<br>Mencegah situs penyerang secara diam-diam memicu permintaan yang mengubah data di aplikasi atas nama pengguna yang sedang aktif login tanpa sepengetahuan pengguna. |
| **`Max-Age`** | Menentukan masa aktif kedaluwarsa cookie dalam satuan **detik** sejak diterbitkan (misalnya `Max-Age=86400` untuk masa berlaku 24 jam). Setelah waktu tersebut habis, peramban secara otomatis memusnahkan cookie tersebut dari penyimpanan lokal. | **Session Hijacking / Replay Attack Berkepanjangan:**<br>Mengurangi risiko penyalahgunaan token sesi yang sudah usang jika perangkat pengguna tertinggal, dicuri, atau jika token sesi lama berhasil didapatkan oleh penyerang di kemudian hari. |
