"use client";
import { useEffect, useState } from "react";

export function Leitor({ id, pgs, nome }: { id: string; pgs: string[]; nome: string }) {
  const [modo, setModo] = useState<"rolagem" | "pagina">("pagina");
  const [i, setI] = useState(0);
  const n = pgs.length;
  const src = (f: string) => `/empreendimentos/${id}/book/${f}`;
  const ir = (k: number) => setI(Math.max(0, Math.min(n - 1, k)));

  useEffect(() => {
    if (modo !== "pagina") return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); setI((v) => Math.min(n - 1, v + 1)); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); setI((v) => Math.max(0, v - 1)); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [modo, n]);

  useEffect(() => { if (modo === "pagina" && pgs[i + 1]) new Image().src = src(pgs[i + 1]); }); // eslint-disable-line

  return (
    <div>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-ink/10 bg-snow/95 px-4 py-3 backdrop-blur">
        <div className="inline-flex" role="group" aria-label="Modo de leitura">
          <button type="button" onClick={() => setModo("pagina")} className={`btn ${modo === "pagina" ? "btn-gold" : "btn-line"}`}>Página a página</button>
          <button type="button" onClick={() => setModo("rolagem")} className={`btn ml-2 ${modo === "rolagem" ? "btn-gold" : "btn-line"}`}>Rolagem</button>
        </div>
        {modo === "pagina" && (
          <div className="ml-auto flex items-center gap-3 tabular-nums">
            <button type="button" className="btn btn-line" onClick={() => ir(i - 1)} disabled={i === 0} aria-label="Página anterior">‹</button>
            <span className="text-sm text-charcoal/80">{i + 1} / {n}</span>
            <button type="button" className="btn btn-line" onClick={() => ir(i + 1)} disabled={i === n - 1} aria-label="Próxima página">›</button>
          </div>
        )}
      </div>
      <div className="bg-sand px-4 py-6">
        {modo === "pagina" ? (
          <div className="mx-auto flex max-w-6xl justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src(pgs[i])} alt={`${nome}, página ${i + 1}`} className="h-auto max-h-[calc(100vh-140px)] w-auto max-w-full object-contain" />
          </div>
        ) : (
          <div className="mx-auto flex max-w-5xl flex-col gap-4">
            {pgs.map((f, k) => (
              <figure key={f} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src(f)} alt={`${nome}, página ${k + 1}`} loading="lazy" className="h-auto w-full" />
                <figcaption className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] tabular-nums text-white">{k + 1} / {n}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
