/**
 * TanahKita — Skema Validasi Pembaruan Item Wilayah Ulayat (Modul 7 — Zod 4)
 * Menggunakan z.stringbool() untuk memetakan "true" -> true dan "false" -> false
 * secara ketat (menutup galat z.coerce.boolean() yang mengubah "false" menjadi true).
 */

import { z } from "zod";

export const skemaUbahItem = z.object({
  deskripsi: z
    .string({ error: "Deskripsi patok batas wajib diisi." })
    .trim()
    .min(10, "Deskripsi patok batas minimal 10 karakter.")
    .max(1000, "Deskripsi patok batas maksimal 1.000 karakter."),
  // Zod 4: hanya menerima "true" -> true dan "false" -> false (menolak "1", "yes", "on", dll.)
  tersedia: z.stringbool({
    truthy: ["true"],
    falsy: ["false"],
    error: "Status ketersediaan harus bernilai true atau false.",
  }),
});

export type MasukanUbahItem = z.infer<typeof skemaUbahItem>;
