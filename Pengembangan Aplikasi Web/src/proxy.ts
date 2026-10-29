import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pemeriksaan optimistik: hanya memeriksa keberadaan cookie sebelum halaman dirender
export function proxy(request: NextRequest) {
  const adaSesi =
    request.cookies.has("sesi") || request.cookies.has("tanahkita_sesi_tetua");

  if (!adaSesi) {
    const urlMasuk = new URL("/masuk", request.url);
    urlMasuk.searchParams.set("dari", request.nextUrl.pathname);
    return NextResponse.redirect(urlMasuk);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/katalog/tambah"],
};
