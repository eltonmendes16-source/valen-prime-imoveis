import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { EmpCard } from "@/components/EmpCard";
import { LeadForm } from "@/components/LeadForm";
import { AMBIENTES, porSegmento } from "@/lib/emp";

export function generateStaticParams() { return AMBIENTES.map((a) => ({ slug: a.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = AMBIENTES.find((x) => x.slug === slug);
  return a ? { title: a.titulo, description: a.resumo } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = AMBIENTES.find((x) => x.slug === slug);
  if (!a) notFound();
  const lista = a.segmento ? porSegmento(a.segmento) : [];
  return (
    <>
      <PageHero eyebrow="Ambiente" titulo={a.titulo} texto={a.texto || a.resumo} />
      {a.segmento ? (
        <section className="bg-snow py-16"><div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{lista.map((e) => <EmpCard key={e.id} emp={e} />)}</div>
          {a.slug === "compactos-mcmv" && <p className="mt-8 max-w-2xl text-xs text-muted">O enquadramento no programa Minha Casa Minha Vida depende de faixa de renda, valor do imóvel e regras vigentes, que mudam com frequência. Confirme antes de decidir.</p>}
        </div></section>
      ) : (
        <section className="bg-snow py-16"><div className="container-page grid gap-10 lg:grid-cols-2">
          <div className="space-y-4 text-charcoal/80">
            <p className="eyebrow">Em breve</p>
            <h2 className="h-display text-3xl">Locação com <em>acompanhamento</em></h2>
            <p>Estou montando a carteira de imóveis para locação. Se você quer alugar ou colocar um imóvel para alugar, deixe seus dados e retorno pelo WhatsApp.</p>
            <p className="text-sm text-muted">Também ajudo com contrato, documentação e avaliação do valor de aluguel.</p>
            <Link href="/servicos" className="btn btn-line">Ver serviços</Link>
          </div>
          <LeadForm titulo="Interesse em locação" interesseInicial="Locação" />
        </div></section>
      )}
    </>
  );
}
