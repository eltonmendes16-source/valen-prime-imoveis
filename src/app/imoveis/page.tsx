import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Filtro } from "./Filtro";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = { title: "Empreendimentos", description: "Lançamentos no ABC paulista: alto padrão, médio padrão e compactos. Filtre por cidade, dormitórios e metragem." };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Empreendimentos" titulo={<>Encontre seu <em>imóvel</em></>} texto="Valores de partida conforme tabelas disponíveis, sujeitos a alteração sem aviso prévio." />
      <section className="bg-snow py-14"><div className="container-page"><Suspense fallback={<p className="text-muted">Carregando…</p>}><Filtro /></Suspense></div></section>
      <section className="bg-sand py-16"><div className="container-page max-w-2xl"><LeadForm titulo="Não encontrou?" subtitulo="Conte o que procura e retorno pelo WhatsApp." /></div></section>
    </>
  );
}
