export function Secao({ eyebrow, titulo, children, claro = false, className = "", id }: {
  eyebrow?: string; titulo?: React.ReactNode; children: React.ReactNode; claro?: boolean; className?: string; id?: string;
}) {
  return (
    <section id={id} className={`py-20 sm:py-24 ${claro ? "bg-paper text-ink" : "bg-snow text-charcoal"} ${className}`}>
      <div className="container-page">
        {(eyebrow || titulo) && (
          <div className="mb-12 max-w-2xl">
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            {titulo && <h2 className="h-display text-3xl sm:text-5xl">{titulo}</h2>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
