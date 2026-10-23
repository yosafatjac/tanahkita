"use client";

import { useId, useState } from "react";

export default function KolomCatatan({ label }: { label: string }) {
  const id = useId();
  const [catatan, setCatatan] = useState("");

  return (
    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 text-sm shadow-sm">
      <label htmlFor={id} className="block font-semibold text-stone-800">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Ketik catatan pengujian..."
        className="mt-2 block w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-stone-900 shadow-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700"
      />
    </div>
  );
}
