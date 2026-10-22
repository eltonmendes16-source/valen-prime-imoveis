import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
export const metadata: Metadata = { title: "Política de Privacidade" };
export default function Page() {
  return (<><PageHero eyebrow="Legal" titulo="Política de Privacidade" /><section className="bg-snow py-16"><div className="container-page max-w-2xl space-y-4 text-charcoal/80"><p>Este site não possui banco de dados nem coleta dados automaticamente. Os formulários montam uma mensagem e abrem o WhatsApp do consultor: os dados informados são enviados por você, por essa conversa, e usados apenas para retornar o contato e apresentar imóveis e serviços.</p><p>O site pode usar fontes do Google Fonts, que recebem o endereço IP do visitante ao carregar. Se ferramentas de análise ou cookies forem adicionados, esta política será atualizada.</p><p>Você pode solicitar acesso, correção ou exclusão dos seus dados (LGPD, Lei 13.709/2018) pelos canais de contato do rodapé.</p><p className="text-xs text-muted">Texto-base. Recomenda-se revisão por advogado antes da publicação.</p></div></section></>);
}
