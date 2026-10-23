"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type Tautan = { href: string; label: string };

export default function TautanNav({
  tautan,
  onNavigate,
}: {
  tautan: Tautan[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-1 lg:gap-1.5 text-sm font-medium">
      {tautan.map((t) => {
        const aktif =
          t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <li key={t.href}>
            <Link
              href={t.href}
              onClick={onNavigate}
              aria-current={aktif ? "page" : undefined}
              className={`block px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                aktif
                  ? "bg-amber-800/90 text-white font-semibold underline decoration-2 underline-offset-4"
                  : "text-amber-100/90 hover:bg-amber-900/60 hover:text-amber-200"
              }`}
            >
              {t.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
