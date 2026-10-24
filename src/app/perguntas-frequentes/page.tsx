import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { LeadForm } from "@/components/LeadForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Compra na planta: perguntas frequentes",
  description: "Respostas diretas sobre comprar imóvel na planta: registro da incorporação, INCC, atraso na obra, desistência, financiamento, FGTS e custos.",
  alternates: { canonical: "/perguntas-frequentes" },
};

type Item = { p: string; r: React.ReactNode; t: string };
const L = (href: string, txt: string) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline">{txt}</a>;
const LEI4591 = "https://www.planalto.gov.br/ccivil_03/leis/l4591.htm";
const LEI13786 = "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13786.htm";

const GRUPOS: { titulo: string; itens: Item[] }[] = [
  { titulo: "Antes de comprar", itens: [
    { p: "O que é comprar na planta?",
      t: "É comprar uma unidade de um empreendimento ainda em construção. O pagamento é feito em etapas durante a obra, e o saldo costuma ser financiado em banco quando o imóvel fica pronto. Por isso o contrato, o prazo e a reputação do incorporador pesam tanto quanto o preço.",
      r: <p>É comprar uma unidade de um empreendimento ainda em construção. O pagamento é feito em etapas durante a obra, e o saldo costuma ser financiado em banco quando o imóvel fica pronto. Por isso o contrato, o prazo e a reputação do incorporador pesam tanto quanto o preço.</p> },
    { p: "Como saber se o empreendimento está regular?",
      t: "A lei exige o registro da incorporação no cartório de registro de imóveis antes da venda das unidades, e o número do registro e o cartório devem constar na publicidade (exceto anúncios classificados). Peça o número e confirme no cartório.",
      r: <p>A Lei 4.591/1964 (art. 32) condiciona a venda ao registro do memorial de incorporação no registro de imóveis, e o número do registro e o cartório devem constar na publicidade, exceto em anúncios classificados. Peça o número ao consultor e confirme no cartório. {L(LEI4591, "Texto da lei")}.</p> },
    { p: "O que é patrimônio de afetação?",
      t: "É um regime opcional em que o terreno e os bens da obra ficam separados do patrimônio do incorporador e respondem só pelas dívidas daquela incorporação, para garantir a entrega das unidades. Pergunte se o empreendimento adotou.",
      r: <p>É um regime que o incorporador pode adotar (Lei 4.591/1964, art. 31-A): o terreno e os bens da obra ficam separados do patrimônio dele e respondem só pelas dívidas daquela incorporação, com a finalidade de entregar as unidades. Pergunte se o empreendimento adotou, porque isso muda regras de devolução em caso de desistência. {L(LEI4591, "Texto da lei")}.</p> },
    { p: "O que conferir antes de assinar?",
      t: "Registro da incorporação, memorial descritivo, quadro-resumo, minuta do contrato, prazo de entrega e tolerância, índice de correção, regras de desistência e se há patrimônio de afetação. Leia tudo com calma e leve dúvidas a um advogado.",
      r: <ul className="list-disc space-y-1 pl-5"><li>Número do registro da incorporação e o cartório.</li><li>Memorial descritivo (acabamentos e áreas) e plantas.</li><li>Quadro-resumo e minuta completa do contrato.</li><li>Prazo de entrega e se há tolerância de atraso.</li><li>Índices de correção, juros e quando passam a valer.</li><li>Regras de desistência e devolução de valores.</li><li>Se o empreendimento tem patrimônio de afetação.</li></ul> },
  ] },
  { titulo: "Contrato e pagamento", itens: [
    { p: "Como funciona o fluxo de pagamento?",
      t: "Em geral há uma entrada (ato), parcelas mensais durante a obra, parcelas anuais ou intermediárias, uma parcela única perto da entrega e o saldo financiado em banco. Cada empreendimento tem a sua tabela.",
      r: <p>Em geral há uma entrada (ato), parcelas mensais durante a obra, parcelas anuais ou intermediárias, uma parcela única perto da entrega e o saldo financiado em banco. Cada empreendimento tem a sua tabela: veja um exemplo real na <Link href="/escolha-sua-unidade/ilha-de-murano" className="underline">tela de escolha de unidade do Ilha de Murano</Link> e simule no <Link href="/simulador" className="underline">simulador</Link>.</p> },
    { p: "O que é o INCC?",
      t: "É o Índice Nacional de Custo da Construção, calculado pela FGV. Muitos contratos usam o INCC para corrigir as parcelas até a conclusão da obra, então o valor pago ao longo do tempo é maior que o da tabela inicial.",
      r: <p>É o Índice Nacional de Custo da Construção, calculado pela FGV. Muitos contratos corrigem as parcelas pelo INCC até a conclusão da obra, então o valor que você paga ao longo do tempo tende a ser maior que o da tabela inicial. Depois da obra, o contrato pode prever juros e outro índice, como o IGP-M: confira as condições do seu empreendimento.</p> },
    { p: "O que é o quadro-resumo do contrato?",
      t: "É uma página no início do contrato, exigida por lei, que resume preço, corretagem, índices, juros, regras de arrependimento e prazo de entrega, entre outros pontos. Leia essa página primeiro.",
      r: <p>É uma página no início do contrato de incorporação, exigida pela Lei 4.591/1964 (art. 35-A, incluído pela Lei 13.786/2018). Ela resume itens como preço, valor e beneficiário da corretagem, índices de correção, juros, regras de arrependimento e prazo de entrega. Leia essa página primeiro. {L(LEI4591, "Texto da lei")}.</p> },
    { p: "Posso preencher uma ficha antes de decidir?",
      t: "Sim. A ficha cadastral serve para análise e proposta e não é uma reserva nem aprovação de crédito. Ela só vale como compromisso quando houver contrato assinado.",
      r: <p>Sim. A ficha cadastral serve para análise e proposta e não é reserva nem aprovação de crédito. Valores e condições só ficam garantidos com o contrato assinado.</p> },
  ] },
  { titulo: "Obra, atraso e entrega", itens: [
    { p: "E se a obra atrasar?",
      t: "O contrato pode prever tolerância de até 180 dias corridos, se isso for combinado de forma clara e destacada. Passada a tolerância, o comprador em dia pode desistir e receber de volta o que pagou mais a multa prevista, ou continuar e receber 1% do valor pago por mês de atraso. As duas coisas não se somam.",
      r: <><p>Pela Lei 4.591/1964 (art. 43-A), a entrega em até 180 dias corridos depois da data prevista pode ser pactuada como tolerância, desde que de forma clara e destacada, e nesse prazo não há resolução nem penalidade.</p><p className="mt-2">Passada a tolerância, o comprador que está em dia e não deu causa ao atraso pode: (1) desistir do contrato e receber o que pagou, com a multa prevista, em até 60 dias corridos; ou (2) manter o contrato e receber 1% do valor efetivamente pago por mês de atraso, proporcional aos dias. As duas indenizações não se acumulam. {L(LEI13786, "Lei 13.786/2018")}.</p></> },
    { p: "Quando recebo as chaves?",
      t: "Depois da conclusão da obra e do habite-se, da vistoria e da regularização do pagamento ou do financiamento do saldo. Na vistoria, anote qualquer pendência por escrito.",
      r: <p>Depois da conclusão da obra e do habite-se, da vistoria e da regularização do saldo, que normalmente é quitado ou financiado em banco. Na vistoria, confira o imóvel com o memorial descritivo e registre qualquer pendência por escrito.</p> },
    { p: "Posso vender ou passar o contrato para outra pessoa antes da entrega?",
      t: "Em geral, é possível ceder os direitos do contrato, mas as regras, a anuência da incorporadora e eventuais taxas dependem do que está escrito no contrato. Verifique antes de assinar.",
      r: <p>Em geral é possível ceder os direitos do contrato, mas as regras, a anuência da incorporadora e eventuais taxas dependem do que está escrito nele. Se a revenda for parte do seu plano, confira essa cláusula antes de assinar.</p> },
  ] },
  { titulo: "Desistência", itens: [
    { p: "Posso desistir depois de assinar?",
      t: "Se o contrato foi fechado fora do estande ou da sede da incorporadora, há 7 dias para se arrepender, com devolução do que pagou, inclusive a corretagem. A comunicação deve ser por carta registrada com aviso de recebimento. Depois disso, a desistência segue as regras do distrato.",
      r: <><p>Se o contrato foi fechado fora do estande de vendas ou da sede da incorporadora, a Lei 4.591/1964 (art. 67-A, §§ 10 a 12) prevê 7 dias improrrogáveis para se arrepender, com devolução dos valores pagos, inclusive a corretagem. O exercício deve ser comprovado por carta registrada com aviso de recebimento, contando-se a data da postagem. Passado o prazo, o contrato é irretratável, mas a desistência ainda pode ocorrer por distrato, nas condições do contrato. {L(LEI13786, "Lei 13.786/2018")}.</p></> },
    { p: "Quanto perco se desistir (distrato)?",
      t: "A lei limita a multa a 25% do que foi pago, ou 50% se o empreendimento tem patrimônio de afetação, além da comissão de corretagem e de outros custos previstos, como impostos e condomínio. Os prazos de devolução também variam. Confira o quadro-resumo e peça orientação jurídica.",
      r: <><p>Pela Lei 4.591/1964 (art. 67-A), do valor devolvido são descontadas a comissão de corretagem e a multa do contrato, limitada a 25% da quantia paga. Se a incorporação tem patrimônio de afetação, a multa pode chegar a 50%. O comprador também responde por impostos e condomínio do período e, se já estiver com o imóvel, por uma compensação pelo uso.</p><p className="mt-2">A devolução ocorre, com patrimônio de afetação, em até 30 dias após o habite-se e, sem ele, em parcela única após 180 dias da resolução do contrato. Os termos exatos constam do seu contrato: leia o quadro-resumo e consulte um advogado antes de decidir. {L(LEI13786, "Lei 13.786/2018")}.</p></> },
  ] },
  { titulo: "Financiamento, FGTS e custos", itens: [
    { p: "Como funciona o financiamento do saldo?",
      t: "Perto da entrega, o comprador pede o financiamento em um banco, que analisa renda e crédito e define taxa, prazo e parcela. A simulação do site é só uma estimativa. A aprovação e as condições são do banco.",
      r: <p>Perto da entrega, você pede o financiamento a um banco, que analisa renda e crédito e define taxa, prazo e parcela. Uma regra prática comum é que a parcela não passe de cerca de 30% da renda familiar, mas cada banco decide. A simulação do site é só uma estimativa e não aprova crédito: use o <Link href="/simulador" className="underline">simulador</Link> para comparar cenários e peça propostas a mais de um banco.</p> },
    { p: "Posso usar o FGTS?",
      t: "Em muitos casos é possível usar o FGTS na compra de moradia própria, mas as regras (tempo de trabalho, outros imóveis, local do imóvel e limites de valor) mudam e dependem da Caixa e do banco. Confirme as condições atuais antes de contar com ele.",
      r: <p>Em muitos casos é possível usar o FGTS na compra de moradia própria, por exemplo para parte do pagamento ou para reduzir o saldo ou as parcelas, mas as condições (tempo de trabalho sob o regime do FGTS, outros imóveis, local e valor do imóvel) mudam com frequência e dependem do agente financeiro. Confirme as regras atuais no site da {L("https://www.caixa.gov.br/voce/habitacao/Paginas/utilizacao-fgts.aspx", "Caixa")} ou com o seu banco antes de contar com ele.</p> },
    { p: "Quais custos existem além do preço do imóvel?",
      t: "ITBI, escritura e registro, taxas e avaliação do financiamento, corretagem quando for do comprador, condomínio e IPTU depois da entrega, e mudança e decoração. Os valores dependem da cidade, do banco e do contrato.",
      r: <ul className="list-disc space-y-1 pl-5"><li>ITBI, imposto municipal pago na transferência do imóvel.</li><li>Escritura e registro no cartório.</li><li>Taxas e avaliação do financiamento.</li><li>Comissão de corretagem, se for do comprador: deve constar no quadro-resumo.</li><li>Condomínio e IPTU depois da entrega.</li><li>Mudança, móveis e decoração.</li></ul> },
    { p: "Os preços e as condições mudam?",
      t: "Sim. Tabelas e disponibilidade vêm do incorporador e podem mudar sem aviso. As condições só ficam garantidas com o contrato assinado. O site registra as mudanças na página de atualizações.",
      r: <p>Sim. Tabelas e disponibilidade vêm do incorporador e podem mudar sem aviso prévio, e as condições só ficam garantidas com o contrato assinado. O histórico fica em <Link href="/atualizacoes" className="underline">Últimas atualizações</Link>.</p> },
  ] },
];

