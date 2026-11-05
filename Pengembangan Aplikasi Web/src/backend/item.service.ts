import "server-only";
import { prisma } from "@/lib/prisma";
import type { Item, Ulasan } from "@/lib/tipe";

export class ItemBackendService {
  static async getAll(): Promise<Item[]> {
    return prisma.item.findMany({
      orderBy: { dibuatPada: "desc" },
      include: {
        ulasan: {
          orderBy: { dibuatPada: "desc" },
        },
      },
    });
  }

  static async getById(id: number): Promise<Item | null> {
    return prisma.item.findUnique({
      where: { id },
      include: {
        ulasan: {
          orderBy: { dibuatPada: "desc" },
        },
      },
    });
  }

  static async create(data: {
    judul: string;
    kategori: "HutanAdat" | "ZonaSagu" | "PesisirUlayat" | "LembahKeramat" | "PerkebunanKomunal";
    distrik: string;
    luasHektar: number;
    deskripsi: string;
    tersedia?: boolean;
    gambar?: string | null;
  }) {
    return prisma.item.create({ data });
  }

  static async update(id: number, data: { deskripsi?: string; tersedia?: boolean }) {
    return prisma.item.update({
      where: { id },
      data,
    });
  }

  static async deleteWithTransaction(id: number) {
    return prisma.$transaction([
      prisma.ulasan.deleteMany({ where: { itemId: id } }),
      prisma.item.delete({ where: { id } }),
    ]);
  }
}
