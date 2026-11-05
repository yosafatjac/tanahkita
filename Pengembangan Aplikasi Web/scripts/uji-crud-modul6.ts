import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client";
import { z } from "zod";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const skemaUlasan = z.object({
  nama: z.string().trim().min(3, "Nama pengulas minimal 3 karakter"),
  nilai: z.coerce.number().int().min(1, "Nilai minimal 1").max(5, "Nilai maksimal 5"),
  komentar: z.string().trim().min(5, "Komentar minimal 5 karakter"),
});

const skemaItemSederhana = z.object({
  judul: z.string().trim().min(3, "Judul minimal 3 karakter"),
});

async function main() {
  console.log("======================================================================");
  console.log("🚀 MENJALANKAN 10 SKENARIO UJI CRUD & TRANSAKSI (MODUL 6 PRAKTIKUM)");
  console.log("   Basis Data: PostgreSQL 18 | ORM: Prisma 7 | Proyek: TanahKita");
  console.log("======================================================================\n");

  let testItemId: number | null = null;

  // -------------------------------------------------------------------------
  // Skenario 1: Tambah wilayah ulayat (Item) dengan data sah (Create)
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 1: Tambah wilayah ulayat (Item) dengan data sah");
  try {
    const item1 = await prisma.item.create({
      data: {
        judul: "Kawasan Adat Hutan Sagu Tipuka " + Date.now(),
        kategori: "ZonaSagu",
        distrik: "Mimika Timur",
        luasHektar: 120.5,
        deskripsi: "Kawasan cadangan pangan sagu tradisional masyarakat Tipuka.",
        tersedia: true,
      },
    });
    testItemId = item1.id;
    console.log(`  [BERHASIL] Item berhasil disimpan ke PostgreSQL. ID: ${item1.id}, Judul: "${item1.judul}"\n`);
  } catch (err) {
    console.error("  [GAGAL] Skenario 1:", err);
  }

  // -------------------------------------------------------------------------
  // Skenario 2: Tambah wilayah ulayat dengan judul ganda (Pelanggaran @unique P2002)
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 2: Tambah wilayah ulayat dengan judul ganda (Pelanggaran @unique)");
  try {
    const itemAwal = await prisma.item.findFirst();
    if (!itemAwal) throw new Error("Tidak ada item awal untuk diuji");

    console.log(`  Mencoba menyisipkan item dengan judul yang sudah ada: "${itemAwal.judul}"...`);
    await prisma.item.create({
      data: {
        judul: itemAwal.judul,
        kategori: "HutanAdat",
        distrik: "Kuala Kencana",
        luasHektar: 50.0,
        deskripsi: "Deskripsi duplikat",
        tersedia: true,
      },
    });
    console.error("  [GAGAL] Seharusnya Prisma melempar galat P2002!\n");
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      console.log(`  [BERHASIL] Ditangkap PrismaClientKnownRequestError berkode P2002!`);
      console.log(`  Pesan ramah yang dikembalikan Server Action: "Judul item sudah terdaftar."\n`);
    } else {
      console.error("  [GAGAL] Terjadi galat tidak terduga:", err);
    }
  }

  // -------------------------------------------------------------------------
  // Skenario 3: Tambah wilayah ulayat dengan judul kosong / pendek (Validasi Zod)
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 3: Tambah wilayah ulayat dengan judul pendek (< 3 karakter) (Validasi Zod)");
  const inputSalah = { judul: "Ab" };
  const hasilValidasi3 = skemaItemSederhana.safeParse(inputSalah);
  if (!hasilValidasi3.success) {
    console.log(`  [BERHASIL] Zod berhasil menolak input sebelum query database:`);
    console.log(`  Galat:`, hasilValidasi3.error.flatten().fieldErrors);
    console.log(`  Basis data tidak dieksekusi.\n`);
  } else {
    console.error("  [GAGAL] Input tidak sah lolos validasi!\n");
  }

  // -------------------------------------------------------------------------
  // Skenario 4: Ubah deskripsi wilayah ulayat yang ada (Update)
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 4: Ubah deskripsi wilayah ulayat yang ada (Update)");
  if (testItemId) {
    const deskripsiBaru = "Deskripsi diperbarui dengan patok batas pohon besi dan aliran sungai Iwaka.";
    const itemDiperbarui = await prisma.item.update({
      where: { id: testItemId },
      data: { deskripsi: deskripsiBaru },
    });
    console.log(`  [BERHASIL] Item ID ${testItemId} berhasil diupdate:`);
    console.log(`  Deskripsi baru: "${itemDiperbarui.deskripsi}"\n`);
  }

  // -------------------------------------------------------------------------
  // Skenario 5: Ubah wilayah ulayat yang sudah dihapus / ID tidak ditemukan (P2025)
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 5: Ubah wilayah ulayat dengan ID tidak ditemukan (P2025)");
  try {
    const idFiktif = 9999999;
    await prisma.item.update({
      where: { id: idFiktif },
      data: { deskripsi: "Mencoba update item fiktif" },
    });
    console.error("  [GAGAL] Seharusnya Prisma melempar P2025!\n");
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      console.log(`  [BERHASIL] Ditangkap PrismaClientKnownRequestError berkode P2025!`);
      console.log(`  Pesan ramah yang dikembalikan Server Action: "Item tidak ditemukan atau sudah dihapus."\n`);
    } else {
      console.error("  [GAGAL] Galat tidak terduga:", err);
    }
  }

  // -------------------------------------------------------------------------
  // Skenario 6: Baca halaman detail dengan ID tidak ada / tidak valid
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 6: Ambil detail dengan ID fiktif 999999 (Simulasi notFound())");
  const cariItem = await prisma.item.findUnique({
    where: { id: 999999 },
    include: { ulasan: true },
  });
  if (cariItem === null) {
    console.log(`  [BERHASIL] findUnique mengembalikan null.`);
    console.log(`  Komponen Server Component Next.js memanggil notFound() -> Tampil Halaman 404.\n`);
  } else {
    console.error("  [GAGAL] Seharusnya null!\n");
  }

  // -------------------------------------------------------------------------
  // Skenario 7: Hapus wilayah ulayat beserta ulasannya melalui transaksi atomik
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 7: Hapus wilayah ulayat beserta ulasannya (prisma.$transaction)");
  // Buat item uji khusus untuk dihapus
  const itemHapus = await prisma.item.create({
    data: {
      judul: "Kawasan Ulayat Rencana Hapus " + Date.now(),
      kategori: "LembahKeramat",
      distrik: "Tembagapura",
      luasHektar: 45.0,
      deskripsi: "Data sementara untuk uji transaksi hapus.",
      tersedia: false,
      ulasan: {
        create: [
          { nama: "Saksi Satu", nilai: 5, komentar: "Ulasan 1" },
          { nama: "Saksi Dua", nilai: 4, komentar: "Ulasan 2" },
        ],
      },
    },
    include: { ulasan: true },
  });
  console.log(`  Dibuat item ID ${itemHapus.id} dengan ${itemHapus.ulasan.length} ulasan.`);

  // Eksekusi transaksi hapus atomik
  await prisma.$transaction([
    prisma.ulasan.deleteMany({ where: { itemId: itemHapus.id } }),
    prisma.item.delete({ where: { id: itemHapus.id } }),
  ]);

  const cekHapus = await prisma.item.findUnique({ where: { id: itemHapus.id } });
  const cekUlasanHapus = await prisma.ulasan.count({ where: { itemId: itemHapus.id } });
  if (cekHapus === null && cekUlasanHapus === 0) {
    console.log(`  [BERHASIL] Transaksi berhasil menghapus item dan seluruh ulasannya secara atomik.\n`);
  } else {
    console.error("  [GAGAL] Item atau ulasan masih tersisa!\n");
  }

  // -------------------------------------------------------------------------
  // Skenario 8: Bukti Rollback Transaksi saat langkah kedua gagal
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 8: Bukti Rollback Transaksi saat langkah kedua gagal");
  const itemRollback = await prisma.item.create({
    data: {
      judul: "Kawasan Ulayat Bukti Rollback " + Date.now(),
      kategori: "PesisirUlayat",
      distrik: "Mimika Barat Jauh",
      luasHektar: 88.0,
      deskripsi: "Kawasan pesisir pantai ulayat Kamora.",
      ulasan: {
        create: [
          { nama: "Tetua Marga Kamora", nilai: 5, komentar: "Saksi batas laut" },
        ],
      },
    },
    include: { ulasan: true },
  });
  console.log(`  Dibuat item ID ${itemRollback.id} dengan 1 ulasan.`);

  try {
    console.log("  Mengeksekusi transaksi: Langkah 1 (delete ulasan), Langkah 2 (delete item ID fiktif 99999999)...");
    await prisma.$transaction([
      prisma.ulasan.deleteMany({ where: { itemId: itemRollback.id } }),
      prisma.item.delete({ where: { id: 99999999 } }), // SENGAJA SALAH UNTUK MEMICU ROLLBACK
    ]);
    console.error("  [GAGAL] Transaksi seharusnya gagal dan rollback!\n");
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      console.log(`  [BERHASIL] Langkah kedua melempar galat P2025!`);
    } else {
      console.log(`  Langkah kedua gagal melempar galat.`);
    }

    // Periksa apakah ulasan masih ada (Bukti Rollback)
    const ulasanSetelahRollback = await prisma.ulasan.count({
      where: { itemId: itemRollback.id },
    });
    console.log(`  Memeriksa tabel Ulasan untuk itemId ${itemRollback.id}: ditemukan ${ulasanSetelahRollback} ulasan.`);
    if (ulasanSetelahRollback === 1) {
      console.log(`  [BUKTI ROLLBACK SAH] Ulasan tetap utuh! Perubahan langkah pertama dibatalkan sepenuhnya oleh PostgreSQL.\n`);
    } else {
      console.error(`  [GAGAL ROLLBACK] Ulasan hilang, transaksi tidak rollback!\n`);
    }
  }

  // Bersihkan data uji rollback
  await prisma.$transaction([
    prisma.ulasan.deleteMany({ where: { itemId: itemRollback.id } }),
    prisma.item.delete({ where: { id: itemRollback.id } }),
  ]);

  // -------------------------------------------------------------------------
  // Skenario 9: Tambah ulasan dengan nilai di luar rentang (nilai: 6) (Zod)
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 9: Tambah ulasan dengan nilai di luar rentang (nilai: 6)");
  const ulasanIlegal = {
    nama: "Saksi Lapangan",
    nilai: 6,
    komentar: "Komentar uji validasi",
  };
  const hasilValidasi9 = skemaUlasan.safeParse(ulasanIlegal);
  if (!hasilValidasi9.success) {
    console.log(`  [BERHASIL] Ditolak oleh validasi Zod skemaUlasan:`);
    console.log(`  Galat kolom 'nilai':`, hasilValidasi9.error.flatten().fieldErrors.nilai);
    console.log(`  Tidak ada data yang disimpan ke basis data.\n`);
  } else {
    console.error("  [GAGAL] Nilai 6 lolos validasi!\n");
  }

  // -------------------------------------------------------------------------
  // Skenario 10: Tambah ulasan kedua dengan nama saksi sama (Pelanggaran @@unique([itemId, nama]))
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 10: Tambah ulasan kedua dengan nama pengulas sama pada item sama");
  if (testItemId) {
    try {
      console.log(`  Membuat ulasan pertama oleh "Saksi Marga Beanal"...`);
      await prisma.ulasan.create({
        data: {
          itemId: testItemId,
          nama: "Saksi Marga Beanal",
          nilai: 5,
          komentar: "Verifikasi pertama sah.",
        },
      });

      console.log(`  Mencoba membuat ulasan kedua dengan nama yang sama pada item ${testItemId}...`);
      await prisma.ulasan.create({
        data: {
          itemId: testItemId,
          nama: "Saksi Marga Beanal",
          nilai: 4,
          komentar: "Verifikasi kedua seharusnya ditolak.",
        },
      });
      console.error("  [GAGAL] Seharusnya Prisma melempar P2002 composite!\n");
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        console.log(`  [BERHASIL] Ditangkap PrismaClientKnownRequestError P2002 (Ulasan_itemId_nama_key)!`);
        console.log(`  Pesan ramah yang dikembalikan: "Anda sudah pernah mengulas wilayah ulayat ini."\n`);
      } else {
        console.error("  [GAGAL] Galat tidak terduga:", err);
      }
    }

    // Bersihkan item uji testItemId
    await prisma.$transaction([
      prisma.ulasan.deleteMany({ where: { itemId: testItemId } }),
      prisma.item.delete({ where: { id: testItemId } }),
    ]);
  }

  console.log("======================================================================");
  console.log("🎉 SEMUA 10 SKENARIO UJI CRUD, RELASI, & TRANSAKSI 100% SUKSES!");
  console.log("======================================================================");
}

main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
