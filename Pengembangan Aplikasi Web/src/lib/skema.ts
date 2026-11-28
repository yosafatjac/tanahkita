/**
 * Modul 5–8 — Skema Validasi Terpusat (Formulir Server Actions & RESTful API v1)
 */

import { z } from "zod";

// Ekspor skema lama (Modul 5–7) tetap dipertahankan agar formulir web tidak rusak
export * from "@/schemas";
export { ulayatSchema as skemaItem } from "@/schemas/ulayat.schema";
export { skemaUbahItem } from "@/schemas/item-edit.schema";
export { loginSchema as skemaMasuk } from "@/schemas/auth.schema";
export { skemaUlasan, skemaUbahUlasan } from "@/schemas/ulasan.schema";

// ============================================================================
// Modul 8 — Skema Validasi RESTful API (/api/v1) dengan Zod 4
// ============================================================================

export const KATEGORI = [
  "HutanAdat",
  "ZonaSagu",
  "PesisirUlayat",
  "LembahKeramat",
  "PerkebunanKomunal",
] as const;

// Aturan field dasar entitas Item (tanpa .default agar aman untuk .partial() pada PATCH)
export const skemaItemDasar = z.object({
  judul: z
    .string({ error: "Judul wilayah ulayat wajib diisi" })
    .trim()
    .min(3, "Judul minimal 3 karakter")
    .max(80, "Judul maksimal 80 karakter"),
  kategori: z.enum(KATEGORI, { error: "Kategori tidak dikenal" }),
  distrik: z
    .string({ error: "Distrik wajib berupa teks" })
    .trim()
    .min(3, "Distrik minimal 3 karakter")
    .max(80, "Distrik maksimal 80 karakter"),
  luasHektar: z
    .number({ error: "Luas hektar harus berupa angka" })
    .positive("Luas hektar harus lebih dari 0")
    .max(100000, "Luas hektar maksimal 100.000"),
  deskripsi: z
    .string({ error: "Deskripsi wajib diisi" })
    .trim()
    .min(3, "Deskripsi minimal 3 karakter")
    .max(500, "Deskripsi maksimal 500 karakter"),
});

// POST /api/v1/item: JSON bertipe; distrik, luasHektar, dan tersedia memiliki nilai bawaan bila tidak dikirim
export const skemaItemBaru = skemaItemDasar.extend({
  distrik: skemaItemDasar.shape.distrik.default("Kuala Kencana"),
  luasHektar: skemaItemDasar.shape.luasHektar.default(10),
  tersedia: z.boolean({ error: "Tersedia harus berupa boolean" }).default(true),
});

// PATCH /api/v1/item/{id}: semua field opsional, tetapi minimal satu field wajib dikirim
export const skemaItemUbah = skemaItemDasar
  .extend({
    tersedia: z.boolean({ error: "Tersedia harus berupa boolean" }),
  })
  .partial()
  .refine((o) => Object.values(o).some((v) => v !== undefined), {
    error: "Kirim minimal satu field yang diubah.",
  });

// GET /api/v1/item: parameter kueri paginasi & filter kategori (batas maks. 50)
export const skemaKueriItem = z.object({
  halaman: z.coerce.number().int().min(1).default(1),
  batas: z.coerce.number().int().min(1).max(50).default(10),
  kategori: z.enum(KATEGORI, { error: "Kategori tidak dikenal" }).optional(),
});

// Parameter path {id}: wajib bilangan bulat positif
export const skemaId = z.coerce.number().int().positive();

export type MasukanItemBaru = z.infer<typeof skemaItemBaru>;
export type MasukanItemUbah = z.infer<typeof skemaItemUbah>;
export type KueriItem = z.infer<typeof skemaKueriItem>;
