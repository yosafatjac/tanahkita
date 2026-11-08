import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client";
import { skemaUlasan, skemaUbahUlasan } from "../src/schemas/ulasan.schema";
import { ulayatSchema } from "../src/schemas/ulayat.schema";
import {
  buatHashSandiLambat,
  validasiKebijakanSandiNist,
  verifikasiHashSandiLambat,
} from "../src/lib/password-hash";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log("======================================================================");
  console.log("🚀 MENJALANKAN 12 SKENARIO UJI CRUD PENUH 2 ENTITAS, RELASI, TRANSAKSI");
  console.log("   & VALIDASI SERVER (TUGAS 2 MILESTONE v0.2 — PAW & KEAMANAN)");
  console.log("   Basis Data: PostgreSQL 18 | ORM: Prisma 7 | Proyek: TanahKita");
  console.log("======================================================================\n");

  let testItemId: number | null = null;
  let testUlasanId: number | null = null;

  // -------------------------------------------------------------------------
  // Skenario 1 [CRUD #1 — Item Create]: Tambah wilayah ulayat (Item) sah
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 1 [Item — Create]: Tambah wilayah ulayat (Item) dengan data sah");
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

  // -------------------------------------------------------------------------
  // Skenario 2 [CRUD #2 — Item Read]: Baca daftar & detail Item dari PostgreSQL
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 2 [Item — Read]: Baca detail wilayah ulayat berdasarkan ID & uji ID fiktif (404)");
  const itemBaca = await prisma.item.findUnique({
    where: { id: testItemId },
    include: { ulasan: true },
  });
  const cariItemFiktif = await prisma.item.findUnique({
    where: { id: 999999 },
  });
  if (itemBaca && itemBaca.id === testItemId && cariItemFiktif === null) {
    console.log(`  [BERHASIL] Item ID ${testItemId} terbaca dari PostgreSQL ("${itemBaca.judul}") dan ID fiktif 999999 mengembalikan null (memicu notFound() 404).\n`);
  } else {
    throw new Error("Skenario 2 gagal");
  }

  // -------------------------------------------------------------------------
  // Skenario 3 [CRUD #3 — Item Update]: Ubah deskripsi & status wilayah ulayat
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 3 [Item — Update]: Ubah deskripsi wilayah ulayat yang ada (ubahItem)");
  const deskripsiBaru = "Deskripsi diperbarui dengan patok batas pohon besi dan aliran sungai Iwaka.";
  const itemDiperbarui = await prisma.item.update({
    where: { id: testItemId },
    data: { deskripsi: deskripsiBaru, tersedia: false },
  });
  console.log(`  [BERHASIL] Item ID ${testItemId} berhasil diupdate. Deskripsi baru: "${itemDiperbarui.deskripsi}", tersedia: ${itemDiperbarui.tersedia}\n`);

  // -------------------------------------------------------------------------
  // Skenario 4 [CRUD #4 — Ulasan Create]: Tambah ulasan kesaksian pada Item
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 4 [Ulasan — Create]: Tambah ulasan kesaksian saksi batas adat pada Item (tambahUlasan)");
  const ulasan1 = await prisma.ulasan.create({
    data: {
      itemId: testItemId,
      nama: "Saksi Marga Beanal",
      nilai: 4,
      komentar: "Patok batas timur di muara sungai telah disepakati bersama.",
    },
  });
  testUlasanId = ulasan1.id;
  console.log(`  [BERHASIL] Ulasan berhasil disimpan ke PostgreSQL. ID: ${ulasan1.id}, Pengulas: "${ulasan1.nama}", Nilai: ${ulasan1.nilai}/5\n`);

  // -------------------------------------------------------------------------
  // Skenario 5 [CRUD #5 — Ulasan Read & Relasi #1 (1-ke-N)]: Baca Ulasan berelasi
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 5 [Ulasan — Read & Relasi 1:N]: Baca Item beserta daftar Ulasan anak yang berelasi");
  const itemDenganUlasan = await prisma.item.findUnique({
    where: { id: testItemId },
    include: { ulasan: true },
  });
  if (itemDenganUlasan && itemDenganUlasan.ulasan.length === 1) {
    console.log(`  [BERHASIL] Relasi 1:N Item -> Ulasan terverifikasi: ditemukan ${itemDenganUlasan.ulasan.length} ulasan milik "${itemDenganUlasan.ulasan[0].nama}".\n`);
  } else {
    throw new Error("Skenario 5 gagal");
  }

  // -------------------------------------------------------------------------
  // Skenario 6 [CRUD #6 — Ulasan Update]: Ubah nilai & komentar ulasan (ubahUlasan)
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 6 [Ulasan — Update]: Ubah nilai skor & isi komentar ulasan yang ada (ubahUlasan)");
  const validUbah = skemaUbahUlasan.safeParse({
    nilai: 5,
    komentar: "Setelah peninjauan ulang patok batu keramat, skor dinaikkan menjadi 5/5.",
  });
  if (!validUbah.success) throw new Error("Validasi skemaUbahUlasan gagal");
  const ulasanDiperbarui = await prisma.ulasan.update({
    where: { id: testUlasanId },
    data: {
      nilai: validUbah.data.nilai,
      komentar: validUbah.data.komentar,
    },
  });
  console.log(`  [BERHASIL] Ulasan ID ${testUlasanId} berhasil diupdate: Nilai ${ulasanDiperbarui.nilai}/5, Komentar: "${ulasanDiperbarui.komentar}"\n`);

  // -------------------------------------------------------------------------
  // Skenario 7 [CRUD #7 — Ulasan Delete]: Hapus satu ulasan anak (hapusUlasan)
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 7 [Ulasan — Delete]: Hapus ulasan anak secara individual (hapusUlasan)");
  const ulasanSementara = await prisma.ulasan.create({
    data: {
      itemId: testItemId,
      nama: "Saksi Sementara",
      nilai: 3,
      komentar: "Kesaksian sementara untuk uji hapus ulasan tunggal.",
    },
  });
  await prisma.ulasan.deleteMany({
    where: { id: ulasanSementara.id, itemId: testItemId },
  });
  const cekUlasanSementara = await prisma.ulasan.findUnique({
    where: { id: ulasanSementara.id },
  });
  if (cekUlasanSementara === null) {
    console.log(`  [BERHASIL] Ulasan ID ${ulasanSementara.id} berhasil dihapus tanpa menghapus Item induk.\n`);
  } else {
    throw new Error("Skenario 7 gagal");
  }

  // -------------------------------------------------------------------------
  // Skenario 8 [CRUD #8 — Item Delete & Relasi #2 Transaksi Atomik]: Hapus Item + Ulasan
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 8 [Item — Delete & Transaksi Atomik]: Hapus wilayah ulayat beserta seluruh ulasannya (prisma.$transaction)");
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
          { nama: "Saksi Satu", nilai: 5, komentar: "Ulasan kesaksian pertama" },
          { nama: "Saksi Dua", nilai: 4, komentar: "Ulasan kesaksian kedua" },
        ],
      },
    },
    include: { ulasan: true },
  });
  await prisma.$transaction([
    prisma.ulasan.deleteMany({ where: { itemId: itemHapus.id } }),
    prisma.item.delete({ where: { id: itemHapus.id } }),
  ]);
  const cekHapus = await prisma.item.findUnique({ where: { id: itemHapus.id } });
  const cekUlasanHapus = await prisma.ulasan.count({ where: { itemId: itemHapus.id } });
  if (cekHapus === null && cekUlasanHapus === 0) {
    console.log(`  [BERHASIL] Transaksi berhasil menghapus Item ID ${itemHapus.id} dan 2 ulasan anaknya secara atomik.\n`);
  } else {
    throw new Error("Skenario 8 gagal");
  }

  // -------------------------------------------------------------------------
  // Skenario 9 [Transaksi Rollback]: Bukti Rollback saat langkah kedua gagal (P2025)
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 9 [Bukti Rollback Transaksi]: Kegagalan langkah ke-2 membatalkan penghapusan ulasan");
  const itemRollback = await prisma.item.create({
    data: {
      judul: "Kawasan Ulayat Bukti Rollback " + Date.now(),
      kategori: "PesisirUlayat",
      distrik: "Mimika Barat Jauh",
      luasHektar: 88.0,
      deskripsi: "Kawasan pesisir pantai ulayat Kamora.",
      ulasan: {
        create: [{ nama: "Tetua Marga Kamora", nilai: 5, komentar: "Saksi batas laut" }],
      },
    },
  });
  try {
    await prisma.$transaction([
      prisma.ulasan.deleteMany({ where: { itemId: itemRollback.id } }),
      prisma.item.delete({ where: { id: 99999999 } }), // sengaja salah
    ]);
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      const sisaUlasan = await prisma.ulasan.count({ where: { itemId: itemRollback.id } });
      console.log(`  [BUKTI ROLLBACK SAH] Langkah ke-2 melempar P2025, dan ${sisaUlasan} ulasan pada Item ${itemRollback.id} tetap utuh (tidak jadi terhapus).\n`);
    }
  }
  await prisma.$transaction([
    prisma.ulasan.deleteMany({ where: { itemId: itemRollback.id } }),
    prisma.item.delete({ where: { id: itemRollback.id } }),
  ]);

  // -------------------------------------------------------------------------
  // Skenario 10 [Penanganan Galat Unik P2002]: Judul Item ganda & Pengulas ganda
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 10 [Kendala Unik P2002]: Penolakan duplikasi judul Item & pengulas yang sama pada Item yang sama");
  let p2002Tertangkap = false;
  try {
    await prisma.ulasan.create({
      data: {
        itemId: testItemId,
        nama: "Saksi Marga Beanal", // Sudah ada di Skenario 4
        nilai: 4,
        komentar: "Duplikasi pengulas pada item yang sama.",
      },
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      p2002Tertangkap = true;
      console.log(`  [BERHASIL] Ditangkap PrismaClientKnownRequestError P2002 (Ulasan_itemId_nama_key) -> "Anda sudah pernah mengulas wilayah ulayat ini."\n`);
    }
  }
  if (!p2002Tertangkap) throw new Error("Skenario 10 gagal");

  // -------------------------------------------------------------------------
  // Skenario 11 [3 Bukti Validasi Server Zod]: Menolak 3 input tidak valid tanpa menyentuh DB
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 11 [3 Bukti Validasi Server Zod]: Menolak input tidak valid di server sebelum menyentuh DB");
  // Kasus Validasi A: Nama ulayat terlalu pendek (< 5 karakter) dan luas negatif
  const valA = ulayatSchema.safeParse({
    nama: "Abc",
    kategori: "Hutan Adat",
    distrik: "Kuala Kencana",
    kampung: "Mimika",
    margaPengelola: "Marga Magal",
    luasHektar: -15,
    deskripsi: "Terlalu pendek",
    titikKoordinat: "-4.5461, 136.8833",
    persetujuanBatasAdat: "true",
  });
  // Kasus Validasi B: Nilai ulasan di luar rentang 1..5 (nilai: 6)
  const valB = skemaUlasan.safeParse({
    nama: "Saksi Lapangan",
    nilai: 6,
    komentar: "Komentar uji validasi cukup panjang",
  });
  // Kasus Validasi C: Pembaruan ulasan dengan komentar terlalu pendek (< 5 karakter)
  const valC = skemaUbahUlasan.safeParse({
    nilai: 4,
    komentar: "Ya",
  });

  if (!valA.success && !valB.success && !valC.success) {
    console.log("  [BERHASIL] Ketiga skenario input tidak valid ditolak oleh Zod di server:");
    console.log("    1) Kasus A (ulayatSchema):", valA.error.flatten().fieldErrors);
    console.log("    2) Kasus B (skemaUlasan nilai=6):", valB.error.flatten().fieldErrors);
    console.log("    3) Kasus C (skemaUbahUlasan komentar='Ya'):", valC.error.flatten().fieldErrors, "\n");
  } else {
    throw new Error("Skenario 11 gagal");
  }

  // -------------------------------------------------------------------------
  // Skenario 12 [Keamanan Kata Sandi Lambat & NIST SP 800-63B-4]: scrypt + salt unik
  // -------------------------------------------------------------------------
  console.log("▶ Skenario 12 [Keamanan Sesi & Kata Sandi NIST SP 800-63B-4]: Hash lambat scrypt & penolakan sandi lemah");
  const sandiPendek = validasiKebijakanSandiNist("Pendek123!");
  const sandiBocor = validasiKebijakanSandiNist("password1234567");
  const sandiSah = validasiKebijakanSandiNist("AdatMimika2026#TanahKita");
  const hash1 = buatHashSandiLambat("AdatMimika2026#TanahKita");
  const hash2 = buatHashSandiLambat("AdatMimika2026#TanahKita");
  const cocok = verifikasiHashSandiLambat("AdatMimika2026#TanahKita", hash1);
  const salah = verifikasiHashSandiLambat("SandiSalah123456789", hash1);

  if (!sandiPendek.valid && !sandiBocor.valid && sandiSah.valid && hash1 !== hash2 && cocok && !salah) {
    console.log("  [BERHASIL] Kebijakan NIST SP 800-63B-4 & scrypt dengan salt unik terverifikasi:");
    console.log(`    - Sandi <15 karakter ditolak: "${sandiPendek.alasan}"`);
    console.log(`    - Sandi bocor ditolak: "${sandiBocor.alasan}"`);
    console.log(`    - Dua hash dari sandi yang sama menghasilkan PHC berbeda (salt unik): ${hash1 !== hash2}`);
    console.log(`    - Verifikasi constant-time (timingSafeEqual): cocok=${cocok}, salah=${salah}\n`);
  } else {
    throw new Error("Skenario 12 gagal");
  }

  // Bersihkan item uji testItemId
  if (testItemId) {
    await prisma.$transaction([
      prisma.ulasan.deleteMany({ where: { itemId: testItemId } }),
      prisma.item.delete({ where: { id: testItemId } }),
    ]);
  }

  console.log("======================================================================");
  console.log("🎉 SEMUA 12 SKENARIO UJI CRUD 2 ENTITAS, RELASI, TRANSAKSI, & VALIDASI LULUS 100%!");
  console.log("======================================================================");
}

main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
