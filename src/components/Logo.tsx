import Link from "next/link";
export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="Valen Prime Imóveis — página inicial">
      <span className="grid h-9 w-9 place-items-center rounded-sm border border-gold text-golddark transition group-hover:bg-gold group-hover:text-ink">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M4 5l8 14 8-14" strokeLinejoin="round" />
          <path d="M9 5l3 5 3-5" strokeLinejoin="round" opacity=".7" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`block font-serif text-[19px] font-semibold ${claro ? "text-ink" : "text-charcoal"}`}>Valen Prime</span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-golddark">Imóveis</span>
      </span>
    </Link>
  );
}
