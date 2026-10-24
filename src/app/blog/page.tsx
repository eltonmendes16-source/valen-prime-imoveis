import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { BlogLista } from "@/components/BlogLista";

export const metadata: Metadata = { title: "Blog", description: "Artigos, insights de mercado imobiliário e financeiro, lançamentos e financiamento." };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Blog" titulo={<>Conteúdo para decidir <em>melhor</em></>} />
      <section className="bg-paper py-16 text-ink"><div className="container-page"><BlogLista /></div></section>
    </>
  );
}
