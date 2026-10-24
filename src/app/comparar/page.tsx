import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { AvisoValores } from "@/components/AvisoValores";
import { COM_TABELA, EMPS, brl, entregaTexto, faixaArea, localizacao, SEGMENTO_LABEL, type Emp } from "@/lib/emp";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Comparar empreendimentos", robots: { index: false, follow: true } };

const LINHAS: { rotulo: string; v: (e: Emp) => string }[] = [
  { rotulo: "Localização", v: (e) => localizacao(e) },
  { rotulo: "Perfil", v: (e) => SEGMENTO_LABEL[e.segmento] },
  { rotulo: "Incorporadora", v: (e) => e.incorporadora || "—" },
  { rotulo: "Metragem", v: (e) => faixaArea(e) },
  { rotulo: "Dormitórios", v: (e) => e.quartos },
  { rotulo: "Suítes", v: (e) => e.suites || "—" },
  { rotulo: "Vagas", v: (e) => e.vagas },
  { rotulo: "A partir de", v: (e) => (e.precoAPartir ? brl(e.precoAPartir) : COM_TABELA.includes(e.id) ? "Ver tabela de preços" : "Sob consulta") },
  { rotulo: "Menor preço por m²", v: (e) => (e.precoM2Min ? brl(e.precoM2Min) : "—") },
  { rotulo: "Entrega prevista", v: (e) => entregaTexto(e.entrega) || "—" },
  { rotulo: "Torres / unidades", v: (e) => [e.torres ? `${e.torres} torre(s)` : "", e.totalUnidades ? `${e.totalUnidades} unid.` : ""].filter(Boolean).join(" · ") || "—" },
  { rotulo: "Entrada + obra (fluxo)", v: (e) => (e.fluxoPct ? `${e.fluxoPct}%` : "—") },
  { rotulo: "Lazer", v: (e) => (e.lazer.length ? e.lazer.slice(0, 6).join(", ") : "—") },
];

export default async function Comparar({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const { ids = "" } = await searchParams;
  const lista = ids.split(",").map((id) => EMPS.find((e) => e.id === id)).filter(Boolean).slice(0, 3) as Emp[];
  return (
    <>
      <PageHero eyebrow="Lado a lado" titulo="Comparar empreendimentos" />
      <section className="bg-snow py-12"><div className="container-page">
        {lista.length < 2 ? (
          <p className="rounded-md border border-ink/10 bg-sand p-8 text-center text-charcoal/80">Escolha 2 ou 3 empreendimentos na sua <Link href="/favoritos" className="underline">lista de favoritos</Link> para comparar.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-sm">
                <thead><tr><th className="w-36 p-2 text-left" />{lista.map((e) => <th key={e.id} className="p-2 text-left align-bottom font-serif text-lg font-semibold text-ink"><Link href={`/empreendimentos/${e.id}`} className="hover:text-golddark">{e.nome}</Link></th>)}</tr></thead>
                <tbody>{LINHAS.map((l) => (
                  <tr key={l.rotulo} className="border-t border-ink/10 align-top">
                    <th scope="row" className="p-2 text-left text-xs font-medium uppercase tracking-wide text-muted">{l.rotulo}</th>
                    {lista.map((e) => <td key={e.id} className="p-2 text-charcoal">{l.v(e)}</td>)}
                  </tr>))}
                </tbody>
              </table>
            </div>
            <AvisoValores className="mt-6" />
            <a className="btn btn-gold mt-6 inline-flex" target="_blank" rel="noopener noreferrer" href={whatsappLink(`Olá! Comparei no site: ${lista.map((e) => e.nome).join(" x ")}. Pode me ajudar a escolher?`)}>Pedir ajuda para escolher</a>
          </>
        )}
      </div></section>
    </>
  );
}
