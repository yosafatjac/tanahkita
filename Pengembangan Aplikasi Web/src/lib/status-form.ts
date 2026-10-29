/**
 * Modul 5 — Tipe Status Formulir (StatusForm & FormActionState)
 * Digunakan bersama useActionState dan Server Actions
 */

import type { FormActionState } from "@/schemas";

export type { FormActionState };

export type StatusForm = {
  galat?: Record<string, string[] | undefined>;
  pesan?: string;
  nilai?: Record<string, string>;
};
