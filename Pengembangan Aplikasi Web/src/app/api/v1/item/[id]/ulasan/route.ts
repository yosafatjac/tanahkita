import { prisma } from "@/lib/prisma";
import { bacaId, problem } from "@/lib/api/problem";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/v1/item/{id}/ulasan: resource bersarang dari relasi 1:N Modul 6
export async function GET(_request: Request, { params }: Ctx) {
  const id = await bacaId(params);
  if (id === null) {
    return problem(400, "Bad Request", {
      detail: "id harus bilangan bulat positif.",
    });
  }

  const item = await prisma.item.findUnique({
    where: { id },
    select: { ulasan: { orderBy: { id: "desc" } } },
  });

  if (!item) {
    return problem(404, "Not Found", {
      detail: `Item ${id} tidak ditemukan.`,
    });
  }

  return Response.json({ data: item.ulasan });
}
