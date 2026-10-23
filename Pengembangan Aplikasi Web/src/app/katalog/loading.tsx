import React from "react";

export default function LoadingKatalog() {
  return (
    <div role="status" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
      <p className="text-sm font-medium text-stone-600">Memuat katalog wilayah ulayat...</p>
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-stone-200 rounded w-48"></div>
        <div className="h-40 bg-stone-200 rounded-2xl"></div>
        <div className="h-14 bg-stone-100 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-stone-100 rounded-xl border border-stone-200 p-5">
              <div className="h-5 bg-stone-200 rounded w-24 mb-4"></div>
              <div className="h-6 bg-stone-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-stone-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-stone-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
