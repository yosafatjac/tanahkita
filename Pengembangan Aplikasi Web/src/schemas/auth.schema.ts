/**
 * TanahKita — Skema Validasi Autentikasi Masuk Tetua Adat (Zod 4)
 * Folder Khusus: src/schemas/
 * Modul 5: Formulir, Validasi, Session, dan Cookie
 */

import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Format email tidak sah (contoh: tetua@tanahkita.id)"),

  kataSandi: z
    .string({ error: "Kata sandi wajib diisi" })
    .min(15, "Kata sandi minimal 15 karakter sesuai standar NIST SP 800-63B-4")
    .max(128, "Kata sandi maksimal 128 karakter"),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;
