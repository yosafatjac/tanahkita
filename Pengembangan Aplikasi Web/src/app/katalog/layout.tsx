import React from "react";
import KolomCatatan from "@/components/KolomCatatan";

export default function LayoutKatalog({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:grid lg:grid-cols-[18rem_1fr] lg:gap-8">
      <aside aria-label="Panel katalog" className="mb-8 lg:mb-0 space-y-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
            Panel Katalog Ulayat
          </p>
          <p className="text-xs text-stone-500 mt-2 mb-4 leading-relaxed">
            Layout bersarang ini dipertahankan saat Anda bernavigasi ke detail wilayah ulayat.
          </p>
          <KolomCatatan label="Catatan di layout" />
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
}
