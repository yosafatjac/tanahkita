/**
 * TanahKita — Skema Validasi Pendaftaran Ulayat Adat Mimika (Zod 4)
 * Folder Khusus: src/schemas/
 * Modul 5: Formulir, Validasi, Session, dan Cookie
 */

import { z } from "zod";

export const DISTRIK_MIMIKA = [
  "Kuala Kencana",
  "Kwamki Narama",
  "Tembagapura",
  "Agimuga",
  "Mimika Baru",
  "Mimika Timur",
  "Iwaka",
] as const;

export const KATEGORI_ULAYAT = [
  "Hutan Adat",
  "Zona Sagu",
  "Pesisir Ulayat",
  "Lembah Keramat",
  "Perkebunan Komunal",
] as const;

export const ulayatSchema = z.object({
  nama: z
    .string({ error: "Nama ulayat wajib diisi" })
    .trim()
    .min(3, "Nama ulayat minimal 3 karakter")
    .max(100, "Nama ulayat maksimal 100 karakter"),

  kategori: z.enum(KATEGORI_ULAYAT, {
    error: "Pilih kategori ulayat resmi dari daftar",
  }),

  distrik: z.enum(DISTRIK_MIMIKA, {
    error: "Pilih distrik resmi Kabupaten Mimika",
  }),

  kampung: z
    .string({ error: "Nama kampung wajib diisi" })
    .trim()
    .min(3, "Nama kampung minimal 3 karakter")
    .max(80, "Nama kampung maksimal 80 karakter"),

  margaPengelola: z
    .string({ error: "Marga pengelola wajib diisi" })
    .trim()
    .min(3, "Marga pengelola minimal 3 karakter (contoh: Marga Magal)")
    .max(80, "Marga pengelola maksimal 80 karakter"),

  luasHektar: z.coerce
    .number({ error: "Luas wilayah harus berupa angka valid" })
    .positive("Luas wilayah harus lebih dari 0 hektar")
    .max(100000, "Luas wilayah maksimal 100.000 hektar"),

  deskripsi: z
    .string({ error: "Deskripsi ulayat wajib diisi" })
    .trim()
    .min(10, "Deskripsi ulayat minimal 10 karakter untuk kelengkapan arsip")
    .max(1000, "Deskripsi ulayat maksimal 1.000 karakter"),

  titikKoordinat: z
    .string({ error: "Titik koordinat wajib diisi" })
    .trim()
    .min(5, "Titik koordinat wajib diisi (contoh: 4°25'12.4\"S 136°52'45.8\"E)"),

  persetujuanBatasAdat: z
    .stringbool()
    .default(false)
    .refine((val) => val === true, {
      error: "Persetujuan batas adat dengan suku/marga tetangga wajib disepakati",
    }),
});

export type UlayatSchemaInput = z.infer<typeof ulayatSchema>;