export default function Page() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: GRUPOS.flatMap((g) => g.itens).map((i) => ({ "@type": "Question", name: i.p, acceptedAnswer: { "@type": "Answer", text: i.t } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero eyebrow="Guia" titulo="Compra na planta: perguntas frequentes" texto="Respostas diretas às dúvidas mais comuns de quem está pensando em comprar um imóvel em lançamento." />
      <section className="bg-snow py-16"><div className="container-page grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-10">
          {GRUPOS.map((g) => (
            <div key={g.titulo}>
              <h2 className="font-serif text-2xl font-semibold text-ink">{g.titulo}</h2>
              <div className="mt-4 divide-y divide-ink/10 rounded-md border border-ink/10 bg-white">
                {g.itens.map((i) => (
                  <details key={i.p} className="group p-4">
                    <summary className="cursor-pointer list-none font-semibold text-ink marker:content-none">{i.p}<span className="float-right text-golddark transition group-open:rotate-45" aria-hidden="true">+</span></summary>
                    <div className="mt-3 text-charcoal/80">{i.r}</div>
                  </details>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded border border-gold/40 bg-gold/10 p-4 text-sm text-ink" role="note">
            <p><b>Informação geral, não é parecer jurídico.</b> Contratos e casos concretos variam, e as leis podem ser alteradas. Valide dúvidas sobre o seu contrato com um advogado. Textos de lei consultados em outubro de 2026 no site do Planalto: {L(LEI4591, "Lei 4.591/1964")} e {L(LEI13786, "Lei 13.786/2018")}. Os links podem apontar para cópias sem as alterações mais recentes: confira o texto consolidado oficial.</p>
          </div>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <LeadForm titulo="Ficou com dúvida?" subtitulo={`Fale com o ${SITE.consultor}: ele explica o contrato e a tabela do empreendimento que você escolher.`} id="contato-faq" />
        </aside>
      </div></section>
    </>
  );
}
