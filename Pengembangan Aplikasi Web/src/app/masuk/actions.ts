"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { loginSchema, type FormActionState } from "@/schemas";
import { buatSesi, hapusSesi } from "@/lib/sesi";

// Akun Tetua Adat Mock Terdaftar untuk Pengujian Praktikum (Mendukung .env.local DEMO_EMAIL)
const AKUN_TETUA = [
  {
    email: process.env.DEMO_EMAIL || "tetua.magal@tanahkita.id",
    kataSandi: process.env.DEMO_KATA_SANDI || "AdatMimika2026",
    nama: "Tuankou Silas Magal",
    peran: "Tetua Adat" as const,
    marga: "Marga Magal",
  },
  {
    email: "tetua.omaleng@tanahkita.id",
    kataSandi: "AdatMimika2026",
    nama: "Elieser Omaleng",
    peran: "Verifikator Adat" as const,
    marga: "Marga Omaleng",
  },
];

export async function masukAction(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const rawEmail = formData.get("email")?.toString().trim() || "";
  const rawKataSandi = formData.get("kataSandi")?.toString() || "";

  // 1. Validasi Bentuk via Zod 4 Schema & z.flattenError
  const validasi = loginSchema.safeParse({
    email: rawEmail,
    kataSandi: rawKataSandi,
  });

  if (!validasi.success) {
    return {
      success: false,
      message: "Kredensial tidak valid. Silakan periksa format isian Anda.",
      fieldErrors: z.flattenError(validasi.error).fieldErrors,
      fields: { email: rawEmail },
    };
  }

  // 2. Validasi Kredensial / Akun
  const akunDitemukan = AKUN_TETUA.find(
    (akun) => akun.email.toLowerCase() === validasi.data.email.toLowerCase()
  );

  if (!akunDitemukan || akunDitemukan.kataSandi !== validasi.data.kataSandi) {
    return {
      success: false,
      message: "Email atau kata sandi salah.",
      fieldErrors: {
        email: ["Email atau kata sandi salah."],
      },
      fields: { email: rawEmail },
    };
  }

  // 3. Buat Sesi Cookie HttpOnly di Penyimpanan Server
  await buatSesi({
    email: akunDitemukan.email,
    nama: akunDitemukan.nama,
    peran: akunDitemukan.peran,
    marga: akunDitemukan.marga,
  });

  // 4. Redirect ke halaman tambah katalog (di luar try-catch)
  redirect("/katalog/tambah");
}

export async function masukCepatTetuaAction(): Promise<void> {
  // Pintasan instan untuk pengujian laboratorium
  await buatSesi({
    email: process.env.DEMO_EMAIL || "tetua.magal@tanahkita.id",
    nama: "Tuankou Silas Magal",
    peran: "Tetua Adat",
    marga: "Marga Magal",
  });
  redirect("/katalog/tambah");
}

export async function keluarAction(): Promise<void> {
  await hapusSesi();
  redirect("/katalog");
}
