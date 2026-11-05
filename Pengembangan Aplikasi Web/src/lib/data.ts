import "server-only";
import { prisma } from "@/lib/prisma";
import type { Item } from "@/lib/tipe";

const kolomItem = {
  id: true,
  judul: true,
  kategori: true,
  distrik: true,
  luasHektar: true,
  deskripsi: true,
  tersedia: true,
  gambar: true,
  dibuatPada: true,
} as const;

export async function ambilDaftarItem(): Promise<Item[]> {
  return prisma.item.findMany({
    select: {
      ...kolomItem,
      ulasan: {
        select: { id: true, nama: true, nilai: true, komentar: true, dibuatPada: true, itemId: true },
        orderBy: { dibuatPada: "desc" },
      },
    },
    orderBy: { dibuatPada: "desc" },
  });
}

export async function ambilItem(id: number) {
  return prisma.item.findUnique({
    where: { id },
    select: {
      ...kolomItem,
      ulasan: {
        select: { id: true, nama: true, nilai: true, komentar: true, dibuatPada: true, itemId: true },
        orderBy: { dibuatPada: "desc" },
      },
    },
  });
}
