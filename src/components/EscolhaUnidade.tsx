"use client";
import { useEffect, useMemo, useState } from "react";
import { Calculator, Download, Eye, MessageCircle, Sparkles, Video } from "lucide-react";
import type { TabelaEmp } from "@/lib/tabelas";
import { LeadForm } from "./LeadForm";
import { AgendarVisita } from "./AgendarVisita";
import { AvisoValores } from "./AvisoValores";
import { whatsappLink } from "@/lib/site";
import { fichaUnidadePdf } from "@/lib/pdf";
import { registrar } from "@/lib/comportamento";

type Unidade = TabelaEmp["unidades"][number];
const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
const brl2 = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const dia = (iso: string) => iso.split("-").reverse().join("/");

// Parcela da Tabela Price para uma estimativa do financiamento bancário (a taxa e o prazo reais dependem do banco).
function price(valor: number, taxaAnual: number, meses: number) {
  const i = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
  return i === 0 ? valor / meses : (valor * i) / (1 - Math.pow(1 + i, -meses));
}

export function EscolhaUnidade({ nomeEmp, empId, dados }: { nomeEmp: string; empId: string; dados: TabelaEmp }) {
  const { tabela, unidades, andares, finais } = dados;
  const [sel, setSel] = useState<Unidade | null>(null);
  const [taxa, setTaxa] = useState(11.5);
  const [prazo, setPrazo] = useState(360);
  const [comp, setComp] = useState<string[]>([]);
  const [renda, setRenda] = useState("");
  const [entrada, setEntrada] = useState("");
  const rendaN = Number(renda.replace(/\D/g, "")) || 0;
  const entradaN = Number(entrada.replace(/\D/g, "")) || 0;
  const parcelaFin = (u: Unidade) => price(u.financiamento, taxa, prazo);
  // Regra prática usada como referência: parcela até 30% da renda familiar. Não é aprovação de crédito.
  const cabem = useMemo(() => rendaN <= 0 ? [] : unidades.filter((u) => u.mensal <= rendaN * 0.3 && price(u.financiamento, taxa, prazo) <= rendaN * 0.3 && (entradaN <= 0 || u.ato <= entradaN)).sort((a, b) => a.total - b.total), [rendaN, entradaN, taxa, prazo, unidades]);
  const comparadas = comp.map((id) => unidades.find((u) => u.id === id)).filter(Boolean) as Unidade[];
  useEffect(() => { if (sel) registrar({ tipo: "unidade", id: sel.id }); }, [sel]);
  useEffect(() => { if (rendaN > 0) registrar({ tipo: "renda" }); }, [rendaN]);
  const alternar = (id: string) => setComp((c) => c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]);
  const rotulo = (u: Unidade) => `${u.id.replace("U-", "")} · ${u.andar}º andar, final ${u.final}`;
  const mapa = useMemo(() => new Map(unidades.map((u) => [`${u.andar}-${u.final}`, u])), [unidades]);
  const vencida = new Date(tabela.validade + "T23:59:59-03:00") < new Date();
  const c = tabela.condicoes;

  return (
    <div className="space-y-10">
      {vencida && <p role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-800">A tabela de preços desta página venceu em {dia(tabela.validade)}. Consulte os valores atualizados com o consultor.</p>}

      <section aria-label="Quanto cabe no seu bolso" className="rounded-md border border-ink/10 bg-white p-6">
        <h2 className="font-serif text-2xl font-semibold">Quanto cabe no seu bolso?</h2>
        <p className="mt-1 text-sm text-mutedink">Informe a renda familiar e a entrada que você tem. Mostramos as unidades cujas parcelas ficam em até 30% da renda. Os valores não são salvos.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Renda familiar mensal (R$)<input inputMode="numeric" value={renda} onChange={(e) => setRenda(e.target.value.replace(/\D/g, ""))} placeholder="Ex.: 20000" className="field mt-1" /></label>
          <label className="text-sm">Entrada disponível para o ato (R$, opcional)<input inputMode="numeric" value={entrada} onChange={(e) => setEntrada(e.target.value.replace(/\D/g, ""))} placeholder="Ex.: 70000" className="field mt-1" /></label>
        </div>
        {rendaN > 0 && (
          <div className="mt-4">
            {cabem.length === 0 ? (
              <p className="rounded-md bg-sand p-4 text-sm">Nenhuma unidade da tabela cabe nesses valores. A parcela da obra e a do financiamento precisam ficar em até 30% da renda; o ato, dentro da entrada informada. Fale com o consultor para avaliar outras possibilidades.</p>
            ) : (
              <>
                <p className="text-sm"><b>{cabem.length}</b> unidade(s) cabem no seu perfil:</p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {cabem.map((u) => (
                    <li key={u.id}><button onClick={() => { setSel(u); document.getElementById("unidade")?.scrollIntoView({ behavior: "smooth" }); }} className="w-full rounded border border-gold/50 bg-snow p-3 text-left text-sm hover:bg-gold/15">
                      <b>{rotulo(u)}</b> · {u.area} m²<br />{brl(u.total)} · obra {brl(u.mensal)}/mês · financ. ≈ {brl(parcelaFin(u))}/mês
                    </button></li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-3 text-xs text-mutedink">Estimativa com {taxa.toLocaleString("pt-BR")}% ao ano em {prazo} meses (ajuste abaixo, na unidade escolhida). Não é aprovação de crédito.</p>
          </div>
        )}
      </section>

      <section aria-label="Escolha da unidade">
        <h2 className="font-serif text-2xl font-semibold">1. Escolha o andar e o final</h2>
        <p className="mt-1 text-sm text-mutedink">Unidades com preço aparecem em dourado. As demais não constam na tabela atual: consulte a disponibilidade.</p>
        <div className="mt-5 overflow-x-auto">
          <div className="inline-block min-w-full rounded-md border border-ink/10 bg-white p-3">
            <div className="grid grid-cols-[3.5rem_repeat(3,minmax(5.5rem,1fr))] gap-1.5 text-center text-xs text-mutedink">
              <span />{finais.map((f) => <span key={f} className="pb-1 font-medium">Final {f}</span>)}
              {Array.from({ length: andares }, (_, i) => andares - i).map((a) => (
                <div key={a} className="contents">
                  <span className="self-center font-mono">{a}º</span>
                  {finais.map((f) => {
                    const u = mapa.get(`${a}-${f}`);
                    if (!u) return <span key={f} className="rounded bg-sand/70 py-2 text-[11px] text-mutedink/60" aria-label={`${a}º andar, final ${f}, sem preço na tabela`}>—</span>;
                    const ativo = sel?.id === u.id;
                    return (
                      <button key={f} onClick={() => setSel(u)} aria-pressed={ativo}
                        className={`rounded py-2 text-[11px] font-semibold transition ${ativo ? "bg-ink text-paper ring-2 ring-gold" : "bg-gold/25 text-ink hover:bg-gold/50"}`}>
                        {u.area} m²<br /><span className="font-normal">{brl(u.total)}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {sel && (
        <section id="unidade" aria-label="Unidade escolhida" className="rounded-md border border-gold/60 bg-white p-6 shadow-sm">
          <p className="font-mono text-[11px] uppercase tracking-wider text-golddark">Unidade {sel.id.replace("U-", "")} · {sel.andar}º andar · final {sel.final}</p>
          <h2 className="mt-1 font-serif text-3xl font-semibold">{brl2(sel.total)}</h2>
          <p className="text-sm text-mutedink">{sel.area} m² · {sel.vaga === "dupla" ? "2 vagas" : "1 vaga"} · {sel.final === 2 ? "2 dormitórios (1 suíte)" : "3 dormitórios (1 suíte)"}</p>

          <h3 className="mt-6 font-semibold">2. Fluxo de pagamento (tabela de {dia(tabela.impressa)})</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[30rem] text-sm">
              <thead><tr className="text-left text-xs text-mutedink"><th className="py-1.5">Parcela</th><th>Quantidade</th><th>% do total</th><th>Início</th><th className="text-right">Valor</th></tr></thead>
              <tbody className="divide-y divide-ink/10">
                <tr><td className="py-1.5">Ato</td><td>{c.ato.qtd}</td><td>{c.ato.pct}%</td><td>{c.ato.inicio}</td><td className="text-right">{brl2(sel.ato)}</td></tr>
                <tr><td className="py-1.5">Mensais</td><td>{c.mensais.qtd}×</td><td>{c.mensais.pct}%</td><td>{c.mensais.inicio}</td><td className="text-right">{brl2(sel.mensal)} cada</td></tr>
                <tr><td className="py-1.5">Anuais</td><td>{c.anuais.qtd}×</td><td>{c.anuais.pct}%</td><td>{c.anuais.inicio}</td><td className="text-right">{brl2(sel.anual)} cada</td></tr>
                <tr><td className="py-1.5">Parcela única</td><td>{c.unica.qtd}</td><td>{c.unica.pct}%</td><td>{c.unica.inicio}</td><td className="text-right">{brl2(sel.unica)}</td></tr>
                <tr><td className="py-1.5">Financiamento (chaves)</td><td>{c.financiamento.qtd}</td><td>{c.financiamento.pct}%</td><td>{c.financiamento.inicio}</td><td className="text-right">{brl2(sel.financiamento)}</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 font-semibold">3. Simule o financiamento</h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Prazo: <b>{prazo} meses</b><input type="range" min={120} max={420} step={12} value={prazo} onChange={(e) => setPrazo(Number(e.target.value))} className="mt-1 w-full" /></label>
            <label className="text-sm">Taxa de juros: <b>{taxa.toLocaleString("pt-BR")}% ao ano</b><input type="range" min={8} max={16} step={0.25} value={taxa} onChange={(e) => setTaxa(Number(e.target.value))} className="mt-1 w-full" /></label>
          </div>
          <p className="mt-3 rounded-md bg-sand p-4 text-sm">Parcela estimada em Tabela Price: <b className="text-lg">{brl2(price(sel.financiamento, taxa, prazo))}</b> por mês, sobre {brl2(sel.financiamento)}.</p>
          <p className="mt-2 text-xs text-mutedink">Estimativa sem seguros, tarifas, INCC e IGP-M. A taxa, o prazo e a aprovação dependem do banco e da análise de crédito.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`/simulador?emp=${empId}`} className="btn btn-line"><Calculator size={16} /> Simulador completo</a>
            <button onClick={() => alternar(sel.id)} className="btn btn-line">{comp.includes(sel.id) ? "Remover da comparação" : comp.length >= 3 ? "Comparação cheia (3)" : "Adicionar à comparação"}</button>
            <a href={`/aluguel-ou-comprar?valor=${Math.round(sel.total)}&entrada=${Math.round(sel.total - sel.financiamento)}`} className="btn btn-line">Comparar com aluguel</a>
            <button onClick={() => { registrar({ tipo: "pdf" }); fichaUnidadePdf(nomeEmp, sel, dados.tabela, { taxa, meses: prazo, parcelaFin: parcelaFin(sel) }); }} className="btn btn-line"><Download size={16} /> Baixar ficha em PDF</button>
            <a href="#interesse" className="btn btn-gold">Quero esta unidade</a>
            <a href={whatsappLink(`Olá, Mendes! Vim pelo site e tenho interesse na unidade ${sel.id.replace("U-", "")} (${sel.andar}º andar, final ${sel.final}, ${sel.area} m²) do ${nomeEmp}, valor de tabela ${brl(sel.total)}. Pode me enviar mais informações?`)} target="_blank" rel="noopener noreferrer" className="btn !bg-[#25D366] text-ink"><MessageCircle size={16} /> Falar no WhatsApp sobre esta unidade</a>
          </div>
        </section>
      )}

      {comparadas.length > 0 && (
        <section aria-label="Comparação de unidades" className="rounded-md border border-ink/10 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-2xl font-semibold">Comparar unidades ({comparadas.length}/3)</h2>
            <button onClick={() => setComp([])} className="text-sm text-golddark underline">Limpar</button>
          </div>
          {comparadas.length < 2 && <p className="mt-2 text-sm text-mutedink">Escolha mais uma unidade e clique em "Adicionar à comparação".</p>}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead><tr className="text-left text-xs text-mutedink"><th className="py-1.5" />{comparadas.map((u) => <th key={u.id} className="pr-3">{rotulo(u)}<br /><button onClick={() => alternar(u.id)} className="font-normal text-golddark underline">remover</button></th>)}</tr></thead>
              <tbody className="divide-y divide-ink/10">
                {([
                  ["Metragem", (u: Unidade) => `${u.area} m²`],
                  ["Vagas", (u: Unidade) => (u.vaga === "dupla" ? "2" : "1")],
                  ["Dormitórios", (u: Unidade) => (u.final === 2 ? "2 (1 suíte)" : "3 (1 suíte)")],
                  ["Preço da tabela", (u: Unidade) => brl2(u.total)],
                  ["Preço por m²", (u: Unidade) => brl(u.total / u.area)],
                  ["Ato", (u: Unidade) => brl2(u.ato)],
                  [`${c.mensais.qtd} mensais de`, (u: Unidade) => brl2(u.mensal)],
                  [`${c.anuais.qtd} anuais de`, (u: Unidade) => brl2(u.anual)],
                  ["Parcela única", (u: Unidade) => brl2(u.unica)],
                  ["Financiamento", (u: Unidade) => brl2(u.financiamento)],
                  [`Parcela estimada (${prazo} meses, ${taxa.toLocaleString("pt-BR")}% a.a.)`, (u: Unidade) => brl2(parcelaFin(u))],
                ] as [string, (u: Unidade) => string][]).map(([nome, f]) => (
                  <tr key={nome}><td className="py-1.5 pr-3 text-mutedink">{nome}</td>{comparadas.map((u) => <td key={u.id} className="pr-3 font-medium">{f(u)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section id="tour" aria-label="Vista e decorado" className="grid scroll-mt-24 gap-6 md:grid-cols-2">
        {dados.tour360 ? <div className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Eye size={20} /> Passeio virtual 360°</h2>
          <p className="mt-1 text-sm text-mutedink">Veja a vista e circule pelo ambiente.</p>
          <div className="mt-4 aspect-video overflow-hidden rounded bg-sand">
            <iframe src={dados.tour360} title={`Passeio virtual 360° do ${nomeEmp}`} className="h-full w-full" allow="fullscreen; gyroscope; accelerometer" loading="lazy" />
          </div>
          <a href={dados.tour360} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-golddark underline">Abrir em tela cheia</a>
        </div> : <div className="rounded-md border border-ink/10 bg-white p-6"><h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Eye size={20} /> Passeio virtual 360°</h2><p className="mt-3 rounded bg-sand p-6 text-sm text-mutedink">Passeio virtual em breve.</p></div>}
        <div className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Video size={20} /> Apartamento decorado</h2>
          {dados.videoDecorado ? (
            <div className="mt-4 aspect-video overflow-hidden rounded bg-black">
              {dados.videoDecorado.endsWith(".mp4")
                ? <video src={dados.videoDecorado} poster={dados.videoPoster} controls preload="metadata" playsInline className="h-full w-full" />
                : <iframe src={dados.videoDecorado} title={`Decorado do ${nomeEmp}`} className="h-full w-full" allow="fullscreen" loading="lazy" />}
            </div>
          ) : <p className="mt-3 rounded bg-sand p-6 text-sm text-mutedink">Vídeo do decorado em breve.</p>}
          <h2 className="mt-6 flex items-center gap-2 font-serif text-2xl font-semibold"><Sparkles size={20} /> Decore com IA</h2>
          <p className="mt-2 rounded bg-sand p-6 text-sm text-mutedink">Em breve: escolha um estilo e veja o ambiente decorado. As imagens serão ilustrativas.</p>
        </div>
      </section>

      <section id="visita"><AgendarVisita empreendimento={nomeEmp} detalhe={sel ? `unidade ${sel.id.replace("U-", "")}` : undefined} /></section>

      <section id="interesse">
        <LeadForm titulo={`Tenho interesse no ${nomeEmp}`} empreendimento={nomeEmp} mensagemInicial={sel ? `Tenho interesse na unidade ${sel.id.replace("U-", "")} (${sel.andar}º andar, final ${sel.final}), ${brl(sel.total)} na tabela de ${dia(tabela.impressa)}.` : undefined} />
      </section>

      <AvisoValores />

      <div className="space-y-1 text-xs text-mutedink">
        <p><b>Tabela de venda de {dia(tabela.impressa)}, válida até {dia(tabela.validade)}.</b> Valores sujeitos a alteração sem aviso prévio; a disponibilidade deve ser confirmada com o consultor. Imagens, vídeos e passeio virtual são ilustrativos e podem diferir da unidade entregue.</p>
        {tabela.obs.map((o) => <p key={o}>• {o}</p>)}
      </div>
    </div>
  );
}
