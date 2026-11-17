const TINTS = [
  "bg-apricot-tint text-apricot-ink",
  "bg-sky-tint text-sky-ink",
  "bg-pine-tint text-pine-ink",
  "bg-coral-tint text-coral-ink",
  "bg-sun-tint text-sun-ink",
];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0]![0]! + parts[parts.length - 1]![0]! : (parts[0] ?? "?").slice(0, 1);
  return letters.toUpperCase();
}

/** Initials on a tint picked from the name, so each person keeps the same colour. */
export function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const dims = size === "lg" ? "h-14 w-14 rounded-2xl text-lg" : "h-11 w-11 rounded-xl text-sm";
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center font-bold ${dims} ${TINTS[h % TINTS.length]}`}>
      {initials(name)}
    </span>
  );
}
