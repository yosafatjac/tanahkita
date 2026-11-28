import { z } from "zod";
import { skemaId } from "@/lib/skema";

export function problem(
  status: number,
  title: string,
  extra: Record<string, unknown> = {},
) {
  return Response.json(
    { type: "about:blank", title, status, ...extra },
    { status, headers: { "Content-Type": "application/problem+json" } },
  );
}

export function galatValidasi(error: z.ZodError) {
  const { formErrors, fieldErrors } = z.flattenError(error);
  return problem(422, "Unprocessable Content", {
    detail: formErrors[0] ?? "Data tidak lolos validasi.",
    errors: fieldErrors,
  });
}

export async function bacaJson(request: Request) {
  try {
    return { ok: true as const, data: (await request.json()) as unknown };
  } catch {
    const res = problem(400, "Bad Request", {
      detail: "Body harus JSON yang valid.",
    });
    return { ok: false as const, res };
  }
}

export async function bacaId(params: Promise<{ id: string }>) {
  const hasil = skemaId.safeParse((await params).id);
  return hasil.success ? hasil.data : null;
}
