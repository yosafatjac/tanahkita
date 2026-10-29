import { proxy } from "./proxy";

// Next.js 15 runtime compatibility untuk konvensi proxy.ts Modul 5
export const middleware = proxy;

export const config = {
  matcher: ["/katalog/tambah"],
};
