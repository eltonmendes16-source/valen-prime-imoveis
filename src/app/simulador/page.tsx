import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Simulador } from "./Simulador";

export const metadata: Metadata = { title: "Simulador de fluxo de pagamento", description: "Simule ato, parcelas, reforços, chaves e financiamento SAC ou Price de um imóvel na planta." };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Ferramenta" titulo={<>Simulador de <em>fluxo</em> de pagamento</>} texto="Ajuste os campos e veja o custo ao longo da obra e no financiamento. Todos os valores são editáveis." />
      <section className="bg-snow py-14"><div className="container-page"><Suspense fallback={<p className="text-muted">Carregando…</p>}><Simulador /></Suspense></div></section>
    </>
  );
}
