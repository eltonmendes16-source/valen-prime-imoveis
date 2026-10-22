import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = { title: "Parceiros", description: "Parcerias com construtoras, incorporadoras e comercializadoras de imóveis." };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Parceiros" titulo={<>Construtoras, incorporadoras e <em>comercializadoras</em></>} texto="Apresento lançamentos com análise financeira clara, atendimento próximo e conteúdo técnico para investidores e compradores finais." />
      <section className="bg-snow py-16"><div className="container-page grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl font-semibold">O que ofereço</h2>
          <ul className="mt-5 space-y-3 text-charcoal/80">
            {["Página dedicada do empreendimento, com ficha, tipologias, lazer e localização", "Simulador de fluxo de pagamento aplicado à sua tabela", "Atendimento consultivo e agendamento de visitas ao plantão", "Conteúdo no blog e nas redes, com linguagem transparente"].map((t) => <li key={t} className="border-t border-ink/10 pt-3">{t}</li>)}
          </ul>
          <p className="mt-6 text-sm text-muted">Condições comerciais, comissionamento e uso de imagens sempre acordados por escrito com a empresa.</p>
        </div>
        <LeadForm titulo="Proposta de parceria" interesseInicial="Parceria (construtora, incorporadora ou corretor)" />
      </div></section>
    </>
  );
}
