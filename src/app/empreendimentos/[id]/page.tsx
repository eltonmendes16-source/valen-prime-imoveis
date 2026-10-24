import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calculator } from "lucide-react";
import { Capa } from "@/components/Capa";
import { LeadForm } from "@/components/LeadForm";
import { COM_TABELA, EMPS, getEmp, brl, faixaArea, localizacao, entregaTexto, SEGMENTO_LABEL } from "@/lib/emp";
import { SITE } from "@/lib/site";
import books from "@/data/books.json";

export function generateStaticParams() { return EMPS.map((e) => ({ id: e.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const e = getEmp((await params).id);
  return e ? { title: `${e.nome} — ${localizacao(e)}`, description: `${e.nome}: ${e.quartos} dormitórios, ${faixaArea(e)}, ${localizacao(e)}.` } : {};
}

function Lista({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (!itens?.length) return null;
  return (
    <div><h3 className="font-serif text-2xl font-semibold">{titulo}</h3>
      <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm text-charcoal/80 sm:grid-cols-2">{itens.map((i) => <li key={i} className="border-b border-ink/10 pb-2">{i}</li>)}</ul></div>
  );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const e = getEmp((await params).id);
  if (!e) notFound();
  const ent = entregaTexto(e.entrega);
  const fatos: [string, string][] = [
    ["Localização", localizacao(e)], ["Segmento", SEGMENTO_LABEL[e.segmento]], ["Metragem", faixaArea(e)],
    ["Dormitórios", e.quartos], ["Suítes", e.suites ?? "—"], ["Vagas", e.vagas],
    ...(e.torres ? [["Torres", String(e.torres)] as [string, string]] : []), ...(e.pavimentos ? [["Pavimentos", String(e.pavimentos)] as [string, string]] : []),
    ...(e.totalUnidades ? [["Unidades", String(e.totalUnidades)] as [string, string]] : []), ...(e.terreno ? [["Terreno", e.terreno]] as [string, string][] : []),
    ...(ent ? [["Entrega prevista", ent] as [string, string]] : []),
    ...(SITE.mostrarComercializadora || !e.incorporadora ? [] : [["Incorporadora", e.incorporadora] as [string, string]]),
  ];
  return (
    <>
      <section className="border-b border-gold/40 bg-snow">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="aspect-[16/10] overflow-hidden rounded-md border border-ink/10"><Capa emp={e} /></div>
          <div>
            <p className="eyebrow">{SEGMENTO_LABEL[e.segmento]}</p>
            <h1 className="h-display mt-3 text-4xl sm:text-5xl">{e.nome}</h1>
            <p className="mt-2 text-charcoal/70">{localizacao(e)}</p>
            <p className="mt-8 text-xs uppercase tracking-wider text-muted">{e.precoAPartir ? "A partir de" : "Valores"}</p>
            {!e.precoAPartir && COM_TABELA.includes(e.id)
              ? <Link href={`/escolha-sua-unidade/${e.id}`} className="btn btn-gold mt-2">Ver tabela de preços</Link>
              : <p className="font-serif text-4xl font-semibold text-golddark">{e.precoAPartir ? brl(e.precoAPartir) : "Sob consulta"}</p>}
            {e.tabelaData && <p className="mt-1 text-xs text-muted">Tabela de {new Date(e.tabelaData + "T12:00:00").toLocaleDateString("pt-BR")} · sujeita a alteração sem aviso prévio.</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/simulador?emp=${e.id}`} className="btn btn-line"><Calculator size={16} /> Simular fluxo</Link>
              {(books as Record<string, string[]>)[e.id] && <Link href={`/empreendimentos/${e.id}/book`} className="btn btn-line">Ver book</Link>}
              <a href="#visita" className="btn btn-line">Agendar visita</a>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-snow py-16">
        <div className="container-page space-y-14">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-ink/10 bg-ink/5 sm:grid-cols-3 lg:grid-cols-4">
            {fatos.map(([k, v]) => <div key={k} className="bg-sand p-5"><dt className="text-[11px] uppercase tracking-wider text-muted">{k}</dt><dd className="mt-1 font-serif text-lg">{v}</dd></div>)}
          </dl>
          {e.tipologias?.length > 0 && (
            <div><h3 className="font-serif text-2xl font-semibold">Tipologias</h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">{e.tipologias.map((t, i) => <li key={i} className="rounded border border-ink/10 p-4 text-sm"><span className="font-mono text-golddark">{t.area}</span>{t.desc && <span className="text-charcoal/75"> — {t.desc}</span>}</li>)}</ul></div>
          )}
          <Lista titulo="Lazer" itens={e.lazer} />
          <Lista titulo="Infraestrutura e entorno" itens={e.infraestrutura} />
          <Lista titulo="Acabamentos" itens={e.acabamentos} />
          <p className="max-w-3xl text-xs leading-relaxed text-muted">Imagens e informações ilustrativas, sujeitas a alteração. Metragens, valores e condições de pagamento dependem da tabela vigente e da disponibilidade das unidades. Consulte o memorial descritivo e o registro de incorporação.</p>
        </div>
      </section>
      <section id="visita" className="bg-sand py-16"><div className="container-page max-w-2xl"><LeadForm titulo={`Tenho interesse no ${e.nome}`} empreendimento={e.nome} /></div></section>
    </>
  );
}
