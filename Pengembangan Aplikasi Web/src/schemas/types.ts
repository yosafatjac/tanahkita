/**
 * TanahKita — Tipe Data Generik untuk Form Validation & Action State
 * Modul 5: Formulir, Validasi, Session, dan Cookie
 */

export interface FormActionState<TData = unknown> {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  fields?: Record<string, string | number | boolean | undefined>;
  data?: TData;
  timestamp?: number;
}
