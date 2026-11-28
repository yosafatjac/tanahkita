import type { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { bacaJson, galatValidasi, problem } from "@/lib/api/problem";
import { skemaItemBaru, skemaKueriItem } from "@/lib/skema";

// GET /api/v1/item?halaman=1&batas=10&kategori=HutanAdat
export async function GET(request: NextRequest) {
  const kueri = skemaKueriItem.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!kueri.success) {
    return problem(400, "Bad Request", {
      detail: "Parameter kueri tidak valid.",
      errors: z.flattenError(kueri.error).fieldErrors,
    });
  }

  const { halaman, batas, kategori } = kueri.data;
  const where = kategori ? { kategori } : {};

  const [data, total] = await prisma.$transaction([
    prisma.item.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (halaman - 1) * batas,
      take: batas,
    }),
    prisma.item.count({ where }),
  ]);

  return Response.json({ data, meta: { halaman, batas, total } });
}

// POST /api/v1/item
export async function POST(request: Request) {
  const body = await bacaJson(request);
  if (!body.ok) return body.res; // 400: body bukan JSON valid

  const hasil = skemaItemBaru.safeParse(body.data);
  if (!hasil.success) return galatValidasi(hasil.error); // 422: gagal validasi Zod

  try {
    const item = await prisma.item.create({ data: hasil.data });
    return Response.json(item, {
      status: 201,
      headers: { Location: `/api/v1/item/${item.id}` },
    });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return problem(409, "Conflict", {
        detail: `Item dengan judul "${hasil.data.judul}" sudah terdaftar.`,
      });
    }
    throw e;
  }
}
