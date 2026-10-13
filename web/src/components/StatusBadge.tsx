import React from "react";
import { ClaimStatus } from "../types/claim";

interface StatusBadgeProps {
  status: ClaimStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "TERVERIFIKASI_ADAT":
      return (
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300"
          aria-label="Status: Terverifikasi Tetua Adat"
        >
          <svg
            className="w-3.5 h-3.5 text-emerald-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          Terverifikasi Adat
        </span>
      );

    case "MENUNGGU_VERIFIKASI":
      return (
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-950 border border-amber-300"
          aria-label="Status: Menunggu Verifikasi Tetua"
        >
          <svg
            className="w-3.5 h-3.5 text-amber-700 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Menunggu Verifikasi
        </span>
      );

    case "DALAM_SENGKETA":
      return (
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-950 border border-rose-300"
          aria-label="Status: Dalam Mediasi Sengketa"
        >
          <svg
            className="w-3.5 h-3.5 text-rose-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Dalam Sengketa
        </span>
      );

    default:
      return null;
  }
}
