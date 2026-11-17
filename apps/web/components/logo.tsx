/** Pine tile with an apricot sun: the calm base with a hint of celebration. */
export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden className="relative h-8 w-8 overflow-hidden rounded-[10px] bg-[#1f4d3f]">
        <span className="absolute -right-2 -bottom-2 h-5 w-5 rounded-full bg-[#f2a65a]" />
      </span>
      <span className="text-xl font-extrabold tracking-tight">Rem</span>
    </span>
  );
}
