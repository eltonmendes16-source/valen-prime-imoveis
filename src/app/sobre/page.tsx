import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Sobre" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Sobre" titulo={<>{SITE.consultor}, <em>{SITE.cargo.toLowerCase()}</em></>} texto="A Valen Prime Imóveis une análise financeira e atendimento direto para quem compra, vende ou investe no ABC paulista." />
      <section className="bg-snow py-16"><div className="container-page max-w-2xl space-y-5 text-lg leading-relaxed text-charcoal/80">
        <p>Meu trabalho é ler cada empreendimento com cuidado, conferir ficha, book, memorial e tabela, e traduzir isso em números que fazem sentido para a sua decisão.</p>
        <p>Atendo lançamentos de alto padrão, médio padrão e compactos, além de locação e serviços como documentação, financiamento, regularização e avaliação.</p>
        <p className="text-sm text-muted">{SITE.creci ? `Registro profissional: ${SITE.creci}.` : "Registro profissional (CRECI) em processo."}</p>
        <div className="flex flex-wrap gap-3 pt-2"><Link href="/imoveis" className="btn btn-gold">Ver empreendimentos</Link><a href={SITE.siteInstitucional} className="btn btn-line" target="_blank" rel="noopener noreferrer">Valen Prime Strategy</a></div>
      </div></section>
    </>
  );
}
