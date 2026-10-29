"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ulayatSchema, type FormActionState } from "@/schemas";
import { tambahKatalogItem, cekNamaDuplikat } from "@/data/mockKatalog";
import { bacaSesi } from "@/lib/sesi";

export async function simpanUlayatAction(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const rawFields: Record<string, string | number | boolean | undefined> = {
    nama: formData.get("nama")?.toString() || "",
    kategori: formData.get("kategori")?.toString() || "",
    distrik: formData.get("distrik")?.toString() || "",
    kampung: formData.get("kampung")?.toString() || "",
    margaPengelola: formData.get("margaPengelola")?.toString() || "",
    luasHektar: formData.get("luasHektar")?.toString() || "",
    deskripsi: formData.get("deskripsi")?.toString() || "",
    titikKoordinat: formData.get("titikKoordinat")?.toString() || "",
    persetujuanBatasAdat: formData.get("persetujuanBatasAdat")?.toString() || "false",
  };

  // 1. Sesi: Verifikasi apakah pengguna sudah masuk sebagai Tetua/Pengelola Adat
  const sesi = await bacaSesi();
  if (!sesi) {
    return {
      success: false,
      message: "Silakan masuk terlebih dahulu sebagai Tetua/Verifikator Adat untuk mendaftarkan ulayat.",
      fields: rawFields,
    };
  }

  // 2. Validasi Bentuk: Evaluasi menggunakan Zod 4 Schema & z.flattenError
  const validasi = ulayatSchema.safeParse(rawFields);
  if (!validasi.success) {
    return {
      success: false,
      message: "Terdapat kesalahan pengisian formulir. Periksa kolom yang bertanda merah.",
      fieldErrors: z.flattenError(validasi.error).fieldErrors,
      fields: rawFields,
    };
  }

  // 3. Validasi Semantik: Cek anti-duplikasi nama ulayat adat
  if (cekNamaDuplikat(validasi.data.nama)) {
    return {
      success: false,
      message: `Ulayat dengan nama "${validasi.data.nama}" sudah terdaftar di arsip adat Mimika. Harap gunakan nama atau penamaan zona yang spesifik.`,
      fieldErrors: {
        nama: ["Nama ulayat ini sudah terdaftar dalam sistem adat Mimika."],
      },
      fields: rawFields,
    };
  }

  // 4. Mutasi / Penyimpanan Data (Catat detail di log server bila gagal, kembalikan pesan umum)
  try {
    tambahKatalogItem({
      nama: validasi.data.nama,
      kategori: validasi.data.kategori,
      distrik: validasi.data.distrik,
      kampung: validasi.data.kampung,
      margaPengelola: validasi.data.margaPengelola,
      luasHektar: validasi.data.luasHektar,
      deskripsi: validasi.data.deskripsi,
      titikKoordinat: validasi.data.titikKoordinat,
    });
  } catch (error) {
    console.error("simpanUlayatAction gagal:", error);
    return {
      success: false,
      message: "Data ulayat gagal disimpan ke sistem arsip. Silakan coba lagi.",
      fields: rawFields,
    };
  }

  // 5. Revalidasi cache katalog
  revalidatePath("/katalog");

  // 6. Redirect (di luar blok try/catch)
  redirect("/katalog?berhasil=tambah");
}
