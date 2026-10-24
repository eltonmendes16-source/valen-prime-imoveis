import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { BlogLista } from "@/components/BlogLista";
import { BoletimForm } from "@/components/BoletimForm";
import { CATEGORIAS, POSTS } from "@/lib/blog";

export const metadata: Metadata = { title: "Blog", description: "Artigos, insights de mercado imobiliário e financeiro, lançamentos e financiamento." };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Blog" titulo={<>Conteúdo para decidir <em>melhor</em></>} />
      <section className="bg-paper py-16 text-ink"><div className="container-page"><BlogLista posts={POSTS.map(({ html, corpo, ...resto }) => ({ ...resto, corpo: [] }))} categorias={CATEGORIAS} /></div></section>
      <section className="bg-snow py-12"><div className="container-page max-w-xl"><BoletimForm id="boletim-blog" /></div></section>
    </>
  );
}
