import React from "react";
import KolomCatatan from "@/components/KolomCatatan";

// Template menerima key unik per segmen anak, sehingga
// isinya dipasang ulang (remount) setiap kali rute anak berganti.
export default function TemplateKatalog({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 mb-2">
          Template Segmen Katalog
        </p>
        <p className="text-xs text-stone-500 mb-4 leading-relaxed">
          Isi template ini otomatis di-remount dan state-nya kembali kosong setiap kali berpindah halaman.
        </p>
        <KolomCatatan label="Catatan di template" />
      </div>
      {children}
    </div>
  );
}
