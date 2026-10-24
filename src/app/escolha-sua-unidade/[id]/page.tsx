import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { EscolhaUnidade } from "@/components/EscolhaUnidade";
import { COM_TABELA, EMPS } from "@/lib/emp";
import { carregarTabela, type TabelaPreenchida } from "@/lib/tabelas";

export function generateStaticParams() { return COM_TABELA.map((id) => ({ id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = EMPS.find((x) => x.id === id);
  return e ? { title: `Escolha sua unidade · ${e.nome}`, description: `Escolha o andar, veja o preço, o fluxo de pagamento e simule o financiamento do ${e.nome}.` } : {};
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const e = EMPS.find((x) => x.id === id);
  const dados = e && COM_TABELA.includes(id) ? await carregarTabela(id) : null;
  if (!e || !dados || !dados.tabela) notFound();
  return (
    <>
      <PageHero eyebrow={e.nome} titulo={<>Escolha a sua <em>unidade</em></>} />
      <section className="bg-paper py-12 text-ink"><div className="container-page max-w-5xl"><EscolhaUnidade nomeEmp={e.nome} empId={e.id} dados={dados as TabelaPreenchida} /></div></section>
    </>
  );
}
