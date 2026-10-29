import "server-only";
import { cookies } from "next/headers";

const NAMA_COOKIE_SESI = "sesi";
const NAMA_COOKIE_ALIAS = "tanahkita_sesi_tetua";
const DELAPAN_JAM = 60 * 60 * 8; // 28.800 detik (8 jam sesuai Tabel 3 Modul 5)

export interface DataSesi {
  email: string;
  nama: string;
  peran: "Tetua Adat" | "Verifikator Adat";
  marga: string;
  kedaluwarsa: number;
}

// Penyimpanan sementara di memori pada globalThis agar bertahan saat Fast Refresh
const g = globalThis as unknown as { sesiTiruan?: Map<string, DataSesi> };
const penyimpanan = (g.sesiTiruan ??= new Map<string, DataSesi>());

export async function ambilSesi(): Promise<DataSesi | null> {
  const cookieStore = await cookies();
  const id =
    cookieStore.get(NAMA_COOKIE_SESI)?.value ||
    cookieStore.get(NAMA_COOKIE_ALIAS)?.value;

  if (!id) return null;

  const sesi = penyimpanan.get(id);
  if (!sesi || sesi.kedaluwarsa < Date.now()) {
    if (sesi) penyimpanan.delete(id);
    return null;
  }

  return sesi;
}

// Alias sesuai konvensi modul praktikum
export const bacaSesi = ambilSesi;

export async function buatSesi(
  data: Omit<DataSesi, "kedaluwarsa">
): Promise<void> {
  const id = crypto.randomUUID();
  const sesiLengkap: DataSesi = {
    ...data,
    kedaluwarsa: Date.now() + DELAPAN_JAM * 1000,
  };

  penyimpanan.set(id, sesiLengkap);

  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: DELAPAN_JAM,
  };

  cookieStore.set(NAMA_COOKIE_SESI, id, cookieOptions);
  cookieStore.set(NAMA_COOKIE_ALIAS, id, cookieOptions);
}

export async function hapusSesi(): Promise<void> {
  const cookieStore = await cookies();
  const id =
    cookieStore.get(NAMA_COOKIE_SESI)?.value ||
    cookieStore.get(NAMA_COOKIE_ALIAS)?.value;

  if (id) {
    penyimpanan.delete(id);
  }

  cookieStore.delete(NAMA_COOKIE_SESI);
  cookieStore.delete(NAMA_COOKIE_ALIAS);
}
