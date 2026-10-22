import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import books from "@/data/books.json";
import { EMPS, getEmp, localizacao } from "@/lib/emp";
import { Leitor } from "./Leitor";

const B = books as Record<string, string[]>;
export function generateStaticParams() { return EMPS.filter((e) => B[e.id]).map((e) => ({ id: e.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const e = getEmp((await params).id);
  return e ? { title: `Book — ${e.nome}`, description: `Book digital do ${e.nome}, ${localizacao(e)}.` } : {};
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const e = getEmp(id);
  if (!e || !B[id]) notFound();
  return (
    <section className="bg-snow">
      <div className="container-page flex flex-wrap items-end justify-between gap-4 py-8">
        <div>
          <p className="eyebrow">Book digital</p>
          <h1 className="h-display mt-2 text-3xl sm:text-4xl">{e.nome}</h1>
          <p className="mt-1 text-sm text-charcoal/70">{localizacao(e)} · {B[id].length} páginas</p>
        </div>
        <Link href={`/empreendimentos/${id}`} className="btn btn-line">← Voltar ao empreendimento</Link>
      </div>
      <Leitor id={id} pgs={B[id]} nome={e.nome} />
      <p className="container-page py-6 text-xs leading-relaxed text-muted">Imagens e informações ilustrativas, sujeitas a alteração sem aviso prévio. Valores e condições dependem da tabela vigente.</p>
    </section>
  );
}
