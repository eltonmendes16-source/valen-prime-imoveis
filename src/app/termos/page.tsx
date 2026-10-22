import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
export const metadata: Metadata = { title: "Termos de Uso" };
export default function Page() {
  return (<><PageHero eyebrow="Legal" titulo="Termos de Uso" /><section className="bg-snow py-16"><div className="container-page max-w-2xl space-y-4 text-charcoal/80"><p>As informações de empreendimentos (valores, metragens, prazos, imagens e condições) têm caráter informativo, são fornecidas por incorporadoras e podem mudar sem aviso prévio. Imagens são ilustrativas.</p><p>O simulador é uma ferramenta didática: não é proposta, oferta, parecer financeiro nem promessa de rentabilidade ou valorização.</p><p>A contratação depende de análise de documentos, memorial descritivo, registro de incorporação e condições do contrato com a incorporadora e a instituição financeira.</p><p className="text-xs text-muted">Texto-base. Recomenda-se revisão por advogado antes da publicação.</p></div></section></>);
}
