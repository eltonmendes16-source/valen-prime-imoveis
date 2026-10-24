import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { AtualizacoesLista } from "@/components/AtualizacoesLista";
import { AvisoValores } from "@/components/AvisoValores";

export const metadata: Metadata = {
  title: "Últimas atualizações dos empreendimentos",
  description: "Registro das mudanças de tabelas de preços, condições e disponibilidade dos empreendimentos.",
  alternates: { canonical: "/atualizacoes" },
};

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Acompanhe" titulo="Últimas atualizações" texto="Registro das mudanças em tabelas de preços, condições e disponibilidade. Cada item tem a data em que foi registrado." />
      <section className="bg-snow py-16"><div className="container-page max-w-3xl space-y-8">
        <AvisoValores comLink={false} />
        <AtualizacoesLista />
      </div></section>
    </>
  );
}
