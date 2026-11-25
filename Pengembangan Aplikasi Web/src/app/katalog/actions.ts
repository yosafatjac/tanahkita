"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ulayatSchema, type FormActionState } from "@/schemas";
import { bacaSesi } from "@/lib/sesi";

// Helper konversi kategori formulir ke Enum Prisma
function toKategoriEnum(kat: string): "HutanAdat" | "ZonaSagu" | "PesisirUlayat" | "LembahKeramat" | "PerkebunanKomunal" {
  const map: Record<string, "HutanAdat" | "ZonaSagu" | "PesisirUlayat" | "LembahKeramat" | "PerkebunanKomunal"> = {
    "Hutan Adat": "HutanAdat",
    "Zona Sagu": "ZonaSagu",
    "Pesisir Ulayat": "PesisirUlayat",
    "Lembah Keramat": "LembahKeramat",
    "Perkebunan Komunal": "PerkebunanKomunal",
    HutanAdat: "HutanAdat",
    ZonaSagu: "ZonaSagu",
    PesisirUlayat: "PesisirUlayat",
    LembahKeramat: "LembahKeramat",
    PerkebunanKomunal: "PerkebunanKomunal",
  };
  return map[kat] || "HutanAdat";
}

/**
 * Aksi Simpan Ulayat dari Form Tambah (Modul 5 -> Modul 6 CRUD PostgreSQL)
 */
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

  // 1. Sesi: Verifikasi otorisasi Tetua/Pengelola Adat
  const sesi = await bacaSesi();
  if (!sesi) {
    return {
      success: false,
      message: "Silakan masuk terlebih dahulu sebagai Tetua/Verifikator Adat untuk mendaftarkan ulayat.",
      fields: rawFields,
    };
  }

  // 2. Validasi Zod 4 Schema
  const validasi = ulayatSchema.safeParse(rawFields);
  if (!validasi.success) {
    return {
      success: false,
      message: "Terdapat kesalahan pengisian formulir. Periksa kolom yang bertanda merah.",
      fieldErrors: z.flattenError(validasi.error).fieldErrors,
      fields: rawFields,
    };
  }

  // 3. Mutasi PostgreSQL 18 via Prisma ORM 7
  try {
    await prisma.item.create({
      data: {
        judul: validasi.data.nama,
        kategori: toKategoriEnum(validasi.data.kategori),
        distrik: validasi.data.distrik,
        luasHektar: validasi.data.luasHektar,
        deskripsi: validasi.data.deskripsi,
        tersedia: true,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        message: `Ulayat dengan nama "${validasi.data.nama}" sudah terdaftar di arsip adat Mimika.`,
        fieldErrors: {
          nama: ["Nama wilayah ulayat ini sudah tercatat di dalam arsip."],
        },
        fields: rawFields,
      };
    }
    console.error("simpanUlayatAction gagal:", error);
    return {
      success: false,
      message: "Data ulayat gagal disimpan ke basis data PostgreSQL. Silakan coba lagi.",
      fields: rawFields,
    };
  }

  revalidatePath("/katalog");
  redirect("/katalog?berhasil=tambah");
}

/**
 * Aksi Standar Modul 6: Tambah Item
 */
export async function tambahItem(
  _prev: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const judul = formData.get("judul")?.toString() || "";
  const kategori = toKategoriEnum(formData.get("kategori")?.toString() || "");
  const distrik = formData.get("distrik")?.toString() || "Kuala Kencana";
  const luasHektar = parseFloat(formData.get("luasHektar")?.toString() || "10");
  const deskripsi = formData.get("deskripsi")?.toString() || "";
  const tersedia = formData.get("tersedia") === "on" || formData.get("tersedia") === "true";

  if (!judul || judul.length < 3) {
    return {
      success: false,
      message: "Judul minimal 3 karakter.",
      fieldErrors: { judul: ["Judul minimal 3 karakter"] },
    };
  }

  try {
    await prisma.item.create({
      data: {
        judul,
        kategori,
        distrik,
        luasHektar,
        deskripsi,
        tersedia,
      },
    });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        success: false,
        message: "Judul item sudah terdaftar",
        fieldErrors: { judul: ["Judul item sudah terdaftar"] },
      };
    }
    throw e;
  }

  revalidatePath("/katalog");
  return { success: true, message: "Item tersimpan." };
}

/**
 * Aksi Standar Modul 6: Ubah Item
 */
export async function ubahItem(
  id: number,
  _prev: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const deskripsi = formData.get("deskripsi")?.toString().trim() || "";
  const tersedia = formData.get("tersedia") === "on" || formData.get("tersedia") === "true";

  // Pemeriksaan RBAC apabila sedang login sebagai Pemohon Adat (BFLA Prevention)
  const sesi = await bacaSesi();
  if (sesi && sesi.peran === "Pemohon Adat") {
    return {
      success: false,
      message: "403 Forbidden: Peran Pemohon Adat tidak berwenang mengubah status arsip wilayah ulayat.",
    };
  }

  if (deskripsi.length < 10) {
    return {
      success: false,
      message: "Deskripsi patok batas minimal 10 karakter.",
      fieldErrors: { deskripsi: ["Deskripsi patok batas minimal 10 karakter."] },
    };
  }

  try {
    await prisma.item.update({
      where: { id },
      data: { deskripsi, tersedia },
    });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return {
          success: false,
          message: "Judul item sudah terdaftar",
          fieldErrors: { judul: ["Judul item sudah terdaftar"] },
        };
      }
      if (e.code === "P2025") {
        return {
          success: false,
          message: "Item tidak ditemukan atau sudah dihapus.",
        };
      }
    }
    throw e;
  }

  revalidatePath("/katalog");
  revalidatePath(`/katalog/${id}`);
  return { success: true, message: "Perubahan disimpan." };
}

/**
 * Aksi Standar Modul 6: Hapus Item Beserta Seluruh Ulasannya (Transaksi Atomik)
 */
export async function hapusItem(id: number) {
  const sesi = await bacaSesi();
  if (sesi && sesi.peran !== "Tetua Adat") {
    throw new Error(
      `403 Forbidden: Hanya Tetua Adat (Admin) yang berwenang menghapus arsip wilayah ulayat secara permanen (peran saat ini: ${sesi.peran}).`
    );
  }
  await prisma.$transaction([
    prisma.ulasan.deleteMany({ where: { itemId: id } }),
    prisma.item.delete({ where: { id } }),
  ]);
  revalidatePath("/katalog");
  redirect("/katalog");
}
