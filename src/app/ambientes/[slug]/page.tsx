import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { EmpCard } from "@/components/EmpCard";
import { LocacaoForm } from "@/components/LocacaoForm";
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
        <>
          <section className="bg-snow py-16"><div className="container-page grid gap-10 lg:grid-cols-2">
            <div className="space-y-4 text-charcoal/80">
              <p className="eyebrow">Locação</p>
              <h2 className="h-display text-3xl">Alugar com <em>acompanhamento</em></h2>
              <p>Para o proprietário: avaliação do valor de aluguel, divulgação, visitas, análise de documentos do interessado e apoio com o contrato. Para quem procura: ajuda para achar o imóvel certo e entender as condições.</p>
              <h3 className="pt-2 font-serif text-xl font-semibold text-ink">Como funciona para o proprietário</h3>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm">
                <li>Você envia os dados do imóvel pelo formulário.</li>
                <li>Conversamos e indicamos uma faixa de aluguel com base em imóveis parecidos da região.</li>
                <li>Divulgamos, agendamos visitas e reunimos a documentação dos interessados.</li>
                <li>Apoiamos a escolha da garantia e a elaboração do contrato.</li>
              </ol>
              <p className="text-sm text-muted">Pela lei do inquilinato, cada contrato aceita apenas uma modalidade de garantia (caução, fiador, seguro-fiança ou título de capitalização). A escolha é combinada entre as partes.</p>
              <p className="text-xs text-muted">Condições, valores de remuneração e prazos são combinados por escrito antes de começar. Texto-base: recomenda-se revisão por advogado.</p>
              <Link href="/avaliacao-e-consultoria" className="btn btn-line">Quanto vale o aluguel do meu imóvel?</Link>
            </div>
            <LocacaoForm />
          </div></section>
        </>
      )}
    </>
  );
}
