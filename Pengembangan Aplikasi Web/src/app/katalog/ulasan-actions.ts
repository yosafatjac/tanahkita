"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { skemaUlasan } from "@/lib/skema";
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

export async function hapusUlasan(id: number, itemId: number) {
  await prisma.ulasan.deleteMany({ where: { id, itemId } });
  revalidatePath("/katalog");
  revalidatePath(`/katalog/${itemId}`);
}
