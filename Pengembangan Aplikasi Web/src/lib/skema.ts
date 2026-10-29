/**
 * Modul 5 — Re-export skema Zod dari folder khusus src/schemas/
 * Memenuhi keselarasan rubrik modul dan struktur modular skema.
 */

export * from "@/schemas";
export { ulayatSchema as skemaItem } from "@/schemas/ulayat.schema";
export { loginSchema as skemaMasuk } from "@/schemas/auth.schema";
