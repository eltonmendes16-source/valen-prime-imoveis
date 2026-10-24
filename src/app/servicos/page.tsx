import type { Metadata } from "next";
import { FileCheck2, Landmark, Scale, ClipboardCheck, Compass } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { LeadForm } from "@/components/LeadForm";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Serviços", description: "Documentação, financiamento, regularização, avaliação e consultoria imobiliária." };

const S = [
  { i: FileCheck2, t: "Documentação imobiliária", d: "Apoio na conferência de matrícula, certidões, contratos e escritura, para que a compra e a venda aconteçam com segurança.", it: ["Análise de contrato de compra e venda", "Certidões do imóvel e das partes", "Escritura e registro"] },
  { i: Landmark, t: "Financiamento", d: "Orientação para simular, comparar e escolher o financiamento mais adequado à sua renda e ao seu objetivo.", it: ["Simulação SAC e Price", "Documentação para aprovação de crédito", "Acompanhamento até a assinatura"] },
  { i: Scale, t: "Regularização", d: "Caminhos para regularizar imóveis com pendências cartorárias ou municipais, em parceria com profissionais habilitados.", it: ["Averbação de construção", "Habite-se e regularização na prefeitura", "Retificação e registro"] },
  { i: ClipboardCheck, t: "Avaliação de imóveis", d: "Opinião de valor de mercado fundamentada em comparativos, para compra, venda, locação ou garantia.", it: ["Análise comparativa de mercado", "Parecer de valor", "Apoio à precificação"] },
  { i: Compass, t: "Consultoria para investidor e comprador", d: "Leitura do fluxo de pagamento e do custo total, com premissas visíveis e sem promessa de retorno.", it: ["Simulação de fluxo e financiamento", "Comparação entre empreendimentos", "Cenários de correção e valorização"] },
];

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Serviços" titulo={<>Do primeiro contato à <em>escritura</em></>} texto="Atendimento consultivo para quem compra, vende, aluga ou precisa regularizar um imóvel." />
      <section className="bg-paper py-16 text-ink"><div className="container-page grid gap-6 md:grid-cols-2">
        {S.map((s) => (
          <article key={s.t} className="rounded-md border border-ink/10 bg-white p-7">
            <s.i className="text-golddark" size={26} />
            <h2 className="mt-4 font-serif text-2xl font-semibold">{s.t}</h2>
            <p className="mt-2 text-mutedink">{s.d}</p>
            <ul className="mt-4 space-y-1.5 text-sm">{s.it.map((x) => <li key={x} className="border-t border-ink/10 pt-1.5">{x}</li>)}</ul>
            {(s.t === "Avaliação de imóveis" || s.t.startsWith("Consultoria")) && <Link href="/avaliacao-e-consultoria" className="mt-4 inline-block text-sm font-medium text-golddark underline">Saiba mais →</Link>}
          </article>
        ))}
      </div>
      <div className="container-page mt-8 text-xs text-mutedink">
        {SITE.cnae && <p>Atividade (CNAE): {SITE.cnae}</p>}
        <p className="mt-1">Alguns serviços dependem de profissionais habilitados (advogado, engenheiro, arquiteto, despachante) e de registro profissional. Escopo e condições definidos em contrato.</p>
      </div></section>
      <section className="bg-snow py-16"><div className="container-page max-w-2xl"><LeadForm titulo="Solicitar atendimento" interesseInicial="Documentação e regularização" /></div></section>
    </>
  );
}
