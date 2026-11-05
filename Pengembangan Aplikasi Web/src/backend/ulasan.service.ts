import "server-only";
import { prisma } from "@/lib/prisma";

export class UlasanBackendService {
  static async getByItemId(itemId: number) {
    return prisma.ulasan.findMany({
      where: { itemId },
      orderBy: { dibuatPada: "desc" },
    });
  }

  static async create(data: {
    itemId: number;
    nama: string;
    nilai: number;
    komentar: string;
  }) {
    return prisma.ulasan.create({ data });
  }

  static async delete(id: number, itemId: number) {
    return prisma.ulasan.deleteMany({
      where: { id, itemId },
    });
  }
}
