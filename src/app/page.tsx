import Link from "next/link";
import { ArrowRight, FileCheck2, Landmark, Scale, ClipboardCheck, Compass, Building2, Calculator } from "lucide-react";
import { Secao } from "@/components/Secao";
import { EmpCard } from "@/components/EmpCard";
import { LeadForm } from "@/components/LeadForm";
import { EMPS, AMBIENTES, CIDADES, brl, porSegmento } from "@/lib/emp";
import { POSTS } from "@/lib/blog";
import { SITE, whatsappLink } from "@/lib/site";

const DESTAQUES = ["portugal-740", "marco-zero-one", "landscape-paddan", "meritt-paddan", "botanic-santo-andre", "jump-assuncao"];

const SERVICOS = [
  { i: FileCheck2, t: "Documentação", d: "Conferência de certidões, contratos e matrícula antes de assinar." },
  { i: Landmark, t: "Financiamento", d: "Simulação e orientação para escolher banco, sistema e prazo." },
  { i: Scale, t: "Regularização", d: "Caminhos para regularizar imóvel: averbações, habite-se, escritura e registro." },
  { i: ClipboardCheck, t: "Avaliação", d: "Opinião de valor de mercado fundamentada, para compra, venda ou garantia." },
  { i: Compass, t: "Consultoria", d: "Análise do fluxo de pagamento e do custo total para investidor e comprador final." },
];

const DIFERENCIAIS = [
  ["Análise antes da venda", "Cada empreendimento é lido a partir da ficha, do book, do memorial e da tabela, e conferido entre si."],
  ["Fluxo de pagamento explicado", "Ato, mensais, anuais, chaves, correção e financiamento mostrados em números, antes da assinatura."],
  ["Desvios sinalizados", "Qualquer diferença em relação à tabela da incorporadora aparece de forma clara na simulação."],
  ["Vários perfis, um atendimento", "Alto padrão, médio padrão, compactos e locação com o mesmo consultor do início ao fim."],
  ["Serviços além da venda", "Documentação, financiamento, regularização e avaliação no mesmo lugar."],
  ["Sem promessa de rentabilidade", "Números ilustrativos, premissas visíveis e a decisão sempre sua."],
];


const PERFIS = [
  ["Morando sozinho", "Studios e 1 dormitório, de entrada mais acessível.", "/ambientes/compactos-mcmv"],
  ["Casal", "2 dormitórios com varanda e lazer completo.", "/ambientes/medio-padrao"],
  ["Família com filhos", "3 dormitórios, suíte e mais de uma vaga.", "/imoveis?segmento=medio"],
  ["Alto padrão", "Metragens amplas, suítes e coberturas.", "/ambientes/alto-padrao"],
  ["Investidor", "Compare fluxo, correção e custo total no simulador.", "/simulador"],
  ["Primeira casa", "Entenda financiamento e Minha Casa Minha Vida.", "/servicos"],
] as const;

const FAQ = [
  ["Em quais cidades vocês atuam?", "Santo André, São Bernardo do Campo, São Caetano do Sul e região do ABC paulista."],
  ["Os valores do site são finais?", "Não. São preços de partida conforme tabelas disponíveis e podem mudar sem aviso prévio. Peça a tabela atualizada."],
  ["O atendimento tem custo?", "A conversa, a apresentação dos empreendimentos e a simulação não têm custo para o comprador."],
  ["Como funciona o financiamento?", "Na planta, você paga ato, parcelas e reforços durante a obra; nas chaves, o saldo é quitado ou financiado em banco (SAC ou Price). Use o simulador para ver o efeito."],
  ["Posso usar o Minha Casa Minha Vida?", "Depende de renda, valor do imóvel e regras vigentes. Informe seu perfil e verifico as opções possíveis."],
];

