import { z } from "zod";

export const skemaUlasan = z.object({
  nama: z
    .string({ error: "Nama pengulas wajib diisi" })
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(60, "Nama maksimal 60 karakter"),
  nilai: z.coerce
    .number({ error: "Nilai skor verifikasi harus berupa angka" })
    .int("Nilai harus bilangan bulat")
    .min(1, "Nilai minimal 1")
    .max(5, "Nilai maksimal 5"),
  komentar: z
    .string({ error: "Komentar atau kesaksian wajib diisi" })
    .trim()
    .min(5, "Komentar minimal 5 karakter")
    .max(500, "Komentar maksimal 500 karakter"),
});

export const skemaUbahUlasan = z.object({
  nilai: z.coerce
    .number({ error: "Nilai skor verifikasi harus berupa angka" })
    .int("Nilai harus bilangan bulat")
    .min(1, "Nilai minimal 1")
    .max(5, "Nilai maksimal 5"),
  komentar: z
    .string({ error: "Komentar atau kesaksian wajib diisi" })
    .trim()
    .min(5, "Komentar minimal 5 karakter")
    .max(500, "Komentar maksimal 500 karakter"),
});

export type SkemaUlasanInput = z.infer<typeof skemaUlasan>;
export type SkemaUbahUlasanInput = z.infer<typeof skemaUbahUlasan>;
