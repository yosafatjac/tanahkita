import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { bacaId, bacaJson, galatValidasi, problem } from "@/lib/api/problem";
import { skemaItemUbah } from "@/lib/skema";

type Ctx = { params: Promise<{ id: string }> };

const idTidakSah = () =>
  problem(400, "Bad Request", {
    detail: "id harus bilangan bulat positif.",
  });

const tidakAda = (id: number) =>
  problem(404, "Not Found", {
    detail: `Item ${id} tidak ditemukan.`,
  });

// P2025: rekaman yang akan diubah atau dihapus tidak ditemukan
const rekamanTidakAda = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";

// P2002: pelanggaran unique constraint (judul duplikat)
const judulDuplikat = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

// GET /api/v1/item/{id}
export async function GET(_request: Request, { params }: Ctx) {
  const id = await bacaId(params);
  if (id === null) return idTidakSah();

  const item = await prisma.item.findUnique({ where: { id } });
  return item ? Response.json(item) : tidakAda(id);
}

// PATCH /api/v1/item/{id}: ubah sebagian field; body kosong {} ditolak 422
export async function PATCH(request: Request, { params }: Ctx) {
  const id = await bacaId(params);
  if (id === null) return idTidakSah();

  const body = await bacaJson(request);
  if (!body.ok) return body.res;

  const hasil = skemaItemUbah.safeParse(body.data);
  if (!hasil.success) return galatValidasi(hasil.error);

  try {
    const item = await prisma.item.update({
      where: { id },
      data: hasil.data,
    });
    return Response.json(item);
  } catch (e: unknown) {
    if (rekamanTidakAda(e)) return tidakAda(id);
    if (judulDuplikat(e)) {
      return problem(409, "Conflict", {
        detail: "Judul wilayah ulayat sudah terdaftar pada item lain.",
      });
    }
    throw e;
  }
}

// DELETE /api/v1/item/{id}: tolak 409 bila item masih memiliki ulasan (onDelete: Restrict)
export async function DELETE(_request: Request, { params }: Ctx) {
  const id = await bacaId(params);
  if (id === null) return idTidakSah();

  const jumlahUlasan = await prisma.ulasan.count({ where: { itemId: id } });
  if (jumlahUlasan > 0) {
    return problem(409, "Conflict", {
      detail: `Item ${id} masih memiliki ${jumlahUlasan} ulasan.`,
    });
  }

  try {
    await prisma.item.delete({ where: { id } });
  } catch (e: unknown) {
    if (rekamanTidakAda(e)) return tidakAda(id);
    throw e;
  }

  return new Response(null, { status: 204 });
}
