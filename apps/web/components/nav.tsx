"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, PeopleIcon, UploadIcon } from "./icons";

const ITEMS = [
  { href: "/", label: "Upcoming", Icon: CalendarIcon },
  { href: "/people", label: "People", Icon: PeopleIcon },
  { href: "/import", label: "Import", Icon: UploadIcon },
];

function useActive() {
  const path = usePathname();
  return (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
}

/** Sidebar on wide screens. */
export function SideNav() {
  const isActive = useActive();
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {ITEMS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={`flex h-11 items-center gap-3 rounded-xl px-3 font-medium ${
            isActive(href) ? "bg-pine-tint font-bold text-pine-ink" : "text-body hover:bg-subtle"
          }`}
        >
          <Icon />
          {label}
        </Link>
      ))}
    </nav>
  );
}

/** Bottom tab bar on phones. */
export function TabBar() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-line bg-card px-2 pt-2 pb-[max(env(safe-area-inset-bottom),12px)] md:hidden"
    >
      {ITEMS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={`flex flex-col items-center gap-1 py-1.5 text-xs ${
            isActive(href) ? "font-bold text-pine-ink" : "font-medium text-muted"
          }`}
        >
          <Icon size={24} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
