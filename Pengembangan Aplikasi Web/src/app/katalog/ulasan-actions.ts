"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { skemaUlasan, skemaUbahUlasan } from "@/lib/skema";
import { bacaSesi } from "@/lib/sesi";
import type { FormActionState } from "@/schemas/types";

export async function tambahUlasan(
  itemId: number,
  _prev: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const rawData = {
    nama: formData.get("nama")?.toString() || "",
    nilai: formData.get("nilai")?.toString() || "",
    komentar: formData.get("komentar")?.toString() || "",
  };

  const hasil = skemaUlasan.safeParse(rawData);
  if (!hasil.success) {
    return {
      success: false,
      message: "Terdapat kesalahan pengisian ulasan.",
      fieldErrors: z.flattenError(hasil.error).fieldErrors,
      fields: rawData,
    };
  }

  try {
    await prisma.ulasan.create({
      data: {
        nama: hasil.data.nama,
        nilai: hasil.data.nilai,
        komentar: hasil.data.komentar,
        itemId,
      },
    });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return {
          success: false,
          message: "Anda sudah pernah mengulas wilayah ulayat ini.",
          fieldErrors: {
            nama: ["Nama ini sudah mengulas item ini"],
          },
          fields: rawData,
        };
      }
      if (e.code === "P2003") {
        return {
          success: false,
          message: "Item wilayah ulayat tidak ditemukan.",
          fields: rawData,
        };
      }
    }
    throw e;
  }

  revalidatePath("/katalog");
  revalidatePath(`/katalog/${itemId}`);
  return {
    success: true,
    message: "Ulasan kesaksian adat berhasil disimpan.",
  };
}

/**
 * Operasi Update (U) pada Entitas ke-2 (Ulasan) — Melengkapi CRUD Penuh Kedua Entitas
 * Dilengkapi pemeriksaan ABAC/RBAC kepemilikan jika sesi berperan sebagai Pemohon Adat.
 */
export async function ubahUlasan(
  id: number,
  itemId: number,
  _prev: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const rawData = {
    nilai: formData.get("nilai")?.toString() || "",
    komentar: formData.get("komentar")?.toString() || "",
  };

  const hasil = skemaUbahUlasan.safeParse(rawData);
  if (!hasil.success) {
    return {
      success: false,
      message: "Terdapat kesalahan pada pembaruan ulasan.",
      fieldErrors: z.flattenError(hasil.error).fieldErrors,
      fields: rawData,
    };
  }

  // Pemeriksaan ABAC (Ownership) apabila sedang login sebagai Pemohon Adat (mencegah BOLA/IDOR)
  const sesi = await bacaSesi();
  const targetUlasan = await prisma.ulasan.findUnique({ where: { id } });

  if (!targetUlasan || targetUlasan.itemId !== itemId) {
    return {
      success: false,
      message: "Ulasan kesaksian tidak ditemukan atau sudah dihapus.",
      fields: rawData,
    };
  }

  if (
    sesi &&
    sesi.peran === "Pemohon Adat" &&
    targetUlasan.nama.toLowerCase() !== sesi.nama.toLowerCase()
  ) {
    return {
      success: false,
      message: "403 Forbidden: Pemohon Adat hanya diizinkan mengubah kesaksian miliknya sendiri.",
      fields: rawData,
    };
  }

  try {
    await prisma.ulasan.update({
      where: { id },
      data: {
        nilai: hasil.data.nilai,
        komentar: hasil.data.komentar,
      },
    });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return {
        success: false,
        message: "Ulasan tidak ditemukan atau sudah dihapus.",
        fields: rawData,
      };
    }
    throw e;
  }

  revalidatePath("/katalog");
  revalidatePath(`/katalog/${itemId}`);
  return {
    success: true,
    message: "Perubahan ulasan kesaksian berhasil disimpan.",
  };
}

export async function hapusUlasan(id: number, itemId: number) {
  const sesi = await bacaSesi();
  if (sesi && sesi.peran === "Pemohon Adat") {
    const target = await prisma.ulasan.findUnique({ where: { id } });
    if (target && target.nama.toLowerCase() !== sesi.nama.toLowerCase()) {
      throw new Error("403 Forbidden: Pemohon Adat tidak berwenang menghapus kesaksian pengguna lain.");
    }
  }
  await prisma.ulasan.deleteMany({ where: { id, itemId } });
  revalidatePath("/katalog");
  revalidatePath(`/katalog/${itemId}`);
}
