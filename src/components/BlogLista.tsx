"use client";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIAS, POSTS } from "@/lib/blog";

// Lista do blog com abas por assunto (artigos, insights de mercado, mercado financeiro etc.).
export function BlogLista() {
  const [aba, setAba] = useState("Todos");
  const abas = ["Todos", ...CATEGORIAS];
  const lista = [...POSTS].sort((a, b) => b.data.localeCompare(a.data)).filter((p) => aba === "Todos" || p.categoria === aba);
  return (
    <>
      <div role="tablist" aria-label="Assuntos do blog" className="mb-8 flex flex-wrap gap-2">
        {abas.map((a) => {
          const n = a === "Todos" ? POSTS.length : POSTS.filter((p) => p.categoria === a).length;
          return (
            <button key={a} role="tab" aria-selected={aba === a} onClick={() => setAba(a)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${aba === a ? "bg-ink text-paper" : "bg-white text-ink ring-1 ring-ink/15 hover:ring-gold"}`}>
              {a} <span className="opacity-60">({n})</span>
            </button>
          );
        })}
      </div>
      {lista.length === 0 ? (
        <p className="rounded-md border border-ink/10 bg-white p-8 text-center text-mutedink">Novos conteúdos desta área em breve.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {lista.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-md border border-ink/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl">
              <p className="font-mono text-[11px] uppercase tracking-wider text-golddark">{p.categoria} · {p.leitura} min</p>
              <h2 className="mt-3 font-serif text-xl font-semibold leading-snug group-hover:text-golddark">{p.titulo}</h2>
              <p className="mt-3 text-sm text-mutedink">{p.resumo}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
