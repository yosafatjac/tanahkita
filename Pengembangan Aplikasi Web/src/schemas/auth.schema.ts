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
    .min(8, "Kata sandi minimal 8 karakter"),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;