export default function Home() {
  const destaque = DESTAQUES.map((id) => EMPS.find((e) => e.id === id)!).filter(Boolean);
  const comPreco = EMPS.filter((e) => e.precoAPartir);
  const menor = comPreco.length ? Math.min(...comPreco.map((e) => e.precoAPartir as number)) : null;
  return (
    <>
      {/* HERO */}
      <section className="grid-fino relative overflow-hidden border-b border-gold/60 bg-[radial-gradient(900px_420px_at_85%_0%,rgba(193,154,91,.18),transparent_60%),linear-gradient(180deg,#FCFBF8,#F4F0E8)]">
        <div className="container-page grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.25fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow sobe">Valen Prime Imóveis · ABC paulista</p>
            <h1 className="h-display sobe sobe-2 mt-5 text-5xl sm:text-7xl">Imóveis com <em>estratégia</em>.</h1>
            <p className="sobe sobe-3 mt-6 max-w-xl text-lg leading-relaxed text-charcoal/80">
              Lançamentos de alto padrão, médio padrão e compactos, locação e serviços de documentação, financiamento e avaliação, com análise de fluxo de pagamento antes de você decidir.
            </p>
            <div className="sobe sobe-4 mt-8 flex flex-wrap gap-3">
              <Link href="/imoveis" className="btn btn-gold">Ver empreendimentos <ArrowRight size={16} /></Link>
              <Link href="/simulador" className="btn btn-line"><Calculator size={16} /> Simular meu fluxo</Link>
            </div>
          </div>
          {/* Busca */}
          <form action="/imoveis" method="get" className="sobe sobe-4 rounded-md border border-ink/12 bg-snow/70 p-6 backdrop-blur" aria-label="Buscar imóveis">
            <p className="eyebrow mb-4">Busque seu imóvel</p>
            <div className="grid gap-3">
              <div><label className="label" htmlFor="b-seg">Ambiente</label>
                <select id="b-seg" name="segmento" className="field" defaultValue=""><option value="">Todos</option><option value="alto-padrao">Alto padrão</option><option value="medio">Médio padrão</option><option value="economico">Compactos e MCMV</option></select></div>
              <div><label className="label" htmlFor="b-cid">Cidade</label>
                <select id="b-cid" name="cidade" className="field" defaultValue=""><option value="">Todas</option>{CIDADES.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div><label className="label" htmlFor="b-q">Nome do empreendimento</label>
                <input id="b-q" name="q" className="field" placeholder="Ex.: Portugal 740" /></div>
              <button className="btn btn-gold mt-1">Buscar</button>
            </div>
          </form>
        </div>
        {/* Faixa de números */}
        <div className="border-t border-ink/10 bg-snow/60">
          <dl className="container-page grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {[
              [String(EMPS.length), "empreendimentos cadastrados"], [String(CIDADES.length), "cidades do ABC"],
              ["4", "ambientes de atendimento"], [menor ? brl(menor) : "—", "preço de partida (tabelas disponíveis)"],
            ].map(([n, l], i) => (
              <div key={i}><dt className="font-serif text-3xl font-semibold text-golddark sm:text-4xl tabular-nums">{n}</dt><dd className="mt-1 text-xs tracking-wide text-muted">{l}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {/* AMBIENTES */}
      <Secao claro eyebrow="Ambientes" titulo={<>Um ambiente para cada <em>perfil</em> de imóvel</>}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AMBIENTES.map((a, i) => {
            const n = a.segmento ? porSegmento(a.segmento).length : 0;
            return (
              <Link key={a.slug} href={`/ambientes/${a.slug}`} className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-md border border-ink/10 bg-snow p-6 text-charcoal transition hover:-translate-y-1 hover:shadow-2xl">
                <span className="font-mono text-xs text-golddark">0{i + 1}</span>
                <div>
                  <h3 className="font-serif text-2xl font-semibold leading-tight">{a.titulo}</h3>
                  <p className="mt-2 text-sm text-charcoal/70">{a.resumo}</p>
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-golddark">{a.segmento ? `${n} empreendimentos` : "Em breve"} <ArrowRight size={14} className="transition group-hover:translate-x-1" /></p>
                </div>
              </Link>
            );
          })}
        </div>
      </Secao>

      {/* DESTAQUES */}
      <Secao eyebrow="Empreendimentos em destaque" titulo={<>Lançamentos e <em>oportunidades</em> do ABC</>}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{destaque.map((e) => <EmpCard key={e.id} emp={e} />)}</div>
        <div className="mt-10"><Link href="/imoveis" className="btn btn-line">Ver todos os {EMPS.length} empreendimentos <ArrowRight size={16} /></Link></div>
      </Secao>

      {/* SERVIÇOS */}
      <Secao claro eyebrow="Serviços" titulo={<>Muito além da <em>venda</em></>}>
        <div className="grid gap-px overflow-hidden rounded-md border border-ink/10 bg-snow/10 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICOS.map((s) => (
            <div key={s.t} className="bg-paper p-6"><s.i className="text-golddark" size={22} /><h3 className="mt-4 font-serif text-xl font-semibold">{s.t}</h3><p className="mt-2 text-sm leading-relaxed text-mutedink">{s.d}</p></div>
          ))}
        </div>
        <div className="mt-8"><Link href="/servicos" className="btn btn-ink">Conhecer os serviços <ArrowRight size={16} /></Link></div>
      </Secao>

      {/* SIMULADOR */}
      <section className="border-y border-gold/40 bg-sand py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">Ferramenta do site</p>
            <h2 className="h-display text-3xl sm:text-5xl">Simule o <em>fluxo</em> antes de assinar</h2>
            <p className="mt-5 max-w-xl text-charcoal/75">Ato, parcelas mensais e anuais com correção, chaves, financiamento SAC ou Price, custo total e valorização projetada. Os mesmos cálculos que uso na análise dos empreendimentos.</p>
            <Link href="/simulador" className="btn btn-gold mt-7"><Calculator size={16} /> Abrir o simulador</Link>
          </div>
          <ul className="grid gap-3 text-sm text-charcoal/85 sm:grid-cols-2">
            {["Correção por INCC ou IGP-M, ano a ano", "Financiamento SAC ou Price", "Preço do imóvel ou preço do m²", "Custo total e ganho de capital projetado"].map((t) => (
              <li key={t} className="rounded border border-ink/10 bg-snow/60 p-4">{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <Secao eyebrow="Por que a Valen Prime" titulo={<>Seis motivos para <em>conversar</em> comigo</>}>
        <ol className="grid gap-x-12 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {DIFERENCIAIS.map(([t, d], i) => (
            <li key={t} className="border-t border-gold/40 pt-5"><span className="font-mono text-sm text-golddark">{String(i + 1).padStart(2, "0")}</span><h3 className="mt-2 font-serif text-xl font-semibold">{t}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{d}</p></li>
          ))}
        </ol>
      </Secao>

      {/* PARCEIROS */}
      <section className="bg-gold py-16 text-ink">
        <div className="container-page flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em]">Construtoras, incorporadoras e comercializadoras</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Vamos construir uma parceria?</h2>
            <p className="mt-3 text-ink/80">Procuro associação com empresas do mercado para apresentar seus lançamentos com análise financeira clara ao investidor e ao comprador final.</p>
          </div>
          <Link href="/parceiros" className="btn btn-ink shrink-0"><Building2 size={16} /> Quero ser parceiro</Link>
        </div>
      </section>

      {/* BLOG */}
      <Secao claro eyebrow="Blog" titulo={<>Conteúdo para decidir <em>melhor</em></>}>
        <div className="grid gap-6 md:grid-cols-3">
          {POSTS.slice(0, 3).map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-md border border-ink/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl">
              <p className="font-mono text-[11px] uppercase tracking-wider text-golddark">{p.categoria} · {p.leitura} min</p>
              <h3 className="mt-3 font-serif text-xl font-semibold leading-snug group-hover:text-golddark">{p.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mutedink">{p.resumo}</p>
            </Link>
          ))}
        </div>
      </Secao>

      {/* PERFIS */}
      <Secao eyebrow="Para cada momento" titulo={<>Qual é o seu <em>perfil</em>?</>}>
        <div className="grid gap-px overflow-hidden rounded-md border border-ink/10 bg-ink/5 sm:grid-cols-2 lg:grid-cols-3">
          {PERFIS.map(([t, d, h]) => (
            <Link key={t} href={h} className="group bg-sand p-6 transition hover:bg-coal2"><h3 className="font-serif text-xl font-semibold group-hover:text-golddark">{t}</h3><p className="mt-2 text-sm text-muted">{d}</p></Link>
          ))}
        </div>
      </Secao>

      {/* FAQ */}
      <Secao claro eyebrow="Perguntas frequentes" titulo={<>Dúvidas <em>comuns</em></>}>
        <div className="max-w-3xl divide-y divide-ink/10 border-y border-ink/10">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-5"><summary className="cursor-pointer list-none font-serif text-lg font-semibold">{q}</summary><p className="mt-3 text-mutedink">{a}</p></details>
          ))}
        </div>
      </Secao>

      {/* CONTATO */}
      <Secao id="agendar" eyebrow="Agende uma visita ou conversa" titulo={<>Fale com o <em>{`consultor`}</em></>}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4 text-charcoal/80">
            <p>Conte o que você procura e retorno pelo WhatsApp. Posso apresentar empreendimentos, montar a simulação do fluxo e agendar visita ao plantão de vendas.</p>
            <p className="text-sm text-muted">Atendimento direto com o consultor, sem compromisso.</p>
            <div className="flex flex-wrap gap-3 pt-2"><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-gold">WhatsApp</a><a href={`tel:+${SITE.whatsapp}`} className="btn btn-line">Ligar {SITE.telefone}</a></div>
          </div>
          <LeadForm titulo="Agendar visita" subtitulo="Preencha e abriremos o WhatsApp com a sua mensagem pronta." />
        </div>
      </Secao>
    </>
  );
}
