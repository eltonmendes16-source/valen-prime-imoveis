export function PageHero({ eyebrow, titulo, texto }: { eyebrow: string; titulo: React.ReactNode; texto?: string }) {
  return (
    <section className="grid-fino border-b border-gold/40 bg-[radial-gradient(700px_300px_at_90%_0%,rgba(193,154,91,.16),transparent_60%),linear-gradient(180deg,#FCFBF8,#F4F0E8)] py-16 sm:py-24">
      <div className="container-page max-w-3xl">
        <p className="eyebrow sobe">{eyebrow}</p>
        <h1 className="h-display sobe sobe-2 mt-4 text-4xl sm:text-6xl">{titulo}</h1>
        {texto && <p className="sobe sobe-3 mt-5 max-w-2xl text-lg leading-relaxed text-charcoal/75">{texto}</p>}
      </div>
    </section>
  );
}
