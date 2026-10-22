import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { POSTS } from "@/lib/blog";

export const metadata: Metadata = { title: "Blog", description: "Artigos sobre lançamentos, financiamento e mercado imobiliário." };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Blog" titulo={<>Conteúdo para decidir <em>melhor</em></>} />
      <section className="bg-paper py-16 text-ink"><div className="container-page grid gap-6 md:grid-cols-3">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-md border border-ink/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl">
            <p className="font-mono text-[11px] uppercase tracking-wider text-golddark">{p.categoria} · {p.leitura} min</p>
            <h2 className="mt-3 font-serif text-xl font-semibold leading-snug group-hover:text-golddark">{p.titulo}</h2>
            <p className="mt-3 text-sm text-mutedink">{p.resumo}</p>
          </Link>
        ))}
      </div></section>
    </>
  );
}
