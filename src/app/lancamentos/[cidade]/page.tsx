import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { EmpCard } from "@/components/EmpCard";
import { LeadForm } from "@/components/LeadForm";
import { CIDADES_PAGINA, SEGMENTO_LABEL, getCidade } from "@/lib/emp";
import { SITE } from "@/lib/site";

export function generateStaticParams() { return CIDADES_PAGINA.map((c) => ({ cidade: c.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ cidade: string }> }): Promise<Metadata> {
  const { cidade } = await params;
  const c = getCidade(cidade);
  if (!c) return {};
  const t = `Apartamentos na planta em ${c.nome}: lançamentos`;
  const d = `${c.emps.length} empreendimento(s) em ${c.nome} (ABC paulista): plantas, metragens, lazer e previsão de entrega. Atendimento direto com consultor.`;
  return { title: t, description: d, alternates: { canonical: `/lancamentos/${c.slug}` }, openGraph: { title: t, description: d } };
}

export default async function Page({ params }: { params: Promise<{ cidade: string }> }) {
  const { cidade } = await params;
  const c = getCidade(cidade);
  if (!c) notFound();
  const bairros = Array.from(new Set(c.emps.map((e) => e.bairro).filter(Boolean))) as string[];
  const segs = Array.from(new Set(c.emps.map((e) => SEGMENTO_LABEL[e.segmento]))).filter(Boolean);
  const outras = CIDADES_PAGINA.filter((x) => x.slug !== c.slug);
  const base = SITE.url.replace(/\/$/, "");
  const faq = [
    { p: `Quantos lançamentos há em ${c.nome} no site?`, r: `Hoje são ${c.emps.length} empreendimento(s) em ${c.nome}${bairros.length ? `, em bairros como ${bairros.slice(0, 4).join(", ")}` : ""}. A lista muda conforme as incorporadoras atualizam os produtos.` },
    { p: "Os preços e condições estão atualizados?", r: "Valores, tabelas e disponibilidade dependem da incorporadora e podem mudar sem aviso. Confirme sempre com o consultor antes de decidir." },
    { p: "Posso simular o financiamento?", r: "Sim. Use o simulador do site para uma estimativa. Ela não é aprovação de crédito: a análise final é do banco." },
  ];
  const ld = {
    "@context": "https://schema.org", "@type": "ItemList", name: `Lançamentos em ${c.nome}`,
    itemListElement: c.emps.map((e, i) => ({ "@type": "ListItem", position: i + 1, url: `${base}/empreendimentos/${e.id}`, name: e.nome })),
  };
  const ldFaq = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.p, acceptedAnswer: { "@type": "Answer", text: f.r } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([ld, ldFaq]) }} />
      <PageHero eyebrow="Lançamentos" titulo={`Apartamentos na planta em ${c.nome}`} texto={`${c.emps.length} empreendimento(s) selecionados${segs.length ? `: ${segs.join(", ").toLowerCase()}` : ""}. Compare plantas, metragens e lazer, e fale direto com o consultor.`} />
      <section className="bg-snow py-16"><div className="container-page">
        {bairros.length > 0 && <p className="mb-6 text-sm text-muted">Bairros: {bairros.join(" · ")}</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{c.emps.map((e) => <EmpCard key={e.id} emp={e} />)}</div>
        <p className="mt-8 max-w-2xl text-xs text-muted">Informações das incorporadoras, sujeitas a alteração sem aviso. Imagens e plantas são ilustrativas. Confirme valores e condições com o consultor.</p>
      </div></section>
      <section className="bg-paper py-16"><div className="container-page grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="h-display text-3xl">Perguntas <em>frequentes</em></h2>
          <div className="mt-6 space-y-5">{faq.map((f) => <div key={f.p}><h3 className="font-semibold text-ink">{f.p}</h3><p className="mt-1 text-charcoal/80">{f.r}</p></div>)}</div>
          <p className="mt-8 text-sm text-muted">Outras cidades: {outras.map((o, i) => <span key={o.slug}>{i > 0 && " · "}<Link href={`/lancamentos/${o.slug}`} className="underline">{o.nome}</Link></span>)}</p>
        </div>
        <LeadForm titulo={`Quero receber opções em ${c.nome}`} interesseInicial={c.nome} />
      </div></section>
    </>
  );
}
