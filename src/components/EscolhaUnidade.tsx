"use client";
import { useMemo, useState } from "react";
import { Calculator, Eye, Sparkles, Video } from "lucide-react";
import dados from "@/data/murano.json";
import { LeadForm } from "./LeadForm";

type Unidade = (typeof dados.unidades)[number];
const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
const brl2 = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const dia = (iso: string) => iso.split("-").reverse().join("/");

// Parcela da Tabela Price para uma estimativa do financiamento bancário (a taxa e o prazo reais dependem do banco).
function price(valor: number, taxaAnual: number, meses: number) {
  const i = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
  return i === 0 ? valor / meses : (valor * i) / (1 - Math.pow(1 + i, -meses));
}

export function EscolhaUnidade({ nomeEmp }: { nomeEmp: string }) {
  const { tabela, unidades, andares, finais } = dados;
  const [sel, setSel] = useState<Unidade | null>(null);
  const [taxa, setTaxa] = useState(11.5);
  const [prazo, setPrazo] = useState(360);
  const mapa = useMemo(() => new Map(unidades.map((u) => [`${u.andar}-${u.final}`, u])), [unidades]);
  const vencida = new Date(tabela.validade + "T23:59:59-03:00") < new Date();
  const c = tabela.condicoes;

  return (
    <div className="space-y-10">
      {vencida && <p role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-800">A tabela de preços desta página venceu em {dia(tabela.validade)}. Consulte os valores atualizados com o consultor.</p>}

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
        <section aria-label="Unidade escolhida" className="rounded-md border border-gold/60 bg-white p-6 shadow-sm">
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
            <a href={`/simulador?emp=ilha-de-murano`} className="btn btn-line"><Calculator size={16} /> Simulador completo</a>
            <a href="#interesse" className="btn btn-gold">Quero esta unidade</a>
          </div>
        </section>
      )}

      <section aria-label="Vista e decorado" className="grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Eye size={20} /> Passeio virtual 360°</h2>
          <p className="mt-1 text-sm text-mutedink">Veja a vista e circule pelo ambiente.</p>
          <div className="mt-4 aspect-video overflow-hidden rounded bg-sand">
            <iframe src={dados.tour360} title={`Passeio virtual 360° do ${nomeEmp}`} className="h-full w-full" allow="fullscreen; gyroscope; accelerometer" loading="lazy" />
          </div>
          <a href={dados.tour360} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-golddark underline">Abrir em tela cheia</a>
        </div>
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

      <section id="interesse">
        <LeadForm titulo={`Tenho interesse no ${nomeEmp}`} empreendimento={nomeEmp} mensagemInicial={sel ? `Tenho interesse na unidade ${sel.id.replace("U-", "")} (${sel.andar}º andar, final ${sel.final}), ${brl(sel.total)} na tabela de ${dia(tabela.impressa)}.` : undefined} />
      </section>

      <div className="space-y-1 text-xs text-mutedink">
        <p><b>Tabela de venda de {dia(tabela.impressa)}, válida até {dia(tabela.validade)}.</b> Valores sujeitos a alteração sem aviso prévio; a disponibilidade deve ser confirmada com o consultor. Imagens, vídeos e passeio virtual são ilustrativos e podem diferir da unidade entregue.</p>
        {tabela.obs.map((o) => <p key={o}>• {o}</p>)}
      </div>
    </div>
  );
}
