import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Building2, Home, Search, FileText, MessagesSquare, ClipboardList } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { LeadForm } from "@/components/LeadForm";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Avaliação de imóveis e consultoria",
  description: "Opinião de valor de mercado e consultoria para proprietários, investidores e incorporadores no ABC paulista: preço de venda e locação, análise de compra na planta e posicionamento de tabela.",
  alternates: { canonical: "/avaliacao-e-consultoria" },
};

const PUBLICOS = [
  { i: Home, t: "Proprietário e comprador", d: "Quanto vale o seu imóvel hoje, ou se o preço pedido por outro imóvel está coerente com o mercado da região.", it: ["Opinião de valor para vender, comprar ou alugar", "Faixa de preço e prazo provável de venda", "Estratégia de anúncio e negociação"] },
  { i: BarChart3, t: "Investidor", d: "Leitura fria de uma compra na planta ou de um imóvel para renda, com as premissas à vista e sem promessa de retorno.", it: ["Fluxo de pagamento, correção e custo total", "Comparação entre empreendimentos", "Cenários de revenda e de locação"] },
  { i: Building2, t: "Incorporador e construtora", d: "Apoio à formação de preço e à política comercial de lançamentos e de estoque, com base em comparáveis.", it: ["Posicionamento de tabela por tipologia", "Análise de velocidade de vendas e estoque", "Estudo de concorrência na região"] },
];

const PASSOS = [
  { i: ClipboardList, t: "Conversa inicial", d: "Entendemos o objetivo: vender, comprar, alugar, investir ou precificar um lançamento." },
  { i: Search, t: "Levantamento", d: "Reunimos dados do imóvel e comparáveis recentes da região (anúncios, ofertas e lançamentos)." },
  { i: FileText, t: "Análise e parecer", d: "Você recebe um parecer escrito com o valor sugerido, a faixa e as premissas usadas." },
  { i: MessagesSquare, t: "Reunião de entrega", d: "Explicamos os números, tiramos dúvidas e definimos os próximos passos." },
];

export default function Page() {
  const schema = {
    "@context": "https://schema.org", "@type": "Service", name: "Avaliação de imóveis e consultoria imobiliária",
    provider: { "@type": "RealEstateAgent", name: SITE.nome, url: SITE.url }, areaServed: ["Santo André", "São Bernardo do Campo", "São Caetano do Sul"],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHero eyebrow="Avaliação e consultoria" titulo={<>Decida com <em>números</em>, não com palpite</>} texto="Opinião de valor de mercado e consultoria para quem vende, compra, investe ou lança imóveis no ABC paulista." />
      <section className="bg-paper py-16 text-ink"><div className="container-page">
        <div className="grid gap-6 md:grid-cols-3">
          {PUBLICOS.map((p) => (
            <article key={p.t} className="rounded-md border border-ink/10 bg-white p-7">
              <p.i className="text-golddark" size={26} />
              <h2 className="mt-4 font-serif text-2xl font-semibold">{p.t}</h2>
              <p className="mt-2 text-mutedink">{p.d}</p>
              <ul className="mt-4 space-y-1.5 text-sm">{p.it.map((x) => <li key={x} className="border-t border-ink/10 pt-1.5">{x}</li>)}</ul>
            </article>
          ))}
        </div>
      </div></section>

      <section className="bg-snow py-16"><div className="container-page">
        <h2 className="font-serif text-3xl font-semibold text-ink">Como funciona</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map((p, n) => (
            <li key={p.t} className="rounded-md border border-ink/10 bg-sand p-6">
              <p className="font-mono text-xs text-golddark">0{n + 1}</p>
              <p.i className="mt-2 text-golddark" size={22} />
              <h3 className="mt-3 font-serif text-lg font-semibold text-ink">{p.t}</h3>
              <p className="mt-1 text-sm text-mutedink">{p.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 rounded-md border border-gold/40 bg-white p-6 text-sm text-charcoal/80">
          <p className="font-semibold text-ink">O que este serviço é, e o que não é</p>
          <p className="mt-2">Entregamos uma <b>opinião de valor de mercado</b>, com base em comparativos e nas premissas descritas no parecer. Ela não substitui laudo de avaliação de engenharia (por exemplo, para garantia bancária ou ações judiciais), que é feito por profissional habilitado: quando for o caso, indicamos o profissional certo. Também não prometemos valorização nem retorno financeiro.</p>
          <p className="mt-2 text-xs text-muted">Escopo, prazo e valor são combinados por escrito antes de começar.</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#pedido" className="btn btn-gold">Pedir uma avaliação</a>
          <a href={whatsappLink("Olá, Mendes! Quero saber mais sobre avaliação e consultoria imobiliária.")} target="_blank" rel="noopener noreferrer" className="btn btn-line">Falar no WhatsApp</a>
          <Link href="/simulador" className="btn btn-line">Usar o simulador</Link>
        </div>
      </div></section>

      <section id="pedido" className="bg-sand py-16"><div className="container-page max-w-2xl">
        <LeadForm titulo="Pedir avaliação ou consultoria" subtitulo="Conte em poucas linhas o que você precisa. Respondemos pelo WhatsApp para combinar os próximos passos." interesseInicial="Avaliação de imóvel" mensagemInicial="Quero uma avaliação / consultoria. Sobre: " />
      </div></section>
    </>
  );
}
