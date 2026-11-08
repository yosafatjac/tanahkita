"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { loginSchema, type FormActionState } from "@/schemas";
import { buatSesi, hapusSesi } from "@/lib/sesi";
import {
  buatHashSandiLambat,
  validasiKebijakanSandiNist,
  verifikasiHashSandiLambat,
} from "@/lib/password-hash";

const FRASA_SANDI_DEFAULT =
  process.env.DEMO_KATA_SANDI && process.env.DEMO_KATA_SANDI.length >= 15
    ? process.env.DEMO_KATA_SANDI
    : "AdatMimika2026#TanahKita";

/**
 * Daftar Akun Otoritas & Pemohon Adat (RBAC 3 Peran: Tetua Adat, Verifikator Adat, Pemohon Adat)
 * Setiap akun menyimpan hash kata sandi lambat (scrypt N=16384, r=8, p=1) dengan salt CSPRNG 16-byte unik.
 * Tidak ada kata sandi plaintext yang disimpan di dalam objek akun.
 */
const AKUN_TERDAFTAR = [
  {
    email: process.env.DEMO_EMAIL || "tetua.magal@tanahkita.id",
    passwordHash: buatHashSandiLambat(
      FRASA_SANDI_DEFAULT,
      "a1f04c928b3e71d56029ab4ef8123c70"
    ),
    nama: "Tuankou Silas Magal",
    peran: "Tetua Adat" as const,
    marga: "Marga Magal",
  },
  {
    email: "verifikator.omaleng@tanahkita.id",
    passwordHash: buatHashSandiLambat(
      FRASA_SANDI_DEFAULT,
      "b92d81e47c035a6fb14820c9d37e561a"
    ),
    nama: "Elieser Omaleng",
    peran: "Verifikator Adat" as const,
    marga: "Marga Omaleng",
  },
  {
    email: "pemohon.beanal@tanahkita.id",
    passwordHash: buatHashSandiLambat(
      FRASA_SANDI_DEFAULT,
      "c47e19a38f206d5bc93104e8a72f61b3"
    ),
    nama: "Yohanes Beanal",
    peran: "Pemohon Adat" as const,
    marga: "Marga Beanal",
  },
];

// Pembatas laju percobaan masuk (Rate Limiter: maks 3 gagal per 10 detik per email)
interface CatatanPercobaan {
  jumlahGagal: number;
  resetPada: number;
}
const gRate = globalThis as unknown as {
  pembatasMasuk?: Map<string, CatatanPercobaan>;
};
const pembatasMasuk = (gRate.pembatasMasuk ??= new Map<string, CatatanPercobaan>());
const BATAS_GAGAL = 3;
const JENDELA_MS = 10_000;

export async function masukAction(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const rawEmail = formData.get("email")?.toString().trim() || "";
  const rawKataSandi = formData.get("kataSandi")?.toString() || "";
  const kunciRate = rawEmail.toLowerCase() || "anonim";

  // 0. Pemeriksaan Rate Limiting (Mitigasi Brute-Force — RSK-03 / THR-09)
  const sekarang = Date.now();
  const catatan = pembatasMasuk.get(kunciRate);
  if (catatan && catatan.resetPada > sekarang && catatan.jumlahGagal >= BATAS_GAGAL) {
    const sisaDetik = Math.ceil((catatan.resetPada - sekarang) / 1000);
    return {
      success: false,
      message: `429 Too Many Requests: Terlalu banyak percobaan masuk gagal. Silakan tunggu ${sisaDetik} detik sebelum mencoba kembali.`,
      fields: { email: rawEmail },
    };
  }

  // 1. Validasi Kebijakan Kata Sandi NIST SP 800-63B-4
  const cekNist = validasiKebijakanSandiNist(rawKataSandi);
  if (!cekNist.valid) {
    return {
      success: false,
      message: cekNist.alasan || "Kata sandi tidak memenuhi standar NIST SP 800-63B-4.",
      fieldErrors: {
        kataSandi: [cekNist.alasan || "Kata sandi minimal 15 karakter."],
      },
      fields: { email: rawEmail },
    };
  }

  // 2. Validasi Bentuk via Zod 4 Schema & z.flattenError
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

  // 3. Validasi Kredensial dengan Hash Lambat (scrypt + timingSafeEqual)
  const akunDitemukan = AKUN_TERDAFTAR.find(
    (akun) => akun.email.toLowerCase() === validasi.data.email.toLowerCase()
  );

  const hashPembanding =
    akunDitemukan?.passwordHash || AKUN_TERDAFTAR[0].passwordHash;
  const sandiCocok = verifikasiHashSandiLambat(
    validasi.data.kataSandi,
    hashPembanding
  );

  if (!akunDitemukan || !sandiCocok) {
    const riwayat =
      catatan && catatan.resetPada > sekarang
        ? { jumlahGagal: catatan.jumlahGagal + 1, resetPada: catatan.resetPada }
        : { jumlahGagal: 1, resetPada: sekarang + JENDELA_MS };
    pembatasMasuk.set(kunciRate, riwayat);

    return {
      success: false,
      message: "Email atau kata sandi salah.",
      fieldErrors: {
        email: ["Email atau kata sandi salah."],
      },
      fields: { email: rawEmail },
    };
  }

  pembatasMasuk.delete(kunciRate);

  // 4. Buat Sesi Cookie HttpOnly di Penyimpanan Server
  await buatSesi({
    email: akunDitemukan.email,
    nama: akunDitemukan.nama,
    peran: akunDitemukan.peran,
    marga: akunDitemukan.marga,
  });

  // 5. Redirect ke halaman tambah katalog (di luar try-catch)
  redirect("/katalog/tambah");
}

export async function masukCepatTetuaAction(): Promise<void> {
  // Pintasan instan untuk pengujian laboratorium (Peran: Tetua Adat / Admin)
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
